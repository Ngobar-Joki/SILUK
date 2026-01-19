<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('laporan_bulanans', function (Blueprint $table) {
            $table->id();
            $table->string('periode');
            $table->string('data_laporan');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['pending', 'verified_by_operator', 'accepted', 'rejected'])->default('pending');
            $table->text('catatan')->nullable();
            
            // Kolom verifikasi operator
            $table->foreignId('verified_by_operator_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('operator_verified_at')->nullable();
            
            // Kolom verifikasi kepala
            $table->foreignId('verified_by_kepala_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('kepala_verified_at')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laporan_bulanans');
    }
};
