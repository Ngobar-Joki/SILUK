import React, { useState, useEffect, useRef } from "react";

// Import CSS untuk animasi custom
import ChatWidget from "../components/ChatWidget";
import "../../css/animations.css";


interface ThemeContextType {
    theme: string;
    toggleTheme: () => void;
}

// Context untuk tema dark/light mode
const ThemeContext = React.createContext<ThemeContextType>({
    theme: "light",
    toggleTheme: () => {},
});

// Provider theme yang akan digunakan di seluruh aplikasi
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    // Mengecek preferensi tema dari localStorage atau sistem
    const getInitialTheme = () => {
        if (typeof window !== "undefined" && window.localStorage) {
            const storedPrefs = window.localStorage.getItem("theme");
            if (typeof storedPrefs === "string") {
                return storedPrefs;
            }

            const userMedia = window.matchMedia("(prefers-color-scheme: dark)");
            if (userMedia.matches) {
                return "dark";
            }
        }

        return "light"; // tema default light
    };

    const [theme, setTheme] = useState(getInitialTheme);

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    useEffect(() => {
        const root = window.document.documentElement;
        const body = window.document.body;

        // Remove previous theme classes
        root.classList.remove("light", "dark", "light-mode", "dark-mode");
        body.classList.remove("light", "dark", "light-mode", "dark-mode");

        // Add current theme classes
        root.classList.add(theme);
        body.classList.add(theme === "dark" ? "dark-mode" : "light-mode");

        localStorage.setItem("theme", theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Hook untuk menggunakan theme context
const useTheme = () => {
    const context = React.useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};

const Welcome: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("home");
    const [parallaxOffset, setParallaxOffset] = useState(0);
    const [isRegistrationInView, setIsRegistrationInView] = useState(false);
    const sectionRefs = {
        home: useRef<HTMLElement>(null),
        pendaftaran: useRef<HTMLElement>(null),
        laporan: useRef<HTMLElement>(null),
        struktur: useRef<HTMLElement>(null),
        visi: useRef<HTMLElement>(null),
        berita: useRef<HTMLElement>(null),
    };

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            setIsScrolled(scrollY > 50);

            // Parallax effect for registration section (only if in view)
            if (sectionRefs.pendaftaran.current && isRegistrationInView) {
                const rect =
                    sectionRefs.pendaftaran.current.getBoundingClientRect();
                const isInView =
                    rect.top < window.innerHeight && rect.bottom > 0;

                if (isInView) {
                    const parallaxSpeed = 0.5;
                    const offset =
                        (window.innerHeight - rect.top) * parallaxSpeed;
                    setParallaxOffset(offset);
                }
            }

            // Update active section based on scroll position
            const scrollPosition = scrollY + 100;

            const activeSectionName = Object.entries(sectionRefs).find(
                ([_, ref]) => {
                    if (!ref.current) return false;
                    const offsetTop = ref.current.offsetTop;
                    const offsetHeight = ref.current.offsetHeight;

                    return (
                        scrollPosition >= offsetTop &&
                        scrollPosition < offsetTop + offsetHeight
                    );
                }
            )?.[0];

            if (activeSectionName) {
                setActiveSection(activeSectionName);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isRegistrationInView]);

    // Intersection Observer for registration section
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsRegistrationInView(entry.isIntersecting);
            },
            {
                threshold: 0.1,
                rootMargin: "100px 0px",
            }
        );

        if (sectionRefs.pendaftaran.current) {
            observer.observe(sectionRefs.pendaftaran.current);
        }

        return () => {
            if (sectionRefs.pendaftaran.current) {
                observer.unobserve(sectionRefs.pendaftaran.current);
            }
        };
    }, []);

    // Animasi mengetik untuk hero section
    const [displayText, setDisplayText] = useState("");
    const fullText = "Solusi Keuangan Digital";
    const typingSpeed = 150;

    useEffect(() => {
        if (displayText.length < fullText.length) {
            const timeout = setTimeout(() => {
                setDisplayText(fullText.slice(0, displayText.length + 1));
            }, typingSpeed);
            return () => clearTimeout(timeout);
        }
    }, [displayText]);

    // Data statistik
    const stats = [
        {
            number: "5,000+",
            label: "Anggota Aktif",
        },
        {
            number: "Rp 50M+",
            label: "Total Aset",
        },
        {
            number: "15+",
            label: "Tahun Berpengalaman",
        },
        {
            number: "99%",
            label: "Kepuasan Anggota",
        },
    ];

    // Smooth scroll to section
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 80,
                behavior: "smooth",
            });
            setIsMenuOpen(false); // Close mobile menu after clicking
        }
    };

    // Handle navigation click
    const handleNavClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        sectionId: string
    ) => {
        e.preventDefault();
        scrollToSection(sectionId);
    };

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (
                isMenuOpen &&
                !target.closest(".mobile-nav") &&
                !target.closest(".mobile-menu-toggle")
            ) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [isMenuOpen]);

    // Ubah inisialisasi state user menjadi null
    const [user, setUser] = useState<{ name: string; role: string } | null>(
        null
    );
    const [isLoading, setIsLoading] = useState(true);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    // Tambahkan fungsi untuk mengecek status autentikasi
    const checkAuthStatus = async () => {
        try {
            const response = await fetch("/api/user", {
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setUser({
                        name: data.user.name,
                        role: data.user.role,
                    });
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Auth check error:", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Panggil checkAuthStatus saat komponen dimount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Update handleLogout untuk memanggil checkAuthStatus
    const handleLogout = async () => {
        try {
            const csrf = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");

            const response = await fetch("/logout", {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": csrf || "",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "include",
            });

            if (response.ok) {
                setProfileDropdownOpen(false);
                setUser(null);
                window.location.href = "/";
            } else {
                const error = await response.json();
                throw new Error(error.message || "Logout failed");
            }
        } catch (error) {
            console.error("Logout error:", error);
            alert("Logout gagal. Silakan coba lagi.");
        }
    };

    // Render kondisional untuk tombol login/profile
    const renderAuthButton = () => {
        if (isLoading) {
            return null; // atau loading spinner jika diinginkan
        }

        if (!user) {
            return (
                <li>
                    <a href="/login" className="login-button">
                        Masuk
                    </a>
                </li>
            );
        }

        return (
            <li style={{
                position: 'relative',
                listStyle: 'none'
            }}>
                <button
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem'
                    }}
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                    <span style={{
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '50%',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                    }}>
                        {user.name.charAt(0)}
                    </span>
                </button>
                {profileDropdownOpen && (
                    <div style={{
                        position: 'absolute',
                        right: 0,
                        marginTop: '0.5rem',
                        width: '12rem',
                        backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
                        borderRadius: '0.5rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        padding: '0.5rem 0',
                        zIndex: 50
                    }}>
                        <div style={{
                            padding: '0.75rem 1rem',
                            borderBottom: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
                        }}>
                            <p style={{
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: theme === 'dark' ? 'white' : '#111827'
                            }}>
                                {user.name}
                            </p>
                            <p style={{
                                fontSize: '0.75rem',
                                color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                            }}>
                                {user.role}
                            </p>
                        </div>
                        <a
                            href="/profile-pendaftar"
                            style={{
                                display: 'block',
                                padding: '0.5rem 1rem',
                                fontSize: '0.875rem',
                                color: theme === 'dark' ? 'white' : '#111827',
                                textDecoration: 'none'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <span style={{marginRight: '0.5rem'}}>👤</span>
                            Profile
                        </a>
                        
                        <div style={{
                            borderTop: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                            margin: '0.5rem 0'
                        }}></div>
                        <button
                            onClick={handleLogout}
                            style={{
                                display: 'block',
                                width: '100%',
                                textAlign: 'left',
                                padding: '0.5rem 1rem',
                                fontSize: '0.875rem',
                                color: '#dc2626',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <span style={{marginRight: '0.5rem'}}>🔓</span>
                            Keluar
                        </button>
                    </div>
                )}
            </li>
        );
    };

    return (
        <div
            className={`min-h-screen ${
                theme === "dark" ? "dark-mode" : "light-mode"
            }`}
        >
            {/* Header */}
            <header className={`header ${isScrolled ? "header-scrolled" : ""}`}>
                <div className="container">
                    <div className="header-content">
                        <div className="logo-container">
                            <div className="logo">
                                <span>S</span>
                            </div>
                            <div>
                                <h1 className="logo-text">SILUK</h1>
                                <p className="logo-subtitle">
                                    Sistem Layanan Koperasi
                                </p>
                            </div>
                        </div>

                        {/* Hamburger menu untuk mobile */}
                        <div
                            className="mobile-menu-toggle"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <div
                                className={`hamburger ${
                                    isMenuOpen ? "active" : ""
                                }`}
                            >
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>

                        {/* Navigasi desktop */}
                        <nav className="desktop-nav">
                            <ul>
                                {/* ...existing nav items... */}
                                <li
                                    className={
                                        activeSection === "home" ? "active" : ""
                                    }
                                >
                                    <a
                                        href="#home"
                                        onClick={(e) =>
                                            handleNavClick(e, "home")
                                        }
                                    >
                                        Beranda
                                    </a>
                                </li>
                                <li
                                    className={
                                        activeSection === "pendaftaran"
                                            ? "active"
                                            : ""
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
                                {user && ( // Only show Pengajuan when logged in
                                    <li>
                                        <a
                                            href="/pengajuan"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem'
                                            }}
                                        >
                                            Pengajuan
                                        </a>
                                    </li>
                                )}
                                <li
                                    className={
                                        activeSection === "laporan"
                                            ? "active"
                                            : ""
                                    }
                                >
                                    <a
                                        href="#laporan"
                                        onClick={(e) =>
                                            handleNavClick(e, "laporan")
                                        }
                                    >
                                        Laporan
                                    </a>
                                </li>
                                <li
                                    className={
                                        activeSection === "struktur"
                                            ? "active"
                                            : ""
                                    }
                                >
                                    <a
                                        href="#struktur"
                                        onClick={(e) =>
                                            handleNavClick(e, "struktur")
                                        }
                                    >
                                        Struktur
                                    </a>
                                </li>
                                <li
                                    className={
                                        activeSection === "visi" ? "active" : ""
                                    }
                                >
                                    <a
                                        href="#visi"
                                        onClick={(e) =>
                                            handleNavClick(e, "visi")
                                        }
                                    >
                                        Visi & Misi
                                    </a>
                                </li>
                                <li
                                    className={
                                        activeSection === "berita"
                                            ? "active"
                                            : ""
                                    }
                                >
                                    <a
                                        href="#berita"
                                        onClick={(e) =>
                                            handleNavClick(e, "berita")
                                        }
                                    >
                                        Berita
                                    </a>
                                </li>
                                {/* Ganti tombol Masuk dengan dropdown jika login sebagai pendaftar */}
                                {renderAuthButton()}
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
                                    onClick={(e) =>
                                        handleNavClick(e, "pendaftaran")
                                    }
                                >
                                    Pendaftaran
                                </a>
                            </li>
                            {user && ( // Only show Pengajuan when logged in
                                <li>
                                    <a
                                        href="/pengajuan" 
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem'
                                        }}
                                    >
                                        Pengajuan
                                    </a>
                                </li>
                            )}
                            <li>
                                <a
                                    href="#laporan"
                                    onClick={(e) =>
                                        handleNavClick(e, "laporan")
                                    }
                                >
                                    Laporan Bulanan
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#struktur"
                                    onClick={(e) =>
                                        handleNavClick(e, "struktur")
                                    }
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
                            {/* Ganti tombol Masuk dengan dropdown jika login sebagai pendaftar */}
                            {!user ? (
                                <li>
                                    <a
                                        href="/login"
                                        className="mobile-login-button"
                                    >
                                        Masuk
                                    </a>
                                </li>
                            ) : (
                                <li style={{
                                    position: 'relative',
                                    listStyle: 'none'
                                }}>
                                    <button
                                        style={{
                                            display: 'flex', 
                                            alignItems: 'center',
                                            width: '100%',
                                            padding: '0.5rem 1rem',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                    >
                                        <span style={{
                                            width: '2rem',
                                            height: '2rem',
                                            borderRadius: '50%',
                                            backgroundColor: '#2563eb',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            marginRight: '0.75rem'
                                        }}>
                                            {user.name.charAt(0)}
                                        </span>
                                        <span style={{
                                            fontSize: '0.875rem',
                                            color: theme === 'dark' ? 'white' : '#111827'
                                        }}>
                                            {user.name}
                                        </span>
                                    </button>
                                    {profileDropdownOpen && (
                                        <div style={{
                                            backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
                                            padding: '0.5rem 0',
                                            width: '100%'
                                        }}>
                                            <div style={{
                                                padding: '0.75rem 1rem',
                                                borderBottom: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
                                            }}>
                                                <p style={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: '500',
                                                    color: theme === 'dark' ? 'white' : '#111827'
                                                }}>
                                                    {user.name}
                                                </p>
                                                <p style={{
                                                    fontSize: '0.75rem',
                                                    color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                                                }}>
                                                    {user.role}
                                                </p>
                                            </div>
                                            <a
                                                href="/profile"
                                                style={{
                                                    display: 'block',
                                                    padding: '0.5rem 1rem',
                                                    fontSize: '0.875rem',
                                                    color: theme === 'dark' ? 'white' : '#111827',
                                                    textDecoration: 'none'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <span style={{marginRight: '0.5rem'}}>👤</span>
                                                Profile
                                            </a>
                                            
                                            <div style={{
                                                borderTop: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                                                margin: '0.5rem 0'
                                            }}></div>
                                            <button
                                                onClick={handleLogout}
                                                style={{
                                                    display: 'block',
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    padding: '0.5rem 1rem',
                                                    fontSize: '0.875rem',
                                                    color: '#dc2626',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <span style={{marginRight: '0.5rem'}}>🔓</span>
                                                Keluar
                                            </button>
                                        </div>
                                    )}
                                </li>
                            )}
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

            {/* Hero Section */}
            <section id="home" ref={sectionRefs.home} className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-text">
                            <h1 className="hero-title">
                                Wujudkan Impian{" "}
                                <span className="gradient-text">
                                    Bersama Koperasi
                                </span>
                            </h1>
                            <div className="typing-container">
                                <h2 className="typing-text">
                                    {displayText}
                                    <span className="cursor">|</span>
                                </h2>
                            </div>
                            <p className="hero-subtitle">
                                Platform digital terpercaya untuk mengelola
                                keuangan, simpanan, pinjaman, dan investasi Anda
                                dengan mudah, aman, dan transparan.
                            </p>
                            <div className="hero-buttons">
                                <a href="/login" className="primary-button">
                                    <span>Mulai Sekarang</span>
                                    <span className="button-arrow">→</span>
                                </a>
                                <button className="secondary-button">
                                    Pelajari Lebih Lanjut
                                </button>
                            </div>
                        </div>
                        <div className="hero-image">
                            <div className="image-container">
                                <div className="floating-card card-1">
                                    <div className="card-icon">💰</div>
                                    <div className="card-text">
                                        Transaksi Aman
                                    </div>
                                </div>
                                <div className="floating-card card-2">
                                    <div className="card-icon">📱</div>
                                    <div className="card-text">Akses 24/7</div>
                                </div>
                                <div className="floating-card card-3">
                                    <div className="card-icon">🔒</div>
                                    <div className="card-text">
                                        Keamanan Terjamin
                                    </div>
                                </div>
                                <div className="hero-blob"></div>
                                <div className="hero-circle"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="wave-divider">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1440 320"
                    >
                        <path
                            className="wave-path"
                            fillOpacity="1"
                            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                        ></path>
                    </svg>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-card">
                                <div className="stat-number">{stat.number}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Registration Section with Track */}
            <section
                id="pendaftaran"
                ref={sectionRefs.pendaftaran}
                className="registration-section"
                style={{
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Parallax Background Elements */}
                <div
                    className="parallax-bg-elements"
                    style={{
                        transform: `translateY(${parallaxOffset * 0.3}px)`,
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 0,
                        pointerEvents: "none",
                    }}
                >
                    <div className="floating-shape shape-1"></div>
                    <div className="floating-shape shape-2"></div>
                    <div className="floating-shape shape-3"></div>
                    <div className="floating-shape shape-4"></div>
                </div>

                <div
                    className="container"
                    style={{ position: "relative", zIndex: 1 }}
                >
                    <div
                        className="section-header"
                        style={{
                            transform: `translateY(${parallaxOffset * 0.1}px)`,
                        }}
                    >
                        <h2>Proses Pendaftaran</h2>
                        <div className="section-line"></div>
                        <p>
                            Bergabunglah dengan koperasi dalam 4 langkah mudah
                        </p>
                    </div>

                    <div
                        className="registration-track"
                        style={{
                            transform: `translateY(${parallaxOffset * 0.05}px)`,
                        }}
                    >
                        <div className="track-line"></div>

                        <div
                            className="track-step"
                            data-step="1"
                            style={{
                                transform: `translateY(${
                                    parallaxOffset * 0.08
                                }px)`,
                            }}
                        >
                            <div className="step-circle">
                                <div className="step-icon">📝</div>
                            </div>
                            <div className="step-content">
                                <h3>Isi Formulir</h3>
                                <p>
                                    Lengkapi data diri dan dokumen yang
                                    diperlukan
                                </p>
                                <ul>
                                    <li>KTP yang masih berlaku</li>
                                    <li>Kartu Keluarga</li>
                                    <li>Pas foto 3x4</li>
                                    <li>NPWP (opsional)</li>
                                </ul>
                            </div>
                        </div>

                        <div
                            className="track-step"
                            data-step="2"
                            style={{
                                transform: `translateY(${
                                    parallaxOffset * 0.06
                                }px)`,
                            }}
                        >
                            <div className="step-circle">
                                <div className="step-icon">💰</div>
                            </div>
                            <div className="step-content">
                                <h3>Bayar Simpanan Pokok</h3>
                                <p>
                                    Setorkan simpanan pokok sebesar Rp 100.000
                                </p>
                                <ul>
                                    <li>Transfer bank</li>
                                    <li>Pembayaran tunai</li>
                                    <li>E-wallet</li>
                                    <li>Cicilan (tersedia)</li>
                                </ul>
                            </div>
                        </div>

                        <div
                            className="track-step"
                            data-step="3"
                            style={{
                                transform: `translateY(${
                                    parallaxOffset * 0.04
                                }px)`,
                            }}
                        >
                            <div className="step-circle">
                                <div className="step-icon">✅</div>
                            </div>
                            <div className="step-content">
                                <h3>Verifikasi</h3>
                                <p>
                                    Tim kami akan memverifikasi dokumen dalam
                                    1-2 hari
                                </p>
                                <ul>
                                    <li>Pengecekan dokumen</li>
                                    <li>Konfirmasi data</li>
                                    <li>Validasi pembayaran</li>
                                    <li>Notifikasi WhatsApp</li>
                                </ul>
                            </div>
                        </div>

                        <div
                            className="track-step"
                            data-step="4"
                            style={{
                                transform: `translateY(${
                                    parallaxOffset * 0.02
                                }px)`,
                            }}
                        >
                            <div className="step-circle">
                                <div className="step-icon">🎉</div>
                            </div>
                            <div className="step-content">
                                <h3>Anggota Resmi</h3>
                                <p>
                                    Selamat! Anda resmi menjadi anggota koperasi
                                </p>
                                <ul>
                                    <li>Kartu anggota digital</li>
                                    <li>Akses aplikasi mobile</li>
                                    <li>Buku simpanan digital</li>
                                    <li>Konsultasi gratis</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div
                        className="registration-cta"
                        style={{
                            transform: `translateY(${parallaxOffset * 0.03}px)`,
                        }}
                    >
                        <button className="primary-button registration-button">
                            <span>Mulai Pendaftaran</span>
                            <span className="button-arrow">→</span>
                        </button>
                        <p className="cta-note">
                            Proses pendaftaran gratis dan mudah!
                        </p>
                    </div>
                </div>
                <div className="shape-divider">
                    <div className="shape shape1"></div>
                    <div className="shape shape2"></div>
                </div>
            </section>

            {/* Monthly Report Section */}
            <section
                id="laporan"
                ref={sectionRefs.laporan}
                className="report-section"
            >
                <div className="container">
                    <div className="section-header">
                        <h2>Laporan Bulanan</h2>
                        <div className="section-line"></div>
                        <p>
                            Akses laporan keuangan bulanan dengan mudah dan
                            transparan
                        </p>
                    </div>

                    <div className="report-grid">
                        <div className="report-card">
                            <div className="report-icon">📊</div>
                            <h3>Laporan Keuangan</h3>
                            <p>
                                Laporan lengkap posisi keuangan koperasi setiap
                                bulan
                            </p>
                            <ul>
                                <li>✓ Neraca keuangan</li>
                                <li>✓ Laba rugi</li>
                                <li>✓ Arus kas</li>
                                <li>✓ Analisis rasio</li>
                            </ul>
                            <button className="report-button">
                                <span>Download PDF</span>
                                <span>📄</span>
                            </button>
                        </div>

                        <div className="report-card">
                            <div className="report-icon">👥</div>
                            <h3>Laporan Keanggotaan</h3>
                            <p>
                                Data perkembangan anggota dan aktivitas bulanan
                            </p>
                            <ul>
                                <li>✓ Jumlah anggota aktif</li>
                                <li>✓ Anggota baru</li>
                                <li>✓ Tingkat partisipasi</li>
                                <li>✓ Demografis anggota</li>
                            </ul>
                            <button className="report-button">
                                <span>Download PDF</span>
                                <span>📄</span>
                            </button>
                        </div>

                        <div className="report-card">
                            <div className="report-icon">💼</div>
                            <h3>Laporan Usaha</h3>
                            <p>
                                Perkembangan unit usaha dan investasi koperasi
                            </p>
                            <ul>
                                <li>✓ Omzet unit usaha</li>
                                <li>✓ ROI investasi</li>
                                <li>✓ Proyeksi bisnis</li>
                                <li>✓ Analisis pasar</li>
                            </ul>
                            <button className="report-button">
                                <span>Download PDF</span>
                                <span>📄</span>
                            </button>
                        </div>

                        <div className="report-card">
                            <div className="report-icon">🏆</div>
                            <h3>Laporan SHU</h3>
                            <p>
                                Sisa Hasil Usaha dan pembagiannya kepada anggota
                            </p>
                            <ul>
                                <li>✓ Total SHU</li>
                                <li>✓ Pembagian per anggota</li>
                                <li>✓ Mekanisme distribusi</li>
                                <li>✓ Proyeksi tahun depan</li>
                            </ul>
                            <button className="report-button">
                                <span>Download PDF</span>
                                <span>📄</span>
                            </button>
                        </div>
                    </div>

                    <div className="report-archive">
                        <h3>Arsip Laporan</h3>
                        <div className="archive-years">
                            <button className="year-button active">2025</button>
                            <button className="year-button">2024</button>
                            <button className="year-button">2023</button>
                            <button className="year-button">2022</button>
                        </div>
                        <p className="archive-note">
                            Semua laporan tersedia dalam format PDF yang dapat
                            diunduh dan dicetak
                        </p>
                    </div>
                </div>
            </section>

            {/* Organization Structure Section */}
            <section
                id="struktur"
                ref={sectionRefs.struktur}
                className="structure-section"
            >
                <div className="container">
                    <div className="section-header">
                        <h2>Struktur Organisasi</h2>
                        <div className="section-line"></div>
                        <p>
                            Organisasi yang solid dengan manajemen profesional
                        </p>
                    </div>

                    <div className="org-chart">
                        <div className="org-level level-1">
                            <div className="position-card chairman">
                                <div className="position-icon">👑</div>
                                <h3>Ketua Koperasi</h3>
                                <p>Drs. Ahmad Surya, M.M</p>
                                <span className="period">
                                    Periode 2023-2026
                                </span>
                            </div>
                        </div>

                        <div className="org-level level-2">
                            <div className="position-card">
                                <div className="position-icon">📋</div>
                                <h3>Sekretaris</h3>
                                <p>Siti Nurhaliza, S.E</p>
                            </div>
                            <div className="position-card">
                                <div className="position-icon">💰</div>
                                <h3>Bendahara</h3>
                                <p>Bambang Hartono, S.Ak</p>
                            </div>
                        </div>

                        <div className="org-level level-3">
                            <div className="position-card">
                                <div className="position-icon">👥</div>
                                <h3>Manager Keanggotaan</h3>
                                <p>Rina Susanti, S.Sos</p>
                            </div>
                            <div className="position-card">
                                <div className="position-icon">📊</div>
                                <h3>Manager Keuangan</h3>
                                <p>Agus Wijaya, S.E</p>
                            </div>
                            <div className="position-card">
                                <div className="position-icon">🏢</div>
                                <h3>Manager Usaha</h3>
                                <p>Diana Sari, M.B.A</p>
                            </div>
                        </div>
                    </div>

                    <div className="advisory-board">
                        <h3>Badan Pengawas</h3>
                        <div className="advisory-members">
                            <div className="advisor-card">
                                <div className="advisor-icon">🔍</div>
                                <h4>Ketua Pengawas</h4>
                                <p>Prof. Dr. Sutrisno, M.Ec</p>
                            </div>
                            <div className="advisor-card">
                                <div className="advisor-icon">⚖️</div>
                                <h4>Anggota Pengawas</h4>
                                <p>Ir. Muslimin, M.M</p>
                            </div>
                            <div className="advisor-card">
                                <div className="advisor-icon">📈</div>
                                <h4>Anggota Pengawas</h4>
                                <p>Dra. Kartika, M.Si</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision Mission Section */}
            <section
                id="visi"
                ref={sectionRefs.visi}
                className="vision-section"
            >
                <div className="container">
                    <div className="vision-grid">
                        <div className="vision-card">
                            <div className="vision-icon">🎯</div>
                            <h2>Visi</h2>
                            <div className="section-line"></div>
                            <p>
                                Menjadi koperasi digital terdepan yang
                                memberdayakan ekonomi rakyat melalui inovasi
                                teknologi finansial dan pelayanan yang
                                berkualitas tinggi pada tahun 2030.
                            </p>
                        </div>

                        <div className="mission-card">
                            <div className="mission-icon">🚀</div>
                            <h2>Misi</h2>
                            <div className="section-line"></div>
                            <div className="mission-list">
                                <div className="mission-item">
                                    <div className="mission-number">01</div>
                                    <p>
                                        Memberikan layanan keuangan digital yang
                                        mudah, aman, dan terpercaya untuk semua
                                        anggota
                                    </p>
                                </div>
                                <div className="mission-item">
                                    <div className="mission-number">02</div>
                                    <p>
                                        Mengembangkan program-program
                                        pemberdayaan ekonomi untuk meningkatkan
                                        kesejahteraan anggota
                                    </p>
                                </div>
                                <div className="mission-item">
                                    <div className="mission-number">03</div>
                                    <p>
                                        Menerapkan tata kelola yang transparan
                                        dan akuntabel dalam setiap aspek
                                        operasional
                                    </p>
                                </div>
                                <div className="mission-item">
                                    <div className="mission-number">04</div>
                                    <p>
                                        Berkontribusi aktif dalam pembangunan
                                        ekonomi kerakyatan dan kewirausahaan
                                        lokal
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="values-section">
                        <h3>Nilai-Nilai Kami</h3>
                        <div className="values-grid">
                            <div className="value-item">
                                <div className="value-icon">🤝</div>
                                <h4>Kekeluargaan</h4>
                                <p>
                                    Membangun hubungan yang harmonis antar
                                    anggota
                                </p>
                            </div>
                            <div className="value-item">
                                <div className="value-icon">🔒</div>
                                <h4>Kepercayaan</h4>
                                <p>
                                    Menjaga amanah dan kepercayaan semua
                                    stakeholder
                                </p>
                            </div>
                            <div className="value-item">
                                <div className="value-icon">💡</div>
                                <h4>Inovasi</h4>
                                <p>
                                    Terus berinovasi untuk pelayanan yang lebih
                                    baik
                                </p>
                            </div>
                            <div className="value-item">
                                <div className="value-icon">🌱</div>
                                <h4>Keberlanjutan</h4>
                                <p>Memastikan pertumbuhan yang berkelanjutan</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* News Section */}
            <section
                id="berita"
                ref={sectionRefs.berita}
                className="news-section"
            >
                <div className="container">
                    <div className="section-header">
                        <h2>Berita & Informasi</h2>
                        <div className="section-line"></div>
                        <p>
                            Ikuti perkembangan terbaru dan informasi penting
                            dari koperasi
                        </p>
                    </div>

                    <div className="news-grid">
                        <div className="news-card featured">
                            <div className="news-badge">Headline</div>
                            <div className="news-image">📊</div>
                            <div className="news-content">
                                <div className="news-meta">
                                    <span className="news-date">
                                        3 Juli 2025
                                    </span>
                                    <span className="news-category">
                                        Keuangan
                                    </span>
                                </div>
                                <h3>Pembagian SHU 2024 Meningkat 25%</h3>
                                <p>
                                    Koperasi SILUK berhasil mencatat kinerja
                                    gemilang di tahun 2024 dengan peningkatan
                                    SHU sebesar 25% dibanding tahun sebelumnya.
                                </p>
                                <button className="read-more">
                                    Baca Selengkapnya →
                                </button>
                            </div>
                        </div>

                        <div className="news-card">
                            <div className="news-image">🏆</div>
                            <div className="news-content">
                                <div className="news-meta">
                                    <span className="news-date">
                                        1 Juli 2025
                                    </span>
                                    <span className="news-category">
                                        Prestasi
                                    </span>
                                </div>
                                <h3>
                                    Raih Penghargaan Koperasi Digital Terbaik
                                </h3>
                                <p>
                                    SILUK meraih penghargaan sebagai koperasi
                                    digital terbaik se-Indonesia dalam ajang
                                    Koperasi Awards 2025.
                                </p>
                                <button className="read-more">
                                    Baca Selengkapnya →
                                </button>
                            </div>
                        </div>

                        <div className="news-card">
                            <div className="news-image">📱</div>
                            <div className="news-content">
                                <div className="news-meta">
                                    <span className="news-date">
                                        28 Juni 2025
                                    </span>
                                    <span className="news-category">
                                        Teknologi
                                    </span>
                                </div>
                                <h3>Peluncuran Aplikasi Mobile SILUK 2.0</h3>
                                <p>
                                    Aplikasi mobile SILUK versi 2.0 diluncurkan
                                    dengan fitur-fitur baru yang lebih
                                    user-friendly.
                                </p>
                                <button className="read-more">
                                    Baca Selengkapnya →
                                </button>
                            </div>
                        </div>

                        <div className="news-card">
                            <div className="news-image">👥</div>
                            <div className="news-content">
                                <div className="news-meta">
                                    <span className="news-date">
                                        25 Juni 2025
                                    </span>
                                    <span className="news-category">
                                        Keanggotaan
                                    </span>
                                </div>
                                <h3>Program Keanggotaan Baru untuk UMKM</h3>
                                <p>
                                    Diluncurkan program khusus untuk mendukung
                                    pengembangan usaha mikro, kecil, dan
                                    menengah.
                                </p>
                                <button className="read-more">
                                    Baca Selengkapnya →
                                </button>
                            </div>
                        </div>

                        <div className="news-card">
                            <div className="news-image">💼</div>
                            <div className="news-content">
                                <div className="news-meta">
                                    <span className="news-date">
                                        22 Juni 2025
                                    </span>
                                    <span className="news-category">Usaha</span>
                                </div>
                                <h3>Ekspansi Unit Usaha ke 3 Kota Baru</h3>
                                <p>
                                    Koperasi SILUK memperluas jangkauan unit
                                    usaha ke Bandung, Surabaya, dan Medan.
                                </p>
                                <button className="read-more">
                                    Baca Selengkapnya →
                                </button>
                            </div>
                        </div>

                        <div className="news-card">
                            <div className="news-image">🎓</div>
                            <div className="news-content">
                                <div className="news-meta">
                                    <span className="news-date">
                                        20 Juni 2025
                                    </span>
                                    <span className="news-category">
                                        Edukasi
                                    </span>
                                </div>
                                <h3>Workshop Literasi Keuangan Digital</h3>
                                <p>
                                    Penyelenggaraan workshop gratis untuk
                                    meningkatkan literasi keuangan digital
                                    anggota koperasi.
                                </p>
                                <button className="read-more">
                                    Baca Selengkapnya →
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="news-pagination">
                        <button className="pagination-btn prev">
                            ← Sebelumnya
                        </button>
                        <div className="pagination-numbers">
                            <button className="page-btn active">1</button>
                            <button className="page-btn">2</button>
                            <button className="page-btn">3</button>
                            <button className="page-btn">...</button>
                            <button className="page-btn">10</button>
                        </div>
                        <button className="pagination-btn next">
                            Selanjutnya →
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <div className="logo">
                                    <span>S</span>
                                </div>
                                <div>
                                    <h3>SILUK</h3>
                                    <p>Sistem Layanan Koperasi</p>
                                </div>
                            </div>
                            <p>
                                Platform digital terpercaya untuk mengelola
                                keuangan koperasi dengan mudah dan aman.
                            </p>
                            <div className="social-links">
                                <a href="#" className="social-icon">
                                    F
                                </a>
                                <a href="#" className="social-icon">
                                    T
                                </a>
                                <a href="#" className="social-icon">
                                    I
                                </a>
                                <a href="#" className="social-icon">
                                    L
                                </a>
                            </div>
                        </div>

                        <div className="footer-links">
                            <h4>Layanan</h4>
                            <ul>
                                <li>
                                    <a href="#">Simpanan</a>
                                </li>
                                <li>
                                    <a href="#">Pinjaman</a>
                                </li>
                                <li>
                                    <a href="#">Investasi</a>
                                </li>
                                <li>
                                    <a href="#">Asuransi</a>
                                </li>
                            </ul>
                        </div>

                        <div className="footer-links">
                            <h4>Perusahaan</h4>
                            <ul>
                                <li>
                                    <a href="#">Tentang Kami</a>
                                </li>
                                <li>
                                    <a href="#">Karir</a>
                                </li>
                                <li>
                                    <a href="#">Blog</a>
                                </li>
                                <li>
                                    <a href="#">Kontak</a>
                                </li>
                            </ul>
                        </div>

                        <div className="footer-links">
                            <h4>Legal</h4>
                            <ul>
                                <li>
                                    <a href="#">Privasi</a>
                                </li>
                                <li>
                                    <a href="#">Syarat & Ketentuan</a>
                                </li>
                                <li>
                                    <a href="#">FAQ</a>
                                </li>
                                <li>
                                    <a href="#">Bantuan</a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="copyright">
                        <p>
                            &copy; 2025 SILUK. Semua hak dilindungi
                            undang-undang.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Live Chat Widget */}
            <ChatWidget
                botName="Nito"
                primaryColor="#1E40AF"
                accentColor="#3B82F6"
            />
        </div>
    );
};

// Export dengan ThemeProvider wrapper
const WelcomeWithTheme = () => (
    <ThemeProvider>
        <Welcome />
    </ThemeProvider>
);

export default WelcomeWithTheme;
