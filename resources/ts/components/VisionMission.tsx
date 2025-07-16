import React from "react";
import useVisiMisi from "../hooks/useVisiMisi";

const VisionMission: React.FC = () => {
    const { data, loading, error, refetch } = useVisiMisi();

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
                <p>Memuat visi misi...</p>
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
                <p>Gagal memuat visi misi: {error}</p>
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
                <p>Data visi misi belum tersedia.</p>
            </div>
        );
    }

    // Asumsi: data[0] = Visi, data[1] = Misi
    const visi = data.find((item) => item.judul.toLowerCase().includes("visi"));
    const misi = data.find((item) => item.judul.toLowerCase().includes("misi"));

    // Parse misi dengan lebih hati-hati
    const misiList = misi
        ? misi.deskripsi
              .split(/\r?\n/)
              .map((line) => line.trim())
              .filter((line) => line.length > 0)
              .filter((line) => !line.match(/^\d+\.?\s*$/)) // Hapus baris yang hanya berisi angka
              .map((line) => line.replace(/^\d+\.?\s*/, "")) // Hapus nomor di awal baris
              .filter((line) => line.length > 0)
        : [];

    return (
        <div className="vision-grid">
            <div className="vision-card">
                <div className="vision-icon">🎯</div>
                <h2>Visi</h2>
                <div className="section-line"></div>
                <p>{visi ? visi.deskripsi : "-"}</p>
            </div>
            <div className="mission-card">
                <div className="mission-icon">🚀</div>
                <h2>Misi</h2>
                <div className="section-line"></div>
                <div className="mission-list">
                    {misiList.length > 0 ? (
                        misiList.map((item, idx) => (
                            <div className="mission-item" key={idx}>
                                <div className="mission-number">
                                    {(idx + 1).toString().padStart(2, "0")}
                                </div>
                                <p>{item.trim()}</p>
                            </div>
                        ))
                    ) : (
                        <div className="mission-item">
                            <p>-</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VisionMission;
