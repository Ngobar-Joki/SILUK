<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\verify_user;
use App\Service\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function login()
    {
         return Inertia::render('Login'); 
    }

    public function postLogin(Request $request)
    {
        $credentials = $request->only('username', 'password');

        // Logging awal
        Log::debug('Login attempt initiated.', [
            'username' => $request->input('username'),
            'password_provided' => !empty($request->input('password'))
        ]);

        // Cek apakah user ditemukan
        $userExists = User::where('username', $credentials['username'])->first();
        if ($userExists) {
            Log::debug('User found by username.', [
                'username' => $credentials['username'],
                'user_id' => $userExists->id
            ]);
            
            // Cek apakah user sudah terverifikasi
            if (!$userExists->verified) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => "Akun Anda belum terverifikasi. Silakan cek WhatsApp untuk link verifikasi.",
                    ], 401);
                }
                
                return back()->withErrors([
                    'username' => 'Akun Anda belum terverifikasi. Silakan cek WhatsApp untuk link verifikasi.',
                ]);
            }
        } else {
            Log::warning('User NOT found by username during login attempt.', [
                'username' => $credentials['username']
            ]);
        }

        // Coba login
        if (Auth::attempt($credentials)) {
            // Regenerasi session
            $request->session()->regenerate();

            $user = Auth::user();

            $intended = session('url.intended');
            $redirectUrl = $intended ? $intended : match ($user->role) {
                'operator' => route('dashboard'),
                'kepala' => route('dashboard'),
                'pendaftar' => url('/'),
                default => url('/'),
            };

            session()->forget('url.intended');

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Login berhasil!',
                    'redirect' => $redirectUrl,
                ]);
            }

            return redirect($redirectUrl);
        } else {
            // Logging ketika Auth::attempt gagal
            Log::warning('Auth::attempt failed.', [
                'username' => $credentials['username']
            ]);

            // Manual hash check untuk debugging
            if ($userExists) {
                $passwordInput = $credentials['password'];
                $hashInDb = $userExists->password;

                if (Hash::check($passwordInput, $hashInDb)) {
                    Log::debug('Manual Hash::check berhasil, tapi Auth::attempt gagal. Kemungkinan masalah ada di guard atau konfigurasi auth.');
                } else {
                    Log::debug('Manual Hash::check juga gagal.', [
                        'password_input' => $passwordInput,
                        'password_hash_db' => $hashInDb
                    ]);
                }
            } else {
                Log::debug('Hash::check tidak bisa dijalankan karena user tidak ditemukan.');
            }

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => "Username atau Password Salah",
                ], 401);
            }

            return back()->withErrors([
                'username' => 'Username atau Password Salah',
            ]);
        }
    }

    public function logout(Request $request)
    {
        Auth::logout();
        
        // Regenerate session for security
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        // Redirect to login page instead of rendering
        return redirect()->route('login')->with('message', 'Logout berhasil');
    }

    
    public function register()
    {
        return Inertia::render('Register');
    }

    public function postRegister(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'username' => 'required|string|unique:users,username',
            'no_hp' => 'required|string|max:20',
            'alamat' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'required' => ':attribute harus diisi',
            'email' => 'Format email tidak valid',
            'unique' => ':attribute sudah terdaftar',
            'confirmed' => 'Konfirmasi password tidak sama',
            'min' => ':attribute minimal :min karakter',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Data tidak valid'
            ], 422);
        }

        $user = null;
        $verifyUser = null;

        try {
            // Buat user baru
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'username' => $request->username,
                'no_hp' => $request->no_hp,
                'alamat' => $request->alamat,
                'password' => Hash::make($request->password),
                'role' => 'pendaftar',
                'verified' => false,
            ]);

            Log::info('User created successfully', ['user_id' => $user->id, 'email' => $user->email]);

            // Buat token verifikasi
            $verifyUser = verify_user::createToken($user->id);
            
            Log::info('Verification token created', ['user_id' => $user->id, 'token' => $verifyUser->token]);

        } catch (\Exception $e) {
            Log::error('Database error during registration: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.',
            ], 500);
        }

        // Jika user berhasil dibuat, coba kirim WhatsApp
        if ($user && $verifyUser) {
            try {
                // Kirim WhatsApp verifikasi dengan OTP
                $whatsappService = new WhatsAppService();
                
                // Format pesan dengan kode OTP
                $message = "*SILUK - Verifikasi Akun*\n\n";
                $message .= "Halo *{$user->name}*,\n\n";
                $message .= "Selamat datang di SILUK!\n\n";
                $message .= "Kode verifikasi Anda adalah:\n\n";
                $message .= "*{$verifyUser->otp_code}*\n\n";
                $message .= "Masukkan kode di atas pada halaman verifikasi.\n\n";
                $message .= "_Kode berlaku selama 24 jam_\n\n";
                $message .= "Terima kasih! 🙏";
                
                $response = $whatsappService->sendMessage($user->no_hp, $message);
                
                Log::info('Verification WhatsApp sent successfully', [
                    'user_id' => $user->id, 
                    'no_hp' => $user->no_hp,
                    'response' => $response
                ]);

                // Simpan nomor HP ke session untuk halaman OTP
                session(['verify_no_hp' => $user->no_hp]);

                // Return JSON response dengan redirect URL
                return response()->json([
                    'success' => true,
                    'message' => 'Registrasi berhasil! Silakan masukkan kode OTP yang telah dikirim ke WhatsApp Anda.',
                    'redirect' => '/verify-otp'
                ]);

            } catch (\Exception $e) {
                Log::error('WhatsApp sending failed: ' . $e->getMessage(), [
                    'user_id' => $user->id,
                    'no_hp' => $user->no_hp,
                    'trace' => $e->getTraceAsString()
                ]);
                
                // User sudah terdaftar, tapi WhatsApp gagal terkirim
                return response()->json([
                    'success' => true,
                    'message' => 'Registrasi berhasil! Namun pesan WhatsApp verifikasi gagal terkirim. Anda dapat meminta kirim ulang verifikasi.',
                    'wa_failed' => true,
                    'user_no_hp' => $user->no_hp
                ]);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'Terjadi kesalahan sistem. Silakan coba lagi.',
        ], 500);
    }

    public function verify($token)
    {
        $verifyUser = verify_user::where('token', $token)->first();
        
        if ($verifyUser && !$verifyUser->isExpired()) {
            $user = $verifyUser->user;
            if (!$user->verified) {
                $user->verified = true;
                $user->save();
                
                // Hapus token setelah verifikasi berhasil
                verify_user::where('user_id', $user->id)->delete();
                
                $status = "Akun Anda telah berhasil diverifikasi. Anda sekarang dapat login ke akun Anda.";
                $success = true;
            } else {
                $status = "Akun Anda sudah diverifikasi sebelumnya. Anda dapat login ke akun Anda.";
                $success = true;
            }
        } else {
            // Cek apakah token ada tapi sudah expired
            $expiredToken = verify_user::where('token', $token)->first();
            if ($expiredToken && $expiredToken->isExpired()) {
                $status = "Token verifikasi telah kedaluwarsa. Silakan minta verifikasi ulang.";
            } else {
                $status = "Token verifikasi tidak valid. Silakan minta verifikasi ulang atau hubungi administrator.";
            }
            $success = false;
        }

        return view('emails.verifiedConfirmMail', [
            'success' => $success,
            'message' => $status,
            'redirect' => $success ? url('/login') : null
        ]);
    }
    
    /**
     * Verifikasi akun menggunakan kode OTP
     */
    public function verifyOTP(Request $request)
    {
        $request->validate([
            'otp_code' => 'required|string|size:6',
            'no_hp' => 'required|string'
        ]);
        
        $user = User::where('no_hp', $request->no_hp)->first();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor HP tidak ditemukan.'
            ], 404);
        }
        
        if ($user->verified) {
            return response()->json([
                'success' => false,
                'message' => 'Akun sudah terverifikasi sebelumnya.'
            ], 400);
        }
        
        $verifyUser = verify_user::where('user_id', $user->id)
            ->where('otp_code', $request->otp_code)
            ->first();
        
        if (!$verifyUser) {
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP tidak valid.'
            ], 400);
        }
        
        if ($verifyUser->isExpired()) {
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP telah kedaluwarsa. Silakan minta kode baru.'
            ], 400);
        }
        
        // Verifikasi berhasil
        $user->verified = true;
        $user->save();
        
        // Hapus token
        verify_user::where('user_id', $user->id)->delete();
        
        // Hapus session verify_no_hp setelah verifikasi berhasil
        session()->forget('verify_no_hp');
        
        Log::info('User verified via OTP', ['user_id' => $user->id, 'no_hp' => $user->no_hp]);
        
        return response()->json([
            'success' => true,
            'message' => 'Akun Anda telah berhasil diverifikasi! Silakan login.',
            'redirect' => url('/login')
        ]);
    }

    public function resendVerification(Request $request)
    {
        $request->validate([
            'no_hp' => 'required|string|exists:users,no_hp'
        ]);

        $user = User::where('no_hp', $request->no_hp)->first();
        
        if ($user->verified) {
            return response()->json([
                'success' => false,
                'message' => 'Akun sudah terverifikasi'
            ], 400);
        }

        try {
            // Hapus token lama jika ada
            verify_user::where('user_id', $user->id)->delete();

            // Buat token baru
            $verifyUser = verify_user::createToken($user->id);

            Log::info('New verification token created for resend', [
                'user_id' => $user->id, 
                'token' => $verifyUser->token
            ]);

            // Kirim ulang WhatsApp verifikasi dengan OTP
            $whatsappService = new WhatsAppService();
            
            // Format pesan dengan kode OTP
            $message = "*SILUK - Verifikasi Akun*\n\n";
            $message .= "Halo *{$user->name}*,\n\n";
            $message .= "Kode verifikasi baru Anda adalah:\n\n";
            $message .= "*{$verifyUser->otp_code}*\n\n";
            $message .= "Masukkan kode di atas pada halaman verifikasi.\n\n";
            $message .= "_Kode berlaku selama 24 jam_\n\n";
            $message .= "Terima kasih! \ud83d\ude4f";
            
            $response = $whatsappService->sendMessage($user->no_hp, $message);

            Log::info('Verification WhatsApp resent successfully', [
                'user_id' => $user->id, 
                'no_hp' => $user->no_hp,
                'response' => $response
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Link verifikasi telah dikirim ulang ke WhatsApp Anda. Silakan cek pesan masuk.'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to resend verification WhatsApp: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'no_hp' => $user->no_hp,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengirim pesan verifikasi. Silakan coba lagi.'
            ], 500);
        }
    }

    // API untuk mengambil data user yang sedang login
    public function getUser(Request $request)
    {
        $user = $request->user();
        if ($user) {
            return response()->json([
                'success' => true,
                'user' => $user
            ]);
        }
        return response()->json([
            'success' => false,
            'message' => 'User tidak ditemukan'
        ], 404);
    }
}