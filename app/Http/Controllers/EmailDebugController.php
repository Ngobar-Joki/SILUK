<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\verify_user;
use App\Mail\VerifyMail;

class EmailDebugController extends Controller
{
    public function testEmail(Request $request)
    {
        if (!app()->environment('local')) {
            return response()->json(['error' => 'Hanya tersedia di environment local'], 403);
        }

        $email = $request->input('email', 'test@example.com');
        
        try {
            // Buat user dummy untuk testing
            $user = new User();
            $user->name = 'Test User';
            $user->email = $email;
            $user->id = 999;
            
            // Buat token dummy
            $token = sha1(time() . uniqid());
            
            // Test kirim email
            Mail::to($email)->send(new VerifyMail($user, $token));
            
            Log::info('Test email sent successfully', ['email' => $email]);
            
            return response()->json([
                'success' => true,
                'message' => 'Test email sent successfully',
                'email' => $email,
                'token' => $token
            ]);
            
        } catch (\Exception $e) {
            Log::error('Test email failed', [
                'email' => $email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Email sending failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function checkEmailConfig()
    {
        if (!app()->environment('local')) {
            return response()->json(['error' => 'Hanya tersedia di environment local'], 403);
        }
        
        $config = [
            'driver' => config('mail.default'),
            'host' => config('mail.mailers.smtp.host'),
            'port' => config('mail.mailers.smtp.port'),
            'username' => config('mail.mailers.smtp.username'),
            'password' => config('mail.mailers.smtp.password') ? '***' : 'null',
            'encryption' => config('mail.mailers.smtp.encryption'),
            'from_address' => config('mail.from.address'),
            'from_name' => config('mail.from.name'),
        ];
        
        return response()->json($config);
    }
}
