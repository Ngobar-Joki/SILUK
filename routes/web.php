<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;



// Main entry point for the SPA
Route::get('/', function () {
    return view('welcome');
});

