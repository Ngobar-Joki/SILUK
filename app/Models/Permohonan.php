<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permohonan extends Model
{
    protected $fillable = [
        'susunan_penggurus',
        'surat_nonpengurus',
        'surat_kuasa',
        'bukti_modal',
        'ktp',
        'user_id',
        'status',
        'catatan',
    ];

    public $timestamps = true;

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
