import React from "react";
import Layout from "../components/layout/Layout";
import { FileText, Plus, Search, Download, Eye, Trash2 } from "lucide-react";

const Documents: React.FC = () => {
    // Sample documents data
    const documents = [
        {
            id: 1,
            name: "Laporan Keuangan Q1 2024",
            type: "PDF",
            size: "2.4 MB",
            uploadDate: "2024-03-15",
            uploadedBy: "Ahmad Wijaya",
            status: "Approved",
        },
        {
            id: 2,
            name: "Anggaran Dasar Koperasi",
            type: "DOCX",
            size: "1.2 MB",
            uploadDate: "2024-02-20",
            uploadedBy: "Siti Nurhaliza",
            status: "Draft",
        },
        {
            id: 3,
            name: "Daftar Anggota 2024",
            type: "XLSX",
            size: "890 KB",
            uploadDate: "2024-01-10",
            uploadedBy: "Budi Santoso",
            status: "Approved",
        },
    ];

    return (
        <Layout title="Documents">
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Manajemen Dokumen
                            </h2>
                            <p className="text-sm text-gray-600">
                                Kelola dokumen dan file koperasi
                            </p>
                        </div>
                    </div>
                    <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Plus className="h-4 w-4 mr-2" />
                        Upload Dokumen
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari dokumen..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Semua Status</option>
                        <option value="approved">Approved</option>
                        <option value="draft">Draft</option>
                        <option value="review">Review</option>
                    </select>
                </div>

                {/* Documents Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Dokumen
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tipe & Ukuran
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Upload
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {documents.map((doc) => (
                                    <tr
                                        key={doc.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <FileText className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {doc.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {doc.type}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {doc.size}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {doc.uploadDate}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                oleh {doc.uploadedBy}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    doc.status === "Approved"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                }`}
                                            >
                                                {doc.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button className="text-blue-600 hover:text-blue-800">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button className="text-green-600 hover:text-green-800">
                                                    <Download className="h-4 w-4" />
                                                </button>
                                                <button className="text-red-600 hover:text-red-800">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Total Dokumen
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    24
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <FileText className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Approved
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    18
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <FileText className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Pending
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    6
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Documents;
