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
import Dashboard from "./operator/Dashboard";
import Users from "./pages/Users";
import Documents from "./pages/Documents";
import SettingsPage from "./pages/Settings";
import VisiMisiPage from "./operator/VisiMisi";
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
                        <Route path="/users" element={<Users />} />
                        <Route path="/documents" element={<Documents />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/visi-misi" element={<VisiMisiPage />} />

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
