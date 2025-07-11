<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifikasi Email - SILUK</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --success-color: #10b981;
            --success-bg: #ecfdf5;
            --success-border: #a7f3d0;
            --error-color: #ef4444;
            --error-bg: #fef2f2;
            --error-border: #fecaca;
            --primary-color: #4f46e5;
            --text-primary: #1f2937;
            --text-secondary: #6b7280;
            --shadow-lg: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            --border-radius: 20px;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.7;
            color: var(--text-primary);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 0;
        }

        .container {
            background: white;
            border-radius: var(--border-radius);
            overflow: hidden;
            box-shadow: var(--shadow-lg);
            text-align: center;
            position: relative;
        }

        .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            padding: 30px;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='m0 40l40-40h-40v40z'/%3E%3C/g%3E%3C/svg%3E");
            animation: float 20s ease-in-out infinite;
        }

        @keyframes float {

            0%,
            100% {
                transform: translateY(0px) rotate(0deg);
            }

            50% {
                transform: translateY(-20px) rotate(180deg);
            }
        }

        .logo {
            color: white;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 0;
            letter-spacing: -0.5px;
            position: relative;
            z-index: 1;
        }

        .content {
            padding: 50px 30px;
        }

        .icon-container {
            width: 80px;
            height: 80px;
            margin: 0 auto 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            animation: bounceIn 0.8s ease-out;
        }

        @keyframes bounceIn {
            0% {
                transform: scale(0.3);
                opacity: 0;
            }

            50% {
                transform: scale(1.05);
            }

            70% {
                transform: scale(0.9);
            }

            100% {
                transform: scale(1);
                opacity: 1;
            }
        }

        .success .icon-container {
            background: linear-gradient(135deg, var(--success-color), #059669);
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        }

        .error .icon-container {
            background: linear-gradient(135deg, var(--error-color), #dc2626);
            box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
        }

        .icon {
            font-size: 36px;
            color: white;
            font-weight: bold;
        }

        .status-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 15px;
            letter-spacing: -0.5px;
        }

        .success .status-title {
            color: var(--success-color);
        }

        .error .status-title {
            color: var(--error-color);
        }

        .status-message {
            font-size: 16px;
            color: var(--text-secondary);
            margin-bottom: 35px;
            line-height: 1.6;
            max-width: 400px;
            margin-left: auto;
            margin-right: auto;
        }

        .button {
            display: inline-block;
            background: linear-gradient(135deg, var(--primary-color), #7c3aed);
            color: white;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            letter-spacing: 0.5px;
            transition: all 0.3s ease;
            box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4);
            position: relative;
            overflow: hidden;
            margin: 20px 0;
        }

        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 35px -5px rgba(79, 70, 229, 0.6);
            color: white;
            text-decoration: none;
        }

        .button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }

        .button:hover::before {
            left: 100%;
        }

        .status-card {
            background: white;
            border-radius: 16px;
            padding: 20px;
            margin: 25px 0;
            border: 2px solid;
            position: relative;
        }

        .success .status-card {
            background: var(--success-bg);
            border-color: var(--success-border);
        }

        .error .status-card {
            background: var(--error-bg);
            border-color: var(--error-border);
        }

        .footer {
            background: #f9fafb;
            padding: 25px 30px;
            border-top: 1px solid #e5e7eb;
        }

        .footer p {
            color: var(--text-secondary);
            font-size: 14px;
            margin: 0;
        }

        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
            margin: 30px 0;
        }

        .success-animation {
            animation: successPulse 2s ease-in-out infinite;
        }

        @keyframes successPulse {
            0% {
                box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
            }

            50% {
                box-shadow: 0 10px 25px rgba(16, 185, 129, 0.6);
            }

            100% {
                box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
            }
        }

        .error-animation {
            animation: errorShake 0.5s ease-in-out;
        }

        @keyframes errorShake {

            0%,
            100% {
                transform: translateX(0);
            }

            25% {
                transform: translateX(-5px);
            }

            75% {
                transform: translateX(5px);
            }
        }

        /* Additional visual elements */
        .decorative-element {
            position: absolute;
            width: 100px;
            height: 100px;
            border-radius: 50%;
            opacity: 0.1;
        }

        .success .decorative-element {
            background: var(--success-color);
            top: -50px;
            right: -50px;
        }

        .error .decorative-element {
            background: var(--error-color);
            top: -50px;
            left: -50px;
        }

        /* Responsive Design */
        @media (max-width: 640px) {
            .email-wrapper {
                padding: 20px 0;
            }

            .container {
                border-radius: 16px;
                margin: 0 10px;
            }

            .header,
            .content,
            .footer {
                padding: 30px 20px;
            }

            .logo {
                font-size: 28px;
            }

            .status-title {
                font-size: 24px;
            }

            .icon-container {
                width: 70px;
                height: 70px;
            }

            .icon {
                font-size: 32px;
            }

            .button {
                padding: 14px 30px;
                font-size: 15px;
            }
        }
    </style>
</head>

<body>
    <div class="email-wrapper">
        <div class="container {{ $success ? 'success' : 'error' }}">
            <div class="header">
                <div class="logo">SILUK</div>
            </div>

            <div class="content">
                <div class="decorative-element"></div>

                <div class="icon-container {{ $success ? 'success-animation' : 'error-animation' }}">
                    @if ($success)
                        <div class="icon">✓</div>
                    @else
                        <div class="icon">✗</div>
                    @endif
                </div>

                @if ($success)
                    <h1 class="status-title">Verifikasi Berhasil!</h1>
                    <p class="status-message">{{ $message }}</p>

                    <div class="status-card">
                        <p style="color: var(--success-color); font-weight: 600; margin: 0;">
                            🎉 Selamat! Akun Anda telah diaktifkan dan siap digunakan.
                        </p>
                    </div>

                    @if (isset($redirect))
                        <a href="{{ $redirect }}" class="button">
                            🚀 Login Sekarang
                        </a>
                    @endif
                @else
                    <h1 class="status-title">Verifikasi Gagal!</h1>
                    <p class="status-message">{{ $message }}</p>

                    <div class="status-card">
                        <p style="color: var(--error-color); font-weight: 600; margin: 0;">
                            ⚠️ Silakan coba lagi atau hubungi tim dukungan jika masalah berlanjut.
                        </p>
                    </div>
                @endif

                <div class="divider"></div>
            </div>

            <div class="footer">
                <p>&copy; {{ date('Y') }} SILUK. Semua hak dilindungi.</p>
            </div>
        </div>
    </div>
</body>

</html>
