# 🌐 Web Accessibility Widget - SILUK

Fitur aksesibilitas web yang komprehensif untuk aplikasi SILUK dengan dukungan penuh untuk berbagai kebutuhan aksesibilitas pengguna.

## 📋 Fitur Utama

### 🎯 Core Features

-   ✅ **Floating Accessibility Icon** - Ikon orang dalam lingkaran biru di pojok kiri bawah
-   ✅ **Accessibility Menu Panel** - Panel pengaturan aksesibilitas lengkap
-   ✅ **Multi-language Support** - Bahasa Indonesia, English, Bahasa Melayu
-   ✅ **Dynamic Font Sizing** - Kontrol ukuran font 80% - 150%
-   ✅ **Visual Enhancements** - Highlight titles, links, dan konten penting
-   ✅ **Dyslexia-friendly Font** - Font Comic Sans MS untuk kemudahan baca
-   ✅ **Text Spacing Controls** - Letter spacing dan line height
-   ✅ **Font Weight Adjustment** - Kontrol ketebalan font
-   ✅ **User Preferences Storage** - Local storage + database untuk user login
-   ✅ **Admin Dashboard** - Statistik penggunaan aksesibilitas

### 🎨 Design Elements

-   **Color Scheme**: Blue theme (#1E40AF) sesuai SILUK branding
-   **Responsive Design**: Optimal di semua perangkat
-   **Smooth Animations**: Slide up animation dan transisi halus
-   **High Contrast Support**: Dukungan untuk mode kontras tinggi
-   **Dark Mode Ready**: Kompatibel dengan tema gelap

## 🛠️ Struktur File

### Frontend (React + TypeScript)

```
resources/
├── ts/
│   ├── contexts/
│   │   └── AccessibilityContext.tsx     # React Context untuk state management
│   ├── components/
│   │   ├── AccessibilityWidget.tsx      # Main widget component
│   │   └── AccessibilityDashboard.tsx   # Admin dashboard component
│   └── App.tsx                          # Updated dengan AccessibilityProvider
├── css/
│   └── AccessibilityWidget.css          # Global accessibility styles
```

### Backend (Laravel)

```
app/
├── Http/Controllers/
│   └── AccessibilityController.php      # API controller untuk preferensi user
├── Models/
│   └── User.php                         # Updated dengan accessibility_settings
database/
├── migrations/
│   └── add_accessibility_settings_to_users_table.php  # Migration untuk kolom baru
routes/
└── web.php                              # Routes untuk accessibility API
```

## 🚀 Instalasi dan Setup

### 1. Jalankan Migration

```bash
php artisan migrate
```

### 2. Build Assets

```bash
npm run dev
# atau untuk production
npm run build
```

### 3. Verify Integration

Widget akan otomatis muncul di semua halaman aplikasi setelah:

-   ✅ AccessibilityProvider wrapper di App.tsx
-   ✅ AccessibilityWidget component di App.tsx
-   ✅ CSS import di App.tsx

## 📱 Cara Penggunaan

### 🔵 Floating Icon

-   **Lokasi**: Pojok kiri bawah halaman
-   **Aksi**: Klik untuk membuka/tutup panel
-   **Visual**: Ikon orang dalam lingkaran biru
-   **Hover Effect**: Scale animation + color change

### 🎛️ Panel Pengaturan

#### Language Selection

```typescript
// Supported languages
const languages = [
    { code: "id", name: "Bahasa Indonesia" },
    { code: "en", name: "English" },
    { code: "ms", name: "Bahasa Melayu" },
];
```

#### Font Size Control

-   **Range**: 80% - 150%
-   **Increment**: 10% per click
-   **Controls**: - (decrease) and + (increase) buttons
-   **Display**: Real-time percentage display

#### Toggle Features

| Feature          | Function                                |
| ---------------- | --------------------------------------- |
| Highlight Titles | Highlights h1-h6 with yellow background |
| Highlight Links  | Highlights links with blue background   |
| Dyslexia Font    | Changes to Comic Sans MS                |
| Letter Spacing   | Increases character spacing to 0.12em   |
| Line Height      | Increases line spacing to 1.8           |
| Font Weight      | Increases font weight to 600            |

## 💾 Data Persistence

### Local Storage (Guest Users)

```javascript
// Automatic save to localStorage
localStorage.setItem("accessibility-settings", JSON.stringify(settings));

// Automatic load on page refresh
const savedSettings = localStorage.getItem("accessibility-settings");
```

### Database Storage (Authenticated Users)

```php
// Laravel User model with accessibility_settings column
$user->accessibility_settings = json_encode($settings);
$user->save();
```

### API Endpoints

```
POST /api/accessibility/save      - Save user preferences
GET  /api/accessibility/load      - Load user preferences
DELETE /api/accessibility/delete  - Delete user preferences
GET  /api/accessibility/statistics - Admin statistics (operator only)
```

## 🎯 Implementation Details

### React Context Architecture

```typescript
interface AccessibilitySettings {
    language: string;
    fontSize: number;
    highlightTitles: boolean;
    highlightLinks: boolean;
    dyslexiaFont: boolean;
    letterSpacing: boolean;
    lineHeight: boolean;
    fontWeight: boolean;
}
```

### CSS Custom Properties

```css
:root {
    --accessibility-font-size: 100%;
    --accessibility-font-family: Inter, system-ui, sans-serif;
    --accessibility-letter-spacing: normal;
    --accessibility-line-height: 1.6;
    --accessibility-font-weight: 400;
}
```

### Dynamic Style Application

```typescript
// Apply settings to DOM
const applyAccessibilityStyles = (settings: AccessibilitySettings) => {
    const root = document.documentElement;
    root.style.setProperty(
        "--accessibility-font-size",
        `${settings.fontSize}%`
    );
    // ... other properties
};
```

## 📊 Admin Dashboard

### Statistics Available

-   **Total Users**: Jumlah semua pengguna terdaftar
-   **Users with Settings**: Pengguna yang menggunakan fitur aksesibilitas
-   **Adoption Rate**: Persentase adopsi fitur
-   **Feature Usage**: Statistik penggunaan per fitur
-   **Language Distribution**: Distribusi penggunaan bahasa
-   **Font Size Distribution**: Distribusi preferensi ukuran font

### Akses Dashboard

```typescript
// Only accessible by operator role
Route::middleware(['auth', 'role:operator'])->group(function () {
    Route::get('/api/accessibility/statistics', [AccessibilityController::class, 'getStatistics']);
});
```

## 🎨 Customization

### 1. Ganti Warna Tema

```css
/* Update primary color */
.accessibility-toggle-btn {
    background-color: #your-color;
}
```

### 2. Tambah Fitur Toggle

```typescript
// Add new feature to settings interface
interface AccessibilitySettings {
    // ...existing
    newFeature: boolean;
}

// Add to toggle features array
const features = [
    // ...existing
    { key: "newFeature", label: "New Feature" },
];
```

### 3. Custom Highlighting

```css
/* Add custom highlight styles */
.accessibility-highlight-custom .custom-element {
    background-color: #your-highlight-color !important;
    border: 2px solid #your-border-color !important;
}
```

## 🔒 Security Features

### CSRF Protection

```typescript
// All API calls include CSRF token
headers: {
    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
}
```

### Role-based Access

```php
// Admin statistics protected by role middleware
Route::middleware(['auth', 'role:operator'])->group(function () {
    // Admin-only routes
});
```

### Input Validation

```php
// Server-side validation
$validated = $request->validate([
    'settings.fontSize' => 'required|integer|min:80|max:150',
    'settings.language' => 'required|string|in:id,en,ms',
    // ... other validation rules
]);
```

## 🌍 Accessibility Standards Compliance

### WCAG 2.1 Guidelines

-   ✅ **Perceivable**: High contrast colors, scalable fonts
-   ✅ **Operable**: Keyboard navigation, focus indicators
-   ✅ **Understandable**: Clear labels, consistent behavior
-   ✅ **Robust**: Compatible with screen readers

### Keyboard Navigation

```css
/* Focus indicators */
*:focus {
    outline: 3px solid #3b82f6 !important;
    outline-offset: 2px !important;
}
```

### Screen Reader Support

```jsx
// ARIA labels and descriptions
<button aria-label="Toggle accessibility menu">
    <span className="sr-only">Open accessibility settings</span>
</button>
```

## 🔧 Development & Testing

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Test Accessibility Features

1. **Visual Testing**: Test all toggle features manually
2. **Keyboard Testing**: Navigate using Tab, Enter, Escape
3. **Screen Reader Testing**: Use NVDA/JAWS to test compatibility
4. **Responsive Testing**: Test on different screen sizes

## 🆘 Troubleshooting

### Common Issues

**❌ Widget tidak muncul**

```bash
# Check CSS import
import '../css/AccessibilityWidget.css';

# Verify component import
import AccessibilityWidget from './components/AccessibilityWidget';

# Check provider wrapper
<AccessibilityProvider>...</AccessibilityProvider>
```

**❌ Settings tidak tersimpan**

```bash
# Check API endpoints
POST /api/accessibility/save

# Verify authentication
Auth::check()

# Check migration
php artisan migrate:status
```

**❌ Styling tidak apply**

```bash
# Check CSS custom properties
--accessibility-font-size: 100%;

# Verify !important declarations
font-size: var(--accessibility-font-size) !important;

# Clear browser cache
Ctrl+F5 (hard refresh)
```

## 📞 Support

### Developer Support

-   💬 **Internal Chat**: #dev-accessibility
-   📧 **Email**: dev@siluk.co.id
-   📱 **WhatsApp**: +62-812-3456-7890
-   🐛 **Bug Reports**: GitHub Issues

### Documentation

-   📖 **API Docs**: `/docs/accessibility-api`
-   🎥 **Video Tutorial**: Coming soon
-   🔧 **Component Reference**: TypeScript interfaces

---

**✨ Web Accessibility By Nikson ❤️**  
**📅 Last Updated**: July 5, 2025  
**🏷️ Version**: 1.0.0  
**🌐 WCAG 2.1 Compliant**
