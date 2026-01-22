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
                ->where(function($query) {
                    $query->where('no_hp', 'like', '08%')
                          ->orWhere('no_hp', 'like', '628%');
                })
                ->get();

            if ($users->isEmpty()) {
                $this->warn('No users found with valid phone numbers.');
                Log::warning('No pendaftar users found for monthly report reminder');
                return Command::SUCCESS;
            }

            $whatsappService = new WhatsAppService();
            $successCount = 0;
            $failedCount = 0;
            
            // Set locale to Indonesian
            Carbon::setLocale('id');
            $currentMonth = Carbon::now()->translatedFormat('F Y');
            $previousMonth = Carbon::now()->subMonth()->translatedFormat('F Y');

            $this->info("Sending reminders for period: {$previousMonth}");
            $this->info("Total recipients: " . $users->count());
            $this->newLine();
            
            // Create progress bar
            $bar = $this->output->createProgressBar($users->count());
            $bar->setFormat(' %current%/%max% [%bar%] %percent:3s%% - %message%');
            $bar->setMessage('Starting...');
            $bar->start();

            foreach ($users as $user) {
                $bar->setMessage("Processing: {$user->name}");
                
                try {
                    $message = "Halo {$user->name},\n\n"
                        . "Reminder: Jangan lupa untuk mengajukan laporan bulanan untuk periode {$previousMonth}.\n\n"
                        . "Silakan login ke website SILUK untuk mengajukan laporan bulanan Anda.\n"
                        . "Batas waktu pengajuan adalah tanggal 10 setiap bulannya, jika laporan tidak dikirim maka koperasi anda akan dinyatakan tidak aktif di kementrian.\n\n"
                        . "Link: " . config('app.url') . "\n\n"
                        . "Terima kasih,\n"
                        . "Admin SILUK";

                    // Format phone number - handle both 08xxx and 628xxx formats
                    $no_hp = $user->no_hp;
                    
                    if (str_starts_with($no_hp, '08')) {
                        $no_hp = '62' . substr($no_hp, 1);
                    } elseif (!str_starts_with($no_hp, '62')) {
                        // Skip invalid phone numbers
                        $failedCount++;
                        Log::warning('Invalid phone number format skipped', [
                            'user_id' => $user->id,
                            'user_name' => $user->name,
                            'phone' => $user->no_hp
                        ]);
                        $bar->advance();
                        continue;
                    }
                    
                    // Add random delay between 3-8 seconds to avoid spam detection
                    $delay = rand(3, 8);
                    sleep($delay);
                    
                    $result = $whatsappService->sendMessage($no_hp, $message);
                    
                    if ($result) {
                        $successCount++;
                    } else {
                        $failedCount++;
                    }
                    
                    Log::info('Monthly report reminder sent', [
                        'user_id' => $user->id,
                        'user_name' => $user->name,
                        'phone' => $no_hp,
                        'delay_applied' => $delay,
                        'result' => $result ? 'success' : 'failed',
                        'month_period' => $previousMonth
                    ]);
                    
                } catch (\Exception $e) {
                    $failedCount++;
                    
                    Log::error('Error sending monthly report reminder', [
                        'user_id' => $user->id,
                        'user_name' => $user->name,
                        'phone' => $user->no_hp ?? 'N/A',
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
                
                $bar->advance();
            }
            
            $bar->setMessage('Complete!');
            $bar->finish();
            $this->newLine(2);
            
            $this->info("=== Monthly Report Reminder Summary ===");
            $this->info("Period: {$previousMonth}");
            $this->info("Total users: " . $users->count());
            $this->line("<fg=green>Successfully sent: {$successCount}</>");
            $this->line("<fg=red>Failed: {$failedCount}</>");
            
            Log::info('Monthly report reminder completed', [
                'total_users' => $users->count(),
                'success_count' => $successCount,
                'failed_count' => $failedCount,
                'month_period' => $previousMonth,
                'timestamp' => Carbon::now()->toDateTimeString()
            ]);
            
            return Command::SUCCESS;
            
        } catch (\Exception $e) {
            $this->error('Error in monthly report reminder: ' . $e->getMessage());
            Log::error('Error in SendMonthlyReportReminder command', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return Command::FAILURE;
        }
    }
}