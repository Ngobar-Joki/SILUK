import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import axios from "axios";
import { Save, X, User } from "lucide-react";

interface UserProfile {
    name: string;
    email: string;
    no_hp: string;
    alamat: string;
    username: string;
    accessibility_settings?: Record<string, any>;
}

const initialProfile: UserProfile = {
    name: "",
    email: "",
    no_hp: "",
    alamat: "",
    username: "",
    accessibility_settings: {},
};

const ProfileUser: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile>(initialProfile);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        axios
            .get("/profile-user/fetched")
            .then((res) => {
                if (res.data.success && res.data.user) {
                    setProfile({
                        ...initialProfile,
                        ...res.data.user,
                    });
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
        // eslint-disable-next-line
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setSuccess(null);

        try {
            const payload = { ...profile, password: password || undefined };
            const res = await axios.put("/profile-user", payload);
            if (res.data.success) {
                setSuccess(res.data.message);
                setPassword("");
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setErrors(res.data.errors || {});
            }
        } catch (err: any) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout title="Profil Pengguna">
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-10">
                <div className="w-full max-w-xl space-y-8">
                    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-2xl p-8 text-white shadow-lg">
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="relative flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                <User className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold mb-2">
                                    Profil Pengguna
                                </h1>
                                <p className="text-blue-100 text-lg">
                                    Kelola data profil Anda dengan mudah
                                </p>
                            </div>
                        </div>
                    </div>

                    {success && (
                        <div className="relative overflow-hidden rounded-2xl p-6 shadow-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white mb-2">
                            <div className="absolute inset-0 bg-white/10" />
                            <div className="relative flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-full">
                                    <Save className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-lg">
                                    {success}
                                </span>
                            </div>
                        </div>
                    )}
                    {Object.keys(errors).length > 0 && (
                        <div className="relative overflow-hidden rounded-2xl p-6 shadow-lg bg-gradient-to-r from-red-500 to-pink-500 text-white mb-2">
                            <div className="absolute inset-0 bg-white/10" />
                            <div className="relative flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-full">
                                    <X className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-lg">
                                    Terdapat kesalahan pada data yang Anda
                                    masukkan.
                                </span>
                            </div>
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8 shadow space-y-7"
                    >
                        <div className="relative">
                            <input
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                                className={`peer w-full px-4 py-4 text-lg border-2 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-transparent bg-white/70 backdrop-blur-sm ${
                                    errors.name
                                        ? "border-red-400"
                                        : "border-gray-200"
                                }`}
                                placeholder="Nama Lengkap"
                                disabled={loading}
                                autoComplete="off"
                                required
                            />
                            <label
                                htmlFor="name"
                                className="absolute left-4 -top-3 text-sm font-medium text-blue-600 bg-white px-2 rounded-full peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-lg peer-focus:-top-3 peer-focus:text-blue-600 peer-focus:text-sm transition-all duration-200"
                            >
                                Nama Lengkap
                            </label>
                            {errors.name && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors.name[0]}
                                </p>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleChange}
                                className={`peer w-full px-4 py-4 text-lg border-2 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-transparent bg-white/70 backdrop-blur-sm ${
                                    errors.email
                                        ? "border-red-400"
                                        : "border-gray-200"
                                }`}
                                placeholder="Email"
                                disabled={loading}
                                autoComplete="off"
                                required
                            />
                            <label
                                htmlFor="email"
                                className="absolute left-4 -top-3 text-sm font-medium text-blue-600 bg-white px-2 rounded-full peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-lg peer-focus:-top-3 peer-focus:text-blue-600 peer-focus:text-sm transition-all duration-200"
                            >
                                Email
                            </label>
                            {errors.email && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors.email[0]}
                                </p>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                name="no_hp"
                                value={profile.no_hp}
                                onChange={handleChange}
                                className={`peer w-full px-4 py-4 text-lg border-2 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-transparent bg-white/70 backdrop-blur-sm ${
                                    errors.no_hp
                                        ? "border-red-400"
                                        : "border-gray-200"
                                }`}
                                placeholder="No. HP"
                                disabled={loading}
                                autoComplete="off"
                                required
                            />
                            <label
                                htmlFor="no_hp"
                                className="absolute left-4 -top-3 text-sm font-medium text-blue-600 bg-white px-2 rounded-full peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-lg peer-focus:-top-3 peer-focus:text-blue-600 peer-focus:text-sm transition-all duration-200"
                            >
                                No. HP
                            </label>
                            {errors.no_hp && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors.no_hp[0]}
                                </p>
                            )}
                        </div>
                        <div className="relative">
                            <textarea
                                name="alamat"
                                value={profile.alamat}
                                onChange={handleChange}
                                className={`peer w-full px-4 py-4 text-lg border-2 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-transparent bg-white/70 backdrop-blur-sm resize-none ${
                                    errors.alamat
                                        ? "border-red-400"
                                        : "border-gray-200"
                                }`}
                                placeholder="Alamat"
                                disabled={loading}
                                rows={3}
                                required
                            />
                            <label
                                htmlFor="alamat"
                                className="absolute left-4 -top-3 text-sm font-medium text-blue-600 bg-white px-2 rounded-full peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-lg peer-focus:-top-3 peer-focus:text-blue-600 peer-focus:text-sm transition-all duration-200"
                            >
                                Alamat
                            </label>
                            {errors.alamat && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors.alamat[0]}
                                </p>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                name="username"
                                value={profile.username}
                                onChange={handleChange}
                                className={`peer w-full px-4 py-4 text-lg border-2 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-transparent bg-white/70 backdrop-blur-sm ${
                                    errors.username
                                        ? "border-red-400"
                                        : "border-gray-200"
                                }`}
                                placeholder="Username"
                                disabled={loading}
                                autoComplete="off"
                                required
                            />
                            <label
                                htmlFor="username"
                                className="absolute left-4 -top-3 text-sm font-medium text-blue-600 bg-white px-2 rounded-full peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-lg peer-focus:-top-3 peer-focus:text-blue-600 peer-focus:text-sm transition-all duration-200"
                            >
                                Username
                            </label>
                            {errors.username && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors.username[0]}
                                </p>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`peer w-full px-4 py-4 text-lg border-2 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-transparent bg-white/70 backdrop-blur-sm ${
                                    errors.password
                                        ? "border-red-400"
                                        : "border-gray-200"
                                }`}
                                disabled={loading}
                                autoComplete="new-password"
                                placeholder="Minimal 8 karakter"
                            />
                            <label
                                htmlFor="password"
                                className="absolute left-4 -top-3 text-sm font-medium text-blue-600 bg-white px-2 rounded-full peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-lg peer-focus:-top-3 peer-focus:text-blue-600 peer-focus:text-sm transition-all duration-200"
                            >
                                Password Baru{" "}
                                <span className="text-gray-400">
                                    (Opsional)
                                </span>
                            </label>
                            {errors.password && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors.password[0]}
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                className="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        Simpan Perubahan
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default ProfileUser;
