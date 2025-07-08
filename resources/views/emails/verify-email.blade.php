<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifikasi Email - SILUK</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }

        .container {
            background-color: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .logo {
            color: #2563eb;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .title {
            color: #1f2937;
            font-size: 20px;
            margin-bottom: 20px;
        }

        .content {
            margin-bottom: 30px;
        }

        .verify-button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
        }

        .verify-button:hover {
            background-color: #1d4ed8;
        }

        .footer {
            text-align: center;
            margin-top: 30px;
            color: #6b7280;
            font-size: 14px;
        }

        .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <div class="logo">SILUK</div>
            <h1 class="title">Verifikasi Email Anda</h1>
        </div>

        <div class="content">
            <p>Halo <strong>{{ $user->name }}</strong>,</p>

            <p>Terima kasih telah mendaftar di SILUK (Sistem Informasi Layanan Usaha Koperasi). Untuk mengaktifkan akun
                Anda, silakan klik tombol di bawah ini:</p>

            <div style="text-align: center;">
                <a href="{{ $verifyUrl }}" class="verify-button">Verifikasi Email</a>
            </div>

            <p>Atau salin dan tempel link berikut ke browser Anda:</p>
            <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 5px;">
                {{ $verifyUrl }}
            </p>

            <div class="warning">
                <strong>Penting:</strong> Link verifikasi ini akan kedaluwarsa dalam 24 jam. Jika Anda tidak meminta
                verifikasi ini, abaikan email ini.
            </div>
        </div>

        <div class="footer">
            <p>Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
            <p>&copy; {{ date('Y') }} SILUK. Semua hak dilindungi.</p>
        </div>
    </div>
</body>

</html>
