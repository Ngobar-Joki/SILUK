<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\verify_user;
use Carbon\Carbon;

class CleanExpiredTokens extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tokens:clean-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean expired email verification tokens';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $expiredTokens = verify_user::where('expires_at', '<', Carbon::now())->get();
        
        $count = $expiredTokens->count();
        
        if ($count > 0) {
            verify_user::where('expires_at', '<', Carbon::now())->delete();
            $this->info("Deleted {$count} expired verification tokens.");
        } else {
            $this->info("No expired tokens found.");
        }
        
        return 0;
    }
}
