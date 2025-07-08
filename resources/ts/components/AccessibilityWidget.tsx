import React, { useState, useEffect } from "react";
import { useAccessibility } from "../contexts/AccessibilityContext";

const AccessibilityWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const {
        settings,
        updateSetting,
        resetSettings,
        saveToBackend,
        availableLanguages,
        getCurrentLanguage,
    } = useAccessibility();

    const handleFontSizeChange = (increment: boolean) => {
        const newSize = increment
            ? Math.min(settings.fontSize + 10, 150)
            : Math.max(settings.fontSize - 10, 80);
        updateSetting("fontSize", newSize);
    };

    const handleLanguageChange = (languageCode: string) => {
        updateSetting("language", languageCode);

        // Update page title and other language-dependent content
        setTimeout(() => {
            // Trigger any language-dependent updates
            const event = new CustomEvent("languageChanged", {
                detail: { language: languageCode },
            });
            window.dispatchEvent(event);
        }, 100);
    };

    const handleSavePreferences = async () => {
        await saveToBackend();
        // Optional: Show success message
        console.log("Accessibility preferences saved");
    };

    // Listen for keyboard shortcuts
    useEffect(() => {
        const handleKeyboard = (e: KeyboardEvent) => {
            if (e.altKey && e.key === "a") {
                e.preventDefault();
                setIsOpen(!isOpen);
            }
        };

        document.addEventListener("keydown", handleKeyboard);
        return () => document.removeEventListener("keydown", handleKeyboard);
    }, [isOpen]);

    return (
        <>
            {/* Floating Accessibility Icon */}
            <div
                className={`accessibility-widget ${
                    isOpen ? "accessibility-widget--open" : ""
                }`}
                style={{
                    position: "fixed",
                    bottom: "20px",
                    left: "20px",
                    zIndex: 9999,
                }}
            >
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="accessibility-toggle-btn"
                    aria-label="Toggle accessibility menu (Alt+A)"
                    title="Accessibility Menu (Alt+A)"
                    style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        backgroundColor: "#1E40AF",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        transition: "all 0.3s ease",
                        color: "white",
                        fontSize: "24px",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.1)";
                        e.currentTarget.style.backgroundColor = "#1D4ED8";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.backgroundColor = "#1E40AF";
                    }}
                >
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9M15 11.5C15.8 12.3 16 13.4 16 14.5V22H14V16H10V22H8V14.5C8 12.6 9.2 11 10.8 10.7L15 11.5Z" />
                    </svg>
                </button>

                {/* Accessibility Panel */}
                {isOpen && (
                    <div
                        className="accessibility-panel"
                        style={{
                            position: "absolute",
                            bottom: "70px",
                            left: "0",
                            width: "320px",
                            backgroundColor: "white",
                            borderRadius: "12px",
                            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                            border: "1px solid #e5e7eb",
                            padding: "24px",
                            animation: "slideUp 0.3s ease",
                        }}
                    >
                        {/* Header */}
                        <div style={{ marginBottom: "20px" }}>
                            <h3
                                style={{
                                    margin: "0 0 8px 0",
                                    fontSize: "18px",
                                    fontWeight: "600",
                                    color: "#1f2937",
                                }}
                            >
                                Accessibility Menu
                            </h3>
                            <div
                                style={{
                                    height: "3px",
                                    backgroundColor: "#1E40AF",
                                    borderRadius: "2px",
                                    width: "40px",
                                }}
                            ></div>
                        </div>

                        {/* Language Selection */}
                        <div style={{ marginBottom: "20px" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    color: "#374151",
                                    marginBottom: "8px",
                                }}
                            >
                                Language / Bahasa ({getCurrentLanguage().name})
                            </label>
                            <select
                                value={settings.language}
                                onChange={(e) =>
                                    handleLanguageChange(e.target.value)
                                }
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "6px",
                                    fontSize: "14px",
                                    backgroundColor: "white",
                                    cursor: "pointer",
                                }}
                                aria-label="Select interface language"
                            >
                                {availableLanguages.map((lang) => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.nativeName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Font Size Control */}
                        <div style={{ marginBottom: "20px" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    color: "#374151",
                                    marginBottom: "8px",
                                }}
                            >
                                Font Size
                            </label>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                }}
                            >
                                <button
                                    onClick={() => handleFontSizeChange(false)}
                                    disabled={settings.fontSize <= 80}
                                    style={{
                                        width: "36px",
                                        height: "36px",
                                        borderRadius: "6px",
                                        border: "1px solid #d1d5db",
                                        backgroundColor:
                                            settings.fontSize <= 80
                                                ? "#f3f4f6"
                                                : "white",
                                        cursor:
                                            settings.fontSize <= 80
                                                ? "not-allowed"
                                                : "pointer",
                                        fontSize: "18px",
                                        fontWeight: "bold",
                                        color:
                                            settings.fontSize <= 80
                                                ? "#9ca3af"
                                                : "#374151",
                                    }}
                                >
                                    −
                                </button>
                                <span
                                    style={{
                                        fontSize: "14px",
                                        fontWeight: "500",
                                        color: "#1E40AF",
                                        minWidth: "45px",
                                        textAlign: "center",
                                    }}
                                >
                                    {settings.fontSize}%
                                </span>
                                <button
                                    onClick={() => handleFontSizeChange(true)}
                                    disabled={settings.fontSize >= 150}
                                    style={{
                                        width: "36px",
                                        height: "36px",
                                        borderRadius: "6px",
                                        border: "1px solid #d1d5db",
                                        backgroundColor:
                                            settings.fontSize >= 150
                                                ? "#f3f4f6"
                                                : "white",
                                        cursor:
                                            settings.fontSize >= 150
                                                ? "not-allowed"
                                                : "pointer",
                                        fontSize: "18px",
                                        fontWeight: "bold",
                                        color:
                                            settings.fontSize >= 150
                                                ? "#9ca3af"
                                                : "#374151",
                                    }}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Toggle Features */}
                        <div style={{ marginBottom: "20px" }}>
                            {[
                                {
                                    key: "highlightTitles",
                                    label: "Highlight Titles",
                                },
                                {
                                    key: "highlightLinks",
                                    label: "Highlight Links",
                                },
                                { key: "dyslexiaFont", label: "Dyslexia Font" },
                                {
                                    key: "letterSpacing",
                                    label: "Letter Spacing",
                                },
                                { key: "lineHeight", label: "Line Height" },
                                { key: "fontWeight", label: "Font Weight" },
                            ].map((feature) => (
                                <div
                                    key={feature.key}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "12px",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: "14px",
                                            color: "#374151",
                                        }}
                                    >
                                        {feature.label}
                                    </span>
                                    <button
                                        onClick={() =>
                                            updateSetting(
                                                feature.key as keyof typeof settings,
                                                !settings[
                                                    feature.key as keyof typeof settings
                                                ]
                                            )
                                        }
                                        style={{
                                            width: "44px",
                                            height: "24px",
                                            borderRadius: "12px",
                                            border: "none",
                                            backgroundColor: settings[
                                                feature.key as keyof typeof settings
                                            ]
                                                ? "#1E40AF"
                                                : "#e5e7eb",
                                            cursor: "pointer",
                                            position: "relative",
                                            transition: "all 0.3s ease",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "18px",
                                                height: "18px",
                                                borderRadius: "50%",
                                                backgroundColor: "white",
                                                position: "absolute",
                                                top: "3px",
                                                left: settings[
                                                    feature.key as keyof typeof settings
                                                ]
                                                    ? "23px"
                                                    : "3px",
                                                transition: "all 0.3s ease",
                                            }}
                                        ></div>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Reset Button */}
                        <div style={{ marginBottom: "16px" }}>
                            <button
                                onClick={resetSettings}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    backgroundColor: "#f3f4f6",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "6px",
                                    fontSize: "14px",
                                    color: "#374151",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        "#e5e7eb";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        "#f3f4f6";
                                }}
                            >
                                Reset to Default
                            </button>
                        </div>

                        {/* Save Button (only if user is authenticated) */}
                        {(window as any).user && (
                            <div style={{ marginBottom: "16px" }}>
                                <button
                                    onClick={handleSavePreferences}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        backgroundColor: "#1E40AF",
                                        border: "none",
                                        borderRadius: "6px",
                                        fontSize: "14px",
                                        color: "white",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "#1D4ED8";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "#1E40AF";
                                    }}
                                >
                                    Save Preferences
                                </button>
                            </div>
                        )}

                        {/* Credit */}
                        <div
                            style={{
                                textAlign: "center",
                                fontSize: "12px",
                                color: "#6b7280",
                                borderTop: "1px solid #e5e7eb",
                                paddingTop: "12px",
                            }}
                        >
                            Web Accessibility By Nikson ❤️
                        </div>
                    </div>
                )}
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .accessibility-widget {
                    font-family: Inter, system-ui, sans-serif;
                }

                .accessibility-toggle-btn:focus {
                    outline: 2px solid #3B82F6;
                    outline-offset: 2px;
                }

                .accessibility-panel button:focus,
                .accessibility-panel select:focus {
                    outline: 2px solid #3B82F6;
                    outline-offset: 2px;
                }
            `}</style>
        </>
    );
};

export default AccessibilityWidget;
