<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;



// Main entry point for the SPA
Route::get('/', function () {
    return inertia('welcome');
});


Route::get('login', [AuthController::class, 'login'])->name('login');
Route::post('login', [AuthController::class, 'postLogin'])->name('postLogin');
Route::post('logout', [AuthController::class, 'logout'])->name('logout');

// Registration routes
Route::get('register', [AuthController::class, 'register'])->name('register');
Route::post('register', [AuthController::class, 'postRegister'])->name('postRegister');

// Email verification routes
Route::get('verify/{token}', [AuthController::class, 'verify'])->name('verify');
Route::get('resend-verification', function () {
    return inertia('ResendVerificationPage');
})->name('resend.verification.page');
Route::post('resend-verification', [AuthController::class, 'resendVerification'])->name('resend.verification');

// Debug routes (hanya untuk development)
Route::get('debug/email/test', [App\Http\Controllers\EmailDebugController::class, 'testEmail'])->name('debug.email.test');
Route::get('debug/email/config', [App\Http\Controllers\EmailDebugController::class, 'checkEmailConfig'])->name('debug.email.config');

// Accessibility routes (available for all authenticated users)
Route::middleware(['auth'])->prefix('api/accessibility')->group(function () {
    Route::post('/save', [App\Http\Controllers\AccessibilityController::class, 'saveSettings']);
    Route::get('/load', [App\Http\Controllers\AccessibilityController::class, 'loadSettings']);
    Route::delete('/delete', [App\Http\Controllers\AccessibilityController::class, 'deleteSettings']);
});

//profile user routes
    Route::get('/profile-user', [App\Http\Controllers\ProfileUserController::class, 'index'])->name('profile-user');
    Route::get('/profile-user/fetched', [App\Http\Controllers\ProfileUserController::class, 'fetchProfileUser'])->name('profile-user.fetched');
    Route::put('/profile-user', [App\Http\Controllers\ProfileUserController::class, 'update'])->name('profile-user.update');



// API untuk mengambil data user yang sedang login
Route::middleware(['auth'])->get('/api/user', [AuthController::class, 'getUser'])->name('api.user');

Route::middleware(['auth', 'role:operator'])->group(function () {


    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

  
    // VisiMisi routes
    Route::get('/visi-misi', [App\Http\Controllers\VisiMisiController::class, 'index'])->name('visi-misi');
    Route::post('/visi-misi', [App\Http\Controllers\VisiMisiController::class, 'store'])->name('visi-misi.store');
    Route::put('/visi-misi/{id}', [App\Http\Controllers\VisiMisiController::class, 'update'])->name('visi-misi.update');
    Route::delete('/visi-misi/{id}', [App\Http\Controllers\VisiMisiController::class, 'destroy'])->name('visi-misi.destroy');
    Route::get('/visi-misi/fetched', [App\Http\Controllers\VisiMisiController::class, 'fetchedVisiMisi'])->name('visi-misi.fetched');
  
    // StrukturOrganisasi routes
    Route::get('/struktur-organisasi', [App\Http\Controllers\StrukturOrganisasiController::class, 'index'])->name('struktur-organisasi');
    Route::post('/struktur-organisasi', [App\Http\Controllers\StrukturOrganisasiController::class, 'store'])->name('struktur-organisasi.store');
    Route::put('/struktur-organisasi/{id}', [App\Http\Controllers\StrukturOrganisasiController::class, 'update'])->name('struktur-organisasi.update');
    Route::delete('/struktur-organisasi/{id}', [App\Http\Controllers\StrukturOrganisasiController::class, 'destroy'])->name('struktur-organisasi.destroy');
    Route::get('/struktur-organisasi/fetched', [App\Http\Controllers\StrukturOrganisasiController::class, 'fetchedStrukturOrganisasi'])->name('struktur-organisasi.fetched');

    // Berita routes
    Route::get('/berita', [App\Http\Controllers\BeritaController::class, 'index'])->name('berita');
    Route::post('/berita', [App\Http\Controllers\BeritaController::class, 'store'])->name('berita.store');
    Route::put('/berita/{id}', [App\Http\Controllers\BeritaController::class, 'update'])->name('berita.update');
    Route::delete('/berita/{id}', [App\Http\Controllers\BeritaController::class, 'destroy'])->name('berita.destroy');
    Route::get('/berita/fetched', [App\Http\Controllers\BeritaController::class, 'fetchedBerita'])->name('berita.fetched');


    // DaftarUser routes
Route::get('/daftar-user', [App\Http\Controllers\DaftarUserController::class, 'index'])->name('daftar-user');
Route::post('/daftar-user', [App\Http\Controllers\DaftarUserController::class, 'store'])->name('daftar-user.store');
Route::put('/daftar-user/{id}', [App\Http\Controllers\DaftarUserController::class, 'update'])->name('daftar-user.update');
Route::delete('/daftar-user/{id}', [App\Http\Controllers\DaftarUserController::class, 'destroy'])->name('daftar-user.destroy');
Route::get('/daftar-user/fetched', [App\Http\Controllers\DaftarUserController::class, 'fetchedUsers'])->name('daftar-user.fetched');

    Route::get('/api/accessibility/statistics', [App\Http\Controllers\AccessibilityController::class, 'getStatistics']);
});

Route::middleware(['auth', 'role:pendaftar'])->group(function () {
    // Route::get('/pendaftar', [PendaftarController::class, 'index'])->name('pendaftar');
 
});