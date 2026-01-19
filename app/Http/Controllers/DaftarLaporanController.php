<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LaporanBulanan;
use App\Models\User;
use App\Service\WhatsAppService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;

class DaftarLaporanController extends Controller
{
    public function index()
    {
        try {
            $laporans = LaporanBulanan::with('user')->orderBy('created_at', 'desc')->get();
            return Inertia::render('operator/DaftarLaporan', [
                'laporans' => $laporans
            ]);
        } catch (\Exception $e) {
            Log::error('Error in DaftarLaporanController@index', ['error' => $e->getMessage()]);
            return Inertia::render('operator/DaftarLaporan', [
                'laporans' => [],
                'error' => 'Terjadi kesalahan saat mengambil data'
            ]);
        }
    }

    public function fetchedDaftarLaporan(Request $request)
    {
        try {
            $laporans = LaporanBulanan::with(['user', 'verifiedByOperator', 'verifiedByKepala'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $laporans
            ]);
        } catch (\Exception $e) {
            Log::error('Error in DaftarLaporanController@fetched', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data'
            ], 500);
        }
    }

    public function verifikasi($id)
    {
        try {
            $laporan = LaporanBulanan::with('user')->findOrFail($id);
            $user = Auth::user();
            
            // Verifikasi bertahap berdasarkan role
            if ($user->role === 'operator') {
                // Operator verifikasi tahap 1
                if ($laporan->status !== 'pending') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Laporan sudah diverifikasi sebelumnya'
                    ], 400);
                }
                
                $laporan->status = 'verified_by_operator';
                $laporan->verified_by_operator_id = Auth::id();
                $laporan->operator_verified_at = now();
                $laporan->save();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Laporan berhasil diverifikasi operator. Menunggu verifikasi kepala.',
                    'data' => $laporan
                ]);
                
            } elseif ($user->role === 'kepala') {
                // Kepala verifikasi tahap 2 (final)
                if ($laporan->status !== 'verified_by_operator') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Laporan harus diverifikasi operator terlebih dahulu'
                    ], 400);
                }
                
                $laporan->status = 'accepted';
                $laporan->verified_by_kepala_id = Auth::id();
                $laporan->kepala_verified_at = now();
                $laporan->save();
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses untuk verifikasi'
                ], 403);
            }
            
            // Kirim notifikasi WhatsApp hanya jika sudah disetujui final (kepala)
            if ($laporan->status === 'accepted') {
                $userData = $laporan->user;
                if ($userData && $userData->no_hp && substr($userData->no_hp, 0, 2) == '08') {
                $message = "Halo {$userData->name},\n\n"
                    . "Laporan bulanan Anda telah diverifikasi dan diterima.\n"
                    . "Silakan dicek pada halaman laporan pada website SILUK. Untuk detail lebih lanjut, dimohon menghubungi admin.\n\n"
                    . "Terima kasih,\n"
                    . "Admin SILUK.\n";
                $no_hp = '62' . substr($userData->no_hp, 1);
                
                // Add random delay between 5-10 seconds
                $delay = rand(3, 5);
                Log::info('Adding delay before sending WhatsApp notification', [
                    'laporan_id' => $id,
                    'delay_seconds' => $delay
                ]);
                sleep($delay);
                
                $whatsappService = new WhatsAppService();
                $whatsappResult = $whatsappService->sendMessage($no_hp, $message);
                
                Log::info('WhatsApp notification sent for approved laporan', [
                    'laporan_id' => $id,
                    'user_id' => $userData->id,
                    'phone' => $no_hp,
                    'delay_applied' => $delay,
                    'whatsapp_response' => $whatsappResult
                ]);
            }
            }

            return response()->json([
                'success' => true,
                'message' => 'Laporan berhasil diverifikasi dan disetujui.',
                'data' => $laporan
            ]);
        } catch (\Exception $e) {
            Log::error('Error in DaftarLaporanController@verifikasi', [
                'laporan_id' => $id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memverifikasi laporan'
            ], 500);
        }
    }

    public function tolak(Request $request, $id)
    {
        try {
            $laporan = LaporanBulanan::with('user')->findOrFail($id);
            $user = Auth::user();
            
            // Validasi: hanya pending dan verified_by_operator yang bisa ditolak
            if (!in_array($laporan->status, ['pending', 'verified_by_operator'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Laporan tidak dapat ditolak'
                ], 400);
            }
            
            $laporan->status = 'rejected';
            $laporan->catatan = $request->catatan;
            
            // Simpan siapa yang menolak
            if ($user->role === 'operator') {
                $laporan->verified_by_operator_id = Auth::id();
                $laporan->operator_verified_at = now();
            } elseif ($user->role === 'kepala') {
                $laporan->verified_by_kepala_id = Auth::id();
                $laporan->kepala_verified_at = now();
            }
            
            $laporan->save();

            // Kirim notifikasi WhatsApp jika nomor tersedia
            $userData = $laporan->user;
            if ($userData && $userData->no_hp && substr($userData->no_hp, 0, 2) == '08') {
                $message = "Halo {$userData->name},\n\n"
                    . "Laporan bulanan Anda telah ditolak.\n"
                    . "Alasan: {$laporan->catatan}\n\n"
                    . "Silakan dicek pada halaman laporan pada website SILUK. Untuk detail lebih lanjut, dimohon menghubungi admin.\n\n"
                    . "Terima kasih,\n"
                    . "Admin SILUK.\n";
                $no_hp = '62' . substr($userData->no_hp, 1);
                
                // Add random delay between 5-10 seconds
                $delay = rand(3, 5);
                Log::info('Adding delay before sending WhatsApp notification', [
                    'laporan_id' => $id,
                    'delay_seconds' => $delay
                ]);
                sleep($delay);
                
                $whatsappService = new WhatsAppService();
                $whatsappResult = $whatsappService->sendMessage($no_hp, $message);
                
                Log::info('WhatsApp notification sent for rejected laporan', [
                    'laporan_id' => $id,
                    'user_id' => $userData->id,
                    'phone' => $no_hp,
                    'catatan' => $laporan->catatan,
                    'delay_applied' => $delay,
                    'whatsapp_response' => $whatsappResult
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Laporan berhasil ditolak.',
                'data' => $laporan
            ]);
        } catch (\Exception $e) {
            Log::error('Error in DaftarLaporanController@tolak', [
                'laporan_id' => $id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menolak laporan'
            ], 500);
        }
    }

    public function sendMonthlyReminder()
    {
        try {
            // Only allow admin to trigger this
            if (Auth::user()->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            // Run the reminder command
            Artisan::call('reminder:monthly-report');
            $output = Artisan::output();

            Log::info('Monthly reminder manually triggered', [
                'triggered_by' => Auth::id(),
                'output' => $output
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Reminder bulanan berhasil dikirim',
                'output' => $output
            ]);
        } catch (\Exception $e) {
            Log::error('Error triggering monthly reminder', [
                'error' => $e->getMessage(),
                'triggered_by' => Auth::id()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengirim reminder'
            ], 500);
        }
    }
}
