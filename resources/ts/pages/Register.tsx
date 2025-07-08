import React, { useState } from "react";
import axios from "axios";

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        username: "",
        no_hp: "",
        alamat: "",
        password: "",
        password_confirmation: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Nama harus diisi";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email harus diisi";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Format email tidak valid";
        }

        if (!formData.username.trim()) {
            newErrors.username = "Username harus diisi";
        }

        if (!formData.no_hp.trim()) {
            newErrors.no_hp = "No HP harus diisi";
        }

        if (!formData.alamat.trim()) {
            newErrors.alamat = "Alamat harus diisi";
        }

        if (!formData.password) {
            newErrors.password = "Password harus diisi";
        } else if (formData.password.length < 8) {
            newErrors.password = "Password minimal 8 karakter";
        }

        if (!formData.password_confirmation) {
            newErrors.password_confirmation = "Konfirmasi password harus diisi";
        } else if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = "Password tidak sama";
        }

        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSuccess("");

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post("/register", formData, {
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            if (response.data.success) {
                setSuccess(response.data.message);
                setFormData({
                    name: "",
                    email: "",
                    username: "",
                    no_hp: "",
                    alamat: "",
                    password: "",
                    password_confirmation: "",
                });

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    window.location.href = "/login";
                }, 3000);
            }
        } catch (err: any) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({
                    general:
                        err.response?.data?.message ||
                        "Terjadi kesalahan saat registrasi",
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-container">
            {/* Background Animation */}
            <div className="background-animation">
                <div className="floating-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                    <div className="shape shape-4"></div>
                    <div className="shape shape-5"></div>
                </div>
            </div>

            <div className="register-wrapper">
                <div className="register-card">
                    <div className="register-header">
                        <h1>Daftar Akun</h1>
                        <p>Sistem Informasi Layanan Usaha Koperasi</p>
                    </div>

                    {success && (
                        <div className="alert alert-success">
                            <i className="fas fa-check-circle"></i>
                            {success}
                        </div>
                    )}

                    {errors.general && (
                        <div className="alert alert-error">
                            <i className="fas fa-exclamation-circle"></i>
                            {errors.general}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="register-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Nama Lengkap</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={errors.name ? "error" : ""}
                                    placeholder="Masukkan nama lengkap"
                                />
                                {errors.name && (
                                    <span className="error-message">
                                        {errors.name}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={errors.username ? "error" : ""}
                                    placeholder="Masukkan username"
                                />
                                {errors.username && (
                                    <span className="error-message">
                                        {errors.username}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={errors.email ? "error" : ""}
                                    placeholder="Masukkan email"
                                />
                                {errors.email && (
                                    <span className="error-message">
                                        {errors.email}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="no_hp">No HP</label>
                                <input
                                    type="tel"
                                    id="no_hp"
                                    name="no_hp"
                                    value={formData.no_hp}
                                    onChange={handleChange}
                                    className={errors.no_hp ? "error" : ""}
                                    placeholder="Masukkan no HP"
                                />
                                {errors.no_hp && (
                                    <span className="error-message">
                                        {errors.no_hp}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="alamat">Alamat</label>
                            <textarea
                                id="alamat"
                                name="alamat"
                                value={formData.alamat}
                                onChange={handleChange}
                                className={errors.alamat ? "error" : ""}
                                placeholder="Masukkan alamat lengkap"
                                rows={3}
                            />
                            {errors.alamat && (
                                <span className="error-message">
                                    {errors.alamat}
                                </span>
                            )}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div className="password-input">
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={
                                            errors.password ? "error" : ""
                                        }
                                        placeholder="Masukkan password"
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        <i
                                            className={
                                                showPassword
                                                    ? "fas fa-eye-slash"
                                                    : "fas fa-eye"
                                            }
                                        ></i>
                                    </button>
                                </div>
                                {errors.password && (
                                    <span className="error-message">
                                        {errors.password}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="password_confirmation">
                                    Konfirmasi Password
                                </label>
                                <div className="password-input">
                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        className={
                                            errors.password_confirmation
                                                ? "error"
                                                : ""
                                        }
                                        placeholder="Konfirmasi password"
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                    >
                                        <i
                                            className={
                                                showConfirmPassword
                                                    ? "fas fa-eye-slash"
                                                    : "fas fa-eye"
                                            }
                                        ></i>
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <span className="error-message">
                                        {errors.password_confirmation}
                                    </span>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="register-button"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Mendaftar...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-user-plus"></i>
                                    Daftar
                                </>
                            )}
                        </button>
                    </form>

                    <div className="register-footer">
                        <p>
                            Sudah punya akun?{" "}
                            <a href="/login" className="login-link">
                                Login di sini
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                .register-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(
                        135deg,
                        #667eea 0%,
                        #764ba2 100%
                    );
                    position: relative;
                    overflow: hidden;
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
                    left: 10%;
                    animation-delay: 0s;
                }

                .shape-2 {
                    width: 60px;
                    height: 60px;
                    top: 60%;
                    left: 80%;
                    animation-delay: 1s;
                }

                .shape-3 {
                    width: 100px;
                    height: 100px;
                    top: 80%;
                    left: 20%;
                    animation-delay: 2s;
                }

                .shape-4 {
                    width: 40px;
                    height: 40px;
                    top: 30%;
                    left: 70%;
                    animation-delay: 3s;
                }

                .shape-5 {
                    width: 120px;
                    height: 120px;
                    top: 10%;
                    left: 60%;
                    animation-delay: 4s;
                }

                @keyframes float {
                    0%,
                    100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }

                .register-wrapper {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    max-width: 800px;
                    padding: 20px;
                }

                .register-card {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .register-header {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .register-header h1 {
                    color: #1f2937;
                    font-size: 2.5em;
                    margin-bottom: 10px;
                    font-weight: 700;
                }

                .register-header p {
                    color: #6b7280;
                    font-size: 1.1em;
                }

                .alert {
                    padding: 15px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
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

                .register-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
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
                    font-size: 0.9em;
                }

                .form-group input,
                .form-group textarea {
                    padding: 12px 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    font-size: 16px;
                    transition: all 0.3s ease;
                    background: white;
                }

                .form-group input:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .form-group input.error,
                .form-group textarea.error {
                    border-color: #ef4444;
                }

                .password-input {
                    position: relative;
                }

                .toggle-password {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #6b7280;
                    cursor: pointer;
                    padding: 5px;
                    transition: color 0.2s;
                }

                .toggle-password:hover {
                    color: #374151;
                }

                .error-message {
                    color: #ef4444;
                    font-size: 0.8em;
                    margin-top: 5px;
                }

                .register-button {
                    background: linear-gradient(
                        135deg,
                        #3b82f6 0%,
                        #1d4ed8 100%
                    );
                    color: white;
                    padding: 16px 24px;
                    border: none;
                    border-radius: 12px;
                    font-size: 1.1em;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    margin-top: 20px;
                }

                .register-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
                }

                .register-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .register-footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                }

                .register-footer p {
                    color: #6b7280;
                    margin: 0;
                }

                .login-link {
                    color: #3b82f6;
                    text-decoration: none;
                    font-weight: 600;
                }

                .login-link:hover {
                    text-decoration: underline;
                }

                @media (max-width: 768px) {
                    .register-card {
                        padding: 30px 20px;
                    }

                    .form-row {
                        grid-template-columns: 1fr;
                    }

                    .register-header h1 {
                        font-size: 2em;
                    }
                }
            `}</style>
        </div>
    );
};

export default Register;
