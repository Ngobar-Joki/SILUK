import React, { useState, useEffect } from "react";
import { Bell, User, ChevronDown } from "lucide-react";
import "../../../css/Header.css";

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

    const [user, setUser] = useState<{
        name: string;
        email: string;
        role: string;
    } | null>(null);

    const [notifications, setNotifications] = useState<
        { type: string; title: string; created_at: string; read?: boolean }[]
    >([]);
    const [notifLoading, setNotifLoading] = useState(false);

    useEffect(() => {
        fetch("/api/user", {
            credentials: "same-origin",
            headers: {
                Accept: "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.user) {
                    setUser({
                        name: data.user.name,
                        email: data.user.email,
                        role: data.user.role,
                    });
                }
            })
            .catch(() => setUser(null));
    }, []);

    useEffect(() => {
        setNotifLoading(true);
        fetch("/api/notif-navbar", {
            credentials: "same-origin",
            headers: {
                Accept: "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.notifications) {
                    setNotifications(data.notifications);
                    // Check if all notifications are read
                    // const allRead = data.notifications.every(
                    //     (n: any) => n.read
                    // );
                    // setNotifRead(allRead);
                }
            })
            .catch((error) => {
                console.error("Error fetching notifications:", error);
            })
            .finally(() => setNotifLoading(false));
    }, []);

    // Helper to format time ago
    function timeAgo(dateString: string) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (diff < 60) return `${diff} detik yang lalu`;
        if (diff < 3600) return `${Math.floor(diff / 60)} menit yang lalu`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} jam yang lalu`;
        return `${Math.floor(diff / 86400)} hari yang lalu`;
    }

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
                            {/* Badge tampil hanya jika ada notif belum dibaca */}
                            {notifications.length > 0 &&
                                notifications.some((n) => !n.read) && (
                                    <span
                                        className="notification-badge"
                                        style={{
                                            position: "absolute",
                                            top: "-6px",
                                            right: "-6px",
                                            minWidth: "22px",
                                            height: "22px",
                                            background: "#e53935",
                                            color: "#fff",
                                            borderRadius: "50%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "13px",
                                            fontWeight: 700,
                                            boxShadow: "0 0 0 2px #fff",
                                            zIndex: 2,
                                            padding: "0 6px",
                                            border: "2px solid #fff",
                                            transition: "opacity 0.2s",
                                        }}
                                    >
                                        {
                                            notifications.filter((n) => !n.read)
                                                .length
                                        }
                                    </span>
                                )}
                        </button>

                        {/* Notification dropdown */}
                        {notificationOpen && (
                            <div className="dropdown notification-dropdown">
                                <div className="dropdown-header">
                                    <h3 className="dropdown-title">
                                        Notifikasi Pengajuan Masuk
                                    </h3>
                                </div>
                                <div className="dropdown-content">
                                    {notifLoading ? (
                                        <div className="notification-item">
                                            Memuat notifikasi...
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="notification-item">
                                            Tidak ada notifikasi baru
                                        </div>
                                    ) : (
                                        notifications.map((notif, idx) => (
                                            <div
                                                className="notification-item"
                                                key={idx}
                                            >
                                                <p className="notification-title">
                                                    [{notif.type}] {notif.title}
                                                </p>
                                                <p className="notification-time">
                                                    {timeAgo(notif.created_at)}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="dropdown-footer">
                                    <button
                                        className="dropdown-footer-button"
                                        onClick={async () => {
                                            setNotifLoading(true);
                                            try {
                                                await fetch(
                                                    "/api/notif-navbar/mark-all-read",
                                                    {
                                                        method: "POST",
                                                        credentials:
                                                            "same-origin",
                                                        headers: {
                                                            "Content-Type":
                                                                "application/json",
                                                            Accept: "application/json",
                                                        },
                                                    }
                                                );

                                                // Update local state immediately to remove badge
                                                const updatedNotifications =
                                                    notifications.map(
                                                        (notif) => ({
                                                            ...notif,
                                                            read: true,
                                                        })
                                                    );
                                                setNotifications(
                                                    updatedNotifications
                                                );
                                                // setNotifRead(true);
                                                setNotificationOpen(false);
                                            } catch (error) {
                                                console.error(
                                                    "Error marking notifications as read:",
                                                    error
                                                );
                                            } finally {
                                                setNotifLoading(false);
                                            }
                                        }}
                                    >
                                        Tandai semua sudah dibaca
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
                                        {user ? user.name : "User"}
                                    </p>
                                    <p className="dropdown-subtitle">
                                        {user ? user.email : "admin@siluk.com"}
                                    </p>
                                    <p className="dropdown-subtitle">
                                        Role: {user ? user.role : "User"}
                                    </p>
                                </div>
                                <button
                                    className="dropdown-item"
                                    onClick={() => {
                                        window.location.href = "/profile-user";
                                    }}
                                >
                                    <User className="dropdown-item-icon" />
                                    Profil
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
