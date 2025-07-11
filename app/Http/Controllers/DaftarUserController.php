<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class DaftarUserController extends Controller
{
    protected $rules = [
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'no_hp' => 'required|string|max:15',
        'alamat' => 'required|string',
        'username' => 'required|string|unique:users,username|max:255',
        'password' => 'required|string|min:8',
        'role' => 'required|string|in:admin,user,pendaftar',
        'verified' => 'boolean',
    ];

    protected $messages = [
        'required' => 'Kolom :attribute tidak boleh kosong',
        'string' => 'Kolom :attribute harus berupa teks',
        'email' => 'Format email tidak valid',
        'max' => 'Kolom :attribute maksimal :max karakter',
        'min' => 'Kolom :attribute minimal :min karakter',
        'unique' => 'Kolom :attribute sudah digunakan',
        'in' => 'Kolom :attribute harus salah satu dari: :values',
    ];

    protected function validateUser(Request $request, $id = null)
    {
        $rules = $this->rules;
        
        // Modify rules for update
        if ($id) {
            $rules['email'] = 'required|email|unique:users,email,' . $id;
            $rules['username'] = 'required|string|unique:users,username,' . $id;
            $rules['password'] = 'nullable|string|min:8';
        }

        $validator = Validator::make($request->all(), $rules, $this->messages);

        if ($validator->fails()) {
            return ['status' => false, 'errors' => $validator->errors()];
        }

        return ['status' => true, 'data' => $validator->validated()];
    }

        public function index()
        {
            try {
                $users = User::all();
                return Inertia::render('operator/DaftarUser', ['users' => $users]);
            } catch (\Exception $e) {
                Log::error('Error in index method', [
                    'error' => $e->getMessage()
                ]);
                return Inertia::render('operator/DaftarUser', ['users' => [], 'error' => 'Terjadi kesalahan saat mengambil data']);
            }
        }

    public function fetchedUsers(Request $request)
    {
        try {
            $search = $request->input('search', '');
            $pageSize = (int) $request->input('pageSize', 5);

            $query = User::where('role', 'pendaftar');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%$search%")
                        ->orWhere('email', 'like', "%$search%")
                        ->orWhere('username', 'like', "%$search%");
                });
            }

            $users = $query->orderBy('created_at', 'desc')->paginate($pageSize);

            return response()->json(['success' => true, 'users' => $users]);
        } catch (\Exception $e) {
            Log::error('Error fetching users', [
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data.'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            Log::info('Store user request received', [
                'request_data' => $request->except('password')
            ]);

            $validation = $this->validateUser($request);

            if (!$validation['status']) {
                Log::error('Validation failed', ['errors' => $validation['errors']]);
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validation['errors']
                ], 422);
            }

            $data = $validation['data'];
            $data['password'] = Hash::make($data['password']);
            $data['accessibility_settings'] = $request->accessibility_settings ?? [];
            
            User::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Data pengguna berhasil ditambahkan',
            ]);

        } catch (\Exception $e) {
            Log::error('Error creating user', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan internal pada server. Silakan coba lagi nanti.'
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            Log::info('Update user request received', [
                'id' => $id,
                'request_data' => $request->except('password')
            ]);

            $user = User::find($id);

            if (!$user) {
                Log::error('User not found', ['id' => $id]);
                return response()->json(['success' => false, 'message' => 'Data pengguna tidak ditemukan'], 404);
            }

            $validation = $this->validateUser($request, $id);

            if (!$validation['status']) {
                Log::error('Validation failed', ['errors' => $validation['errors']]);
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validation['errors']
                ], 422);
            }

            $data = $validation['data'];
            
            // Only update password if provided
            if (isset($data['password']) && $data['password']) {
                $data['password'] = Hash::make($data['password']);
            } else {
                unset($data['password']);
            }
            
            // Handle accessibility settings if provided
            if ($request->has('accessibility_settings')) {
                $data['accessibility_settings'] = $request->accessibility_settings;
            }

            Log::info('Updating user data', ['data' => array_diff_key($data, ['password' => ''])]);
            $user->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Data pengguna berhasil diperbarui',
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating user', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan internal pada server. Silakan coba lagi nanti.'
            ], 500);
        }
    }
    
    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Pengguna berhasil dihapus.'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting user', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus data pengguna.'
            ], 500);
        }
    }
}
