import React, { useState } from "react";
import axios from "axios";

interface ResendVerificationProps {
    email?: string;
    onSuccess?: () => void;
}

const ResendVerification: React.FC<ResendVerificationProps> = ({
    email: initialEmail,
    onSuccess,
}) => {
    const [email, setEmail] = useState(initialEmail || "");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await axios.post(
                "/resend-verification",
                { email },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                }
            );

            if (response.data.success) {
                setMessage(response.data.message);
                if (onSuccess) {
                    onSuccess();
                }
            }
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                    "Terjadi kesalahan saat mengirim email verifikasi"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="resend-verification">
            <form onSubmit={handleResend} className="resend-form">
                <div className="form-group">
                    <label htmlFor="email">Email untuk verifikasi ulang</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Masukkan email Anda"
                        required
                    />
                </div>

                {message && (
                    <div className="alert alert-success">
                        <i className="fas fa-check-circle"></i>
                        {message}
                    </div>
                )}

                {error && (
                    <div className="alert alert-error">
                        <i className="fas fa-exclamation-circle"></i>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="resend-button"
                >
                    {loading ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Mengirim...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-paper-plane"></i>
                            Kirim Ulang Email Verifikasi
                        </>
                    )}
                </button>
            </form>

            <style>{`
                .resend-verification {
                    max-width: 400px;
                    margin: 0 auto;
                    padding: 20px;
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 10px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                }

                .resend-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                }

                .form-group label {
                    color: #374151;
                    font-weight: 600;
                    margin-bottom: 8px;
                    font-size: 14px;
                }

                .form-group input {
                    padding: 12px 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 16px;
                    transition: border-color 0.3s ease;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #3b82f6;
                }

                .alert {
                    padding: 12px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                }

                .alert-success {
                    background-color: #d1fae5;
                    color: #065f46;
                    border: 1px solid #a7f3d0;
                }

                .alert-error {
                    background-color: #fee2e2;
                    color: #991b1b;
                    border: 1px solid #fca5a5;
                }

                .resend-button {
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    color: white;
                    padding: 12px 20px;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .resend-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
                }

                .resend-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default ResendVerification;
