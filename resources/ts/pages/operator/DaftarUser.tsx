import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import {
    Edit,
    Save,
    X,
    Trash2,
    Plus,
    User,
    Users,
    AlertTriangle,
} from "lucide-react";
import axios from "axios";

interface User {
    id: number;
    name: string;
    email: string;
    username: string;
    no_hp: string;
    alamat: string;
    role: "pendaftar";
    verified: boolean;
    created_at: string;
    updated_at: string;
}

interface FormData {
    name: string;
    email: string;
    no_hp: string;
    alamat: string;
    username: string;
    password: string;
    role: "admin" | "user" | "pendaftar";
    verified: boolean;
}

interface Errors {
    [key: string]: string[];
}

const DaftarUserPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [errors, setErrors] = useState<Errors>({});
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        no_hp: "",
        alamat: "",
        username: "",
        password: "",
        role: "pendaftar",
        verified: false,
    });
    const [showDeleteConfirmation, setShowDeleteConfirmation] =
        useState<boolean>(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);
    const [message, setMessage] = useState<{ text: string; type: string }>({
        text: "",
        type: "",
    });
    const [search, setSearch] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(5);
    const [totalPages, setTotalPages] = useState<number>(1);

    const fetchedUsers = async (
        params: {
            search?: string;
            page?: number;
            pageSize?: number;
        } = {}
    ) => {
        try {
            setLoading(true);
            const { search = "", page = 1, pageSize = 5 } = params;
            const response = await axios.get("/daftar-user/fetched", {
                params: { search, page, pageSize },
            });
            if (response.data.success) {
                setUsers(response.data.users.data);
                setTotalPages(response.data.users.last_page);
            } else {
                setMessage({
                    text: "Tidak dapat mengambil data pengguna",
                    type: "error",
                });
            }
        } catch (error) {
            setMessage({
                text: "Tidak dapat mengambil data pengguna",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchedUsers({ search, page: currentPage, pageSize });
        // eslint-disable-next-line
    }, [search, currentPage, pageSize]);

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            no_hp: "",
            alamat: "",
            username: "",
            password: "",
            role: "pendaftar",
            verified: false,
        });
        setErrors({});
    };

    const openAddModal = () => {
        resetForm();
        setIsEditing(false);
        setShowModal(true);
    };

    const openEditModal = (user: User) => {
        setFormData({
            name: user.name,
            email: user.email,
            no_hp: user.no_hp,
            alamat: user.alamat,
            username: user.username,
            password: "",
            role: user.role,
            verified: user.verified,
        });
        setCurrentUserId(user.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData({
                ...formData,
                [name]: checked,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing) {
                const response = await axios.put(
                    `/daftar-user/${currentUserId}`,
                    formData
                );
                if (response.data.success) {
                    setShowModal(false);
                    await fetchedUsers();
                    setMessage({
                        text: "Data pengguna berhasil diperbarui",
                        type: "success",
                    });
                }
            } else {
                const response = await axios.post("/daftar-user", formData);
                if (response.data.success) {
                    setShowModal(false);
                    await fetchedUsers();
                    setMessage({
                        text: "Data pengguna berhasil ditambahkan",
                        type: "success",
                    });
                }
            }
            setTimeout(() => setMessage({ text: "", type: "" }), 3000);
        } catch (error: any) {
            if (
                error.response &&
                error.response.data &&
                error.response.data.errors
            ) {
                setErrors(error.response.data.errors);
            } else {
                setMessage({
                    text: "Terjadi kesalahan pada server",
                    type: "error",
                });
            }
        }
    };

    const confirmDelete = (userId: number) => {
        setUserToDelete(userId);
        setShowDeleteConfirmation(true);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        try {
            const response = await axios.delete(`/daftar-user/${userToDelete}`);
            if (response.data.success) {
                await fetchedUsers();
                setMessage({
                    text: "Pengguna berhasil dihapus",
                    type: "success",
                });
            }
        } catch (error) {
            setMessage({
                text: "Terjadi kesalahan saat menghapus data",
                type: "error",
            });
        } finally {
            setShowDeleteConfirmation(false);
            setUserToDelete(null);
            setTimeout(() => setMessage({ text: "", type: "" }), 3000);
        }
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        };
        return new Date(dateString).toLocaleDateString("id-ID", options);
    };

    // Modal Form
    const renderUserForm = () => (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`peer w-full px-4 py-4 text-lg border-2 ${
                            errors.name ? "border-red-500" : "border-gray-200"
                        } rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-transparent bg-white/70 backdrop-blur-sm`}
                        placeholder="Nama Lengkap"
                        required
                    />
                    <label
                        htmlFor="name"
                        className="absolute left-4 -top-3 text-sm font-medium text-blue-600 bg-white px-2 rounded-full transition-all duration-200"
                    >
                        Nama Lengkap
                    </label>
                    {errors.name && (
                        <p className="text-red-500 text-xs italic mt-1">
                            {errors.name[0]}
                        </p>
                    )}
                </div>
                <div className="relative">
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`peer w-full px-4 py-4 text-lg border-2 ${
                            errors.email ? "border-red-500" : "border-gray-200"
                        } rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-transparent bg-white/70 backdrop-blur-sm`}
                        placeholder="Email"
                        required
                    />
                    <label
                        htmlFor="email"
                        className="absolute left-4 -top-3 text-sm font-medium text-blue-600 bg-white px-2 rounded-full transition-all duration-200"
                    >
                        Email
                    </label>
                    {errors.email && (
                        <p className="text-red-500 text-xs italic mt-1">
                            {errors.email[0]}
                        </p>
                    )}
                </div>
                <div className="relative">
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className={`peer w-full px-4 py-4 text-lg border-2 ${
                            errors.username
                                ? "border-red-500"
                                : "border-gray-200"
                        } rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-transparent bg-white/70 backdrop-blur-sm`}
                        placeholder="Username"
                        required
                    />
                    <label
                        htmlFor="username"
                        className="absolute left-4 -top-3 text-sm font-medium text-blue-600 bg-white px-2 rounded-full transition-all duration-200"
                    >
                        Username
                    </label>
                    {errors.username && (
                        <p className="text-red-500 text-xs italic mt-1">
                            {errors.username[0]}
                        </p>
                    )}
                </div>
                <div className="relative">
                    <input
                        type="text"
                        id="no_hp"
                        name="no_hp"
                        value={formData.no_hp}
                        onChange={handleChange}
                        className={`peer w-full px-4 py-4 text-lg border-2 ${
                            errors.no_hp ? "border-red-500" : "border-gray-200"
                        } rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-transparent bg-white/70 backdrop-blur-sm`}
                        placeholder="Nomor HP"
                        required
                    />
                    <label
                        htmlFor="no_hp"
                        className="absolute left-4 -top-3 text-sm font-medium text-blue-600 bg-white px-2 rounded-full transition-all duration-200"
                    >
                        Nomor HP
                    </label>
                    {errors.no_hp && (
                        <p className="text-red-500 text-xs italic mt-1">
                            {errors.no_hp[0]}
                        </p>
                    )}
                </div>
                <div className="relative md:col-span-2">
                    <textarea
                        id="alamat"
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleChange}
                        rows={3}
                        className={`peer w-full px-4 py-4 text-lg border-2 ${
                            errors.alamat ? "border-red-500" : "border-gray-200"
                        } rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-transparent bg-white/70 backdrop-blur-sm resize-none`}
                        placeholder="Alamat"
                        required
                    />
                    <label
                        htmlFor="alamat"
                        className="absolute left-4 -top-3 text-sm font-medium text-blue-600 bg-white px-2 rounded-full transition-all duration-200"
                    >
                        Alamat
                    </label>
                    {errors.alamat && (
                        <p className="text-red-500 text-xs italic mt-1">
                            {errors.alamat[0]}
                        </p>
                    )}
                </div>
                <div className="relative">
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`peer w-full px-4 py-4 text-lg border-2 ${
                            errors.password
                                ? "border-red-500"
                                : "border-gray-200"
                        } rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-transparent bg-white/70 backdrop-blur-sm`}
                        placeholder="Password"
                        autoComplete="new-password"
                        {...(isEditing ? {} : { required: true })}
                    />
                    <label
                        htmlFor="password"
                        className="absolute left-4 -top-3 text-sm font-medium text-blue-600 bg-white px-2 rounded-full transition-all duration-200"
                    >
                        Password{" "}
                        {isEditing && (
                            <span className="font-normal text-xs">
                                (Biarkan kosong jika tidak ingin mengubah)
                            </span>
                        )}
                    </label>
                    {errors.password && (
                        <p className="text-red-500 text-xs italic mt-1">
                            {errors.password[0]}
                        </p>
                    )}
                </div>
                <div className="relative">
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className={`peer w-full px-4 py-4 text-lg border-2 ${
                            errors.role ? "border-red-500" : "border-gray-200"
                        } rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white/70 backdrop-blur-sm`}
                        required
                    >
                        <option value="pendaftar">Pendaftar</option>
                        {/* <option value="user">User</option>
                        <option value="admin">Admin</option> */}
                    </select>
                    <label
                        htmlFor="role"
                        className="absolute left-4 -top-3 text-sm font-medium text-blue-600 bg-white px-2 rounded-full transition-all duration-200"
                    >
                        Role
                    </label>
                    {errors.role && (
                        <p className="text-red-500 text-xs italic mt-1">
                            {errors.role[0]}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <input
                        type="checkbox"
                        name="verified"
                        checked={formData.verified}
                        onChange={handleChange}
                        className="w-5 h-5 accent-blue-600"
                        id="verified"
                    />
                    <label
                        htmlFor="verified"
                        className="text-gray-700 text-sm font-medium"
                    >
                        Terverifikasi
                    </label>
                </div>
            </div>
            <div className="flex gap-3 justify-end pt-6">
                <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="group/cancel flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                >
                    <X className="w-4 h-4 group-hover/cancel:rotate-90 transition-transform" />
                    Batal
                </button>
                <button
                    type="submit"
                    className="group/save flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    <Save className="w-4 h-4 group-hover/save:scale-110 transition-transform" />
                    {isEditing ? "Update" : "Simpan"}
                </button>
            </div>
        </form>
    );

    // Table Card
    const renderUserCard = (user: User) => (
        <div
            key={user.id}
            className="group relative overflow-hidden transition-all duration-500 transform bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300/70 hover:shadow-lg rounded-2xl p-8 mb-8 hover:scale-[1.02] transition-all duration-300"
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <span>{"Pendaftar"}</span>
                            <span className="text-xs text-gray-400">|</span>
                            <span>{user.email}</span>
                        </div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            {user.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-gray-500 text-sm">
                                @{user.username}
                            </span>
                            <span className="text-gray-400 text-xs">|</span>
                            <span className="text-gray-500 text-sm">
                                {user.no_hp}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => openEditModal(user)}
                        className="group/btn flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                        <Edit className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                        <span className="font-medium">Edit</span>
                    </button>
                    <button
                        onClick={() => confirmDelete(user.id)}
                        className="group/btn flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                        <Trash2 className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                        <span className="font-medium">Hapus</span>
                    </button>
                </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
                <div>
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.verified
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                        }`}
                    >
                        {user.verified ? "Terverifikasi" : "Belum Diverifikasi"}
                    </span>
                </div>
                <div className="text-gray-500 text-sm">
                    Tanggal Daftar: {formatDate(user.created_at)}
                </div>
                <div className="text-gray-500 text-sm">
                    Alamat: {user.alamat}
                </div>
            </div>
        </div>
    );

    // Pagination Controls
    const renderPagination = () => (
        <div className="flex justify-center items-center gap-2 mt-6">
            <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
            >
                Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
                <button
                    key={i + 1}
                    className={`px-3 py-1 rounded ${
                        currentPage === i + 1
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                    }`}
                    onClick={() => setCurrentPage(i + 1)}
                >
                    {i + 1}
                </button>
            ))}
            <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
            >
                Next
            </button>
        </div>
    );

    return (
        <Layout title="Daftar Pengguna">
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                    <Users className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">
                                        Daftar Pengguna
                                    </h1>
                                    <p className="text-blue-100 text-lg">
                                        Tambahkan, edit, dan hapus pengguna
                                        dengan mudah
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={openAddModal}
                                className="group flex items-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                <span className="font-medium">
                                    Tambah Pengguna Baru
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex justify-end">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Cari nama, email, username..."
                            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 w-full max-w-xs"
                        />
                    </div>

                    {/* Message */}
                    {message.text && (
                        <div
                            className={`relative overflow-hidden rounded-2xl p-6 shadow-lg transform transition-all duration-300 ${
                                message.type === "success"
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                    : "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                            }`}
                        >
                            <div className="absolute inset-0 bg-white/10" />
                            <div className="relative flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-full">
                                    {message.type === "success" ? (
                                        <Save className="w-5 h-5" />
                                    ) : (
                                        <X className="w-5 h-5" />
                                    )}
                                </div>
                                <span className="font-medium text-lg">
                                    {message.text}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Modal Form */}
                    {showModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center">
                            <div
                                className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm transition-opacity"
                                onClick={() => setShowModal(false)}
                            ></div>
                            <div
                                className="relative bg-white rounded-2xl max-w-2xl w-full mx-4 overflow-hidden shadow-2xl transform transition-all"
                                style={{
                                    animation:
                                        "modal-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                }}
                            >
                                <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-white/10"></div>
                                    <div className="relative flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-full">
                                            <User className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-white text-lg font-semibold">
                                            {isEditing
                                                ? "Edit Pengguna"
                                                : "Tambah Pengguna Baru"}
                                        </h3>
                                    </div>
                                </div>
                                <div className="p-8">{renderUserForm()}</div>
                            </div>
                        </div>
                    )}

                    {/* Loading */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
                                <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <p className="mt-6 text-xl text-gray-600 font-medium">
                                Memuat data...
                            </p>
                            <p className="mt-2 text-gray-500">
                                Mohon tunggu sebentar
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {users.length > 0 ? (
                                <>
                                    {users.map(renderUserCard)}
                                    {renderPagination()}
                                </>
                            ) : (
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-12 text-center">
                                    <div className="mx-auto w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-6">
                                        <Users className="w-12 h-12 text-gray-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                        Belum ada pengguna
                                    </h3>
                                    <p className="text-gray-600 text-lg">
                                        Data pengguna belum tersedia. Silakan
                                        tambahkan pengguna terlebih dahulu.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowDeleteConfirmation(false)}
                    ></div>
                    <div
                        className="relative bg-white rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl transform transition-all"
                        style={{
                            animation:
                                "modal-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        }}
                    >
                        <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4 relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/10"></div>
                            <div className="relative flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-full">
                                    <AlertTriangle className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-white text-lg font-semibold">
                                    Konfirmasi Hapus
                                </h3>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="mb-6">
                                <p className="text-gray-700 text-base">
                                    Apakah Anda yakin ingin menghapus pengguna
                                    ini? Tindakan ini tidak dapat dibatalkan.
                                </p>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    className="group/btn px-4 py-2 border-2 border-gray-300 rounded-xl text-gray-700 font-medium transition-all hover:bg-gray-100 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                                    onClick={() =>
                                        setShowDeleteConfirmation(false)
                                    }
                                >
                                    <div className="flex items-center gap-2">
                                        <X className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
                                        <span>Batal</span>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className="group/btn px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-red-500/30 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    onClick={handleDelete}
                                >
                                    <div className="flex items-center gap-2">
                                        <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                        <span>Hapus Pengguna</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes modal-pop {
                    0% {
                        opacity: 0;
                        transform: scale(0.95) translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
            `}</style>
        </Layout>
    );
};

export default DaftarUserPage;
