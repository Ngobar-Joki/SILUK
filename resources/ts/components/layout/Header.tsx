import React, { useState } from "react";
import { Bell, User, Settings, ChevronDown } from "lucide-react";
import "../../../css/Header.css";

// Add type declaration for window.user
interface User {
    id: number;
    name: string;
    username: string;
    role: string;
    // Add other user properties as needed
}

interface HeaderProps {
    onMenuClick: () => void;
    sidebarCollapsed?: boolean;
    sidebarOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({
    onMenuClick,
    sidebarCollapsed = false,
    sidebarOpen = false,
}) => {
    const [profileOpen, setProfileOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);

    // Get user data - assuming it's available globally or you need to fetch it
    // You may need to adjust this based on how user data is provided in your app
    const userData: User | null = (window as any).user || null;

    return (
        <header
            className={`header ${
                sidebarCollapsed
                    ? "header--sidebar-collapsed"
                    : "header--sidebar-expanded"
            } ${sidebarOpen ? "header--sidebar-open" : ""}`}
        >
            <div className="header-container">
                {/* Mobile Menu Button - Only visible on mobile */}
                <button
                    onClick={onMenuClick}
                    className="mobile-menu-button lg:hidden"
                    aria-label="Toggle mobile menu"
                >
                    <div className="hamburger-icon">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </button>

                {/* Right side - Notifications and Profile */}
                <div className="header-actions">
                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() =>
                                setNotificationOpen(!notificationOpen)
                            }
                            className="action-button"
                            aria-label="Notifications"
                        >
                            <Bell className="icon" />
                            <span className="notification-badge"></span>
                        </button>

                        {/* Notification dropdown */}
                        {notificationOpen && (
                            <div className="dropdown notification-dropdown">
                                <div className="dropdown-header">
                                    <h3 className="dropdown-title">
                                        Notifikasi
                                    </h3>
                                </div>
                                <div className="dropdown-content">
                                    <button className="notification-item">
                                        <p className="notification-title">
                                            Pesan baru
                                        </p>
                                        <p className="notification-time">
                                            2 menit yang lalu
                                        </p>
                                    </button>
                                    <button className="notification-item">
                                        <p className="notification-title">
                                            Update sistem
                                        </p>
                                        <p className="notification-time">
                                            1 jam yang lalu
                                        </p>
                                    </button>
                                    <button className="notification-item">
                                        <p className="notification-title">
                                            Backup selesai
                                        </p>
                                        <p className="notification-time">
                                            3 jam yang lalu
                                        </p>
                                    </button>
                                </div>
                                <div className="dropdown-footer">
                                    <button className="dropdown-footer-button">
                                        Lihat semua notifikasi
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="profile-button"
                            aria-label="Profile menu"
                        >
                            <div className="profile-avatar">
                                <User className="icon-sm icon-white" />
                            </div>
                            <ChevronDown className="profile-chevron" />
                        </button>

                        {/* Profile dropdown menu */}
                        {profileOpen && (
                            <div className="dropdown profile-dropdown">
                                <div className="dropdown-header">
                                    <p className="dropdown-title">
                                        {userData?.name || "User"}
                                    </p>
                                    <p className="dropdown-subtitle">
                                        {userData?.username ||
                                            "admin@siluk.com"}
                                    </p>
                                    <p className="dropdown-subtitle">
                                        Role: {userData?.role || "User"}
                                    </p>
                                </div>
                                <button className="dropdown-item">
                                    <User className="dropdown-item-icon" />
                                    Profil
                                </button>
                                <button className="dropdown-item">
                                    <Settings className="dropdown-item-icon" />
                                    Pengaturan
                                </button>
                                <hr className="dropdown-divider" />
                                <button
                                    className="dropdown-item logout-button"
                                    onClick={async () => {
                                        try {
                                            // Get CSRF token
                                            const token = document
                                                .querySelector(
                                                    'meta[name="csrf-token"]'
                                                )
                                                ?.getAttribute("content");

                                            // Make logout request
                                            const response = await fetch(
                                                "/logout",
                                                {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type":
                                                            "application/json",
                                                        "X-CSRF-TOKEN":
                                                            token || "",
                                                        "X-Requested-With":
                                                            "XMLHttpRequest",
                                                    },
                                                }
                                            );

                                            if (response.ok) {
                                                // Redirect to login page
                                                window.location.href = "/login";
                                            } else {
                                                console.error("Logout failed");
                                                alert(
                                                    "Terjadi kesalahan saat logout"
                                                );
                                            }
                                        } catch (error) {
                                            console.error(
                                                "Logout error:",
                                                error
                                            );
                                            alert(
                                                "Terjadi kesalahan saat logout"
                                            );
                                        }
                                    }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="dropdown-item-icon"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                        <polyline points="16 17 21 12 16 7"></polyline>
                                        <line
                                            x1="21"
                                            y1="12"
                                            x2="9"
                                            y2="12"
                                        ></line>
                                    </svg>
                                    Keluar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
