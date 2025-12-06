import React, { useState, useRef, useEffect } from "react";

interface Message {
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
}

interface ChatSession {
    id: string;
    messages: Message[];
    lastActivity: Date;
    title: string;
}

interface ChatWidgetProps {
    botName?: string;
    primaryColor?: string;
    accentColor?: string;
    initialDarkMode?: boolean; // New prop for initial dark mode state
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
    botName = "Nito",
    primaryColor = "#1E40AF", // Sesuai dengan tema SILUK
    accentColor = "#3B82F6",
    initialDarkMode,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string>("");
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [showSessionList, setShowSessionList] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [showQuickReplies, setShowQuickReplies] = useState(true);
    const [darkMode, setDarkMode] = useState(() => {
        // Initialize dark mode from props or localStorage or system preference
        if (initialDarkMode !== undefined) return initialDarkMode;

        const savedMode = localStorage.getItem('siluk_dark_mode');
        if (savedMode !== null) return savedMode === 'true';

        return window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Storage keys
    const STORAGE_KEYS = {
        SESSIONS: "siluk_chat_sessions",
        CURRENT_SESSION: "siluk_current_session_id",
        DARK_MODE: "siluk_dark_mode",
    };

    // Listen to system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            // Only change if user hasn't explicitly set a preference
            if (localStorage.getItem(STORAGE_KEYS.DARK_MODE) === null) {
                setDarkMode(e.matches);
            }
        };

        // Add listener (use different syntax based on browser support)
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
        } else {
            // For older browsers
            mediaQuery.addListener(handleChange);
        }

        // Cleanup
        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handleChange);
            } else {
                // For older browsers
                mediaQuery.removeListener(handleChange);
            }
        };
    }, []);

    // Save dark mode preference when it changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.DARK_MODE, darkMode.toString());
    }, [darkMode]);

    // Toggle dark mode
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    // Calculate theme-based colors
    const theme = {
        // Chat window
        windowBg: darkMode ? '#1F2937' : 'white',
        messageBg: darkMode ? '#374151' : 'white',
        userMessageBg: darkMode ? primaryColor : primaryColor,
        userMessageText: darkMode ? 'white' : 'white',
        botMessageBg: darkMode ? '#374151' : 'white',
        botMessageText: darkMode ? '#E5E7EB' : 'gray-800',
        botMessageBorder: darkMode ? '#4B5563' : '#E5E7EB',
        textColor: darkMode ? '#E5E7EB' : '#1F2937',
        inputBg: darkMode ? '#374151' : 'white',
        inputBorder: darkMode ? '#4B5563' : '#D1D5DB',
        inputText: darkMode ? '#E5E7EB' : '#1F2937',
        chatAreaBg: darkMode ? '#111827' : '#F9FAFB',

        // Session list
        sessionHover: darkMode ? '#374151' : '#F9FAFB',
        sessionActive: darkMode ? '#3B82F6/20' : '#EFF6FF',
        sessionActiveBorder: darkMode ? '#3B82F6' : '#BFDBFE',
        sessionText: darkMode ? '#E5E7EB' : '#1F2937',
        sessionMeta: darkMode ? '#9CA3AF' : '#6B7280',

        // Quick replies
        quickReplyBg: darkMode ? '#374151' : '#F3F4F6',
        quickReplyHover: darkMode ? '#4B5563' : '#E5E7EB',
        quickReplyText: darkMode ? '#E5E7EB' : '#1F2937',
    };

    // Initialize default welcome message
    const getWelcomeMessage = (): Message => ({
        id: "welcome-" + Date.now(),
        text: `Halo! Saya ${botName}, asisten virtual SILUK. Ada yang bisa saya bantu hari ini? 😊`,
        sender: "bot",
        timestamp: new Date(),
    });

    // Load sessions from localStorage
    const loadSessions = (): ChatSession[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
            if (stored) {
                const sessions = JSON.parse(stored);
                // Convert timestamp strings back to Date objects
                return sessions.map((session: any) => ({
                    ...session,
                    lastActivity: new Date(session.lastActivity),
                    messages: session.messages.map((msg: any) => ({
                        ...msg,
                        timestamp: new Date(msg.timestamp),
                    })),
                }));
            }
        } catch (error) {
            console.error("Error loading chat sessions:", error);
        }
        return [];
    };

    // Save sessions to localStorage
    const saveSessions = (sessionsToSave: ChatSession[]) => {
        try {
            localStorage.setItem(
                STORAGE_KEYS.SESSIONS,
                JSON.stringify(sessionsToSave)
            );
        } catch (error) {
            console.error("Error saving chat sessions:", error);
        }
    };

    // Create new chat session
    const createNewSession = (): string => {
        const sessionId = "session-" + Date.now();
        const welcomeMessage = getWelcomeMessage();

        const newSession: ChatSession = {
            id: sessionId,
            messages: [welcomeMessage],
            lastActivity: new Date(),
            title: `Chat ${new Date().toLocaleDateString("id-ID")}`,
        };

        const updatedSessions = [...sessions, newSession];
        setSessions(updatedSessions);
        saveSessions(updatedSessions);

        setMessages([welcomeMessage]);
        setShowQuickReplies(true);
        setCurrentSessionId(sessionId);
        localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, sessionId);

        return sessionId;
    };

    // Load specific session
    const loadSession = (sessionId: string) => {
        const session = sessions.find((s) => s.id === sessionId);
        if (session) {
            setMessages(session.messages);
            setCurrentSessionId(sessionId);
            setShowQuickReplies(session.messages.length === 1); // Show quick replies only for new sessions
            localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, sessionId);
            setShowSessionList(false);
        }
    };

    // Update current session with new messages
    const updateCurrentSession = (newMessages: Message[]) => {
        if (!currentSessionId) return;

        const updatedSessions = sessions.map((session) => {
            if (session.id === currentSessionId) {
                // Generate title from first user message if still default
                let title = session.title;
                if (title.startsWith("Chat ") && newMessages.length > 1) {
                    const firstUserMessage = newMessages.find(
                        (msg) => msg.sender === "user"
                    );
                    if (firstUserMessage) {
                        title =
                            firstUserMessage.text.slice(0, 30) +
                            (firstUserMessage.text.length > 30 ? "..." : "");
                    }
                }

                return {
                    ...session,
                    messages: newMessages,
                    lastActivity: new Date(),
                    title,
                };
            }
            return session;
        });

        setSessions(updatedSessions);
        saveSessions(updatedSessions);
    };

    // Initialize sessions on component mount
    useEffect(() => {
        const loadedSessions = loadSessions();
        setSessions(loadedSessions);

        const currentSession = localStorage.getItem(
            STORAGE_KEYS.CURRENT_SESSION
        );

        if (
            currentSession &&
            loadedSessions.find((s) => s.id === currentSession)
        ) {
            // Load existing session
            loadSession(currentSession);
        } else {
            // Create new session
            createNewSession();
        }
    }, []);

    // Update session when messages change
    useEffect(() => {
        if (currentSessionId && messages.length > 0) {
            updateCurrentSession(messages);
        }
    }, [messages, currentSessionId]);

    // Delete session
    const deleteSession = (sessionId: string, event: React.MouseEvent) => {
        event.stopPropagation();

        const updatedSessions = sessions.filter((s) => s.id !== sessionId);
        setSessions(updatedSessions);
        saveSessions(updatedSessions);

        // If deleted session was current, create new one
        if (sessionId === currentSessionId) {
            if (updatedSessions.length > 0) {
                loadSession(updatedSessions[0].id);
            } else {
                createNewSession();
            }
        }
    };

    // Quick reply options
    const quickReplies = [
        "📝 Cara daftar jadi anggota",
        "💰 Info simpanan & pinjaman",
        "📊 Lihat laporan keuangan",
        "🏢 Lokasi kantor cabang",
        "📞 Hubungi customer service",
        "💳 Syarat & ketentuan keanggotaan",
        "🏦 Jenis produk koperasi",
        "📈 Suku bunga simpanan",
        "💼 Pinjaman usaha mikro",
        "🎯 Program SHU (Sisa Hasil Usaha)",
        "📱 Layanan digital banking",
        "⏰ Jam operasional",
        "📋 Dokumen yang diperlukan",
        "🔒 Keamanan transaksi",
        "📞 Nomor call center"
    ];

    // Default bot responses for fallback
    const defaultBotResponses = [
        "Terima kasih telah menghubungi SILUK! Tim customer service kami akan segera membantu Anda. 😊",
        "Untuk informasi simpanan dan pinjaman, silakan kunjungi halaman layanan kami atau hubungi cabang terdekat.",
        "Apakah Anda ingin mengetahui lebih lanjut tentang program keanggotaan SILUK?",
        "Silakan kunjungi halaman FAQ untuk informasi lengkap mengenai layanan koperasi SILUK.",
        "Tim support SILUK siap membantu Anda 24/7. Ada pertanyaan lain tentang koperasi?",
        "Untuk keperluan registrasi atau informasi SHU, silakan hubungi (021) 123-4567.",
        "Terima kasih sudah mempercayai SILUK! Kami senang bisa membantu anggota koperasi. 🏦",
        "Jika perlu bantuan terkait laporan keuangan atau struktur organisasi, jangan ragu bertanya!",
        "Saya akan menyampaikan pertanyaan Anda ke tim yang berwenang di SILUK.",
        "Apakah informasi tentang layanan digital SILUK sudah membantu Anda?",
        "Untuk bergabung menjadi anggota SILUK, Anda bisa mengikuti 4 langkah mudah di halaman pendaftaran! 📝",
        "SILUK memiliki berbagai produk simpanan dan pinjaman yang bisa disesuaikan dengan kebutuhan Anda.",
    ];

    // Format bot response to make it more readable
    const formatBotResponse = (responseText: string): string => {
        if (!responseText) return "Maaf, saya tidak dapat memproses pertanyaan Anda saat ini.";

        // Handle responses that are already well formatted (like from our fallback)
        if (responseText.includes('**') || responseText.includes('📞') || responseText.includes('🔧')) {
            // Response is already formatted, just handle escaped newlines
            return responseText.replace(/\\n/g, '\n').trim();
        }

        // Format API responses from external chatbot
        let formatted = responseText.replace(/\\n/g, '\n');

        // Add proper spacing for better readability
        formatted = formatted
            .replace(/\*\*(.*?)\*\*/g, '**$1**') // Keep markdown bold formatting
            .replace(/\n\n+/g, '\n\n') // Normalize multiple line breaks
            .replace(/(\d+\.)\s+/g, '\n$1 ') // Format numbered lists
            .replace(/\*\s+/g, '\n• ') // Format bullet points
            .replace(/^-\s+/gm, '• ') // Convert dashes to bullets
            .replace(/(\n\s*){3,}/g, '\n\n') // Remove excessive whitespace
            .trim();

        // Ensure proper paragraph spacing for SOP content
        if (formatted.includes('SOP') || formatted.includes('Halaman Dokumen:')) {
            formatted = formatted
                .replace(/\n([A-Z][^:]*:)/g, '\n\n**$1**') // Bold section headers
                .replace(/\n(\d+\.\s+)/g, '\n$1') // Format numbered items
                .replace(/(\*{2}[^*]+\*{2})\n(?!\n)/g, '$1\n'); // Add space after bold headers
        }

        return formatted;
    };

    // Fallback responses when API is not available
    const getFallbackResponse = (messageText: string): string => {
        // Specific responses for quick replies
        if (messageText.includes("daftar")) {
            return "Untuk mendaftar sebagai anggota SILUK, Anda perlu: 1) Mengisi formulir, 2) Menyiapkan dokumen, 3) Setor simpanan pokok, 4) Verifikasi data. Proses sangat mudah! 😊";
        } else if (
            messageText.includes("simpanan") ||
            messageText.includes("pinjaman")
        ) {
            return "SILUK menyediakan berbagai produk simpanan (tabungan, deposito) dan pinjaman (konsumtif, produktif) dengan bunga kompetitif. Hubungi kami untuk konsultasi! 💰";
        } else if (messageText.includes("laporan")) {
            return "Laporan keuangan SILUK dipublikasikan setiap bulan dan dapat diakses di website. Kami berkomitmen untuk transparansi penuh! 📊";
        } else if (
            messageText.includes("kantor") ||
            messageText.includes("cabang")
        ) {
            return "Kantor pusat SILUK di Jakarta, dengan cabang di Bandung, Surabaya, dan Medan. Kunjungi halaman kontak untuk alamat lengkap! 🏢";
        } else if (messageText.includes("customer service")) {
            return "Tim customer service SILUK siap melayani Anda di (021) 123-4567 atau email: cs@siluk.co.id. Kami online 24/7! 📞";
        } else if (messageText.includes("syarat") || messageText.includes("ketentuan")) {
            return "**Syarat Keanggotaan SILUK:**\n1. WNI berusia minimal 17 tahun\n2. Mengisi formulir pendaftaran\n3. Fotokopi KTP yang masih berlaku\n4. Setoran simpanan pokok Rp. 100.000\n5. Setoran simpanan wajib minimal Rp. 50.000/bulan 💳";
        } else if (messageText.includes("jenis produk") || messageText.includes("produk koperasi")) {
            return "**Produk SILUK:**\n• **Simpanan:** Tabungan, Deposito, Simpanan Berjangka\n• **Pinjaman:** Konsumtif, Produktif, Multiguna\n• **Investasi:** SHU, Sertifikat Modal\n• **Layanan:** Transfer, Pembayaran, Mobile Banking 🏦";
        } else if (messageText.includes("suku bunga") || messageText.includes("bunga simpanan")) {
            return "**Suku Bunga Simpanan SILUK:**\n• Tabungan: 3-4% per tahun\n• Deposito 6 bulan: 5-6% per tahun\n• Deposito 12 bulan: 6-7% per tahun\n• Simpanan Berjangka: 4-5% per tahun\n*Bunga dapat berubah sesuai kebijakan 📈";
        } else if (messageText.includes("pinjaman usaha") || messageText.includes("usaha mikro")) {
            return "**Pinjaman Usaha Mikro SILUK:**\n• Plafon: Rp. 500.000 - Rp. 50.000.000\n• Bunga: 12-18% per tahun\n• Jangka waktu: 6-36 bulan\n• Agunan: Sesuai plafon pinjaman\n• Syarat: Usaha berjalan min. 6 bulan 💼";
        } else if (messageText.includes("SHU") || messageText.includes("Sisa Hasil Usaha")) {
            return "**Program SHU (Sisa Hasil Usaha):**\nSHU dibagikan kepada anggota setiap akhir tahun berdasarkan:\n• Kontribusi simpanan (40%)\n• Volume transaksi (40%)\n• Partisipasi kegiatan (20%)\nSHU tahun lalu rata-rata 8-12% dari simpanan 🎯";
        } else if (messageText.includes("layanan digital") || messageText.includes("digital banking")) {
            return "**Layanan Digital SILUK:**\n• Mobile Banking SILUK App\n• Internet Banking\n• SMS Banking\n• Transfer antar bank\n• Pembayaran tagihan\n• Top up e-wallet\n• QR Payment 📱";
        } else if (messageText.includes("jam operasional") || messageText.includes("buka tutup")) {
            return "**Jam Operasional SILUK:**\n• **Senin-Jumat:** 08.00 - 16.00 WIB\n• **Sabtu:** 08.00 - 12.00 WIB\n• **Minggu & Libur:** Tutup\n• **Call Center:** 24/7\n• **Mobile Banking:** 24/7 ⏰";
        } else if (messageText.includes("dokumen") || messageText.includes("persyaratan")) {
            return "**Dokumen yang Diperlukan:**\n• KTP asli + fotokopi\n• NPWP (untuk pinjaman > 50 juta)\n• Slip gaji/Surat keterangan penghasilan\n• Rekening koran 3 bulan terakhir\n• Foto 4x6 (2 lembar)\n• Materai 10.000 📋";
        } else if (messageText.includes("keamanan") || messageText.includes("transaksi aman")) {
            return "**Keamanan Transaksi SILUK:**\n• Enkripsi SSL 256-bit\n• Two-Factor Authentication (2FA)\n• Token SMS untuk verifikasi\n• Monitoring transaksi 24/7\n• Auto logout sistem\n• Backup data real-time\n**Jangan bagikan PIN/Password kepada siapapun!** 🔒";
        } else if (messageText.includes("call center") || messageText.includes("nomor telepon")) {
            return "**Contact Center SILUK:**\n📞 **Hotline:** (021) 123-4567\n📞 **WhatsApp:** 0812-3456-7890\n📧 **Email:** cs@siluk.co.id\n💬 **Live Chat:** Website SILUK\n**Layanan 24 jam untuk emergency!** 📞";
        }

        // Default fallback response
        return defaultBotResponses[Math.floor(Math.random() * defaultBotResponses.length)];
    };

    // Create notification sound
    useEffect(() => {
        // Create a simple notification sound using Web Audio API
        const createNotificationSound = () => {
            const audioContext = new (window.AudioContext ||
                (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = "sine";

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(
                0.1,
                audioContext.currentTime + 0.01
            );
            gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                audioContext.currentTime + 0.3
            );

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        };

        if (hasNewMessage && !isOpen) {
            try {
                createNotificationSound();
            } catch (error) {
                console.log("Audio notification not supported");
            }
        }
    }, [hasNewMessage, isOpen]);

    // Scroll to bottom when new message
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 300);
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async (message?: string) => {
        const messageText = message || inputValue;
        if (!messageText.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: messageText,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputValue("");
        setIsTyping(true);
        setShowQuickReplies(false);

        try {
            // Get CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            // Call external chatbot API
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    text: messageText,
                }),
            });

            let botResponse = "";

            if (response.ok) {
                const responseText = await response.text();
                // Format the response to make it more readable
                botResponse = formatBotResponse(responseText);
            } else {
                // Fallback to predefined responses if API fails
                botResponse = getFallbackResponse(messageText);
            }

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: botResponse,
                sender: "bot",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMessage]);
            setIsTyping(false);

            if (!isOpen) {
                setHasNewMessage(true);
            }

            // Play notification sound for bot response
            try {
                const audioContext = new (window.AudioContext ||
                    (window as any).webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = 600;
                oscillator.type = "sine";

                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(
                    0.05,
                    audioContext.currentTime + 0.01
                );
                gainNode.gain.exponentialRampToValueAtTime(
                    0.01,
                    audioContext.currentTime + 0.2
                );

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
            } catch (error) {
                console.log("Audio notification not supported");
            }
        } catch (error) {
            console.error("Error calling chatbot API:", error);

            // Fallback to predefined responses if API call fails
            const botResponse = getFallbackResponse(messageText);

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: botResponse,
                sender: "bot",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMessage]);
            setIsTyping(false);

            if (!isOpen) {
                setHasNewMessage(true);
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleQuickReply = (reply: string) => {
        handleSendMessage(reply);
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setHasNewMessage(false);
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <>
            {/* Chat Widget */}
            <div className="chat-widget fixed bottom-6 right-6 z-50">
                {/* Chat Window */}
                <div
                    className={`absolute bottom-20 right-0 w-80 h-96 rounded-lg shadow-2xl transform transition-all duration-300 ease-in-out ${isOpen
                        ? "scale-100 opacity-100 translate-y-0"
                        : "scale-95 opacity-0 translate-y-4 pointer-events-none"
                        }`}
                    style={{ backgroundColor: theme.windowBg }}
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between p-4 rounded-t-lg text-white"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <span className="text-xl">🏦</span>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">
                                    {botName}
                                </h3>
                                <p className="text-xs opacity-90">
                                    Asisten Virtual SILUK
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Dark Mode Toggle Button */}
                            <button
                                onClick={toggleDarkMode}
                                className="header-btn text-white hover:bg-white/10 rounded-full p-1 transition-colors"
                                title={darkMode ? "Mode Terang" : "Mode Gelap"}
                            >
                                {darkMode ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>

                            {/* Session List Button */}
                            <button
                                onClick={() =>
                                    setShowSessionList(!showSessionList)
                                }
                                className="header-btn text-white hover:bg-white/10 rounded-full p-1 transition-colors"
                                title="Riwayat Chat"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                    />
                                </svg>
                            </button>

                            {/* New Chat Button */}
                            <button
                                onClick={() => createNewSession()}
                                className="new-chat-btn header-btn text-white hover:bg-white/10 rounded-full p-1 transition-colors"
                                title="Chat Baru"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                            </button>

                            {/* Close Button */}
                            <button
                                onClick={toggleChat}
                                className="text-white hover:bg-white/10 rounded-full p-1 transition-colors"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Session List */}
                    {showSessionList && (
                        <div className="session-list border-b" style={{
                            backgroundColor: theme.windowBg,
                            borderColor: darkMode ? '#4B5563' : '#E5E7EB'
                        }}>
                            <div className="p-3">
                                <h4 className="text-sm font-medium mb-2" style={{ color: theme.textColor }}>
                                    Riwayat Chat
                                </h4>
                                <div className="max-h-32 overflow-y-auto space-y-1">
                                    {sessions.length === 0 ? (
                                        <p className="text-xs" style={{ color: theme.sessionMeta }}>
                                            Belum ada riwayat chat
                                        </p>
                                    ) : (
                                        sessions
                                            .sort(
                                                (a, b) =>
                                                    new Date(
                                                        b.lastActivity
                                                    ).getTime() -
                                                    new Date(
                                                        a.lastActivity
                                                    ).getTime()
                                            )
                                            .map((session) => (
                                                <div
                                                    key={session.id}
                                                    className={`session-list-item flex items-center justify-between p-2 rounded cursor-pointer ${session.id ===
                                                        currentSessionId
                                                        ? "active border"
                                                        : ""
                                                        }`}
                                                    style={{
                                                        backgroundColor: session.id === currentSessionId ?
                                                            theme.sessionActive : 'transparent',
                                                        borderColor: session.id === currentSessionId ?
                                                            theme.sessionActiveBorder : 'transparent',

                                                    }}
                                                    onClick={() =>
                                                        loadSession(session.id)
                                                    }
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium truncate"
                                                            style={{ color: theme.sessionText }}>
                                                            {session.title}
                                                        </p>
                                                        <p className="text-xs message-timestamp"
                                                            style={{ color: theme.sessionMeta }}>
                                                            {new Date(
                                                                session.lastActivity
                                                            ).toLocaleDateString(
                                                                "id-ID"
                                                            )}{" "}
                                                            •{" "}
                                                            {
                                                                session.messages
                                                                    .length
                                                            }{" "}
                                                            pesan
                                                        </p>
                                                    </div>
                                                    {sessions.length > 1 && (
                                                        <button
                                                            onClick={(e) =>
                                                                deleteSession(
                                                                    session.id,
                                                                    e
                                                                )
                                                            }
                                                            className="session-delete-btn ml-2 hover:text-red-500 transition-colors"
                                                            style={{ color: theme.sessionMeta }}
                                                            title="Hapus chat"
                                                        >
                                                            <svg
                                                                className="w-3 h-3"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 p-4 h-64 overflow-y-auto" style={{ backgroundColor: theme.chatAreaBg }}>
                        <div className="space-y-3">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`message-item flex ${message.sender === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                        }`}
                                >
                                    <div
                                        className={`max-w-xs px-3 py-2 rounded-lg ${message.sender === "user"
                                            ? "text-white shadow-md"
                                            : "text-gray-800 shadow-sm border"
                                            }`}
                                        style={{
                                            backgroundColor:
                                                message.sender === "user"
                                                    ? theme.userMessageBg
                                                    : theme.botMessageBg,
                                            color:
                                                message.sender === "user"
                                                    ? theme.userMessageText
                                                    : theme.botMessageText,
                                            borderColor:
                                                message.sender === "user"
                                                    ? "transparent"
                                                    : theme.botMessageBorder
                                        }}
                                    >
                                        <div
                                            className="text-sm"
                                            style={{
                                                whiteSpace: "pre-wrap",
                                                lineHeight: "1.5"
                                            }}
                                            dangerouslySetInnerHTML={{
                                                __html: message.text
                                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                    .replace(/\n/g, '<br>')
                                                    .replace(/•/g, '•')
                                            }}
                                        />
                                        <p
                                            className="message-timestamp text-xs mt-1"
                                            style={{
                                                color: message.sender === "user"
                                                    ? "rgba(255, 255, 255, 0.7)"
                                                    : darkMode ? "#9CA3AF" : "#6B7280"
                                            }}
                                        >
                                            {formatTime(message.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="px-3 py-2 rounded-lg shadow-sm border"
                                        style={{
                                            backgroundColor: theme.botMessageBg,
                                            borderColor: theme.botMessageBorder
                                        }}>
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 rounded-full animate-bounce"
                                                style={{ backgroundColor: darkMode ? "#9CA3AF" : "#6B7280" }}></div>
                                            <div
                                                className="w-2 h-2 rounded-full animate-bounce"
                                                style={{
                                                    backgroundColor: darkMode ? "#9CA3AF" : "#6B7280",
                                                    animationDelay: "0.1s",
                                                }}
                                            ></div>
                                            <div
                                                className="w-2 h-2 rounded-full animate-bounce"
                                                style={{
                                                    backgroundColor: darkMode ? "#9CA3AF" : "#6B7280",
                                                    animationDelay: "0.2s",
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Replies */}
                        {showQuickReplies && messages.length === 1 && (
                            <div className="px-4 pb-2">
                                <p className="text-xs mb-3 font-medium"
                                    style={{ color: darkMode ? "#9CA3AF" : "#6B7280" }}>
                                    💡 Pilih topik yang ingin ditanyakan:
                                </p>
                                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                                    {quickReplies.map((reply, index) => (
                                        <button
                                            key={index}
                                            onClick={() =>
                                                handleQuickReply(reply)
                                            }
                                            className="text-xs px-3 py-2 rounded-lg transition-all duration-200 hover:shadow-sm text-left"
                                            style={{
                                                backgroundColor: theme.quickReplyBg,
                                                color: theme.quickReplyText,
                                                border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`
                                            }}
                                        >
                                            {reply}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs mt-2 opacity-75"
                                    style={{ color: darkMode ? "#9CA3AF" : "#6B7280" }}>
                                    Atau ketik pertanyaan Anda...
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 rounded-b-lg border-t"
                        style={{
                            backgroundColor: theme.windowBg,
                            borderColor: darkMode ? '#4B5563' : '#E5E7EB'
                        }}>
                        <div className="flex space-x-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ketik pesan Anda..."
                                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                                style={{
                                    backgroundColor: theme.inputBg,
                                    borderColor: theme.inputBorder,
                                    color: theme.inputText,

                                }}
                            />
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!inputValue.trim()}
                                className="px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    backgroundColor: inputValue.trim()
                                        ? primaryColor
                                        : "#gray-400",
                                }}
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chat Button */}
                <button
                    onClick={toggleChat}
                    className={`relative w-16 h-16 rounded-full text-white shadow-lg transform transition-all duration-200 hover:scale-110 ${isOpen ? "rotate-0" : "rotate-0 hover:rotate-12"
                        }`}
                    style={{ backgroundColor: primaryColor }}
                >
                    {/* Notification Badge */}
                    {hasNewMessage && !isOpen && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                            <span className="text-white text-xs font-bold">
                                !
                            </span>
                        </div>
                    )}

                    {/* Icon */}
                    <div
                        className={`transform transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"
                            }`}
                    >
                        {isOpen ? (
                            <svg
                                className="w-6 h-6 mx-auto"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-6 h-6 mx-auto"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                        )}
                    </div>
                </button>

                {/* Floating Animation Circles */}
                <div className="absolute inset-0 pointer-events-none">
                    <div
                        className={`absolute w-20 h-20 rounded-full opacity-20 animate-ping ${isOpen ? "hidden" : ""
                            }`}
                        style={{ backgroundColor: primaryColor }}
                    ></div>
                    <div
                        className={`absolute w-16 h-16 rounded-full opacity-30 animate-ping ${isOpen ? "hidden" : ""
                            }`}
                        style={{
                            backgroundColor: accentColor,
                            animationDelay: "1s",
                        }}
                    ></div>
                </div>
            </div>

            {/* Global styles for chat widget */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @keyframes bounce {
                    0%, 60%, 100% {
                        transform: translateY(0);
                    }
                    30% {
                        transform: translateY(-10px);
                    }
                }
                
                @keyframes ping {
                    75%, 100% {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
                
                .chat-widget .animate-bounce {
                    animation: bounce 1.4s infinite;
                }
                
                .chat-widget .animate-ping {
                    animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
                
                /* Custom scrollbar */
                .chat-widget .overflow-y-auto::-webkit-scrollbar {
                    width: 4px;
                }
                
                .chat-widget .overflow-y-auto::-webkit-scrollbar-track {
                    background: ${darkMode ? '#111827' : '#f1f1f1'};
                    border-radius: 2px;
                }
                
                .chat-widget .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: ${darkMode ? '#4B5563' : '#c1c1c1'};
                    border-radius: 2px;
                }
                
                .chat-widget .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                    background: ${darkMode ? '#6B7280' : '#a8a8a8'};
                }
                
                /* Session hover effects */
                .chat-widget .session-list-item:hover {
                    background-color: ${darkMode ? '#374151' : '#F9FAFB'};
                }
                
                /* Quick reply hover effects */
                .chat-widget button[class*="px-3 py-1 rounded-full"]:hover {
                    background-color: ${darkMode ? '#4B5563' : '#E5E7EB'};
                }
                
                /* Mobile responsive */
                @media (max-width: 480px) {
                    .chat-widget .w-80 {
                        width: calc(100vw - 2rem);
                        max-width: 320px;
                    }
                }
                `,
                }}
            />
        </>
    );
};

export default ChatWidget;
