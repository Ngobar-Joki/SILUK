<?php

namespace App\Http\Controllers;

use App\Models\LaporanBulanan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class LaporanBulananController extends Controller
{
    protected $rules = [
        'periode'       => 'required|string|max:255',
        'data_laporan'  => 'required|file|mimes:pdf|max:2048',
        'user_id'       => 'required|exists:users,id',
        'status'        => 'required|in:pending,accepted,rejected',
    ];

    protected $messages = [
        'required' => 'Kolom :attribute tidak boleh kosong',
        'file'     => 'Kolom :attribute harus berupa file',
        'mimes'    => 'Kolom :attribute harus berupa file PDF',
        'max'      => 'Ukuran file :attribute maksimal 2MB',
        'exists'   => 'Kolom :attribute tidak valid',
    ];

    protected function validateLaporan(Request $request, $id = null)
    {
        $rules = $this->rules;
        // Untuk update, file bisa opsional
        if ($id) {
            $rules['data_laporan'] = 'sometimes|file|mimes:pdf|max:2048';
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
            $laporans = LaporanBulanan::with('user')->orderBy('created_at', 'desc')->get();
            return Inertia::render('Pendaftar/LaporanBulanan', ['laporans' => $laporans]);
        } catch (\Exception $e) {
            Log::error('Error in index method', ['error' => $e->getMessage()]);
            return Inertia::render('Pendaftar/LaporanBulanan', [
                'laporans' => [],
                'error' => 'Terjadi kesalahan saat mengambil data'
            ]);
        }
    }

    public function store(Request $request)
    {
        try {
            $validation = $this->validateLaporan($request);

            if (!$validation['status']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validation['errors']
                ], 422);
            }

            $data = $validation['data'];

            // Cek apakah sudah ada laporan dengan periode & user_id yang statusnya accepted
            $sudahAda = LaporanBulanan::where('periode', $data['periode'])
                ->where('user_id', $data['user_id'])
                ->where('status', 'accepted')
                ->exists();

            if ($sudahAda) {
                return response()->json([
                    'success' => false,
                    'message' => 'Laporan untuk periode tersebut sudah diajukan dan diterima.'
                ], 422);
            }

            if ($request->hasFile('data_laporan')) {
                $data['data_laporan'] = $request->file('data_laporan')->store('laporan_bulanan', 'public');
            }

            LaporanBulanan::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Laporan bulanan berhasil ditambahkan',
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating laporan bulanan', [
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
        $laporan = LaporanBulanan::with('user')->find($id);

        if (!$laporan) {
            return response()->json([
                'success' => false,
                'message' => 'Data laporan bulanan tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'laporan' => $laporan
        ]);
    }

    public function update(Request $request, LaporanBulanan $laporanBulanan)
    {
        try {
            $validation = $this->validateLaporan($request, $laporanBulanan->id);

            if (!$validation['status']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validation['errors']
                ], 422);
            }

            $data = $validation['data'];
            if ($request->hasFile('data_laporan')) {
                // Optional: hapus file lama jika perlu
                if ($laporanBulanan->data_laporan && \Storage::disk('public')->exists($laporanBulanan->data_laporan)) {
                    \Storage::disk('public')->delete($laporanBulanan->data_laporan);
                }
                $data['data_laporan'] = $request->file('data_laporan')->store('laporan_bulanan', 'public');
            } else {
                unset($data['data_laporan']);
            }

            $laporanBulanan->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Laporan bulanan berhasil diperbarui',
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating laporan bulanan', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan internal pada server. Silakan coba lagi nanti.'
            ], 500);
        }
    }

    public function destroy(LaporanBulanan $laporanBulanan)
    {
        try {
            // Optional: hapus file terkait
            if ($laporanBulanan->data_laporan && \Storage::disk('public')->exists($laporanBulanan->data_laporan)) {
                \Storage::disk('public')->delete($laporanBulanan->data_laporan);
            }
            $laporanBulanan->delete();
            return response()->json([
                'success' => true,
                'message' => 'Laporan bulanan berhasil dihapus.'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting laporan bulanan', [
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus data laporan bulanan.'
            ], 500);
        }
    }

    public function fetchedLaporanBulanan()
    {
        try {
            $laporans = LaporanBulanan::with('user')->orderBy('created_at', 'desc')->get();
            return response()->json([
                'success' => true,
                'laporans' => $laporans
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching laporan bulanan', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'laporans' => [],
                'message' => 'Terjadi kesalahan saat mengambil data laporan bulanan'
            ], 500);
        }
    }
}

