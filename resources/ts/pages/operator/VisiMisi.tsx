import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { Edit, Save, X, Eye, Sparkles, Target, Lightbulb } from "lucide-react";
import axios from "axios";

interface VisiMisi {
    id: number;
    judul: string;
    deskripsi: string;
}

const VisiMisiPage: React.FC<{ visiMisi?: VisiMisi[] }> = (props) => {
    const [visiMisiList, setVisiMisiList] = useState<VisiMisi[]>(
        props.visiMisi || []
    );
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (!props.visiMisi || props.visiMisi.length === 0) {
            fetchVisiMisi();
        } else {
            setVisiMisiList(props.visiMisi);
        }
    }, [props.visiMisi]);

    const fetchVisiMisi = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/visi-misi/fetched");
            setVisiMisiList(response.data.visiMisi);
        } catch (error) {
            console.error("Error fetching visi misi:", error);
            setMessage({ text: "Gagal memuat data visi misi", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        id: number
    ) => {
        const { name, value } = e.target;
        setVisiMisiList((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, [name]: value } : item
            )
        );
    };

    const handleEdit = (id: number) => {
        setIsAnimating(true);
        setTimeout(() => {
            setEditingId(id);
            setIsAnimating(false);
        }, 150);
    };

    const handleCancel = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setEditingId(null);
            setIsAnimating(false);
        }, 150);
    };

    const handleSubmit = async (e: React.FormEvent, id: number) => {
        e.preventDefault();
        const visiMisi = visiMisiList.find((item) => item.id === id);
        if (!visiMisi) return;

        setLoading(true);
        try {
            const response = await axios.put(`/visi-misi/${id}`, visiMisi);

            if (response.data.success) {
                setMessage({ text: response.data.message, type: "success" });
                setEditingId(null);
                fetchVisiMisi();

                // Auto-hide success message
                setTimeout(() => {
                    setMessage({ text: "", type: "" });
                }, 3000);
            }
        } catch (error: any) {
            console.error("Error saving visi misi:", error);
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

    const renderVisiMisiCard = (item: VisiMisi) => {
        const isEditing = editingId === item.id;
        const isVisi = item.id === 1;

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
                        <div
                            className={`p-3 rounded-full ${
                                isVisi
                                    ? "bg-gradient-to-r from-blue-500 to-purple-500"
                                    : "bg-gradient-to-r from-green-500 to-teal-500"
                            }`}
                        >
                            {isVisi ? (
                                <Eye className="w-6 h-6 text-white" />
                            ) : (
                                <Target className="w-6 h-6 text-white" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                {isVisi ? "VISI" : "MISI"}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {isVisi
                                    ? "Pandangan masa depan"
                                    : "Langkah strategis"}
                            </p>
                        </div>
                    </div>

                    {!isEditing && (
                        <button
                            onClick={() => handleEdit(item.id)}
                            className="group/btn flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <Edit className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                            <span className="font-medium">Edit</span>
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <form
                        onSubmit={(e) => handleSubmit(e, item.id)}
                        className="space-y-6"
                    >
                        {/* Floating label input */}
                        <div className="relative">
                            <input
                                type="text"
                                id={`judul-${item.id}`}
                                name="judul"
                                value={item.judul || ""}
                                onChange={(e) => handleChange(e, item.id)}
                                className="peer w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-transparent bg-white/70 backdrop-blur-sm"
                                placeholder="Masukkan judul"
                                required
                            />
                            <label
                                htmlFor={`judul-${item.id}`}
                                className="absolute left-4 -top-3 text-sm font-medium text-blue-600 bg-white px-2 rounded-full peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-lg peer-focus:-top-3 peer-focus:text-blue-600 peer-focus:text-sm transition-all duration-200"
                            >
                                Judul {isVisi ? "Visi" : "Misi"}
                            </label>
                        </div>

                        {/* Floating label textarea */}
                        <div className="relative">
                            <textarea
                                id={`deskripsi-${item.id}`}
                                name="deskripsi"
                                value={item.deskripsi || ""}
                                onChange={(e) => handleChange(e, item.id)}
                                rows={8}
                                className="peer w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-transparent bg-white/70 backdrop-blur-sm resize-none"
                                placeholder="Masukkan deskripsi"
                                required
                            />
                            <label
                                htmlFor={`deskripsi-${item.id}`}
                                className="absolute left-4 -top-3 text-sm font-medium text-blue-600 bg-white px-2 rounded-full peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-lg peer-focus:-top-3 peer-focus:text-blue-600 peer-focus:text-sm transition-all duration-200"
                            >
                                Deskripsi {isVisi ? "Visi" : "Misi"}
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
                ) : (
                    <div className="space-y-6">
                        <div className="group/content">
                            <h4 className="text-xl font-bold text-gray-900 mb-4 group-hover/content:text-blue-600 transition-colors">
                                {item.judul}
                            </h4>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                                <div
                                    className="[&>p]:mb-4 [&>ul]:mb-4 [&>ol]:mb-4 [&>li]:mb-2"
                                    dangerouslySetInnerHTML={{
                                        __html: item.deskripsi,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Layout title="Visi & Misi">
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="space-y-8">
                    {/* Modern Header */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-2xl p-8 text-white">
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                    <Sparkles className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">
                                        Visi & Misi Lembaga
                                    </h1>
                                    <p className="text-blue-100 text-lg">
                                        Kelola visi dan misi organisasi dengan
                                        mudah
                                    </p>
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <Lightbulb className="w-16 h-16 text-white/30" />
                            </div>
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

                    {/* Enhanced Loading state */}
                    {loading && editingId === null ? (
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
                            {visiMisiList.length > 0 ? (
                                visiMisiList.map(renderVisiMisiCard)
                            ) : (
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-12 text-center">
                                    <div className="mx-auto w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-6">
                                        <Eye className="w-12 h-12 text-gray-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                        Belum ada data
                                    </h3>
                                    <p className="text-gray-600 text-lg">
                                        Visi & misi belum tersedia. Silakan
                                        tambahkan data terlebih dahulu.
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

export default VisiMisiPage;
