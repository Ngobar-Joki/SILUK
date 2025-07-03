<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VisiMisi extends Model
{
   
    protected $table = 'visi_misis';

    protected $fillable = [
        'judul',
        'deskripsi',
    ];

    
}
