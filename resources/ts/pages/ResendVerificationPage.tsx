import React from "react";
import ResendVerification from "../components/ResendVerification";

const ResendVerificationPage: React.FC = () => {
    return (
        <div className="resend-page">
            {/* Background Animation with Cooperative Theme */}
            <div className="background-animation">
                <div className="floating-shapes">
                    {/* Community Circles representing members */}
                    <div className="shape community-circle shape-1">
                        <div className="member-dots">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                        </div>
                    </div>

                    {/* Money/Coin Animation */}
                    <div className="shape coin-shape shape-2">
                        <div className="coin-inner">₹</div>
                    </div>

                    {/* Handshake/Partnership Symbol */}
                    <div className="shape partnership-shape shape-3">
                        <svg
                            width="30"
                            height="30"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M11 17a4 4 0 0 1-8 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2z" />
                            <path d="M13 7a4 4 0 0 1 8 0v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z" />
                        </svg>
                    </div>

                    {/* Growth Chart */}
                    <div className="shape growth-chart shape-4">
                        <div className="chart-bars">
                            <div className="bar bar-1"></div>
                            <div className="bar bar-2"></div>
                            <div className="bar bar-3"></div>
                        </div>
                    </div>

                    {/* Additional Cooperative Elements */}
                    <div className="shape savings-box shape-5">
                        <svg
                            width="25"
                            height="25"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <path d="M7 15h0M17 15h0" />
                            <path d="M12 9v6" />
                            <path d="M9 12h6" />
                        </svg>
                    </div>

                    <div className="shape unity-ring shape-6">
                        <div className="ring-segments">
                            <div className="segment"></div>
                            <div className="segment"></div>
                            <div className="segment"></div>
                            <div className="segment"></div>
                        </div>
                    </div>
                </div>

                {/* Money Flow Animation */}
                <div className="money-flow">
                    <div className="money-particle">₹</div>
                    <div className="money-particle">₹</div>
                    <div className="money-particle">₹</div>
                    <div className="money-particle">₹</div>
                </div>

                {/* Network Connections */}
                <div className="network-connections">
                    <div className="connection-line line-1"></div>
                    <div className="connection-line line-2"></div>
                    <div className="connection-line line-3"></div>
                </div>
            </div>

            <div className="content">
                <div className="resend-card">
                    <div className="resend-header">
                        {/* Enhanced cooperative logo matching Login/Register pages */}
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
                        <h1 className="resend-title">
                            <span className="title-gradient">
                                Verifikasi WhatsApp
                            </span>
                        </h1>
                        <p className="resend-subtitle">
                            Kirim ulang link verifikasi ke WhatsApp untuk
                            mengaktifkan akun Anda
                        </p>
                    </div>

                    <div className="form-container">
                        <ResendVerification />
                    </div>

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
                .resend-page {
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
                    font-family: "Inter", -apple-system, BlinkMacSystemFont,
                        "Segoe UI", Roboto, sans-serif;
                    padding: 2rem 0;
                }

                @keyframes cooperativeGradient {
                    0% { background-position: 0% 50%; }
                    25% { background-position: 100% 50%; }
                    50% { background-position: 50% 100%; }
                    75% { background-position: 50% 0%; }
                    100% { background-position: 0% 50%; }
                }

                /* Background Animations */
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
                    animation-delay: 0s;
                }

                .shape-2 {
                    width: 70px;
                    height: 70px;
                    top: 60%;
                    right: 12%;
                    animation-delay: -5s;
                }

                .shape-3 {
                    width: 60px;
                    height: 60px;
                    top: 25%;
                    right: 25%;
                    animation-delay: -10s;
                }

                .shape-4 {
                    width: 90px;
                    height: 90px;
                    bottom: 15%;
                    left: 15%;
                    animation-delay: -7s;
                }

                .shape-5 {
                    width: 65px;
                    height: 65px;
                    top: 70%;
                    left: 60%;
                    animation-delay: -12s;
                }

                .shape-6 {
                    width: 75px;
                    height: 75px;
                    top: 40%;
                    left: 75%;
                    animation-delay: -3s;
                }

                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px) rotate(0deg);
                        opacity: 0.7;
                    }
                    25% {
                        transform: translateY(-25px) rotate(90deg);
                        opacity: 0.9;
                    }
                    50% {
                        transform: translateY(-50px) rotate(180deg);
                        opacity: 0.5;
                    }
                    75% {
                        transform: translateY(-25px) rotate(270deg);
                        opacity: 0.8;
                    }
                }

                /* Community Circle Animation */
                .community-circle {
                    background: rgba(46, 204, 113, 0.2) !important;
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
                    animation: memberPulse 2s ease-in-out infinite;
                }

                .member-dots .dot:nth-child(2) {
                    animation-delay: 0.3s;
                }
                .member-dots .dot:nth-child(3) {
                    animation-delay: 0.6s;
                }

                @keyframes memberPulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0.6;
                    }
                    50% {
                        transform: scale(1.3);
                        opacity: 1;
                    }
                }

                /* Coin Animation */
                .coin-shape {
                    background: linear-gradient(45deg, #f39c12, #e67e22) !important;
                    border: 3px solid #d35400;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: coinFlip 4s ease-in-out infinite;
                }

                .coin-inner {
                    color: white;
                    font-size: 24px;
                    font-weight: bold;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
                }

                @keyframes coinFlip {
                    0%, 100% {
                        transform: rotateY(0deg) translateY(0px);
                    }
                    25% {
                        transform: rotateY(90deg) translateY(-10px);
                    }
                    50% {
                        transform: rotateY(180deg) translateY(-20px);
                    }
                    75% {
                        transform: rotateY(270deg) translateY(-10px);
                    }
                }

                /* Partnership/Handshake Animation */
                .partnership-shape {
                    background: rgba(155, 89, 182, 0.2) !important;
                    border: 2px solid rgba(155, 89, 182, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: rgba(155, 89, 182, 0.8);
                }

                .partnership-shape svg {
                    animation: handshake 3s ease-in-out infinite;
                }

                @keyframes handshake {
                    0%, 100% {
                        transform: scale(1) rotate(0deg);
                    }
                    25% {
                        transform: scale(1.1) rotate(-5deg);
                    }
                    75% {
                        transform: scale(1.1) rotate(5deg);
                    }
                }

                /* Growth Chart Animation */
                .growth-chart {
                    background: rgba(52, 152, 219, 0.2) !important;
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
                    animation: barGrowth 3s ease-in-out infinite;
                }

                .bar-1 {
                    height: 15px;
                    animation-delay: 0s;
                }
                .bar-2 {
                    height: 25px;
                    animation-delay: 0.5s;
                }
                .bar-3 {
                    height: 35px;
                    animation-delay: 1s;
                }

                @keyframes barGrowth {
                    0%, 100% {
                        transform: scaleY(0.5);
                    }
                    50% {
                        transform: scaleY(1.2);
                    }
                }

                /* Savings Box Animation */
                .savings-box {
                    background: rgba(230, 126, 34, 0.2) !important;
                    border: 2px solid rgba(230, 126, 34, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: rgba(230, 126, 34, 0.8);
                }

                .savings-box svg {
                    animation: savingsGlow 2.5s ease-in-out infinite;
                }

                @keyframes savingsGlow {
                    0%, 100% {
                        filter: drop-shadow(0 0 5px rgba(230, 126, 34, 0.3));
                    }
                    50% {
                        filter: drop-shadow(0 0 15px rgba(230, 126, 34, 0.6));
                    }
                }

                /* Unity Ring Animation */
                .unity-ring {
                    background: transparent !important;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }

                .ring-segments {
                    position: relative;
                    width: 40px;
                    height: 40px;
                }

                .segment {
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    background: rgba(231, 76, 60, 0.7);
                    border-radius: 50%;
                    animation: unityRotate 4s linear infinite;
                }

                .segment:nth-child(1) {
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                }
                .segment:nth-child(2) {
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    animation-delay: 1s;
                }
                .segment:nth-child(3) {
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    animation-delay: 2s;
                }
                .segment:nth-child(4) {
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    animation-delay: 3s;
                }

                @keyframes unityRotate {
                    0% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    25% {
                        opacity: 0.5;
                        transform: scale(1.2);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(0.8);
                    }
                    75% {
                        opacity: 0.7;
                        transform: scale(1.1);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                /* Money Flow Animation */
                .money-flow {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                }

                .money-particle {
                    position: absolute;
                    color: rgba(241, 196, 15, 0.7);
                    font-size: 18px;
                    font-weight: bold;
                    animation: moneyFlow 15s linear infinite;
                }

                .money-particle:nth-child(1) {
                    left: 10%;
                    animation-delay: 0s;
                }

                .money-particle:nth-child(2) {
                    left: 30%;
                    animation-delay: 3s;
                }

                .money-particle:nth-child(3) {
                    left: 60%;
                    animation-delay: 7s;
                }

                .money-particle:nth-child(4) {
                    left: 80%;
                    animation-delay: 11s;
                }

                @keyframes moneyFlow {
                    0% {
                        top: -50px;
                        opacity: 0;
                        transform: translateX(0) rotate(0deg);
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        top: 100vh;
                        opacity: 0;
                        transform: translateX(50px) rotate(360deg);
                    }
                }

                /* Network Connections */
                .network-connections {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                }

                .connection-line {
                    position: absolute;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(52, 152, 219, 0.4), transparent);
                    animation: connectionPulse 4s ease-in-out infinite;
                }

                .line-1 {
                    top: 25%;
                    left: 20%;
                    width: 60%;
                    transform: rotate(15deg);
                }

                .line-2 {
                    top: 60%;
                    left: 10%;
                    width: 80%;
                    transform: rotate(-10deg);
                    animation-delay: 1.5s;
                }

                .line-3 {
                    top: 80%;
                    left: 30%;
                    width: 40%;
                    transform: rotate(25deg);
                    animation-delay: 3s;
                }

                @keyframes connectionPulse {
                    0%, 100% {
                        opacity: 0.2;
                    }
                    50% {
                        opacity: 0.8;
                    }
                }

                /* Content Styling */
                .content {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    max-width: 500px;
                    padding: 20px;
                }

                .resend-card {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    padding: 36px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    animation: slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .resend-card::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(46, 204, 113, 0.1),
                        rgba(52, 152, 219, 0.1),
                        rgba(241, 196, 15, 0.1),
                        transparent
                    );
                    animation: cooperativeShimmer 4s ease-in-out infinite;
                    pointer-events: none;
                }

                @keyframes cooperativeShimmer {
                    0% {
                        left: -100%;
                    }
                    100% {
                        left: 100%;
                    }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(50px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                /* Logo Styling */
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
                    border-radius: 50%;
                    border: 3px solid #2c5aa0;
                }

                .cooperative-ring {
                    border: 3px solid #2c5aa0;
                    border-top-color: #4a90e2;
                    border-right-color: #2ecc71;
                    animation: cooperativeLogoSpin 4s linear infinite;
                }

                @keyframes cooperativeLogoSpin {
                    0% {
                        transform: rotate(0deg);
                        border-top-color: #4a90e2;
                    }
                    25% {
                        transform: rotate(90deg);
                        border-top-color: #2ecc71;
                    }
                    50% {
                        transform: rotate(180deg);
                        border-top-color: #f39c12;
                    }
                    75% {
                        transform: rotate(270deg);
                        border-top-color: #e74c3c;
                    }
                    100% {
                        transform: rotate(360deg);
                        border-top-color: #4a90e2;
                    }
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
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    animation: logoPulse 2s ease-in-out infinite;
                }

                @keyframes logoPulse {
                    0%, 100% {
                        transform: translate(-50%, -50%) scale(1);
                    }
                    50% {
                        transform: translate(-50%, -50%) scale(1.1);
                    }
                }

                .cooperative-symbol {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }

                .layer {
                    position: absolute;
                    border-radius: 3px;
                    animation: layerFloat 3s ease-in-out infinite;
                }

                .layer-1 {
                    top: 20%;
                    left: 20%;
                    width: 60%;
                    height: 60%;
                    background: rgba(46, 204, 113, 0.8);
                    animation-delay: 0s;
                }

                .layer-2 {
                    top: 30%;
                    left: 30%;
                    width: 40%;
                    height: 40%;
                    background: rgba(52, 152, 219, 0.8);
                    animation-delay: 1s;
                }

                .layer-3 {
                    top: 40%;
                    left: 40%;
                    width: 20%;
                    height: 20%;
                    background: rgba(241, 196, 15, 0.8);
                    animation-delay: 2s;
                }

                @keyframes layerFloat {
                    0%, 100% {
                        transform: scale(1) rotate(0deg);
                    }
                    33% {
                        transform: scale(1.1) rotate(120deg);
                    }
                    66% {
                        transform: scale(0.9) rotate(240deg);
                    }
                }

                /* Header */
                .resend-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .resend-title {
                    font-size: 30px;
                    font-weight: 800;
                    margin: 0 0 10px 0;
                    animation: titleFade 1s ease-out 0.3s both;
                }

                .title-gradient {
                    background: linear-gradient(135deg, #2c5aa0, #4a90e2);
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: cooperativeTitleShift 4s ease-in-out infinite;
                }

                @keyframes cooperativeTitleShift {
                    0%, 100% {
                        filter: hue-rotate(0deg);
                    }
                    25% {
                        filter: hue-rotate(30deg);
                    }
                    50% {
                        filter: hue-rotate(60deg);
                    }
                    75% {
                        filter: hue-rotate(90deg);
                    }
                }

                .resend-subtitle {
                    color: #666;
                    font-size: 13px;
                    margin: 0;
                    animation: titleFade 1s ease-out 0.5s both;
                }

                @keyframes titleFade {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .form-container {
                    animation: formFade 1s ease-out 0.7s both;
                    margin-bottom: 20px;
                }

                @keyframes formFade {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Form Styling - For the ResendVerification component */
                .form-container :global(form) {
                    width: 100%;
                }

                .form-container :global(label) {
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

                .form-container :global(input) {
                    width: 100%;
                    padding: 16px 20px;
                    border: 2px solid #e1e5e9;
                    border-radius: 14px;
                    font-size: 15px;
                    background: #fff;
                    color: #333;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    font-weight: 500;
                    box-sizing: border-box;
                }

                .form-container :global(input:focus) {
                    outline: none;
                    border-color: #2c5aa0;
                    background: #f8faff;
                    box-shadow: 0 8px 25px rgba(44, 90, 160, 0.15);
                }

                .form-container :global(button[type="submit"]) {
                    width: 100%;
                    height: 50px;
                    border: none;
                    border-radius: 14px;
                    background: linear-gradient(135deg, #2c5aa0, #4a90e2);
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    margin-top: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    position: relative;
                    overflow: hidden;
                }

                .form-container :global(button[type="submit"]:hover:not(:disabled)) {
                    background: linear-gradient(135deg, #1e3c72, #3d7bd8);
                    transform: translateY(-3px);
                    box-shadow: 0 12px 30px rgba(44, 90, 160, 0.4);
                }

                /* Back to Login Section */
                .back-to-login {
                    text-align: center;
                    margin-top: 25px;
                    padding-top: 20px;
                    border-top: 1px solid #e1e5e9;
                }

                .back-to-login p {
                    color: #666;
                    font-size: 14px;
                    margin: 8px 0;
                }

                .login-link {
                    color: #2c5aa0;
                    text-decoration: none;
                    font-weight: 600;
                    padding: 0.25rem 0.5rem;
                    border-radius: 6px;
                    transition: all 0.3s ease;
                }

                .login-link:hover {
                    background-color: rgba(44, 90, 160, 0.1);
                    text-decoration: underline;
                }

                .footer-text {
                    text-align: center;
                    margin-top: 20px;
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 12px;
                    animation: footerFade 1s ease-out 1s both;
                }

                @keyframes footerFade {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @media (max-width: 768px) {
                    .resend-card {
                        padding: 28px;
                    }
                }
                
                @media (max-width: 480px) {
                    .content {
                        padding: 16px;
                        max-width: 340px;
                    }

                    .resend-card {
                        padding: 28px 24px;
                    }

                    .resend-title {
                        font-size: 26px;
                    }

                    .logo-container {
                        width: 56px;
                        height: 56px;
                    }

                    .logo-center {
                        width: 36px;
                        height: 36px;
                    }

                    .form-container :global(input) {
                        padding: 14px 18px;
                        font-size: 14px;
                    }

                    .form-container :global(button[type="submit"]) {
                        height: 46px;
                    }

                    .shape {
                        width: 50px !important;
                        height: 50px !important;
                    }

                    .money-particle {
                        font-size: 14px;
                    }
                }
            `}</style>
        </div>
    );
};

export default ResendVerificationPage;
