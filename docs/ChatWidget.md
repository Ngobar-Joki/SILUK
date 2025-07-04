# Live Chat Widget - SILUK

## Overview

Live Chat Widget adalah komponen React interaktif yang menyediakan fitur chat real-time untuk website SILUK. Widget ini dilengkapi dengan asisten virtual "Nito" yang dapat membantu pengunjung dengan informasi seputar layanan koperasi.

## Features

### ✨ Fitur Utama

-   **Floating Chat Button**: Ikon chat melayang di pojok kanan bawah halaman
-   **Smooth Animations**: Transisi halus saat membuka/tutup jendela chat
-   **Virtual Assistant**: Avatar asisten virtual "Nito" dengan respon otomatis
-   **Quick Replies**: Tombol pilihan cepat untuk topik umum
-   **Responsive Design**: Optimal untuk desktop dan mobile
-   **Dark Mode Support**: Kompatibel dengan tema gelap/terang
-   **Sound Notifications**: Notifikasi suara saat bot membalas
-   **Typing Indicator**: Animasi ketika bot sedang mengetik
-   **Message History**: Riwayat percakapan tersimpan selama sesi

### 🎨 Customization

-   **Bot Name**: Dapat mengubah nama asisten virtual
-   **Color Theme**: Kustomisasi warna primer dan aksen
-   **Font Integration**: Menggunakan Google Fonts (Inter)
-   **Icon Support**: Icons dengan SVG dan emoji

## Installation & Usage

### 1. Import Component

```tsx
import ChatWidget from "../components/ChatWidget";
```

### 2. Basic Usage

```tsx
<ChatWidget />
```

### 3. Custom Configuration

```tsx
<ChatWidget botName="Nito" primaryColor="#1E40AF" accentColor="#3B82F6" />
```

## Component Props

| Prop           | Type   | Default   | Description          |
| -------------- | ------ | --------- | -------------------- |
| `botName`      | string | "Nito"    | Nama asisten virtual |
| `primaryColor` | string | "#1E40AF" | Warna utama widget   |
| `accentColor`  | string | "#3B82F6" | Warna aksen          |

## Bot Responses

Widget dilengkapi dengan respons otomatis yang disesuaikan dengan layanan SILUK:

### Quick Replies

-   📝 Cara daftar jadi anggota
-   💰 Info simpanan & pinjaman
-   📊 Lihat laporan keuangan
-   🏢 Lokasi kantor cabang
-   📞 Hubungi customer service

### Smart Responses

Bot dapat mendeteksi kata kunci dan memberikan respons yang sesuai:

-   **"daftar"** → Informasi proses pendaftaran
-   **"simpanan/pinjaman"** → Info produk keuangan
-   **"laporan"** → Akses laporan keuangan
-   **"kantor/cabang"** → Lokasi kantor
-   **"customer service"** → Kontak bantuan

## Technical Features

### 🔊 Audio Notifications

-   Menggunakan Web Audio API untuk notifikasi suara
-   Suara berbeda untuk notifikasi baru dan respons bot
-   Fallback jika browser tidak mendukung audio

### 📱 Responsive Design

-   Optimized untuk layar desktop (width: 320px)
-   Mobile responsive dengan lebar dinamis
-   Touch-friendly interface untuk perangkat mobile

### 🌙 Dark Mode Support

-   Otomatis mengikuti tema aplikasi
-   CSS variables untuk konsistensi warna
-   Smooth transition saat berganti tema

### ⚡ Performance

-   Lazy loading untuk optimize performa
-   Efficient state management
-   Minimal re-renders

## File Structure

```
resources/
├── ts/
│   └── components/
│       └── ChatWidget.tsx          # Main component
├── css/
│   └── ChatWidget.css              # Custom styles
└── pages/
    └── welcome.tsx                 # Integration example
```

## Browser Support

-   ✅ Chrome 80+
-   ✅ Firefox 75+
-   ✅ Safari 13+
-   ✅ Edge 80+
-   ⚠️ IE 11 (limited support)

## Future Enhancements

### Planned Features

-   [ ] File upload support
-   [ ] Voice message capability
-   [ ] Chat history persistence
-   [ ] Admin dashboard integration
-   [ ] Multi-language support
-   [ ] WhatsApp integration
-   [ ] Live agent handoff

### API Integration Ready

Widget sudah dipersiapkan untuk integrasi dengan:

-   REST API backend
-   WebSocket real-time chat
-   Database chat history
-   CRM systems

## Troubleshooting

### Common Issues

**Chat tidak muncul:**

-   Pastikan import komponen sudah benar
-   Cek console untuk error JavaScript
-   Verifikasi CSS Tailwind sudah loaded

**Audio tidak berfungsi:**

-   Browser policy mengharuskan user interaction
-   Beberapa browser mobile membatasi autoplay
-   Fallback: chat tetap berfungsi tanpa suara

**Styling tidak sesuai:**

-   Pastikan ChatWidget.css sudah di-import
-   Cek conflict dengan CSS lain
-   Verifikasi tema dark/light mode

## Support

Untuk bantuan teknis atau pertanyaan pengembangan:

-   📧 Email: dev@siluk.co.id
-   💬 Internal Chat: #dev-support
-   📖 Dokumentasi: /docs/components

---

**Version**: 1.0.0  
**Last Updated**: July 2025  
**Maintainer**: SILUK Development Team
