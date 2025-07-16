import React, { useState, useEffect } from "react";
import { useBerita, BeritaItem } from "../hooks/useBerita";

const formatDate = (dateStr: string) => {
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    } catch (error) {
        return dateStr;
    }
};

const BeritaInformation: React.FC = () => {
    const [page, setPage] = useState(1);
    const [selectedArticle, setSelectedArticle] = useState<BeritaItem | null>(
        null
    );
    const { berita, loading, error, currentPage, lastPage, setCurrentPage } =
        useBerita(page, 6);

    // Sync page state with hook
    useEffect(() => {
        setCurrentPage(page);
    }, [page, setCurrentPage]);

    // Pisahkan headline dan berita biasa
    const headline = berita.find((b) => b.headline);
    const others = berita.filter((b) => !b.headline);

    const openArticle = (article: BeritaItem) => {
        setSelectedArticle(article);
        document.body.style.overflow = "hidden";
    };

    const closeArticle = () => {
        setSelectedArticle(null);
        document.body.style.overflow = "auto";
    };

    const renderPaginationNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(
            1,
            currentPage - Math.floor(maxVisiblePages / 2)
        );
        let endPage = Math.min(lastPage, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Add first page and ellipsis if needed
        if (startPage > 1) {
            pages.push(
                <button
                    key={1}
                    className={`page-btn${currentPage === 1 ? " active" : ""}`}
                    onClick={() => {
                        setPage(1);
                        setCurrentPage(1);
                    }}
                >
                    1
                </button>
            );
            if (startPage > 2) {
                pages.push(<span key="ellipsis1">...</span>);
            }
        }

        // Add middle pages
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    className={`page-btn${currentPage === i ? " active" : ""}`}
                    onClick={() => {
                        setPage(i);
                        setCurrentPage(i);
                    }}
                >
                    {i}
                </button>
            );
        }

        // Add last page and ellipsis if needed
        if (endPage < lastPage) {
            if (endPage < lastPage - 1) {
                pages.push(<span key="ellipsis2">...</span>);
            }
            pages.push(
                <button
                    key={lastPage}
                    className={`page-btn${
                        currentPage === lastPage ? " active" : ""
                    }`}
                    onClick={() => {
                        setPage(lastPage);
                        setCurrentPage(lastPage);
                    }}
                >
                    {lastPage}
                </button>
            );
        }

        return pages;
    };

    if (loading) {
        return (
            <div className="news-grid">
                <div
                    style={{
                        textAlign: "center",
                        padding: "2rem",
                        fontSize: "1.1rem",
                        color: "#6b7280",
                    }}
                >
                    <div style={{ marginBottom: "1rem" }}>📰</div>
                    Memuat berita...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="news-grid">
                <div
                    style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "#dc2626",
                        backgroundColor: "#fee2e2",
                        borderRadius: "8px",
                        border: "1px solid #fecaca",
                    }}
                >
                    <div style={{ marginBottom: "1rem" }}>❌</div>
                    <strong>Error:</strong> {error}
                    <br />
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: "1rem",
                            padding: "0.5rem 1rem",
                            backgroundColor: "#dc2626",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    if (berita.length === 0) {
        return (
            <div className="news-grid">
                <div
                    style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "#6b7280",
                    }}
                >
                    <div style={{ marginBottom: "1rem" }}>📰</div>
                    Tidak ada berita yang tersedia saat ini.
                </div>
            </div>
        );
    }

    return (
        <React.Fragment>
            <div className="news-grid">
                {headline && (
                    <div className="news-card featured">
                        <div className="news-image">
                            {headline.image ? (
                                <img
                                    src={headline.image}
                                    alt={headline.title}
                                    style={{
                                        width: "100%",
                                        height: "200px",
                                        objectFit: "cover",
                                        borderRadius: 8,
                                    }}
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                        (e.currentTarget
                                            .nextElementSibling as HTMLElement)!.style.display =
                                            "block";
                                    }}
                                />
                            ) : null}
                            <div
                                style={{
                                    display: headline.image ? "none" : "block",
                                    fontSize: "3rem",
                                    textAlign: "center",
                                    padding: "2rem",
                                }}
                            >
                                📰
                            </div>
                        </div>
                        <div className="news-content">
                            <div className="news-meta">
                                <span className="news-date">
                                    {formatDate(
                                        headline.date ||
                                            headline.created_at ||
                                            ""
                                    )}
                                </span>
                                <span className="news-category">
                                    {headline.category}
                                </span>
                            </div>
                            <h3>{headline.title}</h3>
                            <p>{headline.content?.slice(0, 120)}...</p>
                            <button
                                className="read-more"
                                onClick={() => openArticle(headline)}
                            >
                                Baca Selengkapnya →
                            </button>
                        </div>
                    </div>
                )}
                {others.map((item: BeritaItem) => (
                    <div className="news-card" key={item.id}>
                        <div className="news-image">
                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    style={{
                                        width: "100%",
                                        height: "150px",
                                        objectFit: "cover",
                                        borderRadius: 8,
                                    }}
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                        (e.currentTarget
                                            .nextElementSibling as HTMLElement)!.style.display =
                                            "block";
                                    }}
                                />
                            ) : null}
                            <div
                                style={{
                                    display: item.image ? "none" : "block",
                                    fontSize: "2rem",
                                    textAlign: "center",
                                    padding: "1rem",
                                }}
                            >
                                📰
                            </div>
                        </div>
                        <div className="news-content">
                            <div className="news-meta">
                                <span className="news-date">
                                    {formatDate(
                                        item.date || item.created_at || ""
                                    )}
                                </span>
                                <span className="news-category">
                                    {item.category}
                                </span>
                            </div>
                            <h3>{item.title}</h3>
                            <p>{item.content?.slice(0, 100)}...</p>
                            <button
                                className="read-more"
                                onClick={() => openArticle(item)}
                            >
                                Baca Selengkapnya →
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for full article */}
            {selectedArticle && (
                <div
                    className="modal-overlay"
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                        padding: "20px",
                    }}
                    onClick={closeArticle}
                >
                    <div
                        className="modal-content"
                        style={{
                            backgroundColor: "white",
                            borderRadius: "12px",
                            padding: "2rem",
                            maxWidth: "800px",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            position: "relative",
                            width: "100%",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={closeArticle}
                            style={{
                                position: "absolute",
                                top: "1rem",
                                right: "1rem",
                                background: "none",
                                border: "none",
                                fontSize: "1.5rem",
                                cursor: "pointer",
                                color: "#666",
                                padding: "0.5rem",
                                borderRadius: "50%",
                                width: "40px",
                                height: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            ×
                        </button>

                        {selectedArticle.image && (
                            <img
                                src={selectedArticle.image}
                                alt={selectedArticle.title}
                                style={{
                                    width: "100%",
                                    height: "300px",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                    marginBottom: "1.5rem",
                                }}
                            />
                        )}

                        <div
                            className="modal-meta"
                            style={{ marginBottom: "1rem" }}
                        >
                            <span
                                style={{
                                    color: "#666",
                                    fontSize: "0.9rem",
                                    marginRight: "1rem",
                                }}
                            >
                                {formatDate(
                                    selectedArticle.date ||
                                        selectedArticle.created_at ||
                                        ""
                                )}
                            </span>
                            <span
                                style={{
                                    color: "#666",
                                    fontSize: "0.9rem",
                                    backgroundColor: "#f3f4f6",
                                    padding: "0.25rem 0.5rem",
                                    borderRadius: "4px",
                                }}
                            >
                                {selectedArticle.category}
                            </span>
                        </div>

                        <h1
                            style={{
                                fontSize: "2rem",
                                fontWeight: "bold",
                                marginBottom: "1.5rem",
                                color: "#1f2937",
                                lineHeight: "1.2",
                            }}
                        >
                            {selectedArticle.title}
                        </h1>

                        <div
                            style={{
                                fontSize: "1.1rem",
                                lineHeight: "1.7",
                                color: "#374151",
                                whiteSpace: "pre-wrap",
                            }}
                        >
                            {selectedArticle.content}
                        </div>
                    </div>
                </div>
            )}

            {/* Pagination - show if there are items */}
            {berita.length > 0 && (
                <div
                    className="news-pagination"
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "2rem 0",
                        marginTop: "2rem",
                    }}
                >
                    <button
                        className="pagination-btn prev"
                        onClick={() => {
                            const newPage = Math.max(1, currentPage - 1);
                            setPage(newPage);
                        }}
                        disabled={currentPage === 1}
                        style={{
                            padding: "0.75rem 1.5rem",
                            backgroundColor:
                                currentPage === 1 ? "#f3f4f6" : "#3b82f6",
                            color: currentPage === 1 ? "#9ca3af" : "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor:
                                currentPage === 1 ? "not-allowed" : "pointer",
                            fontWeight: "500",
                            transition: "all 0.2s",
                        }}
                    >
                        ← Sebelumnya
                    </button>

                    <div
                        className="pagination-numbers"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            margin: "0 1rem",
                        }}
                    >
                        {lastPage > 1 ? (
                            renderPaginationNumbers().map(
                                (pageElement, index) =>
                                    typeof pageElement === "object" ? (
                                        React.cloneElement(pageElement, {
                                            key: pageElement.key || index,
                                            style: {
                                                padding: "0.5rem 0.75rem",
                                                backgroundColor:
                                                    pageElement.props.className?.includes(
                                                        "active"
                                                    )
                                                        ? "#3b82f6"
                                                        : "white",
                                                color: pageElement.props.className?.includes(
                                                    "active"
                                                )
                                                    ? "white"
                                                    : "#374151",
                                                border: "1px solid #d1d5db",
                                                borderRadius: "6px",
                                                cursor: "pointer",
                                                fontWeight: "500",
                                                minWidth: "40px",
                                                transition: "all 0.2s",
                                            },
                                        })
                                    ) : (
                                        <span
                                            key={index}
                                            style={{ padding: "0.5rem" }}
                                        >
                                            {pageElement}
                                        </span>
                                    )
                            )
                        ) : (
                            <button
                                className="page-btn active"
                                style={{
                                    padding: "0.5rem 0.75rem",
                                    backgroundColor: "#3b82f6",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    fontWeight: "500",
                                    minWidth: "40px",
                                }}
                            >
                                1
                            </button>
                        )}
                    </div>

                    <button
                        className="pagination-btn next"
                        onClick={() => {
                            const newPage = Math.min(lastPage, currentPage + 1);
                            setPage(newPage);
                        }}
                        disabled={currentPage === lastPage}
                        style={{
                            padding: "0.75rem 1.5rem",
                            backgroundColor:
                                currentPage === lastPage
                                    ? "#f3f4f6"
                                    : "#3b82f6",
                            color:
                                currentPage === lastPage ? "#9ca3af" : "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor:
                                currentPage === lastPage
                                    ? "not-allowed"
                                    : "pointer",
                            fontWeight: "500",
                            transition: "all 0.2s",
                        }}
                    >
                        Selanjutnya →
                    </button>
                </div>
            )}
        </React.Fragment>
    );
};

export default BeritaInformation;
