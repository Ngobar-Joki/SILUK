<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Permohonan;
use App\Models\User;
use App\Service\WhatsAppService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class DaftarPermohonanController extends Controller
{
    public function index()
    {
        try {
            $permohonans = Permohonan::with('user')->orderBy('created_at', 'desc')->get();
            return Inertia::render('operator/DaftarPermohonan', [
                'permohonans' => $permohonans
            ]);
        } catch (\Exception $e) {
            Log::error('Error in DaftarPermohonanController@index', ['error' => $e->getMessage()]);
            return Inertia::render('operator/DaftarPermohonan', [
                'permohonans' => [],
                'error' => 'Terjadi kesalahan saat mengambil data'
            ]);
        }
    }

    public function fetchedDaftarPermohonan(Request $request)
    {
        try {
            $permohonans = Permohonan::with('user')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $permohonans
            ]);
        } catch (\Exception $e) {
            Log::error('Error in DaftarPermohonanController@fetched', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data'
            ], 500);
        }
    }

    public function verifikasi($id)
    {
        try {
            $permohonan = Permohonan::with('user')->findOrFail($id);
            $permohonan->status = 'accepted';
            
            // Jika ada kolom verifikator, simpan user yang memverifikasi
            if (Schema::hasColumn('permohonans', 'id_operator') && Schema::hasColumn('permohonans', 'id_admin_verifikasi')) {
                $user = Auth::user();
                if ($user->role === 'operator') {
                    $permohonan->id_operator = Auth::id();
                } else {
                    $permohonan->id_admin_verifikasi = Auth::id();
                }
            }
            $permohonan->save();

            // Kirim notifikasi WhatsApp jika nomor tersedia
            $user = $permohonan->user;
            if ($user && $user->no_hp && substr($user->no_hp, 0, 2) == '08') {
                $message = "Halo {$user->name},\n\n"
                    . "Permohonan koperasi Anda telah diverifikasi dan diterima.\n"
                    . "Silakan dicek pada halaman pengajuan pada website SILUK. Untuk detail lebih lanjut, dimohon menghubungi admin.\n\n"
                    . "Terima kasih,\n"
                    . "Admin SILUK.\n";
                $no_hp = '62' . substr($user->no_hp, 1);
                
                $whatsappService = new WhatsAppService();
                $whatsappResult = $whatsappService->sendMessage($no_hp, $message);
                
                Log::info('WhatsApp notification sent for approved permohonan', [
                    'permohonan_id' => $id,
                    'user_id' => $user->id,
                    'phone' => $no_hp,
                    'whatsapp_response' => $whatsappResult
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Permohonan berhasil diverifikasi.',
                'data' => $permohonan
            ]);
        } catch (\Exception $e) {
            Log::error('Error in DaftarPermohonanController@verifikasi', [
                'permohonan_id' => $id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memverifikasi permohonan'
            ], 500);
        }
    }

    public function tolak(Request $request, $id)
    {
        try {
            $permohonan = Permohonan::with('user')->findOrFail($id);
            $permohonan->status = 'rejected';
            
            // Jika ada kolom verifikator, simpan user yang memverifikasi
            if (Schema::hasColumn('permohonans', 'id_operator') && Schema::hasColumn('permohonans', 'id_admin_verifikasi')) {
                $user = Auth::user();
                if ($user->role === 'operator') {
                    $permohonan->id_operator = Auth::id();
                } else {
                    $permohonan->id_admin_verifikasi = Auth::id();
                }
            }
            
            $permohonan->catatan = $request->catatan;
            $permohonan->save();

            // Kirim notifikasi WhatsApp jika nomor tersedia
            $user = $permohonan->user;
            if ($user && $user->no_hp && substr($user->no_hp, 0, 2) == '08') {
                $message = "Halo {$user->name},\n\n"
                    . "Permohonan koperasi Anda telah ditolak.\n"
                    . "Alasan: {$permohonan->catatan}\n\n"
                    . "Silakan dicek pada halaman pengajuan pada website SILUK. Untuk detail lebih lanjut, dimohon menghubungi admin.\n\n"
                    . "Terima kasih,\n"
                    . "Admin SILUK.\n";
                $no_hp = '62' . substr($user->no_hp, 1);
                
                $whatsappService = new WhatsAppService();
                $whatsappResult = $whatsappService->sendMessage($no_hp, $message);
                
                Log::info('WhatsApp notification sent for rejected permohonan', [
                    'permohonan_id' => $id,
                    'user_id' => $user->id,
                    'phone' => $no_hp,
                    'catatan' => $permohonan->catatan,
                    'whatsapp_response' => $whatsappResult
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Permohonan berhasil ditolak.',
                'data' => $permohonan
            ]);
        } catch (\Exception $e) {
            Log::error('Error in DaftarPermohonanController@tolak', [
                'permohonan_id' => $id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menolak permohonan'
            ], 500);
        }
    }
}
