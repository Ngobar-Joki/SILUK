import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import {
    Users,
    CheckCircle,
    XCircle,
    Clock,
    FileText,
    Download,
    Eye,
} from "lucide-react";
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
    // State untuk active tab
    const [activeTab, setActiveTab] = useState<
        "pending" | "accepted" | "rejected"
    >("pending");
    // State untuk modal verifikasi
    const [showModal, setShowModal] = useState<boolean>(false);
    // (pdfList state removed because it was unused)
    // const [activePdf, setActivePdf] = useState<string | null>(null);
    const [showCatatanModal, setShowCatatanModal] = useState(false);
    const [catatan, setCatatan] = useState("");
    // State untuk file viewer modal
    const [showFileModal, setShowFileModal] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string>("");
    const [fileLoading, setFileLoading] = useState<boolean>(false);
    // Simpan permohonan yang sedang diverifikasi untuk aksi
    const [selectedPermohonan, setSelectedPermohonan] =
        useState<Permohonan | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [notification, setNotification] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);
    // Tambahkan state untuk search dan pagination
    const [search, setSearch] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(5);
    const [totalPages, setTotalPages] = useState<number>(1);

    const fetchedPermohonans = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/daftar-permohonan/fetched", {
                params: { search, page: currentPage, pageSize },
            });
            if (response.data.success) {
                // Asumsikan backend mengembalikan data: { data: [...], last_page: n }
                setPermohonans(response.data.data.data || response.data.data); // fallback jika tidak ada .data
                setTotalPages(response.data.data.last_page || 1);
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

    // Trigger fetch saat search/pagination berubah
    useEffect(() => {
        fetchedPermohonans();
        // eslint-disable-next-line
    }, [search, currentPage, pageSize]);

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

    // Fungsi untuk memfilter permohonan berdasarkan status
    const getFilteredPermohonans = () => {
        switch (activeTab) {
            case "pending":
                return permohonans.filter(
                    (p) => !p.status || p.status === "pending"
                );
            case "accepted":
                return permohonans.filter((p) => p.status === "accepted");
            case "rejected":
                return permohonans.filter((p) => p.status === "rejected");
            default:
                return permohonans;
        }
    };

    // Fungsi untuk menghitung jumlah permohonan per status
    const getStatusCounts = () => {
        const pending = permohonans.filter(
            (p) => !p.status || p.status === "pending"
        ).length;
        const accepted = permohonans.filter(
            (p) => p.status === "accepted"
        ).length;
        const rejected = permohonans.filter(
            (p) => p.status === "rejected"
        ).length;

        return { pending, accepted, rejected };
    };

    const statusCounts = getStatusCounts();
    const filteredPermohonans = getFilteredPermohonans();

    // Fungsi untuk handle perubahan tab dengan smooth transition
    const handleTabChange = (tab: "pending" | "accepted" | "rejected") => {
        setActiveTab(tab);
        // Smooth scroll ke atas ketika tab berubah
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Function to get file extension
    const getFileExtension = (filename: string): string => {
        return filename.split(".").pop()?.toLowerCase() || "";
    };

    // Function to determine file type
    const getFileType = (filename: string): string => {
        const ext = getFileExtension(filename);
        if (["pdf"].includes(ext)) return "pdf";
        if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
        if (["doc", "docx"].includes(ext)) return "document";
        if (["xls", "xlsx"].includes(ext)) return "spreadsheet";
        return "other";
    };

    // Function to handle file viewing
    const handleViewFile = async (filename: string) => {
        if (!filename) {
            setNotification({
                type: "error",
                message: "File tidak tersedia",
            });
            return;
        }

        try {
            setFileLoading(true);
            const filePath = `/storage/${filename}`;

            setSelectedFile(filePath);
            setFileType(getFileType(filename));
            setShowFileModal(true);
        } catch (error) {
            setNotification({
                type: "error",
                message: "Gagal memuat file",
            });
        } finally {
            setFileLoading(false);
        }
    };

    // (handleDownloadFile removed because it was unused)

    // Function to close file modal
    const handleCloseFileModal = () => {
        setShowFileModal(false);
        setSelectedFile(null);
        setFileType("");
    };

    // Fungsi untuk membuka modal verifikasi
    const handleVerifikasi = (permohonan: Permohonan) => {
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

            {/* Modal Verifikasi */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 relative">
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10"
                            onClick={handleCloseModal}
                        >
                            &times;
                        </button>
                        <h2 className="text-xl font-bold mb-4">
                            Verifikasi Permohonan
                        </h2>

                        {selectedPermohonan && (
                            <div className="mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">
                                        Detail Permohonan
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <p>
                                            <strong>Nama:</strong>{" "}
                                            {selectedPermohonan.user?.name}
                                        </p>
                                        <p>
                                            <strong>Email:</strong>{" "}
                                            {selectedPermohonan.user?.email}
                                        </p>
                                        <p>
                                            <strong>Username:</strong>{" "}
                                            {selectedPermohonan.user?.username}
                                        </p>
                                        <p>
                                            <strong>No. HP:</strong>{" "}
                                            {selectedPermohonan.user?.no_hp}
                                        </p>
                                        <p>
                                            <strong>Alamat:</strong>{" "}
                                            {selectedPermohonan.user?.alamat}
                                        </p>
                                        <p>
                                            <strong>Tanggal:</strong>{" "}
                                            {formatDate(
                                                selectedPermohonan.created_at
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Tombol Disetujui dan Ditolak - hanya muncul untuk status pending */}
                                {(!selectedPermohonan?.status ||
                                    selectedPermohonan?.status ===
                                        "pending") && (
                                    <div className="flex gap-4 justify-end">
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
                                )}

                                {/* Tampilkan status jika sudah diverifikasi */}
                                {selectedPermohonan?.status === "accepted" && (
                                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-700 font-medium">
                                            ✅ Permohonan telah disetujui
                                        </p>
                                        <p className="text-green-600 text-sm mt-1">
                                            Disetujui pada:{" "}
                                            {formatDate(
                                                selectedPermohonan.updated_at
                                            )}
                                        </p>
                                    </div>
                                )}

                                {selectedPermohonan?.status === "rejected" && (
                                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-700 font-medium">
                                            ❌ Permohonan ditolak
                                        </p>
                                        <p className="text-red-600 text-sm mt-1">
                                            Ditolak pada:{" "}
                                            {formatDate(
                                                selectedPermohonan.updated_at
                                            )}
                                        </p>
                                        {selectedPermohonan.catatan && (
                                            <p className="text-red-600 text-sm mt-2">
                                                <strong>Catatan:</strong>{" "}
                                                {selectedPermohonan.catatan}
                                            </p>
                                        )}
                                    </div>
                                )}
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

            {/* File Viewer Modal */}
            {showFileModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="bg-white rounded-2xl shadow-lg max-w-4xl w-full max-h-[90vh] m-4 flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">
                                Lihat File Dokumen
                            </h2>
                            <div className="flex items-center gap-2">
                                {selectedFile && (
                                    <button
                                        onClick={() => {
                                            const link =
                                                document.createElement("a");
                                            link.href = selectedFile;
                                            link.download =
                                                selectedFile.split("/").pop() ||
                                                "dokumen";
                                            link.target = "_blank";
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        }}
                                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Download File"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    onClick={handleCloseFileModal}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 p-4 overflow-auto">
                            {fileLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="mt-4 text-gray-600">
                                            Memuat file...
                                        </p>
                                    </div>
                                </div>
                            ) : selectedFile ? (
                                <div className="h-full">
                                    {fileType === "pdf" && (
                                        <iframe
                                            src={selectedFile}
                                            className="w-full h-96 md:h-[500px] border border-gray-300 rounded-lg"
                                            title="PDF Viewer"
                                        />
                                    )}

                                    {fileType === "image" && (
                                        <div className="flex justify-center">
                                            <img
                                                src={selectedFile}
                                                alt="Dokumen"
                                                className="max-w-full max-h-[500px] object-contain rounded-lg shadow-md"
                                            />
                                        </div>
                                    )}

                                    {(fileType === "document" ||
                                        fileType === "spreadsheet" ||
                                        fileType === "other") && (
                                        <div className="text-center py-12">
                                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <FileText className="w-8 h-8 text-gray-600" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                File tidak dapat ditampilkan
                                            </h3>
                                            <p className="text-gray-600 mb-4">
                                                File ini tidak dapat ditampilkan
                                                di browser. Silakan download
                                                untuk melihat isinya.
                                            </p>
                                            <button
                                                onClick={() => {
                                                    const link =
                                                        document.createElement(
                                                            "a"
                                                        );
                                                    link.href = selectedFile;
                                                    link.download =
                                                        selectedFile
                                                            .split("/")
                                                            .pop() || "dokumen";
                                                    link.target = "_blank";
                                                    document.body.appendChild(
                                                        link
                                                    );
                                                    link.click();
                                                    document.body.removeChild(
                                                        link
                                                    );
                                                }}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download File
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-600">
                                        File tidak dapat dimuat
                                    </p>
                                </div>
                            )}
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
                                <div className="flex items-center gap-4 mt-3 text-sm">
                                    <span className="bg-white/20 px-3 py-1 rounded-full">
                                        Total: {permohonans.length}
                                    </span>
                                    <span className="bg-white/20 px-3 py-1 rounded-full">
                                        Ditampilkan:{" "}
                                        {filteredPermohonans.length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl p-6 shadow-lg">
                            {error}
                        </div>
                    )}

                    {/* Tab Navigation */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => handleTabChange("pending")}
                                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                                    activeTab === "pending"
                                        ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg transform scale-105"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>Pending</span>
                                    <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                                        {statusCounts.pending}
                                    </span>
                                </div>
                            </button>
                            <button
                                onClick={() => handleTabChange("accepted")}
                                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                                    activeTab === "accepted"
                                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Disetujui</span>
                                    <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                                        {statusCounts.accepted}
                                    </span>
                                </div>
                            </button>
                            <button
                                onClick={() => handleTabChange("rejected")}
                                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                                    activeTab === "rejected"
                                        ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg transform scale-105"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <XCircle className="w-4 h-4" />
                                    <span>Ditolak</span>
                                    <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                                        {statusCounts.rejected}
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex justify-end mb-4">
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
                            {filteredPermohonans.length > 0 ? (
                                <>
                                    {filteredPermohonans.map(
                                        (permohonan, index) => (
                                            <div
                                                key={permohonan.id}
                                                className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 md:p-8 mb-8 transform transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.01]"
                                                style={{
                                                    animationDelay: `${
                                                        index * 50
                                                    }ms`,
                                                }}
                                            >
                                                <div className="flex flex-col md:flex-row md:items-start gap-4">
                                                    <div
                                                        className={`p-3 rounded-full flex-shrink-0 ${
                                                            permohonan.status ===
                                                            "accepted"
                                                                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                                                : permohonan.status ===
                                                                  "rejected"
                                                                ? "bg-gradient-to-r from-red-500 to-pink-500"
                                                                : "bg-gradient-to-r from-blue-500 to-purple-500"
                                                        }`}
                                                    >
                                                        <Users className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                            <span className="text-sm text-gray-500 font-medium">
                                                                {
                                                                    permohonan
                                                                        .user
                                                                        ?.name
                                                                }
                                                            </span>
                                                            <span className="text-xs text-gray-400">
                                                                |
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                {
                                                                    permohonan
                                                                        .user
                                                                        ?.email
                                                                }
                                                            </span>
                                                            {/* Status Badge */}
                                                            <span
                                                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                    permohonan.status ===
                                                                    "accepted"
                                                                        ? "bg-green-100 text-green-700 border border-green-200"
                                                                        : permohonan.status ===
                                                                          "rejected"
                                                                        ? "bg-red-100 text-red-700 border border-red-200"
                                                                        : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                                                }`}
                                                            >
                                                                {permohonan.status ===
                                                                "accepted"
                                                                    ? "✅ Disetujui"
                                                                    : permohonan.status ===
                                                                      "rejected"
                                                                    ? "❌ Ditolak"
                                                                    : "⏳ Pending"}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                                            <span>
                                                                @
                                                                {
                                                                    permohonan
                                                                        .user
                                                                        ?.username
                                                                }
                                                            </span>
                                                            <span className="text-xs text-gray-400">
                                                                |
                                                            </span>
                                                            <span>
                                                                {
                                                                    permohonan
                                                                        .user
                                                                        ?.no_hp
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="mt-2 space-y-1">
                                                            <div className="text-gray-500 text-sm">
                                                                <span className="font-medium">
                                                                    Tanggal
                                                                    Permohonan:
                                                                </span>{" "}
                                                                {formatDate(
                                                                    permohonan.created_at
                                                                )}
                                                            </div>
                                                            <div className="text-gray-500 text-sm">
                                                                <span className="font-medium">
                                                                    Alamat:
                                                                </span>{" "}
                                                                {
                                                                    permohonan
                                                                        .user
                                                                        ?.alamat
                                                                }
                                                            </div>
                                                        </div>

                                                        {/* Document Files Information */}
                                                        {(permohonan.susunan_penggurus ||
                                                            permohonan.surat_nonpengurus ||
                                                            permohonan.surat_kuasa ||
                                                            permohonan.bukti_modal ||
                                                            permohonan.ktp) && (
                                                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <FileText className="w-4 h-4 text-blue-600" />
                                                                    <span className="text-blue-700 text-sm font-medium">
                                                                        Dokumen
                                                                        Tersedia
                                                                    </span>
                                                                </div>
                                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                                    {permohonan.susunan_penggurus && (
                                                                        <div className="flex items-center gap-1">
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleViewFile(
                                                                                        permohonan.susunan_penggurus!
                                                                                    )
                                                                                }
                                                                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                                                                disabled={
                                                                                    fileLoading
                                                                                }
                                                                            >
                                                                                <Eye className="w-3 h-3" />
                                                                                Susunan
                                                                                Pengurus
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                    {permohonan.surat_nonpengurus && (
                                                                        <div className="flex items-center gap-1">
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleViewFile(
                                                                                        permohonan.surat_nonpengurus!
                                                                                    )
                                                                                }
                                                                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                                                                disabled={
                                                                                    fileLoading
                                                                                }
                                                                            >
                                                                                <Eye className="w-3 h-3" />
                                                                                Surat
                                                                                Non
                                                                                Pengurus
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                    {permohonan.surat_kuasa && (
                                                                        <div className="flex items-center gap-1">
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleViewFile(
                                                                                        permohonan.surat_kuasa!
                                                                                    )
                                                                                }
                                                                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                                                                disabled={
                                                                                    fileLoading
                                                                                }
                                                                            >
                                                                                <Eye className="w-3 h-3" />
                                                                                Surat
                                                                                Kuasa
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                    {permohonan.bukti_modal && (
                                                                        <div className="flex items-center gap-1">
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleViewFile(
                                                                                        permohonan.bukti_modal!
                                                                                    )
                                                                                }
                                                                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                                                                disabled={
                                                                                    fileLoading
                                                                                }
                                                                            >
                                                                                <Eye className="w-3 h-3" />
                                                                                Bukti
                                                                                Modal
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                    {permohonan.ktp && (
                                                                        <div className="flex items-center gap-1">
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleViewFile(
                                                                                        permohonan.ktp!
                                                                                    )
                                                                                }
                                                                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                                                                disabled={
                                                                                    fileLoading
                                                                                }
                                                                            >
                                                                                <Eye className="w-3 h-3" />
                                                                                KTP
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Tambahkan informasi khusus berdasarkan status */}
                                                        {permohonan.status ===
                                                            "accepted" && (
                                                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                                <p className="text-green-700 text-sm font-medium">
                                                                    ✅
                                                                    Permohonan
                                                                    telah
                                                                    disetujui
                                                                </p>
                                                                <p className="text-green-600 text-xs mt-1">
                                                                    Disetujui
                                                                    pada:{" "}
                                                                    {formatDate(
                                                                        permohonan.updated_at
                                                                    )}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {permohonan.status ===
                                                            "rejected" &&
                                                            permohonan.catatan && (
                                                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                                    <p className="text-red-700 text-sm font-medium">
                                                                        ❌
                                                                        Permohonan
                                                                        ditolak
                                                                    </p>
                                                                    <p className="text-red-600 text-xs mt-1">
                                                                        Ditolak
                                                                        pada:{" "}
                                                                        {formatDate(
                                                                            permohonan.updated_at
                                                                        )}
                                                                    </p>
                                                                    <p className="text-red-600 text-sm mt-2">
                                                                        <strong>
                                                                            Catatan:
                                                                        </strong>{" "}
                                                                        {
                                                                            permohonan.catatan
                                                                        }
                                                                    </p>
                                                                </div>
                                                            )}
                                                    </div>

                                                    {/* Tombol aksi berdasarkan status */}
                                                    <div className="flex-shrink-0 mt-4 md:mt-0">
                                                        {(!permohonan.status ||
                                                            permohonan.status ===
                                                                "pending") && (
                                                            <button
                                                                className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                                                                onClick={() =>
                                                                    handleVerifikasi(
                                                                        permohonan
                                                                    )
                                                                }
                                                            >
                                                                <Clock className="w-4 h-4" />
                                                                Verifikasi
                                                            </button>
                                                        )}

                                                        {/* Untuk status accepted, tampilkan tombol lihat detail */}
                                                        {permohonan.status ===
                                                            "accepted" && (
                                                            <button
                                                                className="w-full md:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                                                                onClick={() =>
                                                                    handleVerifikasi(
                                                                        permohonan
                                                                    )
                                                                }
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                                Lihat Detail
                                                            </button>
                                                        )}

                                                        {/* Untuk status rejected, tampilkan tombol lihat detail */}
                                                        {permohonan.status ===
                                                            "rejected" && (
                                                            <button
                                                                className="w-full md:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                                                                onClick={() =>
                                                                    handleVerifikasi(
                                                                        permohonan
                                                                    )
                                                                }
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                                Lihat Detail
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                    {renderPagination()}
                                </>
                            ) : (
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-12 text-center">
                                    <div className="mx-auto w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-6">
                                        <Users className="w-12 h-12 text-gray-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                        {activeTab === "pending"
                                            ? "Belum ada permohonan pending"
                                            : activeTab === "accepted"
                                            ? "Belum ada permohonan yang disetujui"
                                            : "Belum ada permohonan yang ditolak"}
                                    </h3>
                                    <p className="text-gray-600 text-lg">
                                        {activeTab === "pending"
                                            ? "Permohonan pending belum tersedia."
                                            : activeTab === "accepted"
                                            ? "Permohonan yang disetujui belum tersedia."
                                            : "Permohonan yang ditolak belum tersedia."}
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
