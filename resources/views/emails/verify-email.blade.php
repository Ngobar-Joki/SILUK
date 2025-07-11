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

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.7;
            color: #1f2937;
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
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            position: relative;
        }

        .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            padding: 40px 30px;
            text-align: center;
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
            margin-bottom: 10px;
            letter-spacing: -0.5px;
            position: relative;
            z-index: 1;
        }

        .title {
            color: rgba(255, 255, 255, 0.95);
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 0;
            position: relative;
            z-index: 1;
        }

        .content {
            padding: 40px 30px;
        }

        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }

        .description {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
            line-height: 1.6;
        }

        .verify-section {
            text-align: center;
            margin: 35px 0;
        }

        .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
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
        }

        .verify-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 35px -5px rgba(79, 70, 229, 0.6);
        }

        .verify-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }

        .verify-button:hover::before {
            left: 100%;
        }

        .url-section {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
            border-left: 4px solid #4f46e5;
        }

        .url-label {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
            font-weight: 500;
        }

        .url-link {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 13px;
            color: #4f46e5;
            word-break: break-all;
            background: white;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        .warning {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #f59e0b;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
            position: relative;
        }

        .warning::before {
            content: '⚠️';
            font-size: 20px;
            position: absolute;
            top: 20px;
            left: 20px;
        }

        .warning-content {
            margin-left: 35px;
        }

        .warning strong {
            color: #92400e;
            font-weight: 600;
        }

        .warning-text {
            color: #78350f;
            margin-top: 5px;
        }

        .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }

        .footer-text {
            color: #9ca3af;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .copyright {
            color: #6b7280;
            font-size: 13px;
            font-weight: 500;
        }

        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
            margin: 25px 0;
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

            .title {
                font-size: 20px;
            }

            .verify-button {
                padding: 14px 30px;
                font-size: 15px;
            }
        }
    </style>
</head>

<body>
    <div class="email-wrapper">
        <div class="container">
            <div class="header">
                <div class="logo">SILUK</div>
                <h1 class="title">Verifikasi Email Anda</h1>
            </div>

            <div class="content">
                <p class="greeting">Halo <strong>{{ $user->name }}</strong>,</p>

                <p class="description">
                    Terima kasih telah mendaftar di SILUK (Sistem Informasi Layanan Usaha Koperasi).
                    Untuk mengaktifkan akun Anda dan mulai menggunakan layanan kami, silakan verifikasi email Anda.
                </p>

                <div class="verify-section">
                    <a href="{{ $verifyUrl }}" class="verify-button">
                        <span style="color: white;">✉️ Verifikasi Email Sekarang</span>
                    </a>
                </div>

                <div class="divider"></div>

                <div class="url-section">
                    <div class="url-label">Atau salin dan tempel link berikut ke browser Anda:</div>
                    <div class="url-link">{{ $verifyUrl }}</div>
                </div>

                <div class="warning">
                    <div class="warning-content">
                        <div><strong>Penting:</strong></div>
                        <div class="warning-text">
                            Link verifikasi ini akan kedaluwarsa dalam 24 jam. Jika Anda tidak meminta
                            verifikasi ini, abaikan email ini dengan aman.
                        </div>
                    </div>
                </div>
            </div>

            <div class="footer">
                <p class="footer-text">Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
                <p class="copyright">&copy; {{ date('Y') }} SILUK. Semua hak dilindungi.</p>
            </div>
        </div>
    </div>
</body>

</html>
