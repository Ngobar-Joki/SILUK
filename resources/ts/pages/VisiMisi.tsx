import React, { useState } from "react";
import Layout from "../components/layout/Layout";
import { Plus, Edit, Trash2, Search, Filter, Eye } from "lucide-react";

interface VisiMisi {
    id: number;
    visi: string;
    misi: string[];
    created_at: string;
    status: "active" | "inactive";
}

const VisiMisiPage: React.FC = () => {
    const [visiMisiList] = useState<VisiMisi[]>([
        {
            id: 1,
            visi: "Menjadi organisasi terdepan dalam pelayanan masyarakat",
            misi: [
                "Memberikan pelayanan terbaik kepada masyarakat",
                "Meningkatkan kualitas SDM secara berkelanjutan",
                "Mengembangkan teknologi informasi yang modern",
            ],
            created_at: "2025-07-01",
            status: "active",
        },
        {
            id: 2,
            visi: "Menciptakan lingkungan kerja yang produktif dan inovatif",
            misi: [
                "Membangun budaya kerja yang kolaboratif",
                "Mendorong inovasi di setiap lini organisasi",
                "Mengutamakan kepuasan stakeholder",
            ],
            created_at: "2025-06-15",
            status: "inactive",
        },
    ]);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<
        "all" | "active" | "inactive"
    >("all");

    const filteredVisiMisi = visiMisiList.filter((item) => {
        const matchesSearch =
            item.visi.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.misi.some((m) =>
                m.toLowerCase().includes(searchTerm.toLowerCase())
            );
        const matchesStatus =
            statusFilter === "all" || item.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <Layout title="Visi & Misi">
            <div className="space-y-6">
                {/* Header actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari visi atau misi..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(
                                        e.target.value as
                                            | "all"
                                            | "active"
                                            | "inactive"
                                    )
                                }
                                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                            >
                                <option value="all">Semua Status</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Tidak Aktif</option>
                            </select>
                        </div>

                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <Plus className="w-4 h-4" />
                            Tambah Visi Misi
                        </button>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Total Visi Misi
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {visiMisiList.length}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Eye className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Status Aktif
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                    {
                                        visiMisiList.filter(
                                            (item) => item.status === "active"
                                        ).length
                                    }
                                </p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Status Tidak Aktif
                                </p>
                                <p className="text-2xl font-bold text-gray-500">
                                    {
                                        visiMisiList.filter(
                                            (item) => item.status === "inactive"
                                        ).length
                                    }
                                </p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visi Misi List */}
                <div className="space-y-4">
                    {filteredVisiMisi.length === 0 ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Tidak ada data
                            </h3>
                            <p className="text-gray-500">
                                {searchTerm || statusFilter !== "all"
                                    ? "Tidak ada visi misi yang sesuai dengan kriteria pencarian"
                                    : "Belum ada visi misi yang ditambahkan"}
                            </p>
                        </div>
                    ) : (
                        filteredVisiMisi.map((item) => (
                            <VisiMisiCard key={item.id} visiMisi={item} />
                        ))
                    )}
                </div>
            </div>
        </Layout>
    );
};

// VisiMisiCard component
interface VisiMisiCardProps {
    visiMisi: VisiMisi;
}

const VisiMisiCard: React.FC<VisiMisiCardProps> = ({ visiMisi }) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Visi & Misi #{visiMisi.id}
                        </h3>
                        <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                                visiMisi.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                        >
                            {visiMisi.status === "active"
                                ? "Aktif"
                                : "Tidak Aktif"}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">
                        Dibuat:{" "}
                        {new Date(visiMisi.created_at).toLocaleDateString(
                            "id-ID"
                        )}
                    </p>
                </div>

                <div className="flex gap-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {/* Visi */}
                <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Visi:
                    </h4>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                        {visiMisi.visi}
                    </p>
                </div>

                {/* Misi */}
                <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Misi:
                    </h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <ol className="list-decimal list-inside space-y-1">
                            {visiMisi.misi.map((misi, index) => (
                                <li
                                    key={index}
                                    className="text-gray-700 text-sm"
                                >
                                    {misi}
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisiMisiPage;
