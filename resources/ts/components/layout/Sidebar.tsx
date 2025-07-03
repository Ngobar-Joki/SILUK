import React, { useState, useEffect } from "react";
import {
    Home,
    Users,
    FileText,
    Settings,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import "../../../css/Sidebar.css";

interface SidebarProps {
    className?: string;
    onStateChange?: (collapsed: boolean, mobileOpen: boolean) => void;
    isOpen?: boolean;
    onToggle?: () => void;
}

interface MenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    href: string;
    badge?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
    className = "",
    onStateChange,
    isOpen = false,
    onToggle,
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems: MenuItem[] = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: <Home size={20} />,
            href: "/dashboard",
        },
        {
            id: "users",
            label: "Users",
            icon: <Users size={20} />,
            href: "/users",
            badge: "12",
        },
        {
            id: "documents",
            label: "Documents",
            icon: <FileText size={20} />,
            href: "/documents",
        },
        {
            id: "settings",
            label: "Settings",
            icon: <Settings size={20} />,
            href: "/settings",
        },
    ];

    useEffect(() => {
        onStateChange?.(isCollapsed, isOpen);
    }, [isCollapsed, isOpen, onStateChange]);

    const handleDesktopToggle = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="sidebar-mobile-overlay"
                    onClick={onToggle}
                />
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
                    {menuItems.map((item) => (
                        <a
                            key={item.id}
                            href={item.href}
                            className={`
                            sidebar-nav-item
                            ${isCollapsed ? "sidebar-nav-item--collapsed" : ""}
                        `}
                        >
                            <span className="sidebar-nav-icon">
                                {item.icon}
                            </span>

                            {!isCollapsed && (
                                <>
                                    <span className="sidebar-nav-label">
                                        {item.label}
                                    </span>
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
                        </a>
                    ))}
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    <div
                        className={`sidebar-user ${
                            isCollapsed ? "sidebar-user--collapsed" : ""
                        }`}
                    >
                        <div className="sidebar-avatar">
                            <span className="sidebar-avatar-text">JD</span>
                        </div>
                        {!isCollapsed && (
                            <div className="sidebar-user-info">
                                <p className="sidebar-user-name">John Doe</p>
                                <p className="sidebar-user-email">
                                    john@example.com
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
              