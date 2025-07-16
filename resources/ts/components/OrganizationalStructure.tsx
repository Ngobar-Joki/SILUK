import React from "react";
import useOrganizationalStructure from "../hooks/useOrganizationalStructure";

const OrganizationalStructure: React.FC = () => {
    const { data, loading, error, refetch } = useOrganizationalStructure();

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
                            <img
                                src={`/storage/${item.foto}`}
                                alt={`Struktur Organisasi ${index + 1}`}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                                onError={(e) => {
                                    e.currentTarget.src =
                                        "/images/default-org-structure.png";
                                }}
                            />
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
