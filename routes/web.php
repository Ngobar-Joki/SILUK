<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PendaftarController;


// Main entry point for the SPA
Route::get('/', function () {
    return inertia('welcome');
});


Route::get('login', [AuthController::class, 'login'])->name('login');
Route::post('login', [AuthController::class, 'postLogin'])->name('postLogin');
Route::post('logout', [AuthController::class, 'logout'])->name('logout');

// Accessibility routes (available for all authenticated users)
Route::middleware(['auth'])->prefix('api/accessibility')->group(function () {
    Route::post('/save', [App\Http\Controllers\AccessibilityController::class, 'saveSettings']);
    Route::get('/load', [App\Http\Controllers\AccessibilityController::class, 'loadSettings']);
    Route::delete('/delete', [App\Http\Controllers\AccessibilityController::class, 'deleteSettings']);
});

// Accessibility statistics (admin only)
Route::middleware(['auth', 'role:operator'])->group(function () {
    Route::get('/api/accessibility/statistics', [App\Http\Controllers\AccessibilityController::class, 'getStatistics']);
});


Route::middleware(['auth', 'role:operator'])->group(function () {


    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // VisiMisi routes
    Route::get('/visi-misi', [App\Http\Controllers\VisiMisiController::class, 'index'])->name('visi-misi');
    Route::post('/visi-misi', [App\Http\Controllers\VisiMisiController::class, 'store'])->name('visi-misi.store');
    Route::put('/visi-misi/{id}', [App\Http\Controllers\VisiMisiController::class, 'update'])->name('visi-misi.update');
    Route::delete('/visi-misi/{id}', [App\Http\Controllers\VisiMisiController::class, 'destroy'])->name('visi-misi.destroy');
    Route::get('/visi-misi/fetched', [App\Http\Controllers\VisiMisiController::class, 'fetchedVisiMisi'])->name('visi-misi.fetched');
  
});

Route::middleware(['auth', 'role:pendaftar'])->group(function () {
    Route::get('/pendaftar', [PendaftarController::class, 'index'])->name('pendaftar');
 
});