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
        'catatan',
        'verified_by_operator_id',
        'operator_verified_at',
        'verified_by_kepala_id',
        'kepala_verified_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function verifiedByOperator()
    {
        return $this->belongsTo(User::class, 'verified_by_operator_id');
    }
    
    public function verifiedByKepala()
    {
        return $this->belongsTo(User::class, 'verified_by_kepala_id');
    }
}
