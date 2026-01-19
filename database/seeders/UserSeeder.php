<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Operator',
            'email' => 'operator@mail.com',
            'no_hp' => '081234567890',
            'alamat' => 'Jl. Contoh Alamat No. 123',
            'username' => 'operator',
             'password' => bcrypt('password'),
            'role' => 'operator',
            'verified' => true,
            
            

        ]);

        User::create([
            'name' => 'Pendaftar',
            'email' => 'pendaftar@mail.com',
            'no_hp' => '081234567891',
            'alamat' => 'Jl. Contoh Alamat No. 456',
            'username' => 'pendaftar',
             'password' => bcrypt('password'),
            'role' => 'pendaftar',
            'verified' => true,
        ]);

        User::create([
            'name' => 'Kepala',
            'email' => 'kepala@mail.com',
            'no_hp' => '081234567892',
            'alamat' => 'Jl. Contoh Alamat No. 789',
            'username' => 'kepala',
             'password' => bcrypt('password'),
            'role' => 'kepala',
            'verified' => true,
        ]); 
    }
}
