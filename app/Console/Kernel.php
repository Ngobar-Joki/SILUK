<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected $commands = [
        Commands\SendMonthlyReportReminder::class,
    ];

    protected function schedule(Schedule $schedule)
    {
        // Send monthly report reminder on the 1st of every month at 9:00 AM
        $schedule->command('reminder:monthly-report')
            ->monthlyOn(1, '09:00')
            ->timezone('Asia/Jakarta')
            ->withoutOverlapping()
            ->runInBackground();
            
        // Alternative: Send reminder on the 1st and 5th of every month
        // $schedule->command('reminder:monthly-report')
        //     ->monthlyOn(1, '09:00')
        //     ->timezone('Asia/Jakarta');
            
        // $schedule->command('reminder:monthly-report')
        //     ->monthlyOn(5, '09:00')
        //     ->timezone('Asia/Jakarta');
    }

    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
