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
            text-align: center;
        }

        .logo {
            color: #2563eb;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
        }

        .success {
            color: #059669;
            font-size: 18px;
            margin-bottom: 20px;
        }

        .error {
            color: #dc2626;
            font-size: 18px;
            margin-bottom: 20px;
        }

        .icon {
            font-size: 48px;
            margin-bottom: 20px;
        }

        .success-icon {
            color: #059669;
        }

        .error-icon {
            color: #dc2626;
        }

        .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
        }

        .button:hover {
            background-color: #1d4ed8;
        }

        .footer {
            margin-top: 30px;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="logo">SILUK</div>

        @if ($success)
            <div class="icon success-icon">✓</div>
            <h1 class="success">Verifikasi Berhasil!</h1>
            <p>{{ $message }}</p>
            @if (isset($redirect))
                <a href="{{ $redirect }}" class="button">Login Sekarang</a>
            @endif
        @else
            <div class="icon error-icon">✗</div>
            <h1 class="error">Verifikasi Gagal!</h1>
            <p>{{ $message }}</p>
        @endif

        <div class="footer">
            <p>&copy; {{ date('Y') }} SILUK. Semua hak dilindungi.</p>
        </div>
    </div>
</body>

</html>
