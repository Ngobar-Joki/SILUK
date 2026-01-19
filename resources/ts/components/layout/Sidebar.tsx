import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Home,
    Users,
    // Settings,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Building,
    Target,
    Newspaper,
} from "lucide-react";
import "../../../css/Sidebar.css";

interface SidebarProps {
    className?: string;
    onStateChange?: (collapsed: boolean, mobileOpen: boolean) => void;
    isOpen?: boolean;
    onToggle?: () => void;
}

interface SubMenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    href: string;
}

interface MenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    href?: string;
    badge?: string;
    submenu?: SubMenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({
    className = "",
    onStateChange,
    isOpen = false,
    onToggle,
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [user, setUser] = useState<{
        name: string;
        email: string;
        role?: string;
    } | null>(null);
    const location = useLocation();

    const menuItems: MenuItem[] = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: <Home size={20} />,
            href: "/dashboard",
        },

        {
            id: "permohonan",
            label: "Daftar Permohonan",
            icon: <Newspaper size={20} />,
            href: "/daftar-permohonan",
        },

        {
            id: "laporan",
            label: "Laporan",
            icon: <Newspaper size={20} />,
            href: "/daftar-laporan",
        },
        {
            id: "management",
            label: "Management",
            icon: <Building size={20} />,
            submenu: [
                ...(user?.role === "operator"
                    ? [
                          {
                              id: "users",
                              label: "Users",
                              icon: <Users size={18} />,
                              href: "/daftar-user",
                          },
                          {
                              id: "visimisi",
                              label: "Visi Misi",
                              icon: <Target size={18} />,
                              href: "/visi-misi",
                          },
                          {
                              id: "strukturOrganisasi",
                              label: "Struktur Organisasi",
                              icon: <Building size={18} />,
                              href: "/struktur-organisasi",
                          },
                          {
                              id: "berita",
                              label: "Berita",
                              icon: <Newspaper size={18} />,
                              href: "/berita",
                          },
                      ]
                    : []),
                {
                    id: "profile",
                    label: "Profile",
                    icon: <Users size={20} />,
                    href: "/profile-user",
                },
            ],
        },
    ];

    useEffect(() => {
        onStateChange?.(isCollapsed, isOpen);
    }, [isCollapsed, isOpen, onStateChange]);

    // Fetch user data saat mount
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
            .catch(() => {
                setUser(null);
            });
    }, []);

    const handleDesktopToggle = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleDropdownToggle = (itemId: string) => {
        if (isCollapsed) return;
        setOpenDropdown(openDropdown === itemId ? null : itemId);
    };

    const isSubmenuActive = (submenu: SubMenuItem[]) => {
        return submenu.some((item) => location.pathname === item.href);
    };

    const renderMenuItem = (item: MenuItem) => {
        const hasSubmenu = item.submenu && item.submenu.length > 0;
        const isDropdownOpen = openDropdown === item.id;
        const isActive = item.href
            ? location.pathname === item.href
            : hasSubmenu && isSubmenuActive(item.submenu!);

        if (hasSubmenu) {
            return (
                <div key={item.id} className="sidebar-nav-dropdown">
                    <div
                        className={`
                            sidebar-nav-item
                            sidebar-nav-item--dropdown
                            ${isCollapsed ? "sidebar-nav-item--collapsed" : ""}
                            ${isActive ? "sidebar-nav-item--active" : ""}
                            ${isDropdownOpen ? "sidebar-nav-item--open" : ""}
                        `}
                        onClick={() => handleDropdownToggle(item.id)}
                    >
                        <span className="sidebar-nav-icon">{item.icon}</span>

                        {!isCollapsed && (
                            <>
                                <span className="sidebar-nav-label">
                                    {item.label}
                                </span>
                                <span className="sidebar-nav-arrow">
                                    <ChevronDown size={16} />
                                </span>
                            </>
                        )}

                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                            <div className="sidebar-tooltip">{item.label}</div>
                        )}
                    </div>

                    {/* Submenu */}
                    {!isCollapsed && (
                        <div
                            className={`sidebar-submenu ${
                                isDropdownOpen ? "sidebar-submenu--open" : ""
                            }`}
                        >
                            {item.submenu!.map((subItem) => (
                                <Link
                                    key={subItem.id}
                                    to={subItem.href}
                                    className={`
                                        sidebar-submenu-item
                                        ${
                                            location.pathname === subItem.href
                                                ? "sidebar-submenu-item--active"
                                                : ""
                                        }
                                    `}
                                >
                                    <span className="sidebar-submenu-icon">
                                        {subItem.icon}
                                    </span>
                                    <span className="sidebar-submenu-label">
                                        {subItem.label}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        // Regular menu item
        return (
            <Link
                key={item.id}
                to={item.href!}
                className={`
                    sidebar-nav-item
                    ${isCollapsed ? "sidebar-nav-item--collapsed" : ""}
                    ${isActive ? "sidebar-nav-item--active" : ""}
                `}
            >
                <span className="sidebar-nav-icon">{item.icon}</span>

                {!isCollapsed && (
                    <>
                        <span className="sidebar-nav-label">{item.label}</span>
                        {item.badge && (
                            <span className="sidebar-nav-badge">
                                {item.badge}
                            </span>
                        )}
                    </>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                    <div className="sidebar-tooltip">
                        {item.label}
                        {item.badge && (
                            <span className="sidebar-tooltip-badge">
                                {item.badge}
                            </span>
                        )}
                    </div>
                )}
            </Link>
        );
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div className="sidebar-mobile-overlay" onClick={onToggle} />
            )}

            {/* Sidebar */}
            <aside
                className={`
                sidebar
                ${isCollapsed ? "sidebar--collapsed" : "sidebar--expanded"}
                ${isOpen ? "sidebar--mobile-open" : "sidebar--mobile-closed"}
                ${className}
            `}
            >
                {/* Header */}
                <div className="sidebar-header">
                    <div
                        className={`sidebar-brand ${
                            isCollapsed ? "sidebar-brand--collapsed" : ""
                        }`}
                    >
                        <div className="sidebar-logo">
                            <span className="sidebar-logo-text">S</span>
                        </div>
                        {!isCollapsed && (
                            <h1 className="sidebar-title">SILUK</h1>
                        )}
                    </div>

                    {/* Collapse Button - Desktop only */}
                    <button
                        onClick={handleDesktopToggle}
                        className="sidebar-collapse-btn"
                    >
                        {isCollapsed ? (
                            <ChevronRight size={16} />
                        ) : (
                            <ChevronLeft size={16} />
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {menuItems.map(renderMenuItem)}
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    <div
                        className={`sidebar-user ${
                            isCollapsed ? "sidebar-user--collapsed" : ""
                        }`}
                    >
                        <div className="sidebar-avatar">
                            <span className="sidebar-avatar-text">
                                {/* Inisial dari nama user */}
                                {user && user.name
                                    ? user.name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")
                                          .toUpperCase()
                                    : "U"}
                            </span>
                        </div>
                        {!isCollapsed && (
                            <div className="sidebar-user-info">
                                <p className="sidebar-user-name">
                                    {user ? user.name : "Loading..."}
                                </p>
                                <p className="sidebar-user-email">
                                    {user ? user.email : ""}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
