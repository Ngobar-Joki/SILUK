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


Route::middleware(['auth', 'role:operator'])->group(function () {


    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
  
});

Route::middleware(['auth', 'role:pendaftar'])->group(function () {
    Route::get('/pendaftar', [PendaftarController::class, 'index'])->name('pendaftar');
 
});