import { useState, useEffect } from "react";

export interface BeritaItem {
    id: number;
    title: string;
    content: string;
    category: string;
    date: string;
    image?: string;
    headline?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface BeritaResponse {
    data: BeritaItem[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    success?: boolean;
    message?: string;
}

export function useBerita(page: number = 1, pageSize: number = 10) {
    const [berita, setBerita] = useState<BeritaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(page);
    const [lastPage, setLastPage] = useState(1);

    useEffect(() => {
        setLoading(true);
        setError(null);

        fetch(`/api/berita/public?page=${currentPage}&pageSize=${pageSize}`, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((json) => {
                // Handle different response formats
                if (json.success === false) {
                    throw new Error(json.message || "Gagal memuat berita");
                }

                // Check if response has pagination structure
                if (json.data && Array.isArray(json.data)) {
                    setBerita(json.data);
                    setLastPage(json.last_page || 1);
                } else if (Array.isArray(json)) {
                    // Direct array response
                    setBerita(json);
                    setLastPage(1);
                } else {
                    throw new Error("Format response tidak valid");
                }
            })
            .catch((err) => {
                console.error("Error fetching berita:", err);
                setError(err.message || "Gagal memuat berita");
                setBerita([]);
            })
            .finally(() => setLoading(false));
    }, [currentPage, pageSize]);

    return {
        berita,
        loading,
        error,
        currentPage,
        lastPage,
        setCurrentPage,
    };
}
