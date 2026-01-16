import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Navbar from "./components/Navbar.jsx";
import Index from "./pages/Dashboard.jsx";
import Bookings from "./pages/Bookings.jsx";
import AdminDash from "./pages/AdminDash.jsx";

import { BrowserRouter as Router, Routes, Route } from "react-router";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={<Index />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/admin" element={<AdminDash />} />
      </Routes>
    </Router>
  </StrictMode>
);
