import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import AccessibilityDashboard from "../../components/AccessibilityDashboard";
import {
    ChartBarIcon,
    DocumentTextIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowTrendingUpIcon,
    UsersIcon,
    CalendarIcon,
} from "@heroicons/react/24/outline";

interface DashboardData {
    statistics: {
        totalReports: number;
        totalApplications: number;
        pendingApplications: number;
        acceptedApplications: number;
        rejectedApplications: number;
        pendingReports: number;
        acceptedReports: number;
        rejectedReports: number;
    };
    recentReports: any[];
    recentApplications: any[];
    monthlyReports: any[];
    monthlyApplications: any[];
    reportsByStatus: any[];
    applicationsByStatus: any[];
}

interface DashboardProps {
    dashboardData?: DashboardData;
    error?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ dashboardData, error }) => {
    const [activeTab, setActiveTab] = useState("overview");
    const [data, setData] = useState<DashboardData>({
        statistics: {
            totalReports: 0,
            totalApplications: 0,
            pendingApplications: 0,
            acceptedApplications: 0,
            rejectedApplications: 0,
            pendingReports: 0,
            acceptedReports: 0,
            rejectedReports: 0,
        },
        recentReports: [],
        recentApplications: [],
        monthlyReports: [],
        monthlyApplications: [],
        reportsByStatus: [],
        applicationsByStatus: [],
    });
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setFetchError(null);

                if (dashboardData) {
                    setData(dashboardData);
                } else {
                    // Fetch data from API with proper error handling
                    const response = await fetch("/api/dashboard", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                        },
                        credentials: "same-origin",
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error("API Error:", errorText);
                        throw new Error(
                            `HTTP error! status: ${response.status}`
                        );
                    }

                    const contentType = response.headers.get("content-type");
                    if (
                        !contentType ||
                        !contentType.includes("application/json")
                    ) {
                        const errorText = await response.text();
                        console.error("Non-JSON response:", errorText);
                        throw new Error("Server returned non-JSON response");
                    }

                    const result = await response.json();

                    if (result.error) {
                        throw new Error(result.error);
                    }

                    setData(result);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setFetchError(
                    error instanceof Error
                        ? error.message
                        : "Unknown error occurred"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [dashboardData]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "accepted":
                return "bg-emerald-100 text-emerald-800 border-emerald-200";
            case "pending":
                return "bg-amber-100 text-amber-800 border-amber-200";
            case "rejected":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const StatCard = ({
        title,
        value,
        subtitle,
        icon: Icon,
        color = "blue",
        trend,
        percentage,
    }: any) => (
        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100/50 p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
                <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${
                        color === "blue"
                            ? "from-blue-50 to-blue-100"
                            : color === "green"
                            ? "from-emerald-50 to-emerald-100"
                            : color === "yellow"
                            ? "from-amber-50 to-amber-100"
                            : color === "red"
                            ? "from-red-50 to-red-100"
                            : "from-gray-50 to-gray-100"
                    }`}
                >
                    <Icon
                        className={`w-6 h-6 ${
                            color === "blue"
                                ? "text-blue-600"
                                : color === "green"
                                ? "text-emerald-600"
                                : color === "yellow"
                                ? "text-amber-600"
                                : color === "red"
                                ? "text-red-600"
                                : "text-gray-600"
                        }`}
                    />
                </div>
                {trend && (
                    <div
                        className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                            trend === "up"
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-red-100 text-red-600"
                        }`}
                    >
                        <ArrowTrendingUpIcon
                            className={`w-3 h-3 ${
                                trend === "down" ? "transform rotate-180" : ""
                            }`}
                        />
                        <span>{percentage}%</span>
                    </div>
                )}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                    {title}
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {loading ? (
                        <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                        value.toLocaleString()
                    )}
                </p>
                <p className={`text-sm text-${color}-600 font-medium`}>
                    {subtitle}
                </p>
            </div>
        </div>
    );

    const ActivityCard = ({ title, data, icon: Icon, onSeeAll }: any) => (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100/50 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    {Icon && <Icon className="w-5 h-5 text-blue-600 mr-2" />}
                    {title}
                </h3>
                <button
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-colors"
                    onClick={onSeeAll}
                    type="button"
                >
                    Lihat Semua
                </button>
            </div>
            <div className="space-y-3">
                {data && data.length > 0 ? (
                    data.map((item: any, index: number) => (
                        <div
                            key={index}
                            className="group p-4 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl hover:from-blue-50 hover:to-blue-50/50 transition-all duration-300 border border-gray-100/50"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 group-hover:text-blue-900 transition-colors">
                                        {item.judul || "Untitled"}
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-1 flex items-center">
                                        <UsersIcon className="w-4 h-4 mr-1" />
                                        {item.user?.name || "Unknown"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                                        <CalendarIcon className="w-3 h-3 mr-1" />
                                        {item.created_at
                                            ? new Date(
                                                  item.created_at
                                              ).toLocaleDateString("id-ID", {
                                                  day: "numeric",
                                                  month: "long",
                                                  year: "numeric",
                                              })
                                            : "Unknown date"}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                            item.status || "pending"
                                        )}`}
                                    >
                                        {item.status || "pending"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">📭</div>
                        <p>Tidak ada data terbaru</p>
                    </div>
                )}
            </div>
        </div>
    );

    const ChartCard = ({ title, data }: any) => (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100/50 p-6 hover:shadow-lg transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <ChartBarIcon className="w-5 h-5 text-blue-600 mr-2" />
                {title}
            </h3>
            <div className="space-y-4">
                {data && data.length > 0 ? (
                    data.map((item: any, index: number) => (
                        <div key={index} className="group">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                    <div
                                        className={`w-3 h-3 rounded-full ${
                                            item.status === "accepted"
                                                ? "bg-emerald-500"
                                                : item.status === "pending"
                                                ? "bg-amber-500"
                                                : item.status === "rejected"
                                                ? "bg-red-500"
                                                : "bg-gray-500"
                                        }`}
                                    ></div>
                                    <span className="text-sm text-gray-600 capitalize font-medium">
                                        {item.status || "pending"}
                                    </span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900">
                                    {item.count || 0}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-500 ${
                                        item.status === "accepted"
                                            ? "bg-emerald-500"
                                            : item.status === "pending"
                                            ? "bg-amber-500"
                                            : item.status === "rejected"
                                            ? "bg-red-500"
                                            : "bg-gray-500"
                                    }`}
                                    style={{
                                        width: `${
                                            data.length > 0 &&
                                            Math.max(
                                                ...data.map(
                                                    (d: any) => d.count || 0
                                                )
                                            ) > 0
                                                ? ((item.count || 0) /
                                                      Math.max(
                                                          ...data.map(
                                                              (d: any) =>
                                                                  d.count || 0
                                                          )
                                                      )) *
                                                  100
                                                : 0
                                        }%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">📊</div>
                        <p>Tidak ada data untuk ditampilkan</p>
                    </div>
                )}
            </div>
        </div>
    );

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                        <p className="mt-6 text-gray-600 font-medium">
                            Memuat dashboard...
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 sticky top-0 z-10">
                    <div className="px-6 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Dashboard SILUK
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Sistem Informasi Layanan Umum Koperasi
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">
                                        Hari ini
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {new Date().toLocaleDateString(
                                            "id-ID",
                                            {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            }
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-6">
                    {(error || fetchError) && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <div className="flex items-center">
                                <XCircleIcon className="w-5 h-5 text-red-600 mr-2" />
                                <div>
                                    <p className="text-red-800 font-medium">
                                        Error loading dashboard
                                    </p>
                                    <p className="text-red-600 text-sm mt-1">
                                        {error || fetchError}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab Navigation */}
                    <div className="mb-8">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-sm border border-gray-100/50">
                            <nav className="flex space-x-2">
                                <button
                                    onClick={() => setActiveTab("overview")}
                                    className={`py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 ${
                                        activeTab === "overview"
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                            : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                                    }`}
                                >
                                    📊 Dashboard Overview
                                </button>
                                <button
                                    onClick={() =>
                                        setActiveTab("accessibility")
                                    }
                                    className={`py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 ${
                                        activeTab === "accessibility"
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                            : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                                    }`}
                                >
                                    ♿ Accessibility Statistics
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Tab Content */}
                    {activeTab === "overview" && (
                        <div className="space-y-8">
                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard
                                    title="Total Laporan"
                                    value={data.statistics.totalReports}
                                    subtitle="Semua laporan"
                                    icon={DocumentTextIcon}
                                    color="blue"
                                />
                                <StatCard
                                    title="Total Permohonan"
                                    value={data.statistics.totalApplications}
                                    subtitle="Semua permohonan"
                                    icon={ChartBarIcon}
                                    color="green"
                                />
                                <StatCard
                                    title="Permohonan Pending"
                                    value={data.statistics.pendingApplications}
                                    subtitle="Menunggu proses"
                                    icon={ClockIcon}
                                    color="yellow"
                                />
                                <StatCard
                                    title="Laporan Diterima"
                                    value={data.statistics.acceptedReports}
                                    subtitle="Sudah diterima"
                                    icon={CheckCircleIcon}
                                    color="green"
                                />
                            </div>

                            {/* Charts Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <ChartCard
                                    title="Status Laporan"
                                    data={data.reportsByStatus}
                                />
                                <ChartCard
                                    title="Status Permohonan"
                                    data={data.applicationsByStatus}
                                />
                            </div>

                            {/* Recent Activity */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <ActivityCard
                                    title="Laporan Terbaru"
                                    data={data.recentReports}
                                    icon={DocumentTextIcon}
                                    onSeeAll={() =>
                                        (window.location.href =
                                            "/daftar-laporan")
                                    }
                                />
                                <ActivityCard
                                    title="Permohonan Terbaru"
                                    data={data.recentApplications}
                                    icon={ChartBarIcon}
                                    onSeeAll={() =>
                                        (window.location.href =
                                            "/daftar-permohonan")
                                    }
                                />
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100/50 p-6 hover:shadow-lg transition-all duration-300">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                    ⚡ Aksi Cepat
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <button
                                        className="group flex flex-col items-center justify-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                                        onClick={() => (window.location.href = "/daftar-laporan")}
                                    >
                                        <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                                            📊
                                        </div>
                                        <span className="text-sm font-medium text-blue-700">
                                             Laporan
                                        </span>
                                    </button>
                                    <button className="group flex flex-col items-center justify-center p-6 bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                                        onClick={() => (window.location.href = "/daftar-permohonan")}
                                    >
                                        
                                        <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                                            📋
                                        </div>
                                        <span className="text-sm font-medium text-emerald-700">
                                             Permohonan
                                        </span>
                                    </button>
                                    <button className="group flex flex-col items-center justify-center p-6 bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                                        onClick={() => (window.location.href = "/daftar-user")}
                                    >
                                        <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                                            👥
                                        </div>
                                        <span className="text-sm font-medium text-amber-700">
                                            Kelola Anggota
                                        </span>
                                    </button>
                                    <button className="group flex flex-col items-center justify-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                                        onClick={() => (window.location.href = "/berita")}
                                    >
                                        <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                                            📰
                                        </div>
                                        <span className="text-sm font-medium text-purple-700">
                                            Berita
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "accessibility" && (
                        <AccessibilityDashboard />
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
