import { useState, useEffect } from "react";

interface VisiMisi {
    id: number;
    judul: string;
    deskripsi: string;
    created_at: string;
    updated_at: string;
}

interface UseVisiMisiReturn {
    data: VisiMisi[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

const useVisiMisi = (): UseVisiMisiReturn => {
    const [data, setData] = useState<VisiMisi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchVisiMisi = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/visi-misi/public", {
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.success) {
                setData(result.visiMisi || []);
            } else {
                throw new Error(result.message || "Failed to fetch data");
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Unknown error occurred";
            setError(errorMessage);
            console.error("Error fetching visi misi:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVisiMisi();
    }, []);

    const refetch = () => {
        fetchVisiMisi();
    };

    return { data, loading, error, refetch };
};

export default useVisiMisi;
