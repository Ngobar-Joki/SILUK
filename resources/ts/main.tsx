import React from "react";
import { createRoot } from "react-dom/client";
import AppMain from "./AppMain";
import "../css/app.css";
import "../css/animations.css";
import "../css/Sidebar.css";

const container = document.getElementById("app");
if (!container) {
    throw new Error("Failed to find the root element");
}

const root = createRoot(container);
root.render(
    <React.StrictMode>
        <AppMain />
    </React.StrictMode>
);
