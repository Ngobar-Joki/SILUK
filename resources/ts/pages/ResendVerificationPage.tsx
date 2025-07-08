import React from "react";
import ResendVerification from "../components/ResendVerification";

const ResendVerificationPage: React.FC = () => {
    return (
        <div className="resend-page">
            <div className="background-animation">
                <div className="floating-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                </div>
            </div>

            <div className="content">
                <div className="header">
                    <h1>Verifikasi Email</h1>
                    <p>
                        Kirim ulang email verifikasi untuk mengaktifkan akun
                        Anda
                    </p>
                </div>

                <ResendVerification />

                <div className="back-to-login">
                    <p>
                        Kembali ke{" "}
                        <a href="/login" className="login-link">
                            Login
                        </a>
                    </p>
                </div>
            </div>

            <style>{`
                .resend-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    position: relative;
                    overflow: hidden;
                    padding: 20px;
                }

                .background-animation {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1;
                }

                .floating-shapes {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                }

                .shape {
                    position: absolute;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    animation: float 6s ease-in-out infinite;
                }

                .shape-1 {
                    width: 80px;
                    height: 80px;
                    top: 20%;
                    left: 15%;
                    animation-delay: 0s;
                }

                .shape-2 {
                    width: 60px;
                    height: 60px;
                    top: 70%;
                    right: 15%;
                    animation-delay: 2s;
                }

                .shape-3 {
                    width: 100px;
                    height: 100px;
                    bottom: 20%;
                    left: 70%;
                    animation-delay: 4s;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }

                .content {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    max-width: 500px;
                }

                .header {
                    text-align: center;
                    margin-bottom: 40px;
                    color: white;
                }

                .header h1 {
                    font-size: 2.5em;
                    margin-bottom: 10px;
                    font-weight: 700;
                }

                .header p {
                    font-size: 1.1em;
                    opacity: 0.9;
                }

                .back-to-login {
                    text-align: center;
                    margin-top: 30px;
                }

                .back-to-login p {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 14px;
                    margin: 0;
                }

                .login-link {
                    color: #60a5fa;
                    text-decoration: none;
                    font-weight: 600;
                    transition: color 0.3s ease;
                }

                .login-link:hover {
                    color: #3b82f6;
                    text-decoration: underline;
                }

                @media (max-width: 768px) {
                    .header h1 {
                        font-size: 2em;
                    }
                    
                    .header p {
                        font-size: 1em;
                    }
                }
            `}</style>
        </div>
    );
};

export default ResendVerificationPage;
