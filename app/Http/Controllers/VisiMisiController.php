<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\VisiMisi;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class VisiMisiController extends Controller
{
    // Rules updated to match model fillable fields
    protected $rules = [
        'judul' => 'required|string|max:255',
        'deskripsi' => 'required|string',
    ];

    // Messages updated to remove gambar-related messages
    protected $messages = [
        'required' => 'Kolom :attribute tidak boleh kosong',
        'string' => 'Kolom :attribute harus berupa teks',
        'max' => 'Kolom :attribute maksimal :max karakter',
    ];

    protected function validateVisiMisi(Request $request, $id = null)
    {
        // Use the class properties for rules and messages
        $validator = Validator::make($request->all(), $this->rules, $this->messages);

        if ($validator->fails()) {
            return ['status' => false, 'errors' => $validator->errors()];
        }

        return ['status' => true, 'data' => $validator->validated()];
    }

    public function index()
    {
        // Ensure VisiMisi exists, create if not
        $visiMisi = VisiMisi::firstOrCreate([], [
            'judul' => 'Judul Default',
            'deskripsi' => 'Deskripsi Default',
        ]);
        
        return Inertia::render('VisiMisi', compact('visiMisi'));
    }
    
    public function fetchedVisiMisi()
    {
        // Fetch the first VisiMisi record
        $visiMisi = VisiMisi::first();
        
        if (!$visiMisi) {
            return response()->json(['success' => false, 'message' => 'Data visi misi tidak ditemukan'], 404);
        }

        return response()->json(['success' => true, 'visiMisi' => $visiMisi]);
    }

    public function store(Request $request)
    {
        try {
            Log::info('Store request received', [
                'request_data' => $request->all()
            ]);

            $validation = $this->validateVisiMisi($request);

            if (!$validation['status']) {
                Log::error('Validation failed', ['errors' => $validation['errors']]);
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validation['errors']
                ], 422);
            }

            $data = [
                'judul' => $validation['data']['judul'],
                'deskripsi' => $validation['data']['deskripsi'],
            ];

            VisiMisi::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Data visi misi berhasil ditambahkan',
            ]);

        } catch (\Exception $e) {
            Log::error('Error creating visi misi', [
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
            Log::info('Update request received', [
                'id' => $id,
                'request_data' => $request->all()
            ]);

            $visiMisi = VisiMisi::find($id);

            if (!$visiMisi) {
                Log::error('Visi Misi data not found', ['id' => $id]);
                return response()->json(['success' => false, 'message' => 'Data visi misi tidak ditemukan'], 404);
            }

            $validation = $this->validateVisiMisi($request, $id);

            if (!$validation['status']) {
                Log::error('Validation failed', ['errors' => $validation['errors']]);
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validation['errors']
                ], 422);
            }

            $data = [
                'judul' => $validation['data']['judul'],
                'deskripsi' => $validation['data']['deskripsi'],
            ];

            Log::info('Updating visi misi data', ['data' => $data]);
            $visiMisi->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Data visi misi berhasil diperbarui',
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating visi misi', [
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
            $visiMisi = VisiMisi::findOrFail($id);
            $visiMisi->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Visi dan Misi berhasil dihapus.'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting visi misi', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus data.'
            ], 500);
        }
    }
}
