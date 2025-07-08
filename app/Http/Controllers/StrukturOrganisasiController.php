<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StrukturOrganisasi;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class StrukturOrganisasiController extends Controller
{
    // Define validation rules
    protected $rules = [
        'foto' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
    ];

    // Define validation messages
    protected $messages = [
        'required' => 'Kolom :attribute tidak boleh kosong',
        'image' => 'File :attribute harus berupa gambar',
        'mimes' => 'Format file :attribute harus berupa: :values',
        'max' => 'Ukuran file :attribute maksimal :max kilobytes',
    ];

    protected function validateStrukturOrganisasi(Request $request, $id = null)
    {
        $validator = Validator::make($request->all(), $this->rules, $this->messages);

        if ($validator->fails()) {
            return ['status' => false, 'errors' => $validator->errors()];
        }

        return ['status' => true, 'data' => $validator->validated()];
    }

    public function index()
    {
        $strukturOrganisasi = StrukturOrganisasi::all();
        return Inertia::render('StrukturOrganisasi', compact('strukturOrganisasi'));
    }

    public function fetchedStrukturOrganisasi()
    {
        try {
            $strukturOrganisasi = StrukturOrganisasi::all();
            return response()->json(['success' => true, 'strukturOrganisasi' => $strukturOrganisasi]);
        } catch (\Exception $e) {
            Log::error('Error fetching struktur organisasi', [
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
            Log::info('Store request received', [
                'request_data' => $request->all()
            ]);

            $validation = $this->validateStrukturOrganisasi($request);

            if (!$validation['status']) {
                Log::error('Validation failed', ['errors' => $validation['errors']]);
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validation['errors']
                ], 422);
            }

            // Handle file upload
            if ($request->hasFile('foto')) {
                $file = $request->file('foto');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('struktur_organisasi', $fileName, 'public');
                
                $data = [
                    'foto' => $filePath,
                ];

                StrukturOrganisasi::create($data);

                return response()->json([
                    'success' => true,
                    'message' => 'Data struktur organisasi berhasil ditambahkan',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'File foto tidak ditemukan',
            ], 422);

        } catch (\Exception $e) {
            Log::error('Error creating struktur organisasi', [
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

            $strukturOrganisasi = StrukturOrganisasi::find($id);

            if (!$strukturOrganisasi) {
                Log::error('Struktur Organisasi data not found', ['id' => $id]);
                return response()->json(['success' => false, 'message' => 'Data struktur organisasi tidak ditemukan'], 404);
            }

            $validation = $this->validateStrukturOrganisasi($request, $id);

            if (!$validation['status']) {
                Log::error('Validation failed', ['errors' => $validation['errors']]);
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validation['errors']
                ], 422);
            }

            // Handle file upload and remove old file
            if ($request->hasFile('foto')) {
                // Delete old file if exists
                if ($strukturOrganisasi->foto) {
                    Storage::disk('public')->delete($strukturOrganisasi->foto);
                }
                
                $file = $request->file('foto');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('struktur_organisasi', $fileName, 'public');
                
                $data = [
                    'foto' => $filePath,
                ];

                Log::info('Updating struktur organisasi data', ['data' => $data]);
                $strukturOrganisasi->update($data);

                return response()->json([
                    'success' => true,
                    'message' => 'Data struktur organisasi berhasil diperbarui',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'File foto tidak ditemukan',
            ], 422);

        } catch (\Exception $e) {
            Log::error('Error updating struktur organisasi', [
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
            $strukturOrganisasi = StrukturOrganisasi::findOrFail($id);
            
            // Delete associated file if exists
            if ($strukturOrganisasi->foto) {
                Storage::disk('public')->delete($strukturOrganisasi->foto);
            }
            
            $strukturOrganisasi->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Struktur organisasi berhasil dihapus.'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting struktur organisasi', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus data.'
            ], 500);
        }
    }
}
