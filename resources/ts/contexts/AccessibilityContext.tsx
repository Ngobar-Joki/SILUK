import React, { createContext, useContext, useState, useEffect } from "react";

export interface AccessibilitySettings {
    language: string;
    fontSize: number;
    highlightTitles: boolean;
    highlightLinks: boolean;
    dyslexiaFont: boolean;
    letterSpacing: boolean;
    lineHeight: boolean;
    fontWeight: boolean;
}

// Language options interface
export interface LanguageOption {
    code: string;
    name: string;
    nativeName: string;
}

// Available languages
export const availableLanguages: LanguageOption[] = [
    { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
    { code: "en", name: "English", nativeName: "English" },
    { code: "ms", name: "Malay", nativeName: "Bahasa Melayu" },
];

interface AccessibilityContextType {
    settings: AccessibilitySettings;
    availableLanguages: LanguageOption[];
    updateSetting: <K extends keyof AccessibilitySettings>(
        key: K,
        value: AccessibilitySettings[K]
    ) => void;
    resetSettings: () => void;
    saveToBackend: () => Promise<void>;
    loadFromBackend: () => Promise<void>;
    getCurrentLanguage: () => LanguageOption;
}

const defaultSettings: AccessibilitySettings = {
    language: "id",
    fontSize: 100,
    highlightTitles: false,
    highlightLinks: false,
    dyslexiaFont: false,
    letterSpacing: false,
    lineHeight: false,
    fontWeight: false,
};

const AccessibilityContext = createContext<
    AccessibilityContextType | undefined
>(undefined);

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error(
            "useAccessibility must be used within AccessibilityProvider"
        );
    }
    return context;
};

interface AccessibilityProviderProps {
    children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
    children,
}) => {
    const [settings, setSettings] =
        useState<AccessibilitySettings>(defaultSettings);

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedSettings = localStorage.getItem("accessibility-settings");
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSettings({ ...defaultSettings, ...parsed });
            } catch (error) {
                console.error(
                    "Failed to parse saved accessibility settings:",
                    error
                );
            }
        } else {
            // Try to load from backend if user is authenticated
            loadFromBackend();
        }
    }, []);

    // Apply CSS custom properties whenever settings change
    useEffect(() => {
        applyAccessibilityStyles(settings);
        // Save to localStorage
        localStorage.setItem(
            "accessibility-settings",
            JSON.stringify(settings)
        );
    }, [settings]);

    const updateSetting = <K extends keyof AccessibilitySettings>(
        key: K,
        value: AccessibilitySettings[K]
    ) => {
        setSettings((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const resetSettings = () => {
        setSettings(defaultSettings);
        localStorage.removeItem("accessibility-settings");
    };

    const saveToBackend = async () => {
        try {
            // Check if user is authenticated
            const user = (window as any).user;
            if (!user) return;

            const response = await fetch("/api/accessibility/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify({ settings }),
            });

            if (!response.ok) {
                throw new Error("Failed to save settings to backend");
            }
        } catch (error) {
            console.error("Error saving accessibility settings:", error);
        }
    };

    const loadFromBackend = async () => {
        try {
            // Check if user is authenticated
            const user = (window as any).user;
            if (!user) return;

            const response = await fetch("/api/accessibility/load", {
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.settings) {
                    setSettings({ ...defaultSettings, ...data.settings });
                }
            }
        } catch (error) {
            console.error("Error loading accessibility settings:", error);
        }
    };

    const getCurrentLanguage = (): LanguageOption => {
        return (
            availableLanguages.find(
                (lang) => lang.code === settings.language
            ) || availableLanguages[0]
        ); // fallback to first language
    };

    const contextValue: AccessibilityContextType = {
        settings,
        availableLanguages,
        updateSetting,
        resetSettings,
        saveToBackend,
        loadFromBackend,
        getCurrentLanguage,
    };

    return (
        <AccessibilityContext.Provider value={contextValue}>
            {children}
        </AccessibilityContext.Provider>
    );
};

// Helper function to apply accessibility styles
const applyAccessibilityStyles = (settings: AccessibilitySettings) => {
    const root = document.documentElement;

    // Font size - Apply to root element with proper scaling
    const fontSizeScale = settings.fontSize / 100;
    root.style.setProperty(
        "--accessibility-font-scale",
        fontSizeScale.toString()
    );

    // Dyslexia font
    if (settings.dyslexiaFont) {
        root.style.setProperty(
            "--accessibility-font-family",
            "Comic Sans MS, Comic Neue, cursive, sans-serif"
        );
    } else {
        root.style.setProperty(
            "--accessibility-font-family",
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
        );
    }

    // Letter spacing
    if (settings.letterSpacing) {
        root.style.setProperty("--accessibility-letter-spacing", "0.12em");
    } else {
        root.style.setProperty("--accessibility-letter-spacing", "normal");
    }

    // Line height
    if (settings.lineHeight) {
        root.style.setProperty("--accessibility-line-height", "1.8");
    } else {
        root.style.setProperty("--accessibility-line-height", "1.6");
    }

    // Font weight
    if (settings.fontWeight) {
        root.style.setProperty("--accessibility-font-weight", "600");
    } else {
        root.style.setProperty("--accessibility-font-weight", "400");
    }

    // Highlight titles
    if (settings.highlightTitles) {
        root.classList.add("accessibility-highlight-titles");
    } else {
        root.classList.remove("accessibility-highlight-titles");
    }

    // Highlight links
    if (settings.highlightLinks) {
        root.classList.add("accessibility-highlight-links");
    } else {
        root.classList.remove("accessibility-highlight-links");
    }

    // Apply language attribute and update page language
    document.documentElement.lang = settings.language;

    // Update meta language tag if it exists
    const metaLang = document.querySelector(
        'meta[http-equiv="content-language"]'
    );
    if (metaLang) {
        metaLang.setAttribute("content", settings.language);
    } else {
        // Create meta language tag if it doesn't exist
        const newMetaLang = document.createElement("meta");
        newMetaLang.setAttribute("http-equiv", "content-language");
        newMetaLang.setAttribute("content", settings.language);
        document.head.appendChild(newMetaLang);
    }

    // Force reflow to ensure changes are applied
    document.body.offsetHeight;
};
