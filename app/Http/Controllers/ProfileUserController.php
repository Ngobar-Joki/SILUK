<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class ProfileUserController extends Controller
{
    public function index()
    {
        return Inertia::render('ProfileUser');
    }

    // Fetch profile data for the authenticated user
    public function fetchProfileUser(Request $request)
    {
        try {
            $user = $request->user();
            // Ambil hanya field yang diperlukan
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'no_hp' => $user->no_hp,
                'alamat' => $user->alamat,
                'username' => $user->username,
                'accessibility_settings' => $user->accessibility_settings,
            ];
            return response()->json([
                'success' => true,
                'user' => $userData
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching profile user', [
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data profil.'
            ], 500);
        }
    }

    // Update profile data for the authenticated user
    public function update(Request $request)
    {
        try {
            $user = $request->user();

            $rules = [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $user->id,
                'no_hp' => 'required|string|max:15',
                'alamat' => 'required|string',
                'username' => 'required|string|unique:users,username,' . $user->id . '|max:255',
                'password' => 'nullable|string|min:8',
                'accessibility_settings' => 'nullable|array',
            ];

            $messages = [
                'required' => 'Kolom :attribute tidak boleh kosong',
                'string' => 'Kolom :attribute harus berupa teks',
                'email' => 'Format email tidak valid',
                'max' => 'Kolom :attribute maksimal :max karakter',
                'min' => 'Kolom :attribute minimal :min karakter',
                'unique' => 'Kolom :attribute sudah digunakan',
            ];

            $validator = Validator::make($request->all(), $rules, $messages);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();

            if (isset($data['password']) && $data['password']) {
                $data['password'] = Hash::make($data['password']);
            } else {
                unset($data['password']);
            }

            if ($request->has('accessibility_settings')) {
                $data['accessibility_settings'] = $request->accessibility_settings;
            }

            $user->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Profil berhasil diperbarui',
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating profile user', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan internal pada server. Silakan coba lagi nanti.'
            ], 500);
        }
    }
}
