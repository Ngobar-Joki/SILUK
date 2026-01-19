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
            $permohonans = Permohonan::with(['user', 'verifiedByOperator', 'verifiedByKepala'])
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
            $user = Auth::user();
            
            // Verifikasi bertahap berdasarkan role
            if ($user->role === 'operator') {
                // Operator verifikasi tahap 1
                if ($permohonan->status !== 'pending') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Permohonan sudah diverifikasi sebelumnya'
                    ], 400);
                }
                
                $permohonan->status = 'verified_by_operator';
                $permohonan->verified_by_operator_id = Auth::id();
                $permohonan->operator_verified_at = now();
                $permohonan->save();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Permohonan berhasil diverifikasi operator. Menunggu verifikasi kepala.',
                    'data' => $permohonan
                ]);
                
            } elseif ($user->role === 'kepala') {
                // Kepala verifikasi tahap 2 (final)
                if ($permohonan->status !== 'verified_by_operator') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Permohonan harus diverifikasi operator terlebih dahulu'
                    ], 400);
                }
                
                $permohonan->status = 'accepted';
                $permohonan->verified_by_kepala_id = Auth::id();
                $permohonan->kepala_verified_at = now();
                $permohonan->save();
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses untuk verifikasi'
                ], 403);
            }
            
            // Kirim notifikasi WhatsApp hanya jika sudah disetujui final (kepala)
            if ($permohonan->status === 'accepted') {
                $userData = $permohonan->user;
                if ($userData && $userData->no_hp && substr($userData->no_hp, 0, 2) == '08') {
                    $message = "Halo {$userData->name},\n\n"
                        . "Permohonan koperasi Anda telah diverifikasi dan diterima.\n"
                        . "Silakan dicek pada halaman pengajuan pada website SILUK. Untuk detail lebih lanjut, dimohon menghubungi admin.\n\n"
                        . "Terima kasih,\n"
                        . "Admin SILUK.\n";
                    $no_hp = '62' . substr($userData->no_hp, 1);
                
                // Add random delay between 5-10 seconds
                $delay = rand(3, 5);
                Log::info('Adding delay before sending WhatsApp notification', [
                    'permohonan_id' => $id,
                    'delay_seconds' => $delay
                ]);
                sleep($delay);
                
                $whatsappService = new WhatsAppService();
                $whatsappResult = $whatsappService->sendMessage($no_hp, $message);
                
                Log::info('WhatsApp notification sent for approved permohonan', [
                    'permohonan_id' => $id,
                    'user_id' => $userData->id,
                    'phone' => $no_hp,
                    'delay_applied' => $delay,
                    'whatsapp_response' => $whatsappResult
                ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Permohonan berhasil diverifikasi dan disetujui.',
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
            $user = Auth::user();
            
            // Validasi: hanya pending dan verified_by_operator yang bisa ditolak
            if (!in_array($permohonan->status, ['pending', 'verified_by_operator'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Permohonan tidak dapat ditolak'
                ], 400);
            }
            
            $permohonan->status = 'rejected';
            $permohonan->catatan = $request->catatan;
            
            // Simpan siapa yang menolak
            if ($user->role === 'operator') {
                $permohonan->verified_by_operator_id = Auth::id();
                $permohonan->operator_verified_at = now();
            } elseif ($user->role === 'kepala') {
                $permohonan->verified_by_kepala_id = Auth::id();
                $permohonan->kepala_verified_at = now();
            }
            
            $permohonan->save();

            // Kirim notifikasi WhatsApp jika nomor tersedia
            $userData = $permohonan->user;
            if ($userData && $userData->no_hp && substr($userData->no_hp, 0, 2) == '08') {
                $message = "Halo {$userData->name},\n\n"
                    . "Permohonan koperasi Anda telah ditolak.\n"
                    . "Alasan: {$permohonan->catatan}\n\n"
                    . "Silakan dicek pada halaman pengajuan pada website SILUK. Untuk detail lebih lanjut, dimohon menghubungi admin.\n\n"
                    . "Terima kasih,\n"
                    . "Admin SILUK.\n";
                $no_hp = '62' . substr($userData->no_hp, 1);
                
                // Add random delay between 5-10 seconds
                $delay = rand(3, 5);
                Log::info('Adding delay before sending WhatsApp notification', [
                    'permohonan_id' => $id,
                    'delay_seconds' => $delay
                ]);
                sleep($delay);
                
                $whatsappService = new WhatsAppService();
                $whatsappResult = $whatsappService->sendMessage($no_hp, $message);
                
                Log::info('WhatsApp notification sent for rejected permohonan', [
                    'permohonan_id' => $id,
                    'user_id' => $userData->id,
                    'phone' => $no_hp,
                    'catatan' => $permohonan->catatan,
                    'delay_applied' => $delay,
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
