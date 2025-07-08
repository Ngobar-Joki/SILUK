<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\StrukturOrganisasi;

class StrukturOrganisasiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        
        // Insert Vision and Mission data
        StrukturOrganisasi::create([
            'foto' => '1.jpg' // Replace with your actual image URL or path
        ]);

        
    }
}
