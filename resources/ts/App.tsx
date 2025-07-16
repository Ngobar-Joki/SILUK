import React from "react";
import "../css/app.css";
import "../css/AccessibilityWidget.css";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import Welcome from "./pages/welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileUser from "./pages/ProfileUser";
import ProfilePendaftar from "./pages/ProfilePendaftar";

import Dashboard from "./pages/operator/Dashboard";
import DaftarUserPage from "./pages/operator/DaftarUser";
import VisiMisiPage from "./pages/operator/VisiMisi";
import StrukturOrganisasiPage from "./pages/operator/StrukturOrganisasi";
import BeritaPage from "./pages/operator/Berita";
import DaftarPermohonan from "./pages/operator/DaftarPermohonan";
import DaftarLaporan from "./pages/operator/DaftarLaporan";

import PengajuanPermohonan from "./pages/pendaftar/Permohonan";
import LaporanBulanan from "./pages/pendaftar/LaporanBulanan";


import ResendVerificationPage from "./pages/ResendVerificationPage";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import AccessibilityWidget from "./components/AccessibilityWidget";

const App: React.FC = () => {
    return (
        <AccessibilityProvider>
            <Router future={{ v7_startTransition: true }}>
                <div className="App">
                    <Routes>
                        <Route path="/" element={<Welcome />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route
                            path="/daftar-user"
                            element={<DaftarUserPage />}
                        />
                       
                      
                        <Route path="/visi-misi" element={<VisiMisiPage />} />
                        <Route
                            path="/struktur-organisasi"
                            element={<StrukturOrganisasiPage />}
                        />
                        <Route path="/berita" element={<BeritaPage />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/profile-user"
                            element={<ProfileUser />}
                        />
                        <Route
                            path="/permohonan"
                            element={<PengajuanPermohonan />}
                        />
                        <Route
                            path="/daftar-permohonan"
                            element={<DaftarPermohonan />}
                        />
                        <Route
                            path="/laporan-bulanan"
                            element={<LaporanBulanan />}
                        />
                        <Route
                            path="/daftar-laporan"
                            element={<DaftarLaporan />}
                        />
                        <Route
                            path="/profile-pendaftar"
                            element={<ProfilePendaftar />}
                        />
                        <Route
                            path="/resend-verification"
                            element={<ResendVerificationPage />}
                        />

                        {/* Add more routes as needed */}

                        {/* Redirects for legacy routes */}

                        {/* Fallback Route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>

                    {/* Global Accessibility Widget */}
                    <AccessibilityWidget />
                </div>
            </Router>
        </AccessibilityProvider>
    );
};

export default App;
