<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Berita;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BeritaController extends Controller
{
    // Define validation rules
    protected $rules = [
        'tanggal' => 'required|date',
        'Judul_berita' => 'required|string|max:255',
        'isi_berita' => 'required|string',
        'foto' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
    ];

    // Define validation messages
    protected $messages = [
        'required' => 'Kolom :attribute tidak boleh kosong',
        'date' => 'Format :attribute tidak valid',
        'string' => 'Kolom :attribute harus berupa text',
        'max' => 'Panjang :attribute maksimal :max karakter',
        'image' => 'File :attribute harus berupa gambar',
        'mimes' => 'Format file :attribute harus berupa: :values',
    ];

    protected function validateBerita(Request $request, $id = null)
    {
        $validator = Validator::make($request->all(), $this->rules, $this->messages);

        if ($validator->fails()) {
            return ['status' => false, 'errors' => $validator->errors()];
        }

        return ['status' => true, 'data' => $validator->validated()];
    }

    public function index()
    {
        $beritas = Berita::all();
        return Inertia::render('operator/Berita', compact('beritas'));
    }

    public function fetchedBerita(Request $request)
    {
        try {
            $search = $request->input('search', '');
            $pageSize = (int) $request->input('pageSize', 5);

            $query = Berita::query();

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('Judul_berita', 'like', "%$search%")
                        ->orWhere('isi_berita', 'like', "%$search%");
                });
            }

            $beritas = $query->orderBy('tanggal', 'desc')->paginate($pageSize);

            return response()->json(['success' => true, 'beritas' => $beritas]);
        } catch (\Exception $e) {
            Log::error('Error fetching berita', [
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

            $validation = $this->validateBerita($request);

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
                $filePath = $file->storeAs('berita', $fileName, 'public');
                
                $data = [
                    'tanggal' => $request->tanggal,
                    'Judul_berita' => $request->Judul_berita,
                    'isi_berita' => $request->isi_berita,
                    'foto' => $filePath,
                ];

                Berita::create($data);

                return response()->json([
                    'success' => true,
                    'message' => 'Berita berhasil ditambahkan',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'File foto tidak ditemukan',
            ], 422);

        } catch (\Exception $e) {
            Log::error('Error creating berita', [
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

            $berita = Berita::find($id);

            if (!$berita) {
                Log::error('Berita data not found', ['id' => $id]);
                return response()->json(['success' => false, 'message' => 'Data berita tidak ditemukan'], 404);
            }

            $validation = $this->validateBerita($request, $id);

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
                if ($berita->foto) {
                    Storage::disk('public')->delete($berita->foto);
                }
                
                $file = $request->file('foto');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('berita', $fileName, 'public');
                
                $data = [
                    'tanggal' => $request->tanggal,
                    'Judul_berita' => $request->Judul_berita,
                    'isi_berita' => $request->isi_berita,
                    'foto' => $filePath,
                ];

                Log::info('Updating berita data', ['data' => $data]);
                $berita->update($data);

                return response()->json([
                    'success' => true,
                    'message' => 'Data berita berhasil diperbarui',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'File foto tidak ditemukan',
            ], 422);

        } catch (\Exception $e) {
            Log::error('Error updating berita', [
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
            $berita = Berita::findOrFail($id);
            
            // Delete associated file if exists
            if ($berita->foto) {
                Storage::disk('public')->delete($berita->foto);
            }
            
            $berita->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Berita berhasil dihapus.'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting berita', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus data.'
            ], 500);
        }
    }
}
