import React, { useState, useEffect, useRef } from "react";
import Layout from "../../components/layout/Layout";
import {
    Edit,
    Save,
    X,
    Upload,
    Image,
    Network,
    Plus,
    AlertTriangle,
    Trash2,
} from "lucide-react";
import axios from "axios";

interface StrukturOrganisasi {
    id: number;
    foto: string;
    created_at?: string;
    updated_at?: string;
}

const StrukturOrganisasiPage: React.FC<{
    strukturOrganisasi?: StrukturOrganisasi[];
}> = (props) => {
    const [strukturOrganisasiList, setStrukturOrganisasiList] = useState<
        StrukturOrganisasi[]
    >(props.strukturOrganisasi || []);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [isAnimating, setIsAnimating] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    // New state for delete confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);

    // Use a single file input reference instead of two
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!props.strukturOrganisasi) {
            fetchStrukturOrganisasi();
        } else {
            setStrukturOrganisasiList(props.strukturOrganisasi);
        }
    }, [props.strukturOrganisasi]);

    const fetchStrukturOrganisasi = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/struktur-organisasi/fetched");
            setStrukturOrganisasiList(response.data.strukturOrganisasi);
        } catch (error) {
            console.error("Error fetching struktur organisasi:", error);
            setMessage({
                text: "Gagal memuat data struktur organisasi",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (2MB max)
            if (file.size > 2 * 1024 * 1024) {
                setMessage({
                    text: "Ukuran file maksimal 2MB",
                    type: "error",
                });
                // Reset file input
                if (e.target) e.target.value = "";
                return;
            }

            // Validate file type
            const validTypes = [
                "image/jpeg",
                "image/png",
                "image/jpg",
                "image/gif",
            ];
            if (!validTypes.includes(file.type)) {
                setMessage({
                    text: "Format file harus JPEG, PNG, JPG, atau GIF",
                    type: "error",
                });
                // Reset file input
                if (e.target) e.target.value = "";
                return;
            }

            setSelectedFile(file);

            // Create image preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = (id: number) => {
        setIsAnimating(true);
        setTimeout(() => {
            setEditingId(id);
            setIsAdding(false);
            // Reset preview and selected file when starting edit
            setImagePreview(null);
            setSelectedFile(null);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            setIsAnimating(false);
        }, 150);
    };

    // const handleAdd = () => {
    //     setIsAnimating(true);
    //     setTimeout(() => {
    //         setIsAdding(true);
    //         setEditingId(null);
    //         setImagePreview(null);
    //         setSelectedFile(null);
    //         // Reset file input
    //         if (fileInputRef.current) {
    //             fileInputRef.current.value = "";
    //         }
    //         setIsAnimating(false);
    //     }, 150);
    // };

    const handleCancel = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setEditingId(null);
            setIsAdding(false);
            setImagePreview(null);
            setSelectedFile(null);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            setIsAnimating(false);
        }, 150);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile) {
            setMessage({
                text: "Silakan pilih file foto terlebih dahulu",
                type: "error",
            });
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("foto", selectedFile);

        try {
            let response;

            if (editingId) {
                // Update - using POST with _method override for Laravel
                formData.append("_method", "PUT");
                response = await axios.post(
                    `/struktur-organisasi/${editingId}`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            "X-HTTP-Method-Override": "PUT",
                        },
                    }
                );
            } else {
                // Create
                response = await axios.post("/struktur-organisasi", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
            }

            if (response.data.success) {
                setMessage({ text: response.data.message, type: "success" });

                // Reset all states
                setEditingId(null);
                setIsAdding(false);
                setImagePreview(null);
                setSelectedFile(null);

                // Reset both file inputs
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }

                // Refresh data
                await fetchStrukturOrganisasi();

                // Auto-hide success message
                setTimeout(() => {
                    setMessage({ text: "", type: "" });
                }, 3000);
            }
        } catch (error: any) {
            console.error("Error saving struktur organisasi:", error);
            setMessage({
                text:
                    error.response?.data?.message ||
                    "Terjadi kesalahan saat menyimpan data",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        // Instead of using window.confirm, show the custom modal
        setItemToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        setLoading(true);
        try {
            const response = await axios.delete(
                `/struktur-organisasi/${itemToDelete}`
            );

            if (response.data.success) {
                setMessage({ text: response.data.message, type: "success" });
                fetchStrukturOrganisasi();

                // Auto-hide success message
                setTimeout(() => {
                    setMessage({ text: "", type: "" });
                }, 3000);
            }
        } catch (error: any) {
            console.error("Error deleting struktur organisasi:", error);
            setMessage({
                text:
                    error.response?.data?.message ||
                    "Terjadi kesalahan saat menghapus data",
                type: "error",
            });
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setItemToDelete(null);
    };

    const renderStrukturOrganisasiCard = (
        item: StrukturOrganisasi,
        index: number
    ) => {
        const isEditing = editingId === item.id;

        return (
            <div
                key={item.id}
                className={`group relative overflow-hidden transition-all duration-500 transform ${
                    isAnimating
                        ? "scale-95 opacity-50"
                        : "scale-100 opacity-100"
                } ${
                    isEditing
                        ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-xl"
                        : "bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300/70 hover:shadow-lg"
                } rounded-2xl p-8 mb-8 hover:scale-[1.02] transition-all duration-300`}
            >
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Header with icon */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                            <Network className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                Struktur Organisasi {index + 1}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Uploaded:{" "}
                                {new Date(
                                    item.created_at || Date.now()
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {!isEditing && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(item.id)}
                                className="group/btn flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <Edit className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                                <span className="font-medium">Edit</span>
                            </button>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="group/btn flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <X className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
                                <span className="font-medium">Hapus</span>
                            </button>
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Current image display with improved UI */}
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-3">
                                Gambar Saat Ini:
                            </h4>
                            <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                                <img
                                    src={`/storage/${item.foto}`}
                                    alt="Struktur Organisasi saat ini"
                                    className="max-h-64 object-contain rounded-lg border border-gray-200 shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-3">
                                Ganti dengan Gambar Baru:
                            </h4>
                            {/* Improved file upload UI */}
                            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 transition-all duration-200 hover:border-blue-400 bg-white/70 backdrop-blur-sm">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    id={`foto-${item.id}`}
                                    name="foto"
                                    accept="image/jpeg,image/png,image/jpg,image/gif"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />

                                <label
                                    htmlFor={`foto-${item.id}`}
                                    className="flex flex-col items-center justify-center cursor-pointer"
                                >
                                    {imagePreview ? (
                                        <div className="relative w-full">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-64 object-contain mx-auto rounded-lg"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                                                <p className="text-white font-medium">
                                                    Klik untuk mengganti gambar
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <Upload className="w-16 h-16 text-gray-400 mb-4" />
                                            <p className="text-lg font-medium text-gray-700 mb-2">
                                                Klik untuk unggah gambar
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                JPG, PNG, atau GIF (Maks. 2MB)
                                            </p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* File info display */}
                        {selectedFile && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-full">
                                        <Image className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-blue-800">
                                            File yang dipilih:{" "}
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-sm text-blue-600">
                                            Ukuran:{" "}
                                            {(
                                                selectedFile.size /
                                                1024 /
                                                1024
                                            ).toFixed(2)}{" "}
                                            MB
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-3 justify-end pt-6 border-t">
                            <button
                                type="button"
                                onClick={handleCancel}
                                 className="relative z-10 group/cancel flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                            >
                                <X className="w-4 h-4 group-hover/cancel:rotate-90 transition-transform" />
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !selectedFile}
                                className="group/save flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 group-hover/save:scale-110 transition-transform" />
                                        Simpan Perubahan
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="flex justify-center">
                        <div className="group/content relative w-full">
                            <div className="overflow-hidden rounded-xl border border-gray-200">
                                <img
                                    src={`/storage/${item.foto}`}
                                    alt="Struktur Organisasi"
                                    className="w-full h-auto max-h-[500px] object-contain transition-transform duration-300 group-hover/content:scale-105"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderAddForm = () => (
        <div
            className={`group relative overflow-hidden transition-all duration-500 transform ${
                isAnimating ? "scale-95 opacity-50" : "scale-100 opacity-100"
            } bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-xl rounded-2xl p-8 mb-8`}
        >
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-teal-500">
                        <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Tambah Struktur Organisasi Baru
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Unggah gambar struktur organisasi
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Improved file upload UI for adding */}
                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 transition-all duration-200 hover:border-blue-400 bg-white/70 backdrop-blur-sm">
                    <input
                        type="file"
                        ref={fileInputRef}
                        id="foto-new"
                        name="foto"
                        accept="image/jpeg,image/png,image/jpg,image/gif"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    <label
                        htmlFor="foto-new"
                        className="flex flex-col items-center justify-center cursor-pointer"
                    >
                        {imagePreview ? (
                            <div className="relative w-full">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-64 object-contain mx-auto rounded-lg"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                                    <p className="text-white font-medium">
                                        Klik untuk mengganti gambar
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8">
                                <Upload className="w-16 h-16 text-gray-400 mb-4" />
                                <p className="text-lg font-medium text-gray-700 mb-2">
                                    Klik untuk unggah gambar
                                </p>
                                <p className="text-sm text-gray-500">
                                    JPG, PNG, atau GIF (Maks. 2MB)
                                </p>
                            </div>
                        )}
                    </label>
                </div>

                {/* File info display for add form */}
                {selectedFile && isAdding && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                                <Image className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-blue-800">
                                    File yang dipilih: {selectedFile.name}
                                </p>
                                <p className="text-sm text-blue-600">
                                    Ukuran:{" "}
                                    {(selectedFile.size / 1024 / 1024).toFixed(
                                        2
                                    )}{" "}
                                    MB
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 justify-end pt-6">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="group/cancel flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                    >
                        <X className="w-4 h-4 group-hover/cancel:rotate-90 transition-transform" />
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !selectedFile}
                        className="group/save flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 group-hover/save:scale-110 transition-transform" />
                                Simpan
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );

    return (
        <Layout title="Struktur Organisasi">
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="space-y-8">
                    {/* Modern Header */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-2xl p-8 text-white">
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                    <Network className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">
                                        Struktur Organisasi
                                    </h1>
                                    <p className="text-blue-100 text-lg">
                                        Kelola gambar struktur organisasi
                                        lembaga
                                    </p>
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <Image className="w-16 h-16 text-white/30" />
                            </div>
                        </div>
                    </div>

                    {/* Action button to add new */}
                    {/* {!isAdding && !editingId && (
                        <div className="flex justify-end">
                            <button
                                onClick={handleAdd}
                                className="group/btn flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <Plus className="w-5 h-5 group-hover/btn:rotate-90 transition-transform" />
                                <span className="font-medium">Tambah Baru</span>
                            </button>
                        </div>
                    )} */}

                    {/* Enhanced Message display */}
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

                    {/* Enhanced Loading state */}
                    {loading && !editingId && !isAdding ? (
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
                            {isAdding && renderAddForm()}

                            {strukturOrganisasiList.length > 0 ? (
                                strukturOrganisasiList.map((item, index) =>
                                    renderStrukturOrganisasiCard(item, index)
                                )
                            ) : !isAdding ? (
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-12 text-center">
                                    <div className="mx-auto w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-6">
                                        <Network className="w-12 h-12 text-gray-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                        Belum ada data
                                    </h3>
                                    <p className="text-gray-600 text-lg">
                                        Struktur organisasi belum tersedia.
                                        Silakan tambahkan data terlebih dahulu.
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop with blur effect */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm transition-opacity"
                        onClick={cancelDelete}
                    ></div>

                    {/* Modal Content */}
                    <div
                        className="relative bg-white rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl transform transition-all"
                        style={{
                            animation:
                                "modal-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        }}
                    >
                        {/* Gradient header */}
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

                        {/* Modal body */}
                        <div className="p-6">
                            <div className="mb-6">
                                <p className="text-gray-700 text-base">
                                    Apakah Anda yakin ingin menghapus struktur
                                    organisasi ini? Tindakan ini tidak dapat
                                    dibatalkan.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    className="group/btn px-4 py-2 border-2 border-gray-300 rounded-xl text-gray-700 font-medium transition-all hover:bg-gray-100 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                                    onClick={cancelDelete}
                                >
                                    <div className="flex items-center gap-2">
                                        <X className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
                                        <span>Batal</span>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className="group/btn px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-red-500/30 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    onClick={confirmDelete}
                                >
                                    <div className="flex items-center gap-2">
                                        <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                        <span>Hapus Data</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                /* Modal animations */
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

export default StrukturOrganisasiPage;
