<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\verify_user;
use App\Mail\VerifyMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
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
                        'message' => "Akun Anda belum terverifikasi. Silakan cek email untuk verifikasi.",
                    ], 401);
                }
                
                return back()->withErrors([
                    'username' => 'Akun Anda belum terverifikasi. Silakan cek email untuk verifikasi.',
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

        // Jika user berhasil dibuat, coba kirim email
        if ($user && $verifyUser) {
            try {
                // Kirim email verifikasi
                Mail::to($user->email)->send(new VerifyMail($user, $verifyUser->token));
                
                Log::info('Verification email sent successfully', ['user_id' => $user->id, 'email' => $user->email]);

                return response()->json([
                    'success' => true,
                    'message' => 'Registrasi berhasil! Silakan cek email Anda untuk verifikasi akun.',
                ]);

            } catch (\Exception $e) {
                Log::error('Email sending failed: ' . $e->getMessage(), [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'trace' => $e->getTraceAsString()
                ]);
                
                // User sudah terdaftar, tapi email gagal terkirim
                return response()->json([
                    'success' => true,
                    'message' => 'Registrasi berhasil! Namun email verifikasi gagal terkirim. Anda dapat meminta kirim ulang email verifikasi.',
                    'email_failed' => true,
                    'user_email' => $user->email
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
                
                $status = "Email Anda telah berhasil diverifikasi. Anda sekarang dapat login ke akun Anda.";
                $success = true;
            } else {
                $status = "Email Anda sudah diverifikasi sebelumnya. Anda dapat login ke akun Anda.";
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

    public function resendVerification(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        $user = User::where('email', $request->email)->first();
        
        if ($user->verified) {
            return response()->json([
                'success' => false,
                'message' => 'Email sudah terverifikasi'
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

            // Kirim ulang email verifikasi
            Mail::to($user->email)->send(new VerifyMail($user, $verifyUser->token));

            Log::info('Verification email resent successfully', [
                'user_id' => $user->id, 
                'email' => $user->email
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Email verifikasi telah dikirim ulang. Silakan cek kotak masuk Anda.'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to resend verification email: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'email' => $user->email,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengirim email verifikasi. Silakan coba lagi.'
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