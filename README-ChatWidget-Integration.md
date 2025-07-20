# Chat Widget SILUK - Integration Documentation

## Overview

Chat Widget SILUK adalah komponen React yang terintegrasi dengan sistem AI eksternal untuk memberikan informasi tentang Standard Operating Procedure (SOP) koperasi. Widget ini dirancang untuk memberikan pengalaman chat yang interaktif dan user-friendly.

## Features

- 🤖 **AI-Powered Responses** - Integrasi dengan chatbot eksternal melalui API
- 🌙 **Dark/Light Mode** - Dukungan tema gelap dan terang
- 📱 **Responsive Design** - Dapat digunakan di desktop dan mobile
- 💬 **Session Management** - Penyimpanan riwayat percakapan di localStorage
- 🔔 **Real-time Notifications** - Notifikasi suara untuk pesan baru
- ⚡ **Quick Replies** - Pilihan cepat untuk pertanyaan umum
- 🎨 **Customizable Theme** - Warna dan tampilan dapat disesuaikan

## Configuration

### Environment Variables

Tambahkan variabel berikut ke file `.env`:

```env
CHATBOT_URL=https://jnn.ngobars.id/webhook/chat
CHATBOT_TOKEN=9f7a29e0-3d8b-4e8c-958a-46ea72be1b2e
```

### API Integration

Widget ini mengirimkan request ke endpoint internal `/api/chatbot` yang kemudian meneruskan request ke chatbot eksternal dengan format:

- **Method**: GET (ke API eksternal)
- **Headers**: `Authorization: Bearer {CHATBOT_TOKEN}`
- **Query Parameters**: `text` (prefixed dengan "Pada dokumen SOP KOP")

### Response Format

API eksternal diharapkan mengembalikan response dalam format text plain, contoh:

```
SOP Pelatihan Perkoperasian dijelaskan secara lengkap sebagai berikut:\n\n**Halaman Dokumen:** Halaman 13-14\n\n**Dasar Hukum:**\n1. Undang-Undang Nomor 25 Tahun 1992 tentang Perkoperasian.\n2. Undang-Undang Nomor 23 Tahun 2014 tentang Pemerintahan Daerah.
```

## Implementation

### 1. React Component Usage

```tsx
import ChatWidget from './components/ChatWidget';

function App() {
    return (
        <div>
            {/* Your app content */}
            <ChatWidget 
                botName="Nito"
                primaryColor="#1E40AF"
                accentColor="#3B82F6"
                initialDarkMode={false}
            />
        </div>
    );
}
```

### 2. Props Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `botName` | string | "Nito" | Nama bot yang ditampilkan |
| `primaryColor` | string | "#1E40AF" | Warna utama widget |
| `accentColor` | string | "#3B82F6" | Warna aksen |
| `initialDarkMode` | boolean | undefined | Mode gelap awal |

### 3. Laravel Controller Setup

Controller `ChatbotController` menangani:
- Validasi input
- Request ke API eksternal
- Error handling
- Response formatting

### 4. Routing

```php
// routes/web.php
Route::prefix('api/chatbot')->group(function () {
    Route::post('/', [ChatbotController::class, 'chat'])->name('chatbot.chat');
});
```

## Usage Examples

### Basic Usage

1. Widget muncul sebagai floating button di pojok kanan bawah
2. User dapat klik untuk membuka chat window
3. Pilih quick reply atau ketik pesan manual
4. Bot akan merespon berdasarkan data SOP koperasi

### Quick Replies Available

- 📝 Cara daftar jadi anggota
- 💰 Info simpanan & pinjaman
- 📊 Lihat laporan keuangan
- 🏢 Lokasi kantor cabang
- 📞 Hubungi customer service

### Session Management

- Setiap chat session disimpan di localStorage
- User dapat beralih antar session
- Session memiliki judul dan timestamp
- History chat tetap tersimpan setelah reload

## Testing

### Unit Tests

```bash
php artisan test --filter=ChatbotTest
```

### Demo Page

Akses demo page di: `/chatbot-demo`

## API Endpoints

### POST /api/chatbot

**Request Body:**
```json
{
    "text": "Pada dokumen SOP KOP pelatihan koperasi"
}
```

**Response (Success):**
```
SOP Pelatihan Perkoperasian dijelaskan secara lengkap...
```

**Response (Error):**
```json
{
    "error": "Failed to get response from chatbot"
}
```

## Error Handling

Widget memiliki fallback mechanism:
1. Jika API eksternal gagal → gunakan response default
2. Jika network error → tampilkan pesan error
3. Jika timeout → fallback ke response lokal

## Security Considerations

- CSRF protection untuk semua request
- Bearer token authentication ke API eksternal
- Input validation dan sanitization
- Rate limiting (dapat ditambahkan jika diperlukan)

## Browser Compatibility

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Troubleshooting

### Common Issues

1. **Chat tidak terbuka**
   - Periksa console untuk error JavaScript
   - Pastikan React dan dependencies loaded

2. **Bot tidak merespon**
   - Periksa environment variables
   - Cek koneksi ke API eksternal
   - Lihat Laravel logs

3. **Session tidak tersimpan**
   - Pastikan localStorage tidak diblokir
   - Periksa quota localStorage

### Debug Mode

Tambahkan `APP_DEBUG=true` di `.env` untuk melihat detail error.

## Customization

### Theme Colors

```tsx
// Custom theme
<ChatWidget 
    primaryColor="#8B5CF6"  // Purple
    accentColor="#A78BFA"   // Light purple
/>
```

### Custom Quick Replies

Edit array `quickReplies` di component untuk mengubah pilihan cepat.

### Custom Bot Responses

Modify fallback responses di fungsi `getFallbackResponse()`.

## Performance Optimization

- Lazy loading component
- Debounce typing indicator
- Minimize localStorage writes
- Optimize API calls

## Future Enhancements

- [ ] File upload support
- [ ] Voice message
- [ ] Multi-language support
- [ ] Admin dashboard
- [ ] Analytics tracking
- [ ] Bot training interface

## Support

Untuk bantuan teknis, hubungi tim development SILUK.
