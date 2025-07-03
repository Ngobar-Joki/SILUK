<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\VisiMisi;

class VisiMisiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data
        VisiMisi::truncate();

        // Insert Vision and Mission data
        VisiMisi::create([
            'judul' => 'Visi',
            'deskripsi' => 'Menjadi lembaga pendidikan terkemuka yang menghasilkan lulusan berkualitas, berdaya saing tinggi, dan berintegritas.'
        ]);

        VisiMisi::create([
            'judul' => 'Misi',
            'deskripsi' => '1. Menyelenggarakan pendidikan yang berkualitas dan relevan dengan kebutuhan masyarakat.
        2. Mengembangkan penelitian yang inovatif dan bermanfaat bagi kemajuan ilmu pengetahuan.
        3. Melaksanakan pengabdian kepada masyarakat yang berkontribusi pada pembangunan berkelanjutan.
        4. Membangun kerjasama dengan berbagai pihak untuk meningkatkan kualitas pendidikan.'
        ]);
    }
}
