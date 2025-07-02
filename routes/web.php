<?php

use Illuminate\Support\Facades\Route;

// Main entry point for the SPA
Route::get('/', function () {
    return view('welcome');
});

