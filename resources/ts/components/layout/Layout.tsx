import React, { useState, useCallback, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "../../../css/Layout.css";



interface LayoutProps {
    children: React.ReactNode;
    title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

    // Handle responsive behavior
    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth < 1024; // lg breakpoint
            setIsMobile(mobile);

            // Auto-close sidebar on mobile when screen size changes
            if (mobile && sidebarOpen) {
                setSidebarOpen(false);
            }
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);

        return () => window.removeEventListener("resize", checkScreenSize);
    }, [sidebarOpen]);

    // Handle escape key to close sidebar
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && sidebarOpen) {
                setSidebarOpen(false);
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [sidebarOpen]);

    // Set page title
    useEffect(() => {
        if (title) {
            document.title = `${title} - SILUK`;
        } else {
            document.title = "SILUK";
        }
    }, [title]);

    const handleSidebarStateChange = useCallback(
        (collapsed: boolean, _mobileOpen: boolean) => {
            setSidebarCollapsed(collapsed);
        },
        []
    );

    const handleMenuClick = useCallback(() => {
        // On mobile, toggle sidebar
        if (window.innerWidth < 1024) {
            setSidebarMobileOpen(!sidebarMobileOpen);
        } else {
            // On desktop, toggle collapse
            setSidebarCollapsed(!sidebarCollapsed);
        }
    }, [sidebarMobileOpen, sidebarCollapsed]);

    const handleSidebarToggle = useCallback(() => {
        setSidebarMobileOpen(false);
    }, []);

    return (
        <div className="layout">
            {/* Sidebar */}
            <Sidebar
                onStateChange={handleSidebarStateChange}
                isOpen={sidebarMobileOpen}
                onToggle={handleSidebarToggle}
            />

            {/* Header */}
            <Header
                onMenuClick={handleMenuClick}
                sidebarCollapsed={sidebarCollapsed}
                sidebarOpen={sidebarMobileOpen}
            />

            {/* Main content area */}
            <main
                className={`
          transition-all duration-300 pt-16 main-content
          ${
              sidebarCollapsed && !isMobile
                  ? "main-content--sidebar-collapsed"
                  : "main-content--sidebar-expanded"
          }
        `}
            >
            
                {/* Page content */}
                <div className="p-4 lg:p-6">
                    <div className="max-w-7xl mx-auto">{children}</div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
