import React, { useState, useEffect } from "react";

interface AccessibilityStats {
    totalUsers: number;
    usersWithSettings: number;
    adoptionRate: number;
    featureUsage: {
        highlightTitles: number;
        highlightLinks: number;
        dyslexiaFont: number;
        letterSpacing: number;
        lineHeight: number;
        fontWeight: number;
    };
    languageUsage: {
        id: number;
        en: number;
        ms: number;
    };
    fontSizeDistribution: {
        "80-90": number;
        "91-100": number;
        "101-120": number;
        "121-150": number;
    };
}

const AccessibilityDashboard: React.FC = () => {
    const [stats, setStats] = useState<AccessibilityStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/accessibility/statistics", {
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setStats(data.statistics);
                } else {
                    setError(data.message || "Failed to load statistics");
                }
            } else {
                setError("Failed to fetch accessibility statistics");
            }
        } catch (err) {
            setError("Network error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="accessibility-dashboard p-6">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">
                        Loading accessibility statistics...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="accessibility-dashboard p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-red-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                Error Loading Statistics
                            </h3>
                            <p className="mt-1 text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="accessibility-dashboard p-6">
                <p className="text-gray-600">
                    No accessibility statistics available.
                </p>
            </div>
        );
    }

    return (
        <div className="accessibility-dashboard p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                    Accessibility Statistics
                </h2>
                <button
                    onClick={fetchStatistics}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <svg
                        className="mr-2 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-6 w-6 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                                    />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total Users
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats.totalUsers.toLocaleString()}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-6 w-6 text-green-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Users with Accessibility Settings
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats.usersWithSettings.toLocaleString()}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-6 w-6 text-blue-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                                    />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Adoption Rate
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats.adoptionRate}%
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Usage */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Feature Usage
                </h3>
                <div className="space-y-4">
                    {Object.entries(stats.featureUsage).map(
                        ([feature, count]) => {
                            const percentage =
                                stats.usersWithSettings > 0
                                    ? (
                                          (count / stats.usersWithSettings) *
                                          100
                                      ).toFixed(1)
                                    : "0";

                            return (
                                <div
                                    key={feature}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center">
                                        <span className="text-sm font-medium text-gray-700 capitalize">
                                            {feature
                                                .replace(/([A-Z])/g, " $1")
                                                .trim()}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-600 w-12 text-right">
                                            {count} ({percentage}%)
                                        </span>
                                    </div>
                                </div>
                            );
                        }
                    )}
                </div>
            </div>

            {/* Language Usage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Language Usage
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(stats.languageUsage).map(
                            ([lang, count]) => {
                                const percentage =
                                    stats.usersWithSettings > 0
                                        ? (
                                              (count /
                                                  stats.usersWithSettings) *
                                              100
                                          ).toFixed(1)
                                        : "0";

                                const langNames: Record<string, string> = {
                                    id: "Bahasa Indonesia",
                                    en: "English",
                                    ms: "Bahasa Melayu",
                                };

                                return (
                                    <div
                                        key={lang}
                                        className="flex items-center justify-between"
                                    >
                                        <span className="text-sm font-medium text-gray-700">
                                            {langNames[lang] || lang}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            {count} ({percentage}%)
                                        </span>
                                    </div>
                                );
                            }
                        )}
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Font Size Distribution
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(stats.fontSizeDistribution).map(
                            ([range, count]) => {
                                const percentage =
                                    stats.usersWithSettings > 0
                                        ? (
                                              (count /
                                                  stats.usersWithSettings) *
                                              100
                                          ).toFixed(1)
                                        : "0";

                                return (
                                    <div
                                        key={range}
                                        className="flex items-center justify-between"
                                    >
                                        <span className="text-sm font-medium text-gray-700">
                                            {range}%
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            {count} ({percentage}%)
                                        </span>
                                    </div>
                                );
                            }
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccessibilityDashboard;
