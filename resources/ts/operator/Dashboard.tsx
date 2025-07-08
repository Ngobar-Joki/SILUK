import React, { useState } from "react";
import Layout from "../components/layout/Layout";
import AccessibilityDashboard from "../components/AccessibilityDashboard";

const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <Layout>
            <div className="p-4">
                {/* Tab Navigation */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab("overview")}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === "overview"
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                Dashboard Overview
                            </button>
                            <button
                                onClick={() => setActiveTab("accessibility")}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === "accessibility"
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                Accessibility Statistics
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === "overview" && (
                    <>
                        <h1 className="text-2xl font-bold mb-4">
                            Dashboard Koperasi
                        </h1>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h3 className="text-gray-500 text-sm font-medium">
                                    Total Anggota
                                </h3>
                                <p className="text-2xl font-bold">1,245</p>
                                <p className="text-green-500 text-sm">
                                    +12 bulan ini
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h3 className="text-gray-500 text-sm font-medium">
                                    Total Simpanan
                                </h3>
                                <p className="text-2xl font-bold">
                                    Rp 945.500.000
                                </p>
                                <p className="text-green-500 text-sm">
                                    +2.5% dari bulan lalu
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h3 className="text-gray-500 text-sm font-medium">
                                    Total Pinjaman
                                </h3>
                                <p className="text-2xl font-bold">
                                    Rp 675.250.000
                                </p>
                                <p className="text-blue-500 text-sm">
                                    20 pinjaman aktif
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h3 className="text-gray-500 text-sm font-medium">
                                    SHU
                                </h3>
                                <p className="text-2xl font-bold">
                                    Rp 125.750.000
                                </p>
                                <p className="text-green-500 text-sm">
                                    +5.2% tahun ini
                                </p>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Recent Transactions */}
                            <div className="bg-white p-4 rounded-lg shadow col-span-2">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold">
                                        Transaksi Terbaru
                                    </h2>
                                    <button className="text-blue-500 text-sm">
                                        Lihat Semua
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-gray-500 border-b">
                                                <th className="pb-2">
                                                    Anggota
                                                </th>
                                                <th className="pb-2">Jenis</th>
                                                <th className="pb-2">Jumlah</th>
                                                <th className="pb-2">
                                                    Tanggal
                                                </th>
                                                <th className="pb-2">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b">
                                                <td className="py-2">
                                                    Budi Santoso
                                                </td>
                                                <td className="py-2">
                                                    Simpanan
                                                </td>
                                                <td className="py-2">
                                                    Rp 500.000
                                                </td>
                                                <td className="py-2">
                                                    20 Jun 2023
                                                </td>
                                                <td className="py-2">
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                                        Selesai
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-2">
                                                    Siti Aminah
                                                </td>
                                                <td className="py-2">
                                                    Pinjaman
                                                </td>
                                                <td className="py-2">
                                                    Rp 2.000.000
                                                </td>
                                                <td className="py-2">
                                                    19 Jun 2023
                                                </td>
                                                <td className="py-2">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                        Diproses
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-2">
                                                    Ahmad Hidayat
                                                </td>
                                                <td className="py-2">
                                                    Angsuran
                                                </td>
                                                <td className="py-2">
                                                    Rp 350.000
                                                </td>
                                                <td className="py-2">
                                                    18 Jun 2023
                                                </td>
                                                <td className="py-2">
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                                        Selesai
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-2">
                                                    Dewi Lestari
                                                </td>
                                                <td className="py-2">
                                                    Penarikan
                                                </td>
                                                <td className="py-2">
                                                    Rp 1.000.000
                                                </td>
                                                <td className="py-2">
                                                    17 Jun 2023
                                                </td>
                                                <td className="py-2">
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                                        Selesai
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Announcements and Quick Links */}
                            <div className="lg:col-span-1 space-y-6">
                                {/* Announcements */}
                                <div className="bg-white p-4 rounded-lg shadow">
                                    <h2 className="text-lg font-semibold mb-4">
                                        Pengumuman
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="border-b pb-3">
                                            <h3 className="font-medium">
                                                Rapat Anggota Tahunan
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                RAT akan dilaksanakan pada
                                                tanggal 15 Juli 2023
                                            </p>
                                        </div>
                                        <div className="border-b pb-3">
                                            <h3 className="font-medium">
                                                Program Pinjaman Baru
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Pinjaman usaha mikro dengan
                                                bunga 0.5% per bulan
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="font-medium">
                                                Pembagian SHU
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                SHU tahun 2022 akan dibagikan
                                                bulan depan
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Links */}
                                <div className="bg-white p-4 rounded-lg shadow">
                                    <h2 className="text-lg font-semibold mb-4">
                                        Akses Cepat
                                    </h2>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm">
                                            Daftar Anggota
                                        </button>
                                        <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm">
                                            Tambah Simpanan
                                        </button>
                                        <button className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded-lg text-sm">
                                            Ajukan Pinjaman
                                        </button>
                                        <button className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg text-sm">
                                            Laporan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === "accessibility" && <AccessibilityDashboard />}
            </div>
        </Layout>
    );
};

export default Dashboard;
