import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const VerifyOTPPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // Get noHp from location state or localStorage
    const initialNoHp =
        (location.state as any)?.noHp ||
        localStorage.getItem("verify_no_hp") ||
        "";
    const [noHp, setNoHp] = useState(initialNoHp);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [step, setStep] = useState<"phone" | "otp">(
        initialNoHp ? "otp" : "phone"
    );
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) {
            value = value.slice(-1);
        }

        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);

        // Focus last filled input or first empty
        const nextIndex = Math.min(pastedData.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handlePhoneSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (noHp.trim()) {
            setStep("otp");
            setError("");
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpCode = otp.join("");

        if (otpCode.length !== 6) {
            setError("Masukkan 6 digit kode OTP");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await axios.post(
                "/verify-otp",
                {
                    otp_code: otpCode,
                    no_hp: noHp,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                }
            );

            if (response.data.success) {
                setMessage(
                    response.data.message + " Mengalihkan ke halaman login..."
                );
                // Clear localStorage and redirect
                localStorage.removeItem("verify_no_hp");
                setTimeout(() => {
                    navigate("/login");
                }, 1500);
            }
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                    "Terjadi kesalahan saat verifikasi"
            );
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await axios.post(
                "/resend-verification",
                { no_hp: noHp },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                }
            );

            if (response.data.success) {
                setMessage("Kode OTP baru telah dikirim ke WhatsApp Anda");
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            }
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Gagal mengirim ulang kode OTP"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fokus ke input OTP pertama jika sudah di step OTP
        if (step === "otp") {
            inputRefs.current[0]?.focus();
        }
    }, [step]);

    return (
        <div className="verify-page">
            {/* Background Animation */}
            <div className="background-animation">
                <div className="floating-shapes">
                    <div className="shape community-circle shape-1">
                        <div className="member-dots">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                        </div>
                    </div>
                    <div className="shape coin-shape shape-2">
                        <div className="coin-inner">₹</div>
                    </div>
                    <div className="shape growth-chart shape-4">
                        <div className="chart-bars">
                            <div className="bar bar-1"></div>
                            <div className="bar bar-2"></div>
                            <div className="bar bar-3"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="content">
                <div className="verify-card">
                    <div className="verify-header">
                        <div className="logo-container">
                            <div className="logo-ring cooperative-ring"></div>
                            <div className="logo-center">
                                <div className="cooperative-symbol">
                                    <div className="layer layer-1"></div>
                                    <div className="layer layer-2"></div>
                                    <div className="layer layer-3"></div>
                                </div>
                            </div>
                        </div>
                        <h1 className="verify-title">
                            <span className="title-gradient">
                                Verifikasi OTP
                            </span>
                        </h1>
                        <p className="verify-subtitle">
                            {step === "phone"
                                ? "Masukkan nomor WhatsApp Anda untuk verifikasi"
                                : "Masukkan 6 digit kode OTP yang dikirim ke WhatsApp Anda"}
                        </p>
                    </div>

                    {message && (
                        <div className="success-message">
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22,4 12,14.01 9,11.01" />
                            </svg>
                            <p>{message}</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            <p>{error}</p>
                        </div>
                    )}

                    {step === "phone" ? (
                        <form
                            onSubmit={handlePhoneSubmit}
                            className="verify-form"
                        >
                            <div className="form-group">
                                <label htmlFor="no_hp" className="form-label">
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                    Nomor WhatsApp
                                </label>
                                <div className="input-wrapper">
                                    <input
                                        id="no_hp"
                                        type="tel"
                                        value={noHp}
                                        onChange={(e) =>
                                            setNoHp(e.target.value)
                                        }
                                        className="form-input"
                                        placeholder="Contoh: 628123456789"
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="submit-button">
                                <span className="button-bg"></span>
                                <span className="button-content">
                                    Lanjutkan
                                </span>
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify} className="verify-form">
                            <div className="phone-display">
                                <span>Kode dikirim ke: </span>
                                <strong>{noHp}</strong>
                                <button
                                    type="button"
                                    className="change-phone"
                                    onClick={() => setStep("phone")}
                                >
                                    Ubah
                                </button>
                            </div>

                            <div className="otp-inputs">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => {
                                            inputRefs.current[index] = el;
                                        }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) =>
                                            handleOtpChange(
                                                index,
                                                e.target.value
                                            )
                                        }
                                        onKeyDown={(e) =>
                                            handleKeyDown(index, e)
                                        }
                                        onPaste={handlePaste}
                                        className="otp-input"
                                        disabled={loading}
                                    />
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.join("").length !== 6}
                                className="submit-button"
                            >
                                <span className="button-bg"></span>
                                <span className="button-content">
                                    {loading ? (
                                        <div className="loading-spinner">
                                            <div className="spinner-ring"></div>
                                            <span>Memverifikasi...</span>
                                        </div>
                                    ) : (
                                        "Verifikasi"
                                    )}
                                </span>
                            </button>

                            <div className="resend-section">
                                <p>Tidak menerima kode?</p>
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={loading}
                                    className="resend-button"
                                >
                                    Kirim Ulang OTP
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="back-to-login">
                        <p>
                            Kembali ke{" "}
                            <a href="/login" className="login-link">
                                Login
                            </a>
                        </p>
                    </div>
                </div>

                <div className="footer-text">
                    © {new Date().getFullYear()} SILUK. All rights reserved.
                </div>
            </div>

            <style>{`
                .verify-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    background: linear-gradient(
                        135deg,
                        #2c5aa0 0%,
                        #1e3c72 25%,
                        #4a90e2 50%,
                        #7b68ee 75%,
                        #4facfe 100%
                    );
                    background-size: 400% 400%;
                    animation: cooperativeGradient 20s ease infinite;
                    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }

                @keyframes cooperativeGradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                .background-animation {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    overflow: hidden;
                    z-index: 1;
                }

                .floating-shapes {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                }

                .shape {
                    position: absolute;
                    border-radius: 50%;
                    animation: float 15s ease-in-out infinite;
                }

                .shape-1 {
                    width: 80px;
                    height: 80px;
                    top: 15%;
                    left: 8%;
                }

                .shape-2 {
                    width: 70px;
                    height: 70px;
                    top: 60%;
                    right: 12%;
                    animation-delay: -5s;
                }

                .shape-4 {
                    width: 90px;
                    height: 90px;
                    bottom: 15%;
                    left: 15%;
                    animation-delay: -7s;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-30px); }
                }

                .community-circle {
                    background: rgba(46, 204, 113, 0.2);
                    border: 2px solid rgba(46, 204, 113, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .member-dots {
                    display: flex;
                    gap: 4px;
                }

                .member-dots .dot {
                    width: 8px;
                    height: 8px;
                    background: rgba(46, 204, 113, 0.8);
                    border-radius: 50%;
                }

                .coin-shape {
                    background: linear-gradient(45deg, #f39c12, #e67e22);
                    border: 3px solid #d35400;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .coin-inner {
                    color: white;
                    font-size: 24px;
                    font-weight: bold;
                }

                .growth-chart {
                    background: rgba(52, 152, 219, 0.2);
                    border: 2px solid rgba(52, 152, 219, 0.4);
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    padding: 10px;
                }

                .chart-bars {
                    display: flex;
                    gap: 3px;
                    align-items: flex-end;
                }

                .bar {
                    width: 6px;
                    background: rgba(52, 152, 219, 0.8);
                    border-radius: 2px;
                }

                .bar-1 { height: 15px; }
                .bar-2 { height: 25px; }
                .bar-3 { height: 35px; }

                .content {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    max-width: 420px;
                    padding: 20px;
                }

                .verify-card {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    padding: 36px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    animation: slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .verify-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .logo-container {
                    position: relative;
                    width: 64px;
                    height: 64px;
                    margin: 0 auto 20px;
                }

                .logo-ring {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border: 3px solid #2c5aa0;
                    border-radius: 50%;
                    border-top-color: #4a90e2;
                    animation: spin 4s linear infinite;
                }

                @keyframes spin {
                    100% { transform: rotate(360deg); }
                }

                .logo-center {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #2c5aa0, #4a90e2);
                    border-radius: 50%;
                }

                .cooperative-symbol {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }

                .layer {
                    position: absolute;
                    border-radius: 3px;
                }

                .layer-1 {
                    top: 20%;
                    left: 20%;
                    width: 60%;
                    height: 60%;
                    background: rgba(46, 204, 113, 0.8);
                }

                .layer-2 {
                    top: 30%;
                    left: 30%;
                    width: 40%;
                    height: 40%;
                    background: rgba(52, 152, 219, 0.8);
                }

                .layer-3 {
                    top: 40%;
                    left: 40%;
                    width: 20%;
                    height: 20%;
                    background: rgba(241, 196, 15, 0.8);
                }

                .verify-title {
                    font-size: 28px;
                    font-weight: 800;
                    margin: 0 0 10px 0;
                }

                .title-gradient {
                    background: linear-gradient(135deg, #2c5aa0, #4a90e2);
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .verify-subtitle {
                    color: #666;
                    font-size: 14px;
                    margin: 0;
                }

                .success-message {
                    background: linear-gradient(135deg, #48c78e, #06d6a0);
                    color: white;
                    padding: 14px 18px;
                    border-radius: 14px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .success-message p {
                    margin: 0;
                    font-size: 13px;
                    font-weight: 600;
                }

                .error-message {
                    background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
                    color: white;
                    padding: 14px 18px;
                    border-radius: 14px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .error-message p {
                    margin: 0;
                    font-size: 13px;
                    font-weight: 500;
                }

                .verify-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                }

                .form-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .input-wrapper {
                    position: relative;
                }

                .form-input {
                    width: 100%;
                    padding: 16px 20px;
                    border: 2px solid #e1e5e9;
                    border-radius: 14px;
                    font-size: 15px;
                    background: #fff;
                    color: #333;
                    transition: all 0.3s ease;
                    box-sizing: border-box;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #2c5aa0;
                    background: #f8faff;
                }

                .phone-display {
                    text-align: center;
                    padding: 12px;
                    background: #f8faff;
                    border-radius: 10px;
                    font-size: 14px;
                    color: #666;
                }

                .phone-display strong {
                    color: #2c5aa0;
                    margin-left: 4px;
                }

                .change-phone {
                    background: none;
                    border: none;
                    color: #4a90e2;
                    cursor: pointer;
                    margin-left: 8px;
                    font-weight: 600;
                    text-decoration: underline;
                }

                .otp-inputs {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                }

                .otp-input {
                    width: 50px;
                    height: 60px;
                    text-align: center;
                    font-size: 24px;
                    font-weight: 700;
                    border: 2px solid #e1e5e9;
                    border-radius: 12px;
                    background: #fff;
                    color: #2c5aa0;
                    transition: all 0.3s ease;
                }

                .otp-input:focus {
                    outline: none;
                    border-color: #2c5aa0;
                    background: #f8faff;
                    transform: scale(1.05);
                }

                .otp-input:disabled {
                    opacity: 0.6;
                }

                .submit-button {
                    width: 100%;
                    height: 50px;
                    border: none;
                    border-radius: 14px;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                .submit-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .button-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, #2c5aa0, #4a90e2);
                }

                .submit-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(44, 90, 160, 0.3);
                }

                .button-content {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    height: 100%;
                    text-transform: uppercase;
                }

                .loading-spinner {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .spinner-ring {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top: 2px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                .resend-section {
                    text-align: center;
                    padding-top: 10px;
                }

                .resend-section p {
                    color: #666;
                    font-size: 14px;
                    margin: 0 0 8px 0;
                }

                .resend-button {
                    background: none;
                    border: none;
                    color: #2c5aa0;
                    font-weight: 600;
                    cursor: pointer;
                    text-decoration: underline;
                }

                .resend-button:hover {
                    color: #1e3c72;
                }

                .resend-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .back-to-login {
                    text-align: center;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #e1e5e9;
                }

                .back-to-login p {
                    color: #666;
                    font-size: 14px;
                    margin: 0;
                }

                .login-link {
                    color: #2c5aa0;
                    text-decoration: none;
                    font-weight: 600;
                }

                .login-link:hover {
                    text-decoration: underline;
                }

                .footer-text {
                    text-align: center;
                    margin-top: 20px;
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 12px;
                }

                @media (max-width: 480px) {
                    .content {
                        padding: 16px;
                    }

                    .verify-card {
                        padding: 28px 20px;
                    }

                    .otp-input {
                        width: 42px;
                        height: 52px;
                        font-size: 20px;
                    }

                    .otp-inputs {
                        gap: 6px;
                    }
                }
            `}</style>
        </div>
    );
};

export default VerifyOTPPage;
