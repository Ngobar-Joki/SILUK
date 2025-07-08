<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerifyMail;
use App\Models\User;
use App\Models\verify_user;

class TestEmailCommand extends Command
{
    protected $signature = 'test:email {email}';
    protected $description = 'Test email sending functionality';

    public function handle()
    {
        $email = $this->argument('email');
        
        $this->info("Testing email sending to: {$email}");
        
        try {
            // Buat user dummy untuk testing
            $user = new User();
            $user->name = 'Test User';
            $user->email = $email;
            $user->id = 999; // ID dummy
            
            // Buat token dummy
            $token = sha1(time() . uniqid());
            
            // Kirim email
            Mail::to($email)->send(new VerifyMail($user, $token));
            
            $this->info("Email sent successfully!");
            
        } catch (\Exception $e) {
            $this->error("Failed to send email: " . $e->getMessage());
            $this->error("Error details: " . $e->getTraceAsString());
        }
    }
}
