<?php

namespace App\Http\Controllers;

use App\Models\Permohonan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class PermohonanController extends Controller
{
    protected $rules = [
        'susunan_penggurus'   => 'required|file|mimes:pdf|max:2048',
        'surat_nonpengurus'   => 'required|file|mimes:pdf|max:2048',
        'surat_kuasa'         => 'required|file|mimes:pdf|max:2048',
        'bukti_modal'         => 'required|file|mimes:pdf|max:2048',
        'ktp'                 => 'required|file|mimes:pdf|max:2048',
        'user_id'             => 'required|exists:users,id',
        'status'              => 'required|in:pending,accepted,rejected',
    ];

    protected $messages = [
        'required' => 'Kolom :attribute tidak boleh kosong',
        'file'     => 'Kolom :attribute harus berupa file',
        'mimes'    => 'Kolom :attribute harus berupa file PDF',
        'max'      => 'Ukuran file :attribute maksimal 2MB',
        'exists'   => 'Kolom :attribute tidak valid',
        
    ];

    protected function validatePermohonan(Request $request, $id = null)
    {
        $rules = $this->rules;
        // Untuk update, file bisa opsional
        if ($id) {
            foreach (['susunan_penggurus','surat_nonpengurus','surat_kuasa','bukti_modal','ktp'] as $field) {
                $rules[$field] = 'sometimes|file|mimes:pdf|max:2048';
            }
        }
        $validator = Validator::make($request->all(), $rules, $this->messages);

        if ($validator->fails()) {
            return ['status' => false, 'errors' => $validator->errors()];
        }

        return ['status' => true, 'data' => $validator->validated()];
    }

    public function index(Request $request)
    {
        try {
            // Jika ada user_id dalam request, filter berdasarkan user_id
            $query = Permohonan::with('user');
            
            if ($request->has('user_id')) {
                $query->where('user_id', $request->get('user_id'));
            }
            
            $permohonans = $query->get();
            return Inertia::render('pendaftar/Permohonan', ['permohonans' => $permohonans]);
        } catch (\Exception $e) {
            Log::error('Error in index method', ['error' => $e->getMessage()]);
            return Inertia::render('pendaftar/Permohonan', [
                'permohonans' => [],
                'error' => 'Terjadi kesalahan saat mengambil data'
            ]);
        }
    }

    public function store(Request $request)
    {
        try {
            // Cek apakah user sudah punya permohonan accepted
            $userId = $request->input('user_id');
            $existingAccepted = Permohonan::where('user_id', $userId)
                ->where('status', 'accepted')
                ->exists();

            if ($existingAccepted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah memiliki permohonan yang diterima. Tidak dapat mengajukan lagi.'
                ], 403);
            }

            // Cek apakah ada permohonan terakhir yang belum rejected
            $latestPermohonan = Permohonan::where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->first();

            if ($latestPermohonan && $latestPermohonan->status !== 'rejected') {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda hanya dapat mengajukan ulang jika permohonan terakhir Anda ditolak.'
                ], 403);
            }

            $validation = $this->validatePermohonan($request);

            if (!$validation['status']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validation['errors']
                ], 422);
            }

            $data = $validation['data'];
            foreach (['susunan_penggurus','surat_nonpengurus','surat_kuasa','bukti_modal','ktp'] as $field) {
                if ($request->hasFile($field)) {
                    $data[$field] = $request->file($field)->store('permohonan', 'public');
                }
            }

            Permohonan::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Data permohonan berhasil ditambahkan',
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating permohonan', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan internal pada server. Silakan coba lagi nanti.'
            ], 500);
        }
    }

  public function show($id)
{
    $permohonan = Permohonan::with('user')->find($id);

    if (!$permohonan) {
        return response()->json([
            'success' => false,
            'message' => 'Data permohonan tidak ditemukan'
        ], 404);
    }

    return response()->json([
        'success' => true,
        'permohonan' => $permohonan
    ]);
}
    public function update(Request $request, Permohonan $permohonan)
    {
        try {
            $validation = $this->validatePermohonan($request, $permohonan->id);

            if (!$validation['status']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validation['errors']
                ], 422);
            }

            $data = $validation['data'];
            foreach (['susunan_penggurus','surat_nonpengurus','surat_kuasa','bukti_modal','ktp'] as $field) {
                if ($request->hasFile($field)) {
                    // Optional: hapus file lama jika perlu
                    if ($permohonan->$field && \Storage::disk('public')->exists($permohonan->$field)) {
                        \Storage::disk('public')->delete($permohonan->$field);
                    }
                    $data[$field] = $request->file($field)->store('permohonan', 'public');
                } else {
                    unset($data[$field]);
                }
            }

            $permohonan->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Data permohonan berhasil diperbarui',
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating permohonan', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan internal pada server. Silakan coba lagi nanti.'
            ], 500);
        }
    }

    public function destroy(Permohonan $permohonan)
    {
        try {
            $permohonan->delete();
            return response()->json([
                'success' => true,
                'message' => 'Permohonan berhasil dihapus.'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting permohonan', [
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus data permohonan.'
            ], 500);
        }
    }

    public function fetchedPermohonan(Request $request)
    {
        try {
            // Ambil user_id dari request atau dari authenticated user
            $userId = $request->get('user_id');
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'permohonans' => [],
                    'message' => 'User ID tidak ditemukan'
                ], 400);
            }
            
            // Filter permohonan berdasarkan user_id
            $permohonans = Permohonan::with('user')
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->get();
                
            return response()->json([
                'success' => true,
                'permohonans' => $permohonans
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching permohonan', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'permohonans' => [],
                'message' => 'Terjadi kesalahan saat mengambil data permohonan'
            ], 500);
        }
    }
}
