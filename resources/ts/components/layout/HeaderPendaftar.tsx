import React from "react";

interface HeaderPendaftarProps {
    theme: string;
    toggleTheme: () => void;
    isScrolled: boolean;
    activeSection: string;
    handleNavClick: (
        e: React.MouseEvent<HTMLAnchorElement>,
        sectionId: string
    ) => void;
    setIsMenuOpen: (open: boolean) => void;
    isMenuOpen: boolean;
}

const HeaderPendaftar: React.FC<HeaderPendaftarProps> = ({
    theme,
    toggleTheme,
    isScrolled,
    activeSection,
    handleNavClick,
    setIsMenuOpen,
    isMenuOpen,
}) => (
    <header className={`header ${isScrolled ? "header-scrolled" : ""}`}>
        <div className="container">
            <div className="header-content">
                <div className="logo-container">
                    <div className="logo">
                        <span>S</span>
                    </div>
                    <div>
                        <h1 className="logo-text">SILUK</h1>
                        <p className="logo-subtitle">Sistem Layanan Koperasi</p>
                    </div>
                </div>
                {/* Hamburger menu untuk mobile */}
                <div
                    className="mobile-menu-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <div className={`hamburger ${isMenuOpen ? "active" : ""}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
                {/* Navigasi desktop */}
                <nav className="desktop-nav">
                    <ul>
                        <li
                            className={activeSection === "home" ? "active" : ""}
                        >
                            <a
                                href="#home"
                                onClick={(e) => handleNavClick(e, "home")}
                            >
                                Beranda
                            </a>
                        </li>
                        <li
                            className={
                                activeSection === "pendaftaran" ? "active" : ""
                            }
                        >
                            <a
                                href="#pendaftaran"
                                onClick={(e) =>
                                    handleNavClick(e, "pendaftaran")
                                }
                            >
                                Pendaftaran
                            </a>
                        </li>
                        <li
                            className={
                                activeSection === "laporan" ? "active" : ""
                            }
                        >
                            <a
                                href="#laporan"
                                onClick={(e) => handleNavClick(e, "laporan")}
                            >
                                Laporan
                            </a>
                        </li>
                        <li
                            className={
                                activeSection === "struktur" ? "active" : ""
                            }
                        >
                            <a
                                href="#struktur"
                                onClick={(e) => handleNavClick(e, "struktur")}
                            >
                                Struktur
                            </a>
                        </li>
                        <li
                            className={activeSection === "visi" ? "active" : ""}
                        >
                            <a
                                href="#visi"
                                onClick={(e) => handleNavClick(e, "visi")}
                            >
                                Visi & Misi
                            </a>
                        </li>
                        <li
                            className={
                                activeSection === "berita" ? "active" : ""
                            }
                        >
                            <a
                                href="#berita"
                                onClick={(e) => handleNavClick(e, "berita")}
                            >
                                Berita
                            </a>
                        </li>
                        {/* Tidak ada tombol login di sini */}
                        <li>
                            <button
                                className="theme-toggle-button"
                                onClick={toggleTheme}
                                aria-label={
                                    theme === "dark"
                                        ? "Switch to light mode"
                                        : "Switch to dark mode"
                                }
                            >
                                {theme === "dark" ? "☀️" : "🌙"}
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div
                    className="mobile-overlay"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ display: isMenuOpen ? "block" : "none" }}
                />
            )}
            {/* Navigasi mobile */}
            <div className={`mobile-nav ${isMenuOpen ? "open" : ""}`}>
                <ul>
                    <li>
                        <a
                            href="#home"
                            onClick={(e) => handleNavClick(e, "home")}
                        >
                            Beranda
                        </a>
                    </li>
                    <li>
                        <a
                            href="#pendaftaran"
                            onClick={(e) => handleNavClick(e, "pendaftaran")}
                        >
                            Pendaftaran
                        </a>
                    </li>
                    <li>
                        <a
                            href="#laporan"
                            onClick={(e) => handleNavClick(e, "laporan")}
                        >
                            Laporan Bulanan
                        </a>
                    </li>
                    <li>
                        <a
                            href="#struktur"
                            onClick={(e) => handleNavClick(e, "struktur")}
                        >
                            Struktur Organisasi
                        </a>
                    </li>
                    <li>
                        <a
                            href="#visi"
                            onClick={(e) => handleNavClick(e, "visi")}
                        >
                            Visi & Misi
                        </a>
                    </li>
                    <li>
                        <a
                            href="#berita"
                            onClick={(e) => handleNavClick(e, "berita")}
                        >
                            Berita
                        </a>
                    </li>
                    {/* Tidak ada tombol login di sini */}
                    <li className="theme-toggle-mobile">
                        <button
                            onClick={toggleTheme}
                            aria-label={
                                theme === "dark"
                                    ? "Switch to light mode"
                                    : "Switch to dark mode"
                            }
                        >
                            {theme === "dark"
                                ? "Mode Terang ☀️"
                                : "Mode Gelap 🌙"}
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    </header>
);

export default HeaderPendaftar;
