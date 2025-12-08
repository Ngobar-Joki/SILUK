import React, { useState } from "react";
import useOrganizationalStructure from "../hooks/useOrganizationalStructure";

const OrganizationalStructure: React.FC = () => {
    const { data, loading, error, refetch } = useOrganizationalStructure();
    const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

    const handleImageError = (itemId: number) => {
        setFailedImages(prev => new Set(prev).add(itemId));
    };

    if (loading) {
        return (
            <div
                style={{
                    padding: "2rem 0",
                    textAlign: "center",
                    color: "#64748b",
                }}
            >
                <div
                    style={{
                        width: "40px",
                        height: "40px",
                        border: "4px solid #f3f3f3",
                        borderTop: "4px solid #3b82f6",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        margin: "0 auto 1rem",
                    }}
                ></div>
                <p>Memuat struktur organisasi...</p>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div
                style={{
                    padding: "2rem 0",
                    textAlign: "center",
                    color: "#ef4444",
                }}
            >
                <p>Gagal memuat struktur organisasi: {error}</p>
                <button
                    onClick={refetch}
                    style={{
                        backgroundColor: "#3b82f6",
                        color: "white",
                        border: "none",
                        padding: "0.5rem 1rem",
                        borderRadius: "4px",
                        cursor: "pointer",
                        marginTop: "1rem",
                    }}
                    onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor = "#2563eb")
                    }
                    onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor = "#3b82f6")
                    }
                >
                    Coba Lagi
                </button>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div
                style={{
                    padding: "2rem 0",
                    textAlign: "center",
                    color: "#64748b",
                }}
            >
                <p>Struktur organisasi belum tersedia.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: "2rem 0" }}>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(700px, 1fr))",
                    gap: "2rem",
                    justifyItems: "center",
                }}
            >
                {data.map((item, index) => (
                    <div
                        key={item.id}
                        style={{
                            backgroundColor: "white",
                            borderRadius: "12px",
                            padding: "1.5rem",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            textAlign: "center",
                            transition:
                                "transform 0.3s ease, box-shadow 0.3s ease",
                            cursor: "pointer",
                            width: "100%",
                            maxWidth: "700px",
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform =
                                "translateY(-5px)";
                            e.currentTarget.style.boxShadow =
                                "0 10px 25px -5px rgba(0, 0, 0, 0.15)";
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                                "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                        }}
                    >
                        <div
                            style={{
                                width: "600px",
                                height: "500px",
                                borderRadius: "8px",
                                overflow: "hidden",
                                margin: "0 auto",
                                border: "3px solid #e5e7eb",
                            }}
                        >
                            {failedImages.has(item.id) ? (
                                <div
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "#f3f4f6",
                                        color: "#9ca3af",
                                    }}
                                >
                                    <svg
                                        width="80"
                                        height="80"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                    >
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21 15 16 10 5 21" />
                                    </svg>
                                    <p style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
                                        Gambar tidak tersedia
                                    </p>
                                </div>
                            ) : (
                                <img
                                    src={`/storage/${item.foto}`}
                                    alt={`Struktur Organisasi ${index + 1}`}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                    onError={() => handleImageError(item.id)}
                                />
                            )}
                        </div>
                        <div style={{ marginTop: "1rem" }}>
                            <h4
                                style={{
                                    margin: "0",
                                    color: "#1f2937",
                                    fontSize: "1.1rem",
                                    fontWeight: "600",
                                }}
                            >
                                Struktur Organisasi {index + 1}
                            </h4>
                            <p
                                style={{
                                    color: "#6b7280",
                                    fontSize: "0.9rem",
                                    margin: "0.5rem 0 0 0",
                                }}
                            >
                                Diperbarui:{" "}
                                {new Date(item.updated_at).toLocaleDateString(
                                    "id-ID"
                                )}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrganizationalStructure;