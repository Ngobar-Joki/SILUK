<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\verify_user;
use Carbon\Carbon;

class CleanExpiredTokensCommand extends Command
{
    protected $signature = 'tokens:clean-expired';
    protected $description = 'Clean expired email verification tokens';

    public function handle()
    {
        $this->info('Cleaning expired verification tokens...');
        
        $deletedCount = verify_user::where('expires_at', '<', Carbon::now())->delete();
        
        $this->info("Deleted {$deletedCount} expired tokens.");
        
        return 0;
    }
}
