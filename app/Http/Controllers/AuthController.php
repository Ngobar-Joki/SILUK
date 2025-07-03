<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
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
}