# Sistem Pelayanan Koperasi (SILUK)

Sistem manajemen pelayanan koperasi yang dibangun menggunakan Laravel, TypeScript, dan React dengan Tailwind CSS.

## Fitur Utama

### 1. Dashboard Overview

-   Statistik real-time: Total anggota, simpanan, pinjaman, dan permohonan pending
-   Quick actions untuk operasi umum
-   Tampilan ringkasan keuangan

### 2. Manajemen Anggota

-   Daftar anggota dengan informasi lengkap
-   Status anggota (aktif, tidak aktif, suspend)
-   Riwayat simpanan dan pinjaman per anggota
-   Form pendaftaran anggota baru

### 3. Layanan Koperasi

-   **Simpanan:**
    -   Simpanan Pokok
    -   Simpanan Sukarela
    -   Simpanan Berjangka
-   **Pinjaman:**
    -   Pinjaman Konsumtif
    -   Pinjaman Produktif
-   **Layanan Lainnya:**
    -   Investasi
    -   Asuransi

### 4. Transaksi

-   Riwayat transaksi lengkap
-   Filter berdasarkan tipe (kredit/debit) dan status
-   Persetujuan transaksi pending
-   Laporan keuangan

### 5. Permohonan Layanan

-   Form permohonan layanan online
-   Validasi persyaratan otomatis
-   Tracking status permohonan
-   Sistem approval

## Teknologi

-   **Backend:** Laravel 11
-   **Frontend:** React 18 + TypeScript
-   **Styling:** Tailwind CSS v4
-   **Build Tool:** Vite
-   **Database:** SQLite (development)

## Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd SILUK
```

### 2. Install Dependencies

```bash
# PHP dependencies
composer install

# Node.js dependencies
npm install
```

### 3. Environment Setup

```bash
cp .env.example .env
php artisan key:generate
```

### 4. Database Setup

```bash
php artisan migrate
php artisan db:seed
```

### 5. Build Assets

```bash
# Development
npm run dev

# Production
npm run build
```

### 6. Start Server

```bash
php artisan serve
```

## Penggunaan

### Akses Aplikasi

-   Dashboard utama: `http://localhost:8000/koperasi`
-   API endpoint: `http://localhost:8000/api/cooperative/*`

### API Endpoints

#### Dashboard

-   `GET /api/cooperative/dashboard/stats` - Statistik dashboard

#### Anggota

-   `GET /api/cooperative/members` - Daftar anggota

#### Layanan

-   `GET /api/cooperative/services` - Daftar layanan

#### Transaksi

-   `GET /api/cooperative/transactions` - Riwayat transaksi

#### Permohonan Layanan

-   `GET /api/cooperative/service-requests` - Daftar permohonan
-   `POST /api/cooperative/service-requests` - Buat permohonan baru
-   `PATCH /api/cooperative/service-requests/{id}/status` - Update status

## Struktur Proyek

```
resources/
├── ts/                          # TypeScript source
│   ├── components/              # React components
│   │   ├── CooperativeDashboard.tsx
│   │   ├── MemberCard.tsx
│   │   ├── ServiceList.tsx
│   │   ├── TransactionHistory.tsx
│   │   └── ServiceRequestForm.tsx
│   ├── types/                   # TypeScript type definitions
│   │   └── index.ts
│   └── app.tsx                  # Main React app
├── css/
│   └── app.css                  # Tailwind CSS
└── views/
    └── cooperative.blade.php    # Main HTML template

app/Http/Controllers/
└── CooperativeController.php    # API controller

routes/
├── web.php                      # Web routes
└── api.php                      # API routes
```

## Komponen React

### CooperativeDashboard

Komponen utama yang mengelola navigasi dan state global aplikasi.

### MemberCard

Kartu informasi anggota dengan detail simpanan dan pinjaman.

### ServiceList

Daftar layanan koperasi dengan filter dan pencarian.

### TransactionHistory

Riwayat transaksi dengan filter dan ringkasan.

### ServiceRequestForm

Form permohonan layanan dengan validasi dinamis.

## Type Definitions

### Member

```typescript
interface Member {
    id: number;
    memberNumber: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    joinDate: Date;
    status: "active" | "inactive" | "suspended";
    totalSavings: number;
    totalLoans: number;
}
```

### Service

```typescript
interface Service {
    id: number;
    name: string;
    description: string;
    category: "savings" | "loan" | "investment" | "insurance" | "other";
    isActive: boolean;
    requirements: string[];
    fees: number;
}
```

### Transaction

```typescript
interface Transaction {
    id: number;
    memberId: number;
    serviceId: number;
    type: "credit" | "debit";
    amount: number;
    description: string;
    date: Date;
    status: "pending" | "approved" | "rejected";
    processedBy: string;
}
```

## Pengembangan

### Menambah Fitur Baru

1. Buat komponen React di `resources/ts/components/`
2. Tambahkan API endpoint di `CooperativeController`
3. Update routing di `routes/api.php`
4. Tambahkan type definitions di `resources/ts/types/`

### Styling

Gunakan utility classes Tailwind CSS. Custom styles dapat ditambahkan di `resources/css/app.css`.

### Testing

```bash
# PHP tests
php artisan test

# JavaScript tests (jika dikonfigurasi)
npm test
```

## Deployment

### Production Build

```bash
npm run build
php artisan optimize
```

### Environment Variables

Pastikan konfigurasi produksi di `.env`:

```
APP_ENV=production
APP_DEBUG=false
DB_CONNECTION=mysql  # atau database produksi lainnya
```

## Kontribusi

1. Fork repository
2. Buat feature branch
3. Commit changes
4. Push ke branch
5. Buat Pull Request

## Lisensi

[MIT License](LICENSE)

## Support

Untuk pertanyaan atau dukungan, silakan buat issue di repository ini.
