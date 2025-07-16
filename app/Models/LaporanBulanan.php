<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LaporanBulanan extends Model
{
    protected $fillable = [
        'periode',
        'data_laporan',
        'user_id',
        'status',
        'catatan'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

     public function pendaftar()
    {
        return $this->hasMany(verify_user::class, 'id_pendaftar');
    }
    
    public function operator()
    {
        return $this->hasMany(Permohonan::class, 'id_operator');
    }
}
