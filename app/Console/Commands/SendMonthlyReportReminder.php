<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Service\WhatsAppService;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SendMonthlyReportReminder extends Command
{
    protected $signature = 'reminder:monthly-report';
    protected $description = 'Send WhatsApp reminder for monthly report submission';

    public function handle()
    {
        $this->info('Starting monthly report reminder...');
        
        try {
            // Get all users with pendaftar role who have phone numbers
            $users = User::where('role', 'pendaftar')
                ->whereNotNull('no_hp')
                ->where('no_hp', '!=', '')
                ->where('no_hp', 'like', '08%')
                ->get();

            $whatsappService = new WhatsAppService();
            $successCount = 0;
            $failedCount = 0;
            
            $currentMonth = Carbon::now()->format('F Y');
            $previousMonth = Carbon::now()->subMonth()->format('F Y');

            foreach ($users as $user) {
                try {
                    $message = "Halo {$user->name},\n\n"
                        . "Reminder: Jangan lupa untuk mengajukan laporan bulanan untuk periode {$previousMonth}.\n\n"
                        . "Silakan login ke website SILUK untuk mengajukan laporan bulanan Anda.\n"
                        . "Batas waktu pengajuan adalah tanggal 10 setiap bulannya.\n\n"
                        . "Link: " . config('app.url') . "\n\n"
                        . "Terima kasih,\n"
                        . "Admin SILUK";

                    // Format phone number (remove 0 and add 62)
                    $no_hp = '62' . substr($user->no_hp, 1);
                    
                    // Add random delay between 3-8 seconds to avoid spam detection
                    $delay = rand(3, 8);
                    
                    $this->info("Sending reminder to {$user->name} ({$no_hp}) with {$delay}s delay...");
                    
                    sleep($delay);
                    
                    $result = $whatsappService->sendMessage($no_hp, $message);
                    
                    if ($result) {
                        $successCount++;
                        $this->info("✓ Successfully sent to {$user->name}");
                    } else {
                        $failedCount++;
                        $this->error("✗ Failed to send to {$user->name}");
                    }
                    
                    Log::info('Monthly report reminder sent', [
                        'user_id' => $user->id,
                        'user_name' => $user->name,
                        'phone' => $no_hp,
                        'delay_applied' => $delay,
                        'result' => $result,
                        'month_period' => $previousMonth
                    ]);
                    
                } catch (\Exception $e) {
                    $failedCount++;
                    $this->error("✗ Error sending to {$user->name}: " . $e->getMessage());
                    
                    Log::error('Error sending monthly report reminder', [
                        'user_id' => $user->id,
                        'user_name' => $user->name,
                        'error' => $e->getMessage()
                    ]);
                }
            }
            
            $this->info("\n=== Monthly Report Reminder Summary ===");
            $this->info("Total users: " . $users->count());
            $this->info("Successfully sent: {$successCount}");
            $this->info("Failed: {$failedCount}");
            
            Log::info('Monthly report reminder completed', [
                'total_users' => $users->count(),
                'success_count' => $successCount,
                'failed_count' => $failedCount,
                'month_period' => $previousMonth
            ]);
            
        } catch (\Exception $e) {
            $this->error('Error in monthly report reminder: ' . $e->getMessage());
            Log::error('Error in SendMonthlyReportReminder command', [
                'error' => $e->getMessage()
            ]);
        }
    }
}
