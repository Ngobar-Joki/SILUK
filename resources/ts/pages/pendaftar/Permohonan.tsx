import React, { useEffect, useState } from "react";
import axios from "axios";

declare global {
    interface Window {
        toast?: {
            success: (msg: string) => void;
            error: (msg: string) => void;
        };
    }
}

interface Permohonan {
    id?: number;
    susunan_penggurus: string;
    surat_nonpengurus: string;
    surat_kuasa: string;
    bukti_modal: string;
    ktp: string;
    user_id: number;
    created_at?: string;
    status?: string;
}

const initialForm: Omit<Permohonan, "id" | "user"> = {
    susunan_penggurus: "",
    surat_nonpengurus: "",
    surat_kuasa: "",
    bukti_modal: "",
    ktp: "",
    user_id: 0,
    status: "pending", // default status
};

const Permohonan: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [permohonans, setPermohonans] = useState<Permohonan[]>([]);
    const [formData, setFormData] =
        useState<Omit<Permohonan, "id" | "user">>(initialForm);
    const [fileInputs, setFileInputs] = useState<
        Partial<Record<keyof typeof initialForm, File | null>>
    >({});
    const [alert, setAlert] = useState<{
        text: string;
        type: "success" | "error" | "";
    }>({ text: "", type: "" });
    const [errors, setErrors] = useState<
        Partial<Record<keyof typeof initialForm, string>>
    >({});
    const [editingId, setEditingId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const showToast = (type: "success" | "error", message: string) => {
        setAlert({ text: message, type });
        if (window.toast) window.toast[type](message);
        setTimeout(() => setAlert({ text: "", type: "" }), 3000);
    };

    // Fetch permohonan list
    useEffect(() => {
        fetchPermohonans();
    }, []);

    const fetchPermohonans = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/permohonan/fetched");
            if (res.data && Array.isArray(res.data.permohonans)) {
                setPermohonans(res.data.permohonans);
            } else {
                showToast(
                    "error",
                    res.data?.message || "Gagal mengambil data permohonan"
                );
            }
        } catch (e: any) {
            showToast(
                "error",
                e?.response?.data?.message
                    ? `Gagal mengambil data permohonan: ${e.response.data.message}`
                    : "Gagal mengambil data permohonan"
            );
        } finally {
            setLoading(false);
        }
    };

    // Fetch user_id for form (assume from /profile-pendaftar/fetched)
    useEffect(() => {
        axios.get("/profile-pendaftar/fetched").then((res) => {
            if (res.data?.user?.id) {
                setFormData((prev) => ({ ...prev, user_id: res.data.user.id }));
            }
        });
    }, []);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type, files } = e.target as HTMLInputElement;
        if (type === "file" && files && files.length > 0) {
            setFileInputs((prev) => ({ ...prev, [name]: files[0] }));
            setFormData((prev) => ({ ...prev, [name]: files[0].name }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        try {
            const url = editingId ? `/permohonan/${editingId}` : "/permohonan";
            const method = editingId ? "put" : "post";
            const form = new FormData();
            form.append("user_id", String(formData.user_id));
            form.append("status", "pending"); // always send as pending
            [
                "susunan_penggurus",
                "surat_nonpengurus",
                "surat_kuasa",
                "bukti_modal",
                "ktp",
            ].forEach((field) => {
                if (fileInputs[field as keyof typeof initialForm]) {
                    form.append(
                        field,
                        fileInputs[field as keyof typeof initialForm]!
                    );
                } else if (!editingId) {
                    form.append(field, "");
                }
            });

            // For update, if file not changed, don't send it (handled by backend)
            const res = await axios({
                url,
                method,
                data: form,
                headers: {
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
                    "Content-Type": "multipart/form-data",
                },
            });
            if (res.data.success) {
                showToast(
                    "success",
                    editingId
                        ? "Permohonan berhasil diperbarui"
                        : "Permohonan berhasil ditambahkan"
                );
                handleReset(); // reset form & file input
                fetchPermohonans(); // refresh table
                setTimeout(() => {
                    window.location.reload();
                }, 1000); // beri jeda agar alert sempat tampil
            } else {
                showToast("error", res.data.message || "Gagal menyimpan data");
            }
        } catch (err: any) {
            if (err.response?.status === 422 && err.response.data.errors) {
                setErrors(err.response.data.errors);
                showToast("error", "Validasi gagal");
            } else {
                showToast("error", "Terjadi kesalahan saat menyimpan data");
            }
        } finally {
            setLoading(false);
        }
    };

    // const handleEdit = (permohonan: Permohonan) => {
    //     setFormData({
    //         susunan_penggurus: permohonan.susunan_penggurus,
    //         surat_nonpengurus: permohonan.surat_nonpengurus,
    //         surat_kuasa: permohonan.surat_kuasa,
    //         bukti_modal: permohonan.bukti_modal,
    //         ktp: permohonan.ktp,
    //         user_id: permohonan.user_id,
    //     });
    //     setFileInputs({});
    //     setEditingId(permohonan.id!);
    //     setErrors({});
    // };

    const handleReset = () => {
        setFormData({ ...initialForm, user_id: formData.user_id });
        setFileInputs({});
        setEditingId(null);
        setErrors({});
    };

    // Pagination logic
    const totalPages = Math.max(
        1,
        Math.ceil(permohonans.length / itemsPerPage)
    );
    const paginatedPermohonans = permohonans.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    return (
        <div className="register-container">
            {/* Animated Background with Cooperative Theme */}
            <div className="background-animation">
                <div className="floating-shapes">
                    {/* Community Circles representing members */}
                    <div className="shape community-circle shape-1">
                        <div className="member-dots">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                        </div>
                    </div>

                    {/* Money/Coin Animation */}
                    <div className="shape coin-shape shape-2">
                        <div className="coin-inner">₹</div>
                    </div>

                    {/* Handshake/Partnership Symbol */}
                    <div className="shape partnership-shape shape-3">
                        <svg
                            width="30"
                            height="30"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M11 17a4 4 0 0 1-8 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2z" />
                            <path d="M13 7a4 4 0 0 1 8 0v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z" />
                        </svg>
                    </div>

                    {/* Growth Chart */}
                    <div className="shape growth-chart shape-4">
                        <div className="chart-bars">
                            <div className="bar bar-1"></div>
                            <div className="bar bar-2"></div>
                            <div className="bar bar-3"></div>
                        </div>
                    </div>

                    {/* Additional Cooperative Elements */}
                    <div className="shape savings-box shape-5">
                        <svg
                            width="25"
                            height="25"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <path d="M7 15h0M17 15h0" />
                            <path d="M12 9v6" />
                            <path d="M9 12h6" />
                        </svg>
                    </div>

                    <div className="shape unity-ring shape-6">
                        <div className="ring-segments">
                            <div className="segment"></div>
                            <div className="segment"></div>
                            <div className="segment"></div>
                            <div className="segment"></div>
                        </div>
                    </div>
                </div>

                {/* Money Flow Animation */}
                <div className="money-flow">
                    <div className="money-particle">₹</div>
                    <div className="money-particle">₹</div>
                    <div className="money-particle">₹</div>
                    <div className="money-particle">₹</div>
                </div>

                {/* Network Connections */}
                <div className="network-connections">
                    <div className="connection-line line-1"></div>
                    <div className="connection-line line-2"></div>
                    <div className="connection-line line-3"></div>
                </div>
            </div>

            <div className="register-wrapper">
                <div className="register-card">
                    <div className="register-header">
                        <div className="logo-container">
                            <div className="logo-ring cooperative-ring"></div>
                            <div className="logo-center">
                                <div className="cooperative-symbol">
                                    <div className="layer layer-1"></div>
                                    <div className="layer layer-2"></div>
                                    <div className="layer layer-3"></div>
                                </div>
                            </div>
                        </div>
                        <h1 className="register-title">
                            <span className="title-gradient">
                                Pengajuan Permohonan
                            </span>
                        </h1>
                        <p className="register-subtitle">
                            Sistem Informasi Layanan Usaha Koperasi
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="register-form"
                        encType="multipart/form-data"
                    >
                        <div className="form-row">
                            <div className="form-group">
                                <label
                                    htmlFor="susunan_penggurus"
                                    className="form-label"
                                >
                                    Susunan Pengurus (PDF)
                                </label>
                                <div className="input-wrapper">
                                    <input
                                        type="file"
                                        id="susunan_penggurus"
                                        name="susunan_penggurus"
                                        accept="application/pdf"
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                    <div className="input-focus-line"></div>
                                </div>
                                {formData.susunan_penggurus &&
                                    typeof formData.susunan_penggurus ===
                                        "string" &&
                                    !fileInputs.susunan_penggurus &&
                                    editingId && (
                                        <a
                                            href={`/storage/${formData.susunan_penggurus}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ fontSize: 12 }}
                                        >
                                            Lihat file lama
                                        </a>
                                    )}
                                {errors.susunan_penggurus && (
                                    <span className="error-message-text">
                                        {errors.susunan_penggurus}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <label
                                    htmlFor="surat_nonpengurus"
                                    className="form-label"
                                >
                                    Surat Non Pengurus (PDF)
                                </label>
                                <div className="input-wrapper">
                                    <input
                                        type="file"
                                        id="surat_nonpengurus"
                                        name="surat_nonpengurus"
                                        accept="application/pdf"
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                    <div className="input-focus-line"></div>
                                </div>
                                {formData.surat_nonpengurus &&
                                    typeof formData.surat_nonpengurus ===
                                        "string" &&
                                    !fileInputs.surat_nonpengurus &&
                                    editingId && (
                                        <a
                                            href={`/storage/${formData.surat_nonpengurus}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ fontSize: 12 }}
                                        >
                                            Lihat file lama
                                        </a>
                                    )}
                                {errors.surat_nonpengurus && (
                                    <span className="error-message-text">
                                        {errors.surat_nonpengurus}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label
                                    htmlFor="surat_kuasa"
                                    className="form-label"
                                >
                                    Surat Kuasa (PDF)
                                </label>
                                <div className="input-wrapper">
                                    <input
                                        type="file"
                                        id="surat_kuasa"
                                        name="surat_kuasa"
                                        accept="application/pdf"
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                    <div className="input-focus-line"></div>
                                </div>
                                {formData.surat_kuasa &&
                                    typeof formData.surat_kuasa === "string" &&
                                    !fileInputs.surat_kuasa &&
                                    editingId && (
                                        <a
                                            href={`/storage/${formData.surat_kuasa}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ fontSize: 12 }}
                                        >
                                            Lihat file lama
                                        </a>
                                    )}
                                {errors.surat_kuasa && (
                                    <span className="error-message-text">
                                        {errors.surat_kuasa}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <label
                                    htmlFor="bukti_modal"
                                    className="form-label"
                                >
                                    Bukti Modal (PDF)
                                </label>
                                <div className="input-wrapper">
                                    <input
                                        type="file"
                                        id="bukti_modal"
                                        name="bukti_modal"
                                        accept="application/pdf"
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                    <div className="input-focus-line"></div>
                                </div>
                                {formData.bukti_modal &&
                                    typeof formData.bukti_modal === "string" &&
                                    !fileInputs.bukti_modal &&
                                    editingId && (
                                        <a
                                            href={`/storage/${formData.bukti_modal}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ fontSize: 12 }}
                                        >
                                            Lihat file lama
                                        </a>
                                    )}
                                {errors.bukti_modal && (
                                    <span className="error-message-text">
                                        {errors.bukti_modal}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="ktp" className="form-label">
                                    KTP (PDF)
                                </label>
                                <div className="input-wrapper">
                                    <input
                                        type="file"
                                        id="ktp"
                                        name="ktp"
                                        accept="application/pdf"
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                    <div className="input-focus-line"></div>
                                </div>
                                {formData.ktp &&
                                    typeof formData.ktp === "string" &&
                                    !fileInputs.ktp &&
                                    editingId && (
                                        <a
                                            href={`/storage/${formData.ktp}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ fontSize: 12 }}
                                        >
                                            Lihat file lama
                                        </a>
                                    )}
                                {errors.ktp && (
                                    <span className="error-message-text">
                                        {errors.ktp}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div
                            className="form-actions"
                            style={{ display: "flex", gap: 12, marginTop: 16 }}
                        >
                            <button
                                type="button"
                                onClick={handleReset}
                                className="submit-button"
                                style={{
                                    background: "#e1e5e9",
                                    color: "#2c5aa0",
                                }}
                            >
                                <span
                                    className="button-bg"
                                    style={{ background: "#e1e5e9" }}
                                ></span>
                                <span
                                    className="button-content"
                                    style={{ color: "#2c5aa0" }}
                                >
                                    Reset
                                </span>
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="submit-button"
                            >
                                <span className="button-bg"></span>
                                <span className="button-content">
                                    {loading ? (
                                        <div className="loading-spinner">
                                            <div className="spinner-ring cooperative-spinner"></div>
                                            <span>
                                                {editingId
                                                    ? "Menyimpan..."
                                                    : "Mengirim..."}
                                            </span>
                                        </div>
                                    ) : (
                                        <>
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                <circle cx="8.5" cy="7" r="4" />
                                                <line
                                                    x1="20"
                                                    y1="8"
                                                    x2="20"
                                                    y2="14"
                                                />
                                                <line
                                                    x1="23"
                                                    y1="11"
                                                    x2="17"
                                                    y2="11"
                                                />
                                            </svg>
                                            {editingId
                                                ? "Simpan Perubahan"
                                                : "Ajukan Permohonan"}
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    </form>

                    {/* Alert message */}
                    {alert.text && (
                        <div
                            className={`relative overflow-hidden rounded-2xl p-6 shadow-lg transform transition-all duration-300 mt-4 ${
                                alert.type === "success"
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                    : "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                            }`}
                        >
                            <div className="absolute inset-0 bg-white/10" />
                            <div className="relative flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-full">
                                    {alert.type === "success" ? (
                                        <svg
                                            width="20"
                                            height="20"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                            <polyline points="17 21 17 13 7 13 7 21" />
                                            <polyline points="7 3 7 8 15 8" />
                                        </svg>
                                    ) : (
                                        <svg
                                            width="20"
                                            height="20"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <line
                                                x1="18"
                                                y1="6"
                                                x2="6"
                                                y2="18"
                                            />
                                            <line
                                                x1="6"
                                                y1="6"
                                                x2="18"
                                                y2="18"
                                            />
                                        </svg>
                                    )}
                                </div>
                                <span className="font-medium text-lg">
                                    {alert.text}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Tabel daftar permohonan */}
                    <div style={{ marginTop: 32 }}>
                        <h2
                            style={{
                                fontWeight: 700,
                                fontSize: 18,
                                marginBottom: 12,
                            }}
                        >
                            Daftar Permohonan
                        </h2>
                        <div style={{ overflowX: "auto" }}>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                }}
                            >
                                <thead>
                                    <tr style={{ background: "#f8faff" }}>
                                        <th
                                            style={{
                                                padding: 8,
                                                border: "1px solid #e1e5e9",
                                            }}
                                        >
                                            No
                                        </th>
                                        <th
                                            style={{
                                                padding: 8,
                                                border: "1px solid #e1e5e9",
                                            }}
                                        >
                                            Tanggal
                                        </th>
                                        <th
                                            style={{
                                                padding: 8,
                                                border: "1px solid #e1e5e9",
                                            }}
                                        >
                                            Status
                                        </th>
                                        {/* Hapus kolom Aksi */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedPermohonans.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={3} // ubah dari 4 ke 3
                                                style={{
                                                    textAlign: "center",
                                                    padding: 16,
                                                }}
                                            >
                                                Tidak ada data permohonan.
                                            </td>
                                        </tr>
                                    )}
                                    {paginatedPermohonans.map((p, i) => (
                                        <tr key={p.id}>
                                            <td
                                                style={{
                                                    padding: 8,
                                                    border: "1px solid #e1e5e9",
                                                }}
                                            >
                                                {(currentPage - 1) *
                                                    itemsPerPage +
                                                    i +
                                                    1}
                                            </td>
                                            <td
                                                style={{
                                                    padding: 8,
                                                    border: "1px solid #e1e5e9",
                                                }}
                                            >
                                                {/* Tampilkan tanggal, fallback "-" jika tidak ada */}
                                                {p.created_at
                                                    ? new Date(
                                                          p.created_at
                                                      ).toLocaleDateString(
                                                          "id-ID"
                                                      )
                                                    : "-"}
                                            </td>
                                            <td
                                                style={{
                                                    padding: 8,
                                                    border: "1px solid #e1e5e9",
                                                }}
                                            >
                                                {p.status || "-"}
                                            </td>
                                            {/* Hapus tombol Detail */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination controls */}
                        {totalPages > 1 && (
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    marginTop: 16,
                                    gap: 8,
                                }}
                            >
                                <button
                                    onClick={() =>
                                        handlePageChange(currentPage - 1)
                                    }
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: "6px 12px",
                                        borderRadius: 6,
                                        border: "1px solid #e1e5e9",
                                        background:
                                            currentPage === 1
                                                ? "#f8faff"
                                                : "#fff",
                                        color: "#2c5aa0",
                                        cursor:
                                            currentPage === 1
                                                ? "not-allowed"
                                                : "pointer",
                                    }}
                                >
                                    &laquo;
                                </button>
                                {Array.from(
                                    { length: totalPages },
                                    (_, idx) => (
                                        <button
                                            key={idx + 1}
                                            onClick={() =>
                                                handlePageChange(idx + 1)
                                            }
                                            style={{
                                                padding: "6px 12px",
                                                borderRadius: 6,
                                                border: "1px solid #e1e5e9",
                                                background:
                                                    currentPage === idx + 1
                                                        ? "#2c5aa0"
                                                        : "#fff",
                                                color:
                                                    currentPage === idx + 1
                                                        ? "#fff"
                                                        : "#2c5aa0",
                                                fontWeight:
                                                    currentPage === idx + 1
                                                        ? 700
                                                        : 500,
                                                cursor: "pointer",
                                            }}
                                        >
                                            {idx + 1}
                                        </button>
                                    )
                                )}
                                <button
                                    onClick={() =>
                                        handlePageChange(currentPage + 1)
                                    }
                                    disabled={currentPage === totalPages}
                                    style={{
                                        padding: "6px 12px",
                                        borderRadius: 6,
                                        border: "1px solid #e1e5e9",
                                        background:
                                            currentPage === totalPages
                                                ? "#f8faff"
                                                : "#fff",
                                        color: "#2c5aa0",
                                        cursor:
                                            currentPage === totalPages
                                                ? "not-allowed"
                                                : "pointer",
                                    }}
                                >
                                    &raquo;
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="register-footer">
                        <button
                            type="button"
                            className="login-link"
                            style={{
                                border: "none",
                                background: "none",
                                padding: 0,
                                margin: 0,
                                cursor: "pointer",
                            }}
                            onClick={() => window.history.back()}
                        >
                            &larr; Kembali ke halaman sebelumnya
                        </button>
                    </div>
                </div>
                <div className="footer-text">
                    © {new Date().getFullYear()} SILUK. All rights reserved.
                </div>
            </div>
            {/* ...styles remain unchanged... */}

            <style>{`
                /* ...copy all styles from Register.tsx here... */
                /* Container and Background */
                .register-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    background: linear-gradient(
                        135deg,
                        #2c5aa0 0%,
                        #1e3c72 25%,
                        #4a90e2 50%,
                        #7b68ee 75%,
                        #4facfe 100%
                    );
                    background-size: 400% 400%;
                    animation: cooperativeGradient 20s ease infinite;
                    font-family: "Inter", -apple-system, BlinkMacSystemFont,
                        "Segoe UI", Roboto, sans-serif;
                    padding: 2rem 0;
                }
                @keyframes cooperativeGradient {
                    0% {
                        background-position: 0% 50%;
                    }
                    25% {
                        background-position: 100% 50%;
                    }
                    50% {
                        background-position: 50% 100%;
                    }
                    75% {
                        background-position: 50% 0%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }
                .background-animation {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    overflow: hidden;
                    z-index: 1;
                }
                .floating-shapes {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                }
                .shape {
                    position: absolute;
                    border-radius: 50%;
                    animation: float 15s ease-in-out infinite;
                }
                .shape-1 {
                    width: 80px;
                    height: 80px;
                    top: 15%;
                    left: 8%;
                    animation-delay: 0s;
                }
                .shape-2 {
                    width: 70px;
                    height: 70px;
                    top: 60%;
                    right: 12%;
                    animation-delay: -5s;
                }
                .shape-3 {
                    width: 60px;
                    height: 60px;
                    top: 25%;
                    right: 25%;
                    animation-delay: -10s;
                }
                .shape-4 {
                    width: 90px;
                    height: 90px;
                    bottom: 15%;
                    left: 15%;
                    animation-delay: -7s;
                }
                .shape-5 {
                    width: 65px;
                    height: 65px;
                    top: 70%;
                    left: 60%;
                    animation-delay: -12s;
                }
                .shape-6 {
                    width: 75px;
                    height: 75px;
                    top: 40%;
                    left: 75%;
                    animation-delay: -3s;
                }
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px) rotate(0deg);
                        opacity: 0.7;
                    }
                    25% {
                        transform: translateY(-25px) rotate(90deg);
                        opacity: 0.9;
                    }
                    50% {
                        transform: translateY(-50px) rotate(180deg);
                        opacity: 0.5;
                    }
                    75% {
                        transform: translateY(-25px) rotate(270deg);
                        opacity: 0.8;
                    }
                }
                .community-circle {
                    background: rgba(46, 204, 113, 0.2) !important;
                    border: 2px solid rgba(46, 204, 113, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .member-dots {
                    display: flex;
                    gap: 4px;
                }
                .member-dots .dot {
                    width: 8px;
                    height: 8px;
                    background: rgba(46, 204, 113, 0.8);
                    border-radius: 50%;
                    animation: memberPulse 2s ease-in-out infinite;
                }
                .member-dots .dot:nth-child(2) {
                    animation-delay: 0.3s;
                }
                .member-dots .dot:nth-child(3) {
                    animation-delay: 0.6s;
                }
                @keyframes memberPulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0.6;
                    }
                    50% {
                        transform: scale(1.3);
                        opacity: 1;
                    }
                }
                .coin-shape {
                    background: linear-gradient(45deg, #f39c12, #e67e22) !important;
                    border: 3px solid #d35400;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: coinFlip 4s ease-in-out infinite;
                }
                .coin-inner {
                    color: white;
                    font-size: 24px;
                    font-weight: bold;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
                }
                @keyframes coinFlip {
                    0%, 100% {
                        transform: rotateY(0deg) translateY(0px);
                    }
                    25% {
                        transform: rotateY(90deg) translateY(-10px);
                    }
                    50% {
                        transform: rotateY(180deg) translateY(-20px);
                    }
                    75% {
                        transform: rotateY(270deg) translateY(-10px);
                    }
                }
                .partnership-shape {
                    background: rgba(155, 89, 182, 0.2) !important;
                    border: 2px solid rgba(155, 89, 182, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: rgba(155, 89, 182, 0.8);
                }
                .partnership-shape svg {
                    animation: handshake 3s ease-in-out infinite;
                }
                @keyframes handshake {
                    0%, 100% {
                        transform: scale(1) rotate(0deg);
                    }
                    25% {
                        transform: scale(1.1) rotate(-5deg);
                    }
                    75% {
                        transform: scale(1.1) rotate(5deg);
                    }
                }
                .growth-chart {
                    background: rgba(52, 152, 219, 0.2) !important;
                    border: 2px solid rgba(52, 152, 219, 0.4);
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    padding: 10px;
                }
                .chart-bars {
                    display: flex;
                    gap: 3px;
                    align-items: flex-end;
                }
                .bar {
                    width: 6px;
                    background: rgba(52, 152, 219, 0.8);
                    border-radius: 2px;
                    animation: barGrowth 3s ease-in-out infinite;
                }
                .bar-1 {
                    height: 15px;
                    animation-delay: 0s;
                }
                .bar-2 {
                    height: 25px;
                    animation-delay: 0.5s;
                }
                .bar-3 {
                    height: 35px;
                    animation-delay: 1s;
                }
                @keyframes barGrowth {
                    0%, 100% {
                        transform: scaleY(0.5);
                    }
                    50% {
                        transform: scaleY(1.2);
                    }
                }
                .savings-box {
                    background: rgba(230, 126, 34, 0.2) !important;
                    border: 2px solid rgba(230, 126, 34, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: rgba(230, 126, 34, 0.8);
                }
                .savings-box svg {
                    animation: savingsGlow 2.5s ease-in-out infinite;
                }
                @keyframes savingsGlow {
                    0%, 100% {
                        filter: drop-shadow(0 0 5px rgba(230, 126, 34, 0.3));
                    }
                    50% {
                        filter: drop-shadow(0 0 15px rgba(230, 126, 34, 0.6));
                    }
                }
                .unity-ring {
                    background: transparent !important;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                .ring-segments {
                    position: relative;
                    width: 40px;
                    height: 40px;
                }
                .segment {
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    background: rgba(231, 76, 60, 0.7);
                    border-radius: 50%;
                    animation: unityRotate 4s linear infinite;
                }
                .segment:nth-child(1) {
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                }
                .segment:nth-child(2) {
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    animation-delay: 1s;
                }
                .segment:nth-child(3) {
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    animation-delay: 2s;
                }
                .segment:nth-child(4) {
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    animation-delay: 3s;
                }
                @keyframes unityRotate {
                    0% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    25% {
                        opacity: 0.5;
                        transform: scale(1.2);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(0.8);
                    }
                    75% {
                        opacity: 0.7;
                        transform: scale(1.1);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .money-flow {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                }
                .money-particle {
                    position: absolute;
                    color: rgba(241, 196, 15, 0.7);
                    font-size: 18px;
                    font-weight: bold;
                    animation: moneyFlow 15s linear infinite;
                }
                .money-particle:nth-child(1) {
                    left: 10%;
                    animation-delay: 0s;
                }
                .money-particle:nth-child(2) {
                    left: 30%;
                    animation-delay: 3s;
                }
                .money-particle:nth-child(3) {
                    left: 60%;
                    animation-delay: 7s;
                }
                .money-particle:nth-child(4) {
                    left: 80%;
                    animation-delay: 11s;
                }
                @keyframes moneyFlow {
                    0% {
                        top: -50px;
                        opacity: 0;
                        transform: translateX(0) rotate(0deg);
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        top: 100vh;
                        opacity: 0;
                        transform: translateX(50px) rotate(360deg);
                    }
                }
                .network-connections {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                }
                .connection-line {
                    position: absolute;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(52, 152, 219, 0.4), transparent);
                    animation: connectionPulse 4s ease-in-out infinite;
                }
                .line-1 {
                    top: 25%;
                    left: 20%;
                    width: 60%;
                    transform: rotate(15deg);
                }
                .line-2 {
                    top: 60%;
                    left: 10%;
                    width: 80%;
                    transform: rotate(-10deg);
                    animation-delay: 1.5s;
                }
                .line-3 {
                    top: 80%;
                    left: 30%;
                    width: 40%;
                    transform: rotate(25deg);
                    animation-delay: 3s;
                }
                @keyframes connectionPulse {
                    0%, 100% {
                        opacity: 0.2;
                    }
                    50% {
                        opacity: 0.8;
                    }
                }
                .logo-container {
                    position: relative;
                    width: 64px;
                    height: 64px;
                    margin: 0 auto 20px;
                }
                .logo-ring {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    border: 3px solid #2c5aa0;
                }
                .cooperative-ring {
                    border: 3px solid #2c5aa0;
                    border-top-color: #4a90e2;
                    border-right-color: #2ecc71;
                    animation: cooperativeLogoSpin 4s linear infinite;
                }
                @keyframes cooperativeLogoSpin {
                    0% {
                        transform: rotate(0deg);
                        border-top-color: #4a90e2;
                    }
                    25% {
                        transform: rotate(90deg);
                        border-top-color: #2ecc71;
                    }
                    50% {
                        transform: rotate(180deg);
                        border-top-color: #f39c12;
                    }
                    75% {
                        transform: rotate(270deg);
                        border-top-color: #e74c3c;
                    }
                    100% {
                        transform: rotate(360deg);
                        border-top-color: #4a90e2;
                    }
                }
                .logo-center {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #2c5aa0, #4a90e2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    animation: logoPulse 2s ease-in-out infinite;
                }
                @keyframes logoPulse {
                    0%, 100% {
                        transform: translate(-50%, -50%) scale(1);
                    }
                    50% {
                        transform: translate(-50%, -50%) scale(1.1);
                    }
                }
                .cooperative-symbol {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }
                .layer {
                    position: absolute;
                    border-radius: 3px;
                    animation: layerFloat 3s ease-in-out infinite;
                }
                .layer-1 {
                    top: 20%;
                    left: 20%;
                    width: 60%;
                    height: 60%;
                    background: rgba(46, 204, 113, 0.8);
                    animation-delay: 0s;
                }
                .layer-2 {
                    top: 30%;
                    left: 30%;
                    width: 40%;
                    height: 40%;
                    background: rgba(52, 152, 219, 0.8);
                    animation-delay: 1s;
                }
                .layer-3 {
                    top: 40%;
                    left: 40%;
                    width: 20%;
                    height: 20%;
                    background: rgba(241, 196, 15, 0.8);
                    animation-delay: 2s;
                }
                @keyframes layerFloat {
                    0%, 100% {
                        transform: scale(1) rotate(0deg);
                    }
                    33% {
                        transform: scale(1.1) rotate(120deg);
                    }
                    66% {
                        transform: scale(0.9) rotate(240deg);
                    }
                }
                .register-wrapper {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    max-width: 900px;
                    padding: 20px;
                }
                .register-card {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    padding: 36px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    animation: slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }
                .register-card::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(46, 204, 113, 0.1),
                        rgba(52, 152, 219, 0.1),
                        rgba(241, 196, 15, 0.1),
                        transparent
                    );
                    animation: cooperativeShimmer 4s ease-in-out infinite;
                }
                @keyframes cooperativeShimmer {
                    0% {
                        left: -100%;
                    }
                    100% {
                        left: 100%;
                    }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(50px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .register-header {
                    text-align: center;
                    margin-bottom: 32px;
                }
                .register-title {
                    font-size: 30px;
                    font-weight: 800;
                    margin: 0 0 10px 0;
                    animation: titleFade 1s ease-out 0.3s both;
                }
                .title-gradient {
                    background: linear-gradient(135deg, #2c5aa0, #4a90e2);
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: cooperativeTitleShift 4s ease-in-out infinite;
                }
                @keyframes cooperativeTitleShift {
                    0%, 100% {
                        filter: hue-rotate(0deg);
                    }
                    25% {
                        filter: hue-rotate(30deg);
                    }
                    50% {
                        filter: hue-rotate(60deg);
                    }
                    75% {
                        filter: hue-rotate(90deg);
                    }
                }
                .register-subtitle {
                    color: #666;
                    font-size: 13px;
                    margin: 0;
                    animation: titleFade 1s ease-out 0.5s both;
                }
                @keyframes titleFade {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .register-form {
                    animation: formFade 1s ease-out 0.7s both;
                }
                @keyframes formFade {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 20px;
                }
                .form-group {
                    margin-bottom: 20px;
                }
                .form-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .form-label svg {
                    opacity: 0.7;
                }
                .input-wrapper {
                    position: relative;
                }
                .textarea-wrapper {
                    height: auto;
                }
                .form-input {
                    width: 100%;
                    padding: 16px 20px;
                    border: 2px solid #e1e5e9;
                    border-radius: 14px;
                    font-size: 15px;
                    background: #fff;
                    color: #333;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    font-weight: 500;
                    box-sizing: border-box;
                }
                .form-input:focus {
                    outline: none;
                    border-color: #2c5aa0;
                    background: #f8faff;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(44, 90, 160, 0.15);
                }
                .form-input::placeholder {
                    color: #999;
                    font-style: italic;
                    font-size: 14px;
                }
                .input-focus-line {
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    width: 0;
                    height: 3px;
                    background: linear-gradient(90deg, #2c5aa0, #4a90e2);
                    border-radius: 2px;
                    transition: all 0.3s ease;
                    transform: translateX(-50%);
                }
                .form-input:focus ~ .input-focus-line {
                    width: 100%;
                }
                .error-message-text {
                    color: #e74c3c;
                    font-size: 12px;
                    margin-top: 8px;
                    display: block;
                }
                .submit-button {
                    width: 100%;
                    height: 50px;
                    border: none;
                    border-radius: 14px;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    margin-top: 10px;
                }
                .button-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, #2c5aa0, #4a90e2);
                    transition: all 0.3s ease;
                }
                .submit-button:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow: 0 12px 30px rgba(44, 90, 160, 0.4);
                }
                .submit-button:hover:not(:disabled) .button-bg {
                    background: linear-gradient(135deg, #1e3c72, #3d7bd8);
                }
                .submit-button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .button-content {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    height: 100%;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .loading-spinner {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .spinner-ring {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top: 2px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                .cooperative-spinner {
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top: 2px solid #2ecc71;
                    border-right: 2px solid #f39c12;
                    animation: cooperativeSpin 1.5s linear infinite;
                }
                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
                @keyframes cooperativeSpin {
                    0% {
                        transform: rotate(0deg);
                        border-top-color: #2ecc71;
                    }
                    33% {
                        transform: rotate(120deg);
                        border-top-color: #3498db;
                    }
                    66% {
                        transform: rotate(240deg);
                        border-top-color: #f39c12;
                    }
                    100% {
                        transform: rotate(360deg);
                        border-top-color: #2ecc71;
                    }
                }
                .register-footer {
                    text-align: center;
                    margin-top: 25px;
                    padding-top: 20px;
                    border-top: 1px solid #e1e5e9;
                }
                .register-footer p {
                    color: #666;
                    font-size: 14px;
                    margin: 8px 0;
                }
                .login-link {
                    color: #2c5aa0;
                    text-decoration: none;
                    font-weight: 600;
                    padding: 0.25rem 0.5rem;
                    border-radius: 6px;
                    transition: all 0.3s ease;
                }
                .login-link:hover {
                    background-color: rgba(44, 90, 160, 0.1);
                    text-decoration: underline;
                }
                .footer-text {
                    text-align: center;
                    margin-top: 20px;
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 12px;
                    animation: footerFade 1s ease-out 1s both;
                }
                @keyframes footerFade {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                @media (max-width: 768px) {
                    .register-wrapper {
                        max-width: 600px;
                    }
                    .form-row {
                        grid-template-columns: 1fr;
                        gap: 15px;
                    }
                }
                @media (max-width: 480px) {
                    .register-wrapper {
                        padding: 16px;
                        max-width: 340px;
                    }
                    .register-card {
                        padding: 28px 24px;
                    }
                    .register-title {
                        font-size: 26px;
                    }
                    .logo-container {
                        width: 56px;
                        height: 56px;
                    }
                    .logo-center {
                        width: 36px;
                        height: 36px;
                    }
                    .form-input {
                        padding: 14px 18px;
                        font-size: 14px;
                    }
                    .form-group {
                        margin-bottom: 15px;
                    }
                    .submit-button {
                        height: 46px;
                    }
                    .shape {
                        width: 50px !important;
                        height: 50px !important;
                    }
                    .money-particle {
                        font-size: 14px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Permohonan;
