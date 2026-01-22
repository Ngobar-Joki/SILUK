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

// WhatsApp verification routes
Route::get('verify/{token}', [AuthController::class, 'verify'])->name('verify');
Route::get('verify-otp', function () {
    $noHp = session('verify_no_hp', '');
    // JANGAN hapus session di sini, biarkan sampai verifikasi berhasil
    return inertia('VerifyOTPPage', ['noHp' => $noHp]);
})->name('verify.otp.page');
Route::post('verify-otp', [AuthController::class, 'verifyOTP'])->name('verify.otp');
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

//profile pendaftar routes
Route::get('/profile-pendaftar', [App\Http\Controllers\ProfilePendaftarController::class, 'index'])->name('profile-pendaftar');
Route::get('/profile-pendaftar/fetched', [App\Http\Controllers\ProfilePendaftarController::class, 'fetchProfilePendaftar'])->name('profile-pendaftar.fetched');
Route::put('/profile-pendaftar', [App\Http\Controllers\ProfilePendaftarController::class, 'update'])->name('profile-pendaftar.update');

// API untuk mengambil data user yang sedang login
Route::middleware(['auth'])->get('/api/user', [AuthController::class, 'getUser'])->name('api.user');

// Public API routes (accessible without authentication)
Route::get('/api/struktur-organisasi/public', [App\Http\Controllers\StrukturOrganisasiController::class, 'fetchedStrukturOrganisasiPublic'])->name('api.struktur-organisasi.public');

// Public API route for visi misi (accessible without authentication)
Route::get('/api/visi-misi/public', [App\Http\Controllers\VisiMisiController::class, 'fetchedVisiMisi'])->name('api.visi-misi.public');

// Public API route for berita (accessible without authentication)
Route::get('/api/berita/public', [App\Http\Controllers\BeritaController::class, 'fetchedBeritaPublic'])->name('api.berita.public');

// Tambahkan route API untuk notifikasi navbar
Route::middleware(['auth'])->get('/api/notif-navbar', [App\Http\Controllers\NotifNavbarController::class, 'index'])->name('api.notif-navbar');
Route::middleware(['auth'])->post('/api/notif-navbar/mark-all-read', [App\Http\Controllers\NotifNavbarController::class, 'markAllRead'])->name('api.notif-navbar.markAllRead');

Route::middleware(['auth', 'role:operator,kepala'])->group(function () {


    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/api/dashboard', [DashboardController::class, 'getDashboardData'])->name('api.dashboard');


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


    // DaftarPermohonan routes
    Route::get('/daftar-permohonan', [App\Http\Controllers\DaftarPermohonanController::class, 'index'])->name('daftar-permohonan');
    Route::get('/daftar-permohonan/fetched', [App\Http\Controllers\DaftarPermohonanController::class, 'fetchedDaftarPermohonan'])->name('daftar-permohonan.fetched');
    Route::post('/daftar-permohonan/verifikasi/{id}', [App\Http\Controllers\DaftarPermohonanController::class, 'verifikasi'])->name('daftar-permohonan.verifikasi');
    Route::post('/daftar-permohonan/tolak/{id}', [App\Http\Controllers\DaftarPermohonanController::class, 'tolak'])->name('daftar-permohonan.tolak');

    // DaftarLaporan routes
    Route::get('/daftar-laporan', [App\Http\Controllers\DaftarLaporanController::class, 'index'])->name('daftar-laporan');
    Route::get('/daftar-laporan/fetched', [App\Http\Controllers\DaftarLaporanController::class, 'fetchedDaftarLaporan'])->name('daftar-laporan.fetched');
    Route::post('/daftar-laporan/verifikasi/{id}', [App\Http\Controllers\DaftarLaporanController::class, 'verifikasi'])->name('daftar-laporan.verifikasi');
    Route::post('/daftar-laporan/tolak/{id}', [App\Http\Controllers\DaftarLaporanController::class, 'tolak'])->name('daftar-laporan.tolak');

    Route::get('/api/accessibility/statistics', [App\Http\Controllers\AccessibilityController::class, 'getStatistics']);
});

Route::middleware(['auth', 'role:pendaftar'])->group(function () {
    // Route::get('/pendaftar', [PendaftarController::class, 'index'])->name('pendaftar');

    // Permohonan routes

    Route::get('/permohonan', [App\Http\Controllers\PermohonanController::class, 'index'])->name('permohonan');
    Route::post('/permohonan', [App\Http\Controllers\PermohonanController::class, 'store'])->name('permohonan.store');
    Route::get('/permohonan/fetched', [App\Http\Controllers\PermohonanController::class, 'fetchedPermohonan'])->name('permohonan.fetched');

    Route::get('/permohonan/{permohonan}', [App\Http\Controllers\PermohonanController::class, 'show'])->name('permohonan.show');
    Route::put('/permohonan/{permohonan}', [App\Http\Controllers\PermohonanController::class, 'update'])->name('permohonan.update');
    Route::delete('/permohonan/{permohonan}', [App\Http\Controllers\PermohonanController::class, 'destroy'])->name('permohonan.destroy');
    // Tambahkan endpoint untuk fetch data permohonan (AJAX)

    // LaporanBulanan routes
    Route::get('/laporan-bulanan', [App\Http\Controllers\LaporanBulananController::class, 'index'])->name('laporan-bulanan');
    Route::post('/laporan-bulanan', [App\Http\Controllers\LaporanBulananController::class, 'store'])->name('laporan-bulanan.store');
    Route::get('/laporan-bulanan/fetched', [App\Http\Controllers\LaporanBulananController::class, 'fetchedLaporanBulanan'])->name('laporan-bulanan.fetched');
    Route::get('/laporan-bulanan/{id}', [App\Http\Controllers\LaporanBulananController::class, 'show'])->name('laporan-bulanan.show');
    Route::put('/laporan-bulanan/{laporanBulanan}', [App\Http\Controllers\LaporanBulananController::class, 'update'])->name('laporan-bulanan.update');
    Route::delete('/laporan-bulanan/{laporanBulanan}', [App\Http\Controllers\LaporanBulananController::class, 'destroy'])->name('laporan-bulanan.destroy');
});

Route::middleware(['auth', 'role:admin'])->group(function () {
    // Manual trigger for monthly reminder (for testing)
    Route::post('/admin/send-monthly-reminder', [App\Http\Controllers\DaftarLaporanController::class, 'sendMonthlyReminder']);
});

// Chatbot API routes (no authentication required)
Route::prefix('api/chatbot')->group(function () {
    Route::post('/', [App\Http\Controllers\ChatbotController::class, 'chat'])->name('chatbot.chat');
});

// Demo route for chatbot
Route::get('/chatbot-demo', function () {
    return response()->file(public_path('chatbot-demo.html'));
})->name('chatbot.demo');