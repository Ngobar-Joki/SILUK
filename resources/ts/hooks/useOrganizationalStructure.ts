import { useState, useEffect } from "react";

interface OrganizationalStructure {
    id: number;
    foto: string;
    created_at: string;
    updated_at: string;
}

interface UseOrganizationalStructureReturn {
    data: OrganizationalStructure[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

const useOrganizationalStructure = (): UseOrganizationalStructureReturn => {
    const [data, setData] = useState<OrganizationalStructure[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrganizationalStructure = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/struktur-organisasi/public", {
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
                setData(result.strukturOrganisasi || []);
            } else {
                throw new Error(result.message || "Failed to fetch data");
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Unknown error occurred";
            setError(errorMessage);
            console.error("Error fetching organizational structure:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizationalStructure();
    }, []);

    const refetch = () => {
        fetchOrganizationalStructure();
    };

    return { data, loading, error, refetch };
};

export default useOrganizationalStructure;
