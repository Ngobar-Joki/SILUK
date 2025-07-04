import React, { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import { Edit, Save } from "lucide-react";
import axios from "axios";

interface VisiMisi {
    id: number;
    judul: string;
    deskripsi: string;
}

const VisiMisiPage: React.FC<{ visiMisi?: VisiMisi }> = (props) => {
    const [visiMisi, setVisiMisi] = useState<VisiMisi | null>(
        props.visiMisi || null
    );
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    useEffect(() => {
        if (!props.visiMisi) {
            fetchVisiMisi();
        } else {
            setVisiMisi(props.visiMisi);
        }
    }, [props.visiMisi]);

    const fetchVisiMisi = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/visi-misi/fetched");
            setVisiMisi(response.data.visiMisi);
        } catch (error) {
            console.error("Error fetching visi misi:", error);
            setMessage({ text: "Gagal memuat data visi misi", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setVisiMisi((prev) => ({
            ...(prev || { id: 0, judul: "", deskripsi: "" }),
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!visiMisi) return;

        setLoading(true);
        try {
            let response;
            if (visiMisi.id) {
                response = await axios.put(
                    `/visi-misi/${visiMisi.id}`,
                    visiMisi
                );
            } else {
                response = await axios.post("/visi-misi", visiMisi);
            }

            if (response.data.success) {
                setMessage({ text: response.data.message, type: "success" });
                setIsEditing(false);
                if (!visiMisi.id) {
                    fetchVisiMisi(); // Refresh data if it was a new entry
                }
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

    return (
        <Layout title="Visi & Misi">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center"></div>
                <h2 className="text-xl font-bold text-gray-800">
                    Visi & Misi Lembaga
                </h2>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                        Edit Visi & Misi
                    </button>
                )}
            </div>

            {/* Message display */}
            {message.text && (
                <div
                    className={`p-4 rounded-lg ${
                        message.type === "success"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                    }`}
                >
                    {message.text}
                </div>
            )}

            {/* Loading state */}
            {loading ? (
                <div className="text-center py-10">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-gray-200"></div>
                    <p className="mt-2 text-gray-500">Memuat data...</p>
                </div>
            ) : (
                <>
                    {isEditing ? (
                        <form
                            onSubmit={handleSubmit}
                            className="bg-white rounded-lg border border-gray-200 p-6"
                        >
                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="judul"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Judul
                                    </label>
                                    <input
                                        type="text"
                                        id="judul"
                                        name="judul"
                                        value={visiMisi?.judul || ""}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="deskripsi"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Deskripsi
                                    </label>
                                    <textarea
                                        id="deskripsi"
                                        name="deskripsi"
                                        value={visiMisi?.deskripsi || ""}
                                        onChange={handleChange}
                                        rows={8}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="flex gap-3 justify-end pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        disabled={loading}
                                    >
                                        <Save className="w-4 h-4" />
                                        Simpan
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            {visiMisi?.id ? (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                            {visiMisi.judul}
                                        </h3>
                                        <div className="prose max-w-none">
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: visiMisi.deskripsi,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-500">
                                    Belum ada data visi & misi. Silakan klik
                                    tombol Edit untuk menambahkan.
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </Layout>
    );
};

export default VisiMisiPage;
