# ChatWidget API Integration

Dokumentasi ini menjelaskan integrasi ChatWidget dengan API chatbot eksternal untuk sistem SILUK.

## Konfigurasi Environment

Pastikan environment variable berikut sudah dikonfigurasi di file `.env`:

```bash
CHATBOT_URL=https://jnn.ngobars.id/webhook/chat
CHATBOT_TOKEN=9f7a29e0-3d8b-4e8c-958a-46ea72be1b2e
```

## Cara Kerja API

### 1. Request Format
- **Method**: POST (dari frontend ke Laravel)
- **Endpoint**: `/api/chatbot`
- **Headers**:
  - `Content-Type: application/json`
  - `X-CSRF-TOKEN: {csrf_token}`
- **Body**:
  ```json
  {
    "text": "Pada dokumen SOP KOP {user_message}"
  }
  ```

### 2. Laravel Controller Processing
- Controller akan melakukan HTTP GET request ke API eksternal
- **External API Method**: GET
- **External API Headers**:
  - `Authorization: Bearer {CHATBOT_TOKEN}`
  - `Accept: text/plain`
- **External API Query**: `?text=Pada dokumen SOP KOP {user_message}`

### 3. Response Handling
- **Sukses**: Response text langsung dikirim ke frontend
- **Error**: Fallback response yang user-friendly

## Fitur Fallback System

Jika API eksternal tidak tersedia atau mengalami error (seperti "Authorization data is wrong!"), sistem akan memberikan response fallback yang informatif:

### Contoh Fallback Response:
```
**Sistem Chatbot SILUK Sedang Maintenance** 🔧

Terima kasih telah menghubungi SILUK! Sistem chatbot kami sedang dalam perbaikan untuk memberikan pelayanan yang lebih baik.

📞 **Hubungi Customer Service:**
Telepon: (021) 123-4567
Email: info@siluk.co.id
Jam operasional: Senin-Jumat 08:00-17:00

🏦 **Layanan yang tersedia:**
• Simpanan dan Pinjaman
• Informasi Keanggotaan  
• Laporan Keuangan
• Konsultasi Koperasi

Terima kasih atas pengertian Anda! 😊
```

## Format Response

ChatWidget mendukung format response yang kaya dengan:

1. **Markdown Bold**: `**text**` → **text**
2. **Line Breaks**: `\n` → new line
3. **Bullet Points**: `•` → •
4. **Numbered Lists**: `1. item` → 1. item
5. **Emoji**: Full unicode emoji support

### Contoh Response dari API Eksternal:
```
SOP Pelatihan Perkoperasian dijelaskan secara lengkap sebagai berikut:\n\n**Halaman Dokumen:** Halaman 13-14\n\n**Dasar Hukum:**\n1. Undang-Undang Nomor 25 Tahun 1992 tentang Perkoperasian.\n2. Undang-Undang Nomor 23 Tahun 2014 tentang Pemerintahan Daerah.
```

## Error Handling

### 1. Authorization Error (403)
```
[2025-07-20 18:26:57] local.ERROR: Chatbot API Error: {"status":403,"body":"Authorization data is wrong!"}
```

**Solusi**:
- Periksa `CHATBOT_TOKEN` di file `.env`
- Pastikan token masih valid dan tidak expired
- Hubungi penyedia API untuk verifikasi token

### 2. Connection Timeout
- Timeout set ke 30 detik
- Jika timeout, system fallback akan aktif

### 3. Empty Response
- Jika API mengembalikan response kosong
- System akan menggunakan fallback response

## Testing

### Manual Testing via Browser Console:
```javascript
// Test chatbot API
fetch('/api/chatbot', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
    },
    body: JSON.stringify({
        text: 'Cara daftar jadi anggota'
    })
})
.then(response => response.text())
.then(data => console.log(data));
```

## Struktur File

```
app/Http/Controllers/
├── ChatbotController.php          # Main API controller

resources/ts/components/
├── ChatWidget.tsx                 # React component

routes/
├── api.php                        # API routes

resources/views/
├── chatbot-demo.blade.php         # Demo page
```

## Troubleshooting

### 1. CSRF Token Error
- Pastikan meta tag csrf ada di layout
- Periksa token dikirim dengan benar

### 2. 403 Authorization Error
- Periksa CHATBOT_TOKEN di .env
- Pastikan token valid dan tidak expired

### 3. Response Tidak Ter-format
- Periksa fungsi `formatBotResponse()` di ChatWidget.tsx
- Pastikan dangerouslySetInnerHTML bekerja dengan benar

### 4. Fallback Tidak Muncul
- Periksa log Laravel di `storage/logs/laravel.log`
- Pastikan `getFallbackResponse()` dipanggil saat error

## Security Notes

1. **Token Protection**: CHATBOT_TOKEN tidak pernah dikirim ke frontend
2. **CSRF Protection**: Semua request menggunakan CSRF token
3. **Input Validation**: Request text divalidasi di controller
4. **Rate Limiting**: Bisa ditambahkan middleware throttle jika perlu

## Future Improvements

1. **Caching**: Implementasi Redis untuk cache response
2. **Rate Limiting**: Batas maksimal request per user
3. **Analytics**: Tracking usage dan performance
4. **Multi-language**: Support bahasa selain Indonesia
