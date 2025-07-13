import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { Users } from "lucide-react";
import axios from "axios";

interface Permohonan {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
        username: string;
        no_hp: string;
        alamat: string;
    };
    created_at: string;
    updated_at: string;
    status?: string;
    catatan?: string;
    // Tambahkan field pdf untuk setiap dokumen
    susunan_penggurus?: string;
    surat_nonpengurus?: string;
    surat_kuasa?: string;
    bukti_modal?: string;
    ktp?: string;
}

const DaftarPermohonan: React.FC = () => {
    const [permohonans, setPermohonans] = useState<Permohonan[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    // State untuk modal verifikasi
    const [showModal, setShowModal] = useState<boolean>(false);
    // const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
    // Tambahkan state untuk daftar dokumen yang akan diverifikasi
    const [pdfList, setPdfList] = useState<{ label: string; url: string }[]>(
        []
    );
    const [activePdf, setActivePdf] = useState<string | null>(null);
    const [showCatatanModal, setShowCatatanModal] = useState(false);
    const [catatan, setCatatan] = useState("");
    // Simpan permohonan yang sedang diverifikasi untuk aksi
    const [selectedPermohonan, setSelectedPermohonan] =
        useState<Permohonan | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [notification, setNotification] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const fetchedPermohonans = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/daftar-permohonan/fetched");
            if (response.data.success) {
                setPermohonans(response.data.data);
                setError("");
            } else {
                setError("Tidak dapat mengambil data permohonan");
            }
        } catch (error) {
            setError("Terjadi kesalahan saat mengambil data permohonan");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchedPermohonans();
    }, []);

    // Auto hide notification after 5 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

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

    // Fungsi untuk membuka modal verifikasi dan menampilkan semua dokumen
    const handleVerifikasi = (permohonan: Permohonan) => {
        const files: { label: string; url: string }[] = [];
        if (permohonan.susunan_penggurus)
            files.push({
                label: "Susunan Pengurus",
                url: `/storage/${permohonan.susunan_penggurus}`,
            });
        if (permohonan.surat_nonpengurus)
            files.push({
                label: "Surat Non Pengurus",
                url: `/storage/${permohonan.surat_nonpengurus}`,
            });
        if (permohonan.surat_kuasa)
            files.push({
                label: "Surat Kuasa",
                url: `/storage/${permohonan.surat_kuasa}`,
            });
        if (permohonan.bukti_modal)
            files.push({
                label: "Bukti Modal",
                url: `/storage/${permohonan.bukti_modal}`,
            });
        if (permohonan.ktp)
            files.push({ label: "KTP", url: `/storage/${permohonan.ktp}` });

        setPdfList(files);
        setActivePdf(files.length > 0 ? files[0].url : null);
        setShowModal(true);
        setSelectedPermohonan(permohonan);
    };

    // Fungsi untuk menutup modal
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedPermohonan(null);
        setCatatan("");
    };

    // Handler untuk tombol Disetujui
    const handleSetujui = async () => {
        if (!selectedPermohonan) {
            setNotification({
                type: "error",
                message: "Tidak ada permohonan yang dipilih!",
            });
            return;
        }

        try {
            setIsProcessing(true);
            const response = await axios.post(
                `/daftar-permohonan/verifikasi/${selectedPermohonan.id}`
            );

            if (response.data.success) {
                // Update list permohonan
                await fetchedPermohonans();

                // Tutup modal dan reset state
                setShowModal(false);
                setSelectedPermohonan(null);
                setCatatan("");

                setNotification({
                    type: "success",
                    message:
                        "Permohonan berhasil disetujui dan notifikasi WhatsApp telah dikirim!",
                });
            } else {
                setNotification({
                    type: "error",
                    message:
                        "Gagal menyetujui permohonan: " + response.data.message,
                });
            }
        } catch (error: any) {
            console.error("Error approving permohonan:", error);

            // Log detail error untuk debugging
            if (error.response) {
                console.error("Response status:", error.response.status);
                console.error("Response data:", error.response.data);
                setNotification({
                    type: "error",
                    message: `Error ${error.response.status}: ${
                        error.response.data.message ||
                        "Terjadi kesalahan saat menyetujui permohonan"
                    }`,
                });
            } else {
                setNotification({
                    type: "error",
                    message: "Terjadi kesalahan saat menyetujui permohonan",
                });
            }
        } finally {
            setIsProcessing(false);
        }
    };

    // Handler untuk tombol Ditolak
    const handleTolak = () => {
        setShowCatatanModal(true);
    };

    // Handler submit catatan penolakan
    const handleSubmitCatatan = async () => {
        if (!selectedPermohonan) {
            setNotification({
                type: "error",
                message: "Tidak ada permohonan yang dipilih!",
            });
            return;
        }

        if (!catatan.trim()) {
            setNotification({
                type: "error",
                message: "Catatan penolakan harus diisi!",
            });
            return;
        }

        try {
            setIsProcessing(true);
            const response = await axios.post(
                `/daftar-permohonan/tolak/${selectedPermohonan.id}`,
                {
                    catatan: catatan,
                }
            );

            if (response.data.success) {
                // Update list permohonan
                await fetchedPermohonans();

                // Tutup modal dan reset state
                setShowCatatanModal(false);
                setShowModal(false);
                setSelectedPermohonan(null);
                setCatatan("");

                setNotification({
                    type: "success",
                    message:
                        "Permohonan berhasil ditolak dan notifikasi WhatsApp telah dikirim!",
                });
            } else {
                setNotification({
                    type: "error",
                    message:
                        "Gagal menolak permohonan: " + response.data.message,
                });
            }
        } catch (error: any) {
            console.error("Error rejecting permohonan:", error);

            // Log detail error untuk debugging
            if (error.response) {
                console.error("Response status:", error.response.status);
                console.error("Response data:", error.response.data);
                setNotification({
                    type: "error",
                    message: `Error ${error.response.status}: ${
                        error.response.data.message ||
                        "Terjadi kesalahan saat menolak permohonan"
                    }`,
                });
            } else {
                setNotification({
                    type: "error",
                    message: "Terjadi kesalahan saat menolak permohonan",
                });
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Layout title="Daftar Permohonan">
            {/* Notification */}
            {notification && (
                <div
                    className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
                        notification.type === "success"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                    } transition-all duration-300`}
                >
                    <div className="flex items-center gap-2">
                        <span>{notification.message}</span>
                        <button
                            onClick={() => setNotification(null)}
                            className="ml-2 text-white hover:text-gray-200"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Verifikasi PDF */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10"
                            onClick={handleCloseModal}
                        >
                            &times;
                        </button>
                        <h2 className="text-xl font-bold mb-4">
                            Review Dokumen Permohonan (PDF)
                        </h2>
                        {pdfList.length === 0 ? (
                            <div className="text-gray-500">
                                Tidak ada dokumen yang tersedia.
                            </div>
                        ) : (
                            <div>
                                <div className="flex gap-2 mb-4 flex-wrap">
                                    {pdfList.map((pdf) => (
                                        <button
                                            key={pdf.label}
                                            className={`px-3 py-1 rounded ${
                                                activePdf === pdf.url
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-200 text-gray-700"
                                            }`}
                                            onClick={() =>
                                                setActivePdf(pdf.url)
                                            }
                                        >
                                            {pdf.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="w-full h-[400px] border rounded-lg overflow-hidden mb-4">
                                    {activePdf && (
                                        <iframe
                                            src={activePdf}
                                            title="Preview PDF"
                                            className="w-full h-full"
                                            frameBorder={0}
                                        />
                                    )}
                                </div>
                                {/* Tombol Disetujui dan Ditolak */}
                                <div className="flex gap-4 justify-end mt-4">
                                    <button
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={handleSetujui}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing
                                            ? "Memproses..."
                                            : "Disetujui"}
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={handleTolak}
                                        disabled={isProcessing}
                                    >
                                        Ditolak
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Modal Catatan Penolakan */}
            {showCatatanModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 relative">
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                            onClick={() => setShowCatatanModal(false)}
                        >
                            &times;
                        </button>
                        <h2 className="text-xl font-bold mb-4">
                            Catatan Penolakan
                        </h2>
                        <textarea
                            className="w-full border rounded p-2 mb-4"
                            rows={4}
                            placeholder="Masukkan catatan penolakan..."
                            value={catatan}
                            onChange={(e) => setCatatan(e.target.value)}
                        />
                        <div className="flex gap-4 justify-end">
                            <button
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => setShowCatatanModal(false)}
                                disabled={isProcessing}
                            >
                                Batal
                            </button>
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleSubmitCatatan}
                                disabled={!catatan.trim() || isProcessing}
                            >
                                {isProcessing
                                    ? "Mengirim..."
                                    : "Kirim Penolakan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="relative flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                <Users className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold mb-2">
                                    Daftar Permohonan
                                </h1>
                                <p className="text-blue-100 text-lg">
                                    Lihat seluruh permohonan yang masuk
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl p-6 shadow-lg">
                            {error}
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
                            {permohonans.length > 0 ? (
                                permohonans.map((permohonan) => (
                                    <div
                                        key={permohonan.id}
                                        className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 mb-8"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                                                <Users className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                                    <span>
                                                        {permohonan.user?.name}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        |
                                                    </span>
                                                    <span>
                                                        {permohonan.user?.email}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-gray-500 text-sm">
                                                        @
                                                        {
                                                            permohonan.user
                                                                ?.username
                                                        }
                                                    </span>
                                                    <span className="text-gray-400 text-xs">
                                                        |
                                                    </span>
                                                    <span className="text-gray-500 text-sm">
                                                        {permohonan.user?.no_hp}
                                                    </span>
                                                </div>
                                                <div className="text-gray-500 text-sm mt-2">
                                                    Tanggal Permohonan:{" "}
                                                    {formatDate(
                                                        permohonan.created_at
                                                    )}
                                                </div>
                                                <div className="text-gray-500 text-sm">
                                                    Alamat:{" "}
                                                    {permohonan.user?.alamat}
                                                </div>
                                                {/* Tambahkan field permohonan lain di sini jika ada */}
                                            </div>
                                            {/* Satu tombol verifikasi untuk semua dokumen */}
                                            <button
                                                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                                onClick={() =>
                                                    handleVerifikasi(permohonan)
                                                }
                                            >
                                                Verifikasi
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-12 text-center">
                                    <div className="mx-auto w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-6">
                                        <Users className="w-12 h-12 text-gray-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                        Belum ada permohonan
                                    </h3>
                                    <p className="text-gray-600 text-lg">
                                        Data permohonan belum tersedia.
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

export default DaftarPermohonan;
