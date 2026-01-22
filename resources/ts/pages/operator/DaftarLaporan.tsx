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

interface Laporan {
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
    data_laporan?: string;
    periode?: string;
    // Field verifikasi
    verified_by_operator_id?: number;
    operator_verified_at?: string;
    verified_by_kepala_id?: number;
    kepala_verified_at?: string;
    verified_by_operator?: {
        id: number;
        name: string;
    };
    verified_by_kepala?: {
        id: number;
        name: string;
    };
}

const DaftarLaporan: React.FC = () => {
    const [laporans, setLaporans] = useState<Laporan[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    // State untuk active tab
    const [activeTab, setActiveTab] = useState<
        "pending" | "verified_by_operator" | "accepted" | "rejected"
    >("pending");
    // State untuk modal verifikasi
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showCatatanModal, setShowCatatanModal] = useState(false);
    const [catatan, setCatatan] = useState("");
    // State untuk file viewer modal
    const [showFileModal, setShowFileModal] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string>("");
    const [fileLoading, setFileLoading] = useState<boolean>(false);
    // Simpan laporan yang sedang diverifikasi untuk aksi
    const [selectedLaporan, setSelectedLaporan] = useState<Laporan | null>(
        null
    );
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
    // State untuk user role
    const [userRole, setUserRole] = useState<string>("");

    const fetchUserData = async () => {
        try {
            const response = await axios.get("/api/user");
            if (response.data && response.data.user) {
                setUserRole(response.data.user.role);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    const fetchedLaporans = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/daftar-laporan/fetched", {
                params: { search, page: currentPage, pageSize },
            });
            if (response.data.success) {
                // Asumsikan backend mengembalikan data: { data: [...], last_page: n }
                setLaporans(response.data.data.data || response.data.data); // fallback jika tidak ada .data
                setTotalPages(response.data.data.last_page || 1);
                setError("");
            } else {
                setError("Tidak dapat mengambil data laporan");
            }
        } catch (error) {
            setError("Terjadi kesalahan saat mengambil data laporan");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
        fetchedLaporans();
    }, []);

    // Trigger fetch saat search/pagination berubah
    useEffect(() => {
        fetchedLaporans();
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

    // Fungsi untuk memfilter laporan berdasarkan status
    const getFilteredLaporans = () => {
        switch (activeTab) {
            case "pending":
                return laporans.filter(
                    (l) => !l.status || l.status === "pending"
                );
            case "verified_by_operator":
                return laporans.filter(
                    (l) => l.status === "verified_by_operator"
                );
            case "accepted":
                return laporans.filter((l) => l.status === "accepted");
            case "rejected":
                return laporans.filter((l) => l.status === "rejected");
            default:
                return laporans;
        }
    };

    // Fungsi untuk menghitung jumlah laporan per status
    const getStatusCounts = () => {
        const pending = laporans.filter(
            (l) => !l.status || l.status === "pending"
        ).length;
        const verifiedByOperator = laporans.filter(
            (l) => l.status === "verified_by_operator"
        ).length;
        const accepted = laporans.filter((l) => l.status === "accepted").length;
        const rejected = laporans.filter((l) => l.status === "rejected").length;

        return { pending, verifiedByOperator, accepted, rejected };
    };

    const statusCounts = getStatusCounts();
    const filteredLaporans = getFilteredLaporans();

    // Fungsi untuk handle perubahan tab dengan smooth transition
    const handleTabChange = (
        tab: "pending" | "verified_by_operator" | "accepted" | "rejected"
    ) => {
        setActiveTab(tab);
        // Smooth scroll ke atas ketika tab berubah
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Fungsi untuk membuka modal verifikasi
    const handleVerifikasi = (laporan: Laporan) => {
        setShowModal(true);
        setSelectedLaporan(laporan);
    };

    // Fungsi untuk menutup modal
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedLaporan(null);
        setCatatan("");
    };

    // Handler untuk tombol Disetujui
    const handleSetujui = async () => {
        if (!selectedLaporan) {
            setNotification({
                type: "error",
                message: "Tidak ada laporan yang dipilih!",
            });
            return;
        }

        try {
            setIsProcessing(true);
            const response = await axios.post(
                `/daftar-laporan/verifikasi/${selectedLaporan.id}`
            );

            if (response.data.success) {
                // Update list laporan
                await fetchedLaporans();

                // Tutup modal dan reset state
                setShowModal(false);
                setSelectedLaporan(null);
                setCatatan("");

                setNotification({
                    type: "success",
                    message:
                        "Laporan berhasil diverifikasi dan notifikasi WhatsApp telah dikirim!",
                });
            } else {
                setNotification({
                    type: "error",
                    message:
                        "Gagal memverifikasi laporan: " + response.data.message,
                });
            }
        } catch (error: any) {
            console.error("Error approving laporan:", error);

            // Log detail error untuk debugging
            if (error.response) {
                console.error("Response status:", error.response.status);
                console.error("Response data:", error.response.data);
                setNotification({
                    type: "error",
                    message: `Error ${error.response.status}: ${
                        error.response.data.message ||
                        "Terjadi kesalahan saat memverifikasi laporan"
                    }`,
                });
            } else {
                setNotification({
                    type: "error",
                    message: "Terjadi kesalahan saat memverifikasi laporan",
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
        if (!selectedLaporan) {
            setNotification({
                type: "error",
                message: "Tidak ada laporan yang dipilih!",
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
                `/daftar-laporan/tolak/${selectedLaporan.id}`,
                {
                    catatan: catatan,
                }
            );

            if (response.data.success) {
                // Update list laporan
                await fetchedLaporans();

                // Tutup modal dan reset state
                setShowCatatanModal(false);
                setShowModal(false);
                setSelectedLaporan(null);
                setCatatan("");

                setNotification({
                    type: "success",
                    message:
                        "Laporan berhasil ditolak dan notifikasi WhatsApp telah dikirim!",
                });
            } else {
                setNotification({
                    type: "error",
                    message: "Gagal menolak laporan: " + response.data.message,
                });
            }
        } catch (error: any) {
            console.error("Error rejecting laporan:", error);

            // Log detail error untuk debugging
            if (error.response) {
                console.error("Response status:", error.response.status);
                console.error("Response data:", error.response.data);
                setNotification({
                    type: "error",
                    message: `Error ${error.response.status}: ${
                        error.response.data.message ||
                        "Terjadi kesalahan saat menolak laporan"
                    }`,
                });
            } else {
                setNotification({
                    type: "error",
                    message: "Terjadi kesalahan saat menolak laporan",
                });
            }
        } finally {
            setIsProcessing(false);
        }
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
    const handleViewFile = async (laporan: Laporan) => {
        if (!laporan.data_laporan) {
            setNotification({
                type: "error",
                message: "File laporan tidak tersedia",
            });
            return;
        }

        try {
            setFileLoading(true);
            const filePath = `/storage/${laporan.data_laporan}`;

            setSelectedFile(filePath);
            setFileType(getFileType(laporan.data_laporan));
            setShowFileModal(true);
        } catch (error) {
            setNotification({
                type: "error",
                message: "Gagal memuat file laporan",
            });
        } finally {
            setFileLoading(false);
        }
    };

    // Function to handle file download
    const handleDownloadFile = (laporan: Laporan) => {
        if (!laporan.data_laporan) {
            setNotification({
                type: "error",
                message: "File laporan tidak tersedia",
            });
            return;
        }

        const filePath = `/storage/${laporan.data_laporan}`;
        const fileName = laporan.data_laporan.split("/").pop() || "laporan";

        const link = document.createElement("a");
        link.href = filePath;
        link.download = fileName;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Function to close file modal
    const handleCloseFileModal = () => {
        setShowFileModal(false);
        setSelectedFile(null);
        setFileType("");
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
        <Layout title="Daftar Laporan">
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
                            Verifikasi Laporan
                        </h2>

                        {selectedLaporan && (
                            <div className="mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">
                                        Detail Laporan
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <p>
                                            <strong>Nama:</strong>{" "}
                                            {selectedLaporan.user?.name}
                                        </p>
                                        <p>
                                            <strong>Email:</strong>{" "}
                                            {selectedLaporan.user?.email}
                                        </p>
                                        <p>
                                            <strong>Username:</strong>{" "}
                                            {selectedLaporan.user?.username}
                                        </p>
                                        <p>
                                            <strong>No. HP:</strong>{" "}
                                            {selectedLaporan.user?.no_hp}
                                        </p>
                                        <p>
                                            <strong>Alamat:</strong>{" "}
                                            {selectedLaporan.user?.alamat}
                                        </p>
                                        <p>
                                            <strong>Tanggal:</strong>{" "}
                                            {formatDate(
                                                selectedLaporan.created_at
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Tombol Disetujui dan Ditolak - hanya muncul untuk status pending (operator) atau verified_by_operator (kepala) */}
                                {((!selectedLaporan?.status ||
                                    selectedLaporan?.status === "pending") &&
                                    userRole === "operator") ||
                                (selectedLaporan?.status ===
                                    "verified_by_operator" &&
                                    userRole === "kepala") ? (
                                    <div className="flex gap-4 justify-end">
                                        <button
                                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={handleSetujui}
                                            disabled={isProcessing}
                                        >
                                            {isProcessing
                                                ? "Memproses..."
                                                : selectedLaporan?.status ===
                                                  "verified_by_operator"
                                                ? "Setujui (Kepala)"
                                                : "Verifikasi (Operator)"}
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={handleTolak}
                                            disabled={isProcessing}
                                        >
                                            Ditolak
                                        </button>
                                    </div>
                                ) : null}

                                {/* Tampilkan status jika sudah diverifikasi */}
                                {selectedLaporan?.status ===
                                    "verified_by_operator" && (
                                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-blue-700 font-medium">
                                            🔍 Laporan telah diverifikasi
                                            operator
                                        </p>
                                        <p className="text-blue-600 text-sm mt-1">
                                            Diverifikasi oleh:{" "}
                                            {selectedLaporan
                                                .verified_by_operator?.name ||
                                                "Operator"}
                                        </p>
                                        <p className="text-blue-600 text-sm mt-1">
                                            Pada:{" "}
                                            {selectedLaporan.operator_verified_at
                                                ? formatDate(
                                                      selectedLaporan.operator_verified_at
                                                  )
                                                : "-"}
                                        </p>
                                        <p className="text-blue-800 text-sm mt-2 font-medium">
                                            ⏳ Menunggu verifikasi kepala
                                        </p>
                                    </div>
                                )}

                                {selectedLaporan?.status === "accepted" && (
                                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-700 font-medium">
                                            ✅ Laporan telah diverifikasi
                                        </p>
                                        {selectedLaporan.verified_by_operator && (
                                            <p className="text-green-600 text-sm mt-1">
                                                Diverifikasi operator oleh:{" "}
                                                {
                                                    selectedLaporan
                                                        .verified_by_operator
                                                        .name
                                                }{" "}
                                                pada{" "}
                                                {selectedLaporan.operator_verified_at
                                                    ? formatDate(
                                                          selectedLaporan.operator_verified_at
                                                      )
                                                    : "-"}
                                            </p>
                                        )}
                                        {selectedLaporan.verified_by_kepala && (
                                            <p className="text-green-600 text-sm mt-1">
                                                Disetujui kepala oleh:{" "}
                                                {
                                                    selectedLaporan
                                                        .verified_by_kepala.name
                                                }{" "}
                                                pada{" "}
                                                {selectedLaporan.kepala_verified_at
                                                    ? formatDate(
                                                          selectedLaporan.kepala_verified_at
                                                      )
                                                    : "-"}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {selectedLaporan?.status === "rejected" && (
                                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-700 font-medium">
                                            ❌ Laporan ditolak
                                        </p>
                                        <p className="text-red-600 text-sm mt-1">
                                            Ditolak pada:{" "}
                                            {formatDate(
                                                selectedLaporan.updated_at
                                            )}
                                        </p>
                                        {selectedLaporan.catatan && (
                                            <p className="text-red-600 text-sm mt-2">
                                                <strong>Catatan:</strong>{" "}
                                                {selectedLaporan.catatan}
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
                                Lihat File Laporan
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
                                                "laporan";
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
                                                alt="Laporan"
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
                                                            .pop() || "laporan";
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
                                    Daftar Laporan
                                </h1>
                                <p className="text-blue-100 text-lg">
                                    Lihat seluruh laporan yang masuk
                                </p>
                                <div className="flex items-center gap-4 mt-3 text-sm">
                                    <span className="bg-white/20 px-3 py-1 rounded-full">
                                        Total: {laporans.length}
                                    </span>
                                    <span className="bg-white/20 px-3 py-1 rounded-full">
                                        Ditampilkan: {filteredLaporans.length}
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
                                onClick={() =>
                                    handleTabChange("verified_by_operator")
                                }
                                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                                    activeTab === "verified_by_operator"
                                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Verif Operator</span>
                                    <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                                        {statusCounts.verifiedByOperator}
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
                                    <span>Diverifikasi</span>
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
                            {filteredLaporans.length > 0 ? (
                                <>
                                    {filteredLaporans.map((laporan, index) => (
                                        <div
                                            key={laporan.id}
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
                                                        laporan.status ===
                                                        "accepted"
                                                            ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                                            : laporan.status ===
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
                                                            {laporan.user?.name}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            |
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            {
                                                                laporan.user
                                                                    ?.email
                                                            }
                                                        </span>
                                                        {/* Status Badge */}
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                laporan.status ===
                                                                "accepted"
                                                                    ? "bg-green-100 text-green-700 border border-green-200"
                                                                    : laporan.status ===
                                                                      "rejected"
                                                                    ? "bg-red-100 text-red-700 border border-red-200"
                                                                    : laporan.status ===
                                                                      "verified_by_operator"
                                                                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                                                                    : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                                            }`}
                                                        >
                                                            {laporan.status ===
                                                            "accepted"
                                                                ? "✅ Diverifikasi Kepala"
                                                                : laporan.status ===
                                                                  "rejected"
                                                                ? "❌ Ditolak"
                                                                : laporan.status ===
                                                                  "verified_by_operator"
                                                                ? "🔍 Verif Operator"
                                                                : "⏳ Pending"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                                        <span>
                                                            @
                                                            {
                                                                laporan.user
                                                                    ?.username
                                                            }
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            |
                                                        </span>
                                                        <span>
                                                            {
                                                                laporan.user
                                                                    ?.no_hp
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 space-y-1">
                                                        <div className="text-gray-500 text-sm">
                                                            <span className="font-medium">
                                                                Tanggal Laporan:
                                                            </span>{" "}
                                                            {formatDate(
                                                                laporan.created_at
                                                            )}
                                                        </div>
                                                        <div className="text-gray-500 text-sm">
                                                            <span className="font-medium">
                                                                Alamat:
                                                            </span>{" "}
                                                            {
                                                                laporan.user
                                                                    ?.alamat
                                                            }
                                                        </div>
                                                    </div>

                                                    {/* File Information */}
                                                    {laporan.data_laporan && (
                                                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <FileText className="w-4 h-4 text-blue-600" />
                                                                <span className="text-blue-700 text-sm font-medium">
                                                                    File Laporan
                                                                    Tersedia
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() =>
                                                                        handleViewFile(
                                                                            laporan
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                                                                    disabled={
                                                                        fileLoading
                                                                    }
                                                                >
                                                                    <Eye className="w-3 h-3" />
                                                                    {fileLoading
                                                                        ? "Memuat..."
                                                                        : "Lihat File"}
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleDownloadFile(
                                                                            laporan
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                                                                >
                                                                    <Download className="w-3 h-3" />
                                                                    Download
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Tambahkan informasi khusus berdasarkan status */}
                                                    {laporan.status ===
                                                        "accepted" && (
                                                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                            <p className="text-green-700 text-sm font-medium">
                                                                ✅ Laporan telah
                                                                diverifikasi
                                                            </p>
                                                            <p className="text-green-600 text-xs mt-1">
                                                                Diverifikasi
                                                                pada:{" "}
                                                                {formatDate(
                                                                    laporan.updated_at
                                                                )}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {laporan.status ===
                                                        "rejected" &&
                                                        laporan.catatan && (
                                                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                                <p className="text-red-700 text-sm font-medium">
                                                                    ❌ Laporan
                                                                    ditolak
                                                                </p>
                                                                <p className="text-red-600 text-xs mt-1">
                                                                    Ditolak
                                                                    pada:{" "}
                                                                    {formatDate(
                                                                        laporan.updated_at
                                                                    )}
                                                                </p>
                                                                <p className="text-red-600 text-sm mt-2">
                                                                    <strong>
                                                                        Catatan:
                                                                    </strong>{" "}
                                                                    {
                                                                        laporan.catatan
                                                                    }
                                                                </p>
                                                            </div>
                                                        )}
                                                </div>

                                                {/* Tombol aksi berdasarkan status */}
                                                <div className="flex-shrink-0 mt-4 md:mt-0">
                                                    {(!laporan.status ||
                                                        laporan.status ===
                                                            "pending") && (
                                                        <button
                                                            className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                                                            onClick={() =>
                                                                handleVerifikasi(
                                                                    laporan
                                                                )
                                                            }
                                                        >
                                                            <Clock className="w-4 h-4" />
                                                            Verifikasi
                                                        </button>
                                                    )}

                                                    {/* Untuk status verified_by_operator, tampilkan tombol verifikasi kepala hanya untuk role kepala */}
                                                    {laporan.status ===
                                                        "verified_by_operator" &&
                                                        userRole ===
                                                            "kepala" && (
                                                            <button
                                                                className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                                                                onClick={() =>
                                                                    handleVerifikasi(
                                                                        laporan
                                                                    )
                                                                }
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                                Verifikasi
                                                                Kepala
                                                            </button>
                                                        )}

                                                    {/* Untuk status verified_by_operator dan role operator, tampilkan tombol lihat detail */}
                                                    {laporan.status ===
                                                        "verified_by_operator" &&
                                                        userRole ===
                                                            "operator" && (
                                                            <button
                                                                className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                                                                onClick={() =>
                                                                    handleVerifikasi(
                                                                        laporan
                                                                    )
                                                                }
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                                Lihat Detail
                                                            </button>
                                                        )}

                                                    {/* Untuk status accepted, tampilkan tombol lihat detail */}
                                                    {laporan.status ===
                                                        "accepted" && (
                                                        <button
                                                            className="w-full md:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                                                            onClick={() =>
                                                                handleVerifikasi(
                                                                    laporan
                                                                )
                                                            }
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            Lihat Detail
                                                        </button>
                                                    )}

                                                    {/* Untuk status rejected, tampilkan tombol lihat detail */}
                                                    {laporan.status ===
                                                        "rejected" && (
                                                        <button
                                                            className="w-full md:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                                                            onClick={() =>
                                                                handleVerifikasi(
                                                                    laporan
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
                                    ))}
                                    {renderPagination()}
                                </>
                            ) : (
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-12 text-center">
                                    <div className="mx-auto w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-6">
                                        <Users className="w-12 h-12 text-gray-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                        {activeTab === "pending"
                                            ? "Belum ada laporan pending"
                                            : activeTab ===
                                              "verified_by_operator"
                                            ? "Belum ada laporan yang diverifikasi operator"
                                            : activeTab === "accepted"
                                            ? "Belum ada laporan yang diverifikasi"
                                            : "Belum ada laporan yang ditolak"}
                                    </h3>
                                    <p className="text-gray-600 text-lg">
                                        {activeTab === "pending"
                                            ? "Laporan pending belum tersedia."
                                            : activeTab ===
                                              "verified_by_operator"
                                            ? "Laporan yang telah diverifikasi operator belum tersedia."
                                            : activeTab === "accepted"
                                            ? "Laporan yang diverifikasi belum tersedia."
                                            : "Laporan yang ditolak belum tersedia."}
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

export default DaftarLaporan;
