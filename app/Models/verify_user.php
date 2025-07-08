<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class verify_user extends Model
{
    protected $table = 'verify_users';
    
    // Tabel tidak menggunakan auto-increment id
    public $incrementing = false;
    protected $primaryKey = 'user_id';
    protected $keyType = 'int';
    
    protected $guarded = [];
    
    // Menggunakan timestamps default Laravel
    public $timestamps = true;
    
    protected $dates = ['expires_at'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    
    // Scope untuk token yang masih valid
    public function scopeValid($query)
    {
        return $query->where('expires_at', '>', Carbon::now());
    }
    
    // Cek apakah token sudah expired
    public function isExpired()
    {
        return $this->expires_at && Carbon::now()->greaterThan($this->expires_at);
    }
    
    // Set token dengan expiration (24 jam)
    public static function createToken($userId)
    {
        // Hapus token lama jika ada
        self::where('user_id', $userId)->delete();
        
        return self::create([
            'user_id' => $userId,
            'token' => sha1(time() . uniqid()),
            'expires_at' => Carbon::now()->addHours(24)
        ]);
    }
}
