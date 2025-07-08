import React, { useState, useEffect, useRef } from "react";
import Layout from "../components/layout/Layout";
import { Edit, Save, X, Trash2, Plus, Calendar, Image, Newspaper } from "lucide-react";
import axios from "axios";
import { format, parseISO } from "date-fns";

interface Berita {
    id: number;
    tanggal: string;
    Judul_berita: string;
    isi_berita: string;
    foto: string;
    created_at?: string;
    updated_at?: string;
}

const BeritaPage: React.FC = () => {
    const [beritaList, setBeritaList] = useState<Berita[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [isAnimating, setIsAnimating] = useState(false);
    
    const [newBerita, setNewBerita] = useState<Partial<Berita>>({
        tanggal: format(new Date(), 'yyyy-MM-dd'),
        Judul_berita: "",
        isi_berita: "",
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchBerita();
    }, []);

    const fetchBerita = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/berita/fetched");
            setBeritaList(response.data.beritas);
        } catch (error) {
            console.error("Error fetching berita:", error);
            setMessage({ text: "Gagal memuat data berita", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setNewBerita({
            tanggal: format(new Date(), 'yyyy-MM-dd'),
            Judul_berita: "",
            isi_berita: "",
        });
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        id: number | null = null
    ) => {
        const { name, value } = e.target;
        
        if (id === null) {
            // Creating new berita
            setNewBerita(prev => ({ ...prev, [name]: value }));
        } else {
            // Editing existing berita
            setBeritaList(prev =>
                prev.map(item =>
                    item.id === id ? { ...item, [name]: value } : item
                )
            );
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const fileReader = new FileReader();
            fileReader.onload = () => {
                setPreviewUrl(fileReader.result as string);
            };
            fileReader.readAsDataURL(file);
        }
    };

    const handleCreate = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setIsCreating(true);
            setIsAnimating(false);
        }, 150);
    };

    const handleEdit = (id: number) => {
        setIsAnimating(true);
        setTimeout(() => {
            setEditingId(id);
            setIsCreating(false);
            setIsAnimating(false);
        }, 150);
    };

    const handleCancel = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setEditingId(null);
            setIsCreating(false);
            setIsAnimating(false);
            resetForm();
        }, 150);
    };

    const handleSubmitCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            setMessage({ text: "Gambar berita wajib diunggah", type: "error" });
            return;
        }
        
        setLoading(true);
        
        const formData = new FormData();
        formData.append('tanggal', newBerita.tanggal || "");
        formData.append('Judul_berita', newBerita.Judul_berita || "");
        formData.append('isi_berita', newBerita.isi_berita || "");
        formData.append('foto', selectedFile);

        try {
            const response = await axios.post("/berita", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setMessage({ text: response.data.message, type: "success" });
                setIsCreating(false);
                fetchBerita();
                resetForm();

                // Auto-hide success message
                setTimeout(() => {
                    setMessage({ text: "", type: "" });
                }, 3000);
            }
        } catch (error: any) {
            console.error("Error creating berita:", error);
            setMessage({
                text: error.response?.data?.message || "Terjadi kesalahan saat menyimpan data",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitEdit = async (e: React.FormEvent, id: number) => {
        e.preventDefault();
        if (!selectedFile) {
            setMessage({ text: "Gambar berita wajib diunggah", type: "error" });
            return;
        }

        const berita = beritaList.find(item => item.id === id);
        if (!berita) return;

        setLoading(true);
        
        const formData = new FormData();
        formData.append('tanggal', berita.tanggal);
        formData.append('Judul_berita', berita.Judul_berita);
        formData.append('isi_berita', berita.isi_berita);
        formData.append('foto', selectedFile);

        try {
            const response = await axios.post(`/berita/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-HTTP-Method-Override': 'PUT'
                }
            });

            if (response.data.success) {
                setMessage({ text: response.data.message, type: "success" });
                setEditingId(null);
                fetchBerita();
                resetForm();

                // Auto-hide success message
                setTimeout(() => {
                    setMessage({ text: "", type: "" });
                }, 3000);
            }
        } catch (error: any) {
            console.error("Error updating berita:", error);
            setMessage({
                text: error.response?.data?.message || "Terjadi kesalahan saat menyimpan data",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Apakah Anda yakin ingin menghapus berita ini?")) {
            return;
        }

        setLoading(true);
        try {
            const response = await axios.delete(`/berita/${id}`);

            if (response.data.success) {
                setMessage({ text: response.data.message, type: "success" });
                fetchBerita();

                // Auto-hide success message
                setTimeout(() => {
                    setMessage({ text: "", type: "" });
                }, 3000);
            }
        } catch (error: any) {
            console.error("Error deleting berita:", error);
            setMessage({
                text: error.response?.data?.message || "Terjadi kesalahan saat menghapus data",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const renderBeritaForm = (berita: Partial<Berita> | null, isNew = false) => {
        const data = berita || newBerita;
        const id = berita?.id || null;
        
        return (
            <form 
                onSubmit={isNew ? handleSubmitCreate : (e) => handleSubmitEdit(e, id!)}
                className="space-y-6"
            >
                {/* Tanggal */}
                <div className="relative">
                    <input
                        type="date"
                        id={`tanggal-${id || 'new'}`}
                        name="tanggal"
                        value={data.tanggal || ""}
                        onChange={(e) => handleChange(e, id)}
                        className="peer w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-transparent bg-white/70 backdrop-blur-sm"
                        required
                    />
                    <label
                        htmlFor={`tanggal-${id || 'new'}`}
                        className="absolute left-4 -top-3 text-sm font-medium text-blue-600 bg-white px-2 rounded-full transition-all duration-200"
                    >
                        Tanggal Berita
                    </label>
                </div>
                
                {/* Judul Berita */}
                <div className="relative">
                    <input
                        type="text"
                        id={`judul-${id || 'new'}`}
                        name="Judul_berita"
                        value={data.Judul_berita || ""}
                        onChange={(e) => handleChange(e, id)}
                        className="peer w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-transparent bg-white/70 backdrop-blur-sm"
                        placeholder="Masukkan judul berita"
                        required
                    />
                    <label
                        htmlFor={`judul-${id || 'new'}`}
                        className="absolute left-4 -top-3 text-sm font-medium text-blue-600 bg-white px-2 rounded-full peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-lg peer-focus:-top-3 peer-focus:text-blue-600 peer-focus:text-sm transition-all duration-200"
                    >
                        Judul Berita
                    </label>
                </div>
                
                {/* Isi Berita */}
                <div className="relative">
                    <textarea
                        id={`isi-${id || 'new'}`}
                        name="isi_berita"
                        value={data.isi_berita || ""}
                        onChange={(e) => handleChange(e, id)}
                        rows={8}
                        className="peer w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-transparent bg-white/70 backdrop-blur-sm resize-none"
                        placeholder="Masukkan isi berita"
                        required
                    />
                    <label
                        htmlFor={`isi-${id || 'new'}`}
                        className="absolute left-4 -top-3 text-sm font-medium text-blue-600 bg-white px-2 rounded-full peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-lg peer-focus:-top-3 peer-focus:text-blue-600 peer-focus:text-sm transition-all duration-200"
                    >
                        Isi Berita
                    </label>
                </div>
                
                {/* Image Upload */}
                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 transition-all duration-200 hover:border-blue-400 bg-white/70 backdrop-blur-sm">
                    <input 
                        type="file"
                        ref={fileInputRef}
                        id={`foto-${id || 'new'}`}
                        name="foto"
                        accept="image/jpeg,image/png,image/jpg,image/gif"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    
                    <label 
                        htmlFor={`foto-${id || 'new'}`}
                        className="flex flex-col items-center justify-center cursor-pointer"
                    >
                        {previewUrl ? (
                            <div className="relative w-full">
                                <img 
                                    src={previewUrl} 
                                    alt="Preview" 
                                    className="w-full h-64 object-cover rounded-lg shadow-md mb-4" 
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                                    <p className="text-white font-medium">Klik untuk mengganti gambar</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8">
                                <Image className="w-16 h-16 text-gray-400 mb-4" />
                                <p className="text-lg font-medium text-gray-700 mb-2">Klik untuk unggah gambar</p>
                                <p className="text-sm text-gray-500">JPG, PNG, atau GIF (Maks. 2MB)</p>
                            </div>
                        )}
                    </label>
                </div>
                
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
                        disabled={loading}
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
        );
    };

    const renderBeritaCard = (berita: Berita) => {
        const isEditing = editingId === berita.id;
        const formattedDate = berita.tanggal ? format(parseISO(berita.tanggal), 'dd MMMM yyyy') : '';

        return (
            <div
                key={berita.id}
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

                {isEditing ? (
                    renderBeritaForm(berita, false)
                ) : (
                    <div className="space-y-6">
                        {/* Header with action buttons */}
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                                    <Newspaper className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formattedDate}</span>
                                    </div>
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                        {berita.Judul_berita}
                                    </h3>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(berita.id)}
                                    className="group/btn flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                                >
                                    <Edit className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                                    <span className="font-medium">Edit</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(berita.id)}
                                    className="group/btn flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                                >
                                    <Trash2 className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                                    <span className="font-medium">Hapus</span>
                                </button>
                            </div>
                        </div>

                        {/* Image display */}
                        {berita.foto && (
                            <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg">
                                <img 
                                    src={`/storage/${berita.foto}`} 
                                    alt={berita.Judul_berita} 
                                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" 
                                />
                            </div>
                        )}
                        
                        {/* Content */}
                        <div className="group/content">
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                                <div
                                    className="[&>p]:mb-4 [&>ul]:mb-4 [&>ol]:mb-4 [&>li]:mb-2"
                                    dangerouslySetInnerHTML={{
                                        __html: berita.isi_berita,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderCreateForm = () => {
        return (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 mb-8 shadow-xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-600" />
                    Tambah Berita Baru
                </h3>
                {renderBeritaForm(null, true)}
            </div>
        );
    };

    return (
        <Layout title="Kelola Berita">
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="space-y-8">
                    {/* Modern Header */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                    <Newspaper className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">
                                        Kelola Berita
                                    </h1>
                                    <p className="text-blue-100 text-lg">
                                        Tambahkan, edit, dan hapus berita dengan mudah
                                    </p>
                                </div>
                            </div>
                            
                            {!isCreating && !editingId && (
                                <button
                                    onClick={handleCreate}
                                    className="group flex items-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                    <span className="font-medium">Tambah Berita</span>
                                </button>
                            )}
                        </div>
                    </div>

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

                    {/* Create form */}
                    {isCreating && renderCreateForm()}

                    {/* Enhanced Loading state */}
                    {loading && !isCreating && editingId === null ? (
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
                            {beritaList.length > 0 ? (
                                beritaList.map(renderBeritaCard)
                            ) : (
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-12 text-center">
                                    <div className="mx-auto w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-6">
                                        <Newspaper className="w-12 h-12 text-gray-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                        Belum ada berita
                                    </h3>
                                    <p className="text-gray-600 text-lg">
                                        Berita belum tersedia. Silakan tambahkan berita terlebih dahulu.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default BeritaPage;


