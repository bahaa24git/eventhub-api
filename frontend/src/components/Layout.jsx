// src/components/Layout.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Layout({ children }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const menuRef = useRef(null);

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // ✅ Fetch user profile (for avatar)
  useEffect(() => {
    if (!token) return;
    axios
      .get("http://127.0.0.1:8000/api/v1/auth/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProfile(res.data))
      .catch(() => {});
  }, [token]);

  // ✅ Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 🔹 Navbar */}
      <nav
        style={{
          background: "#1e293b",
          color: "#fff",
          padding: "14px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            fontWeight: "700",
            fontSize: "1.2rem",
            cursor: "pointer",
            letterSpacing: "0.5px",
          }}
          onClick={() => navigate("/dashboard")}
        >
          🚀 ProjectHub
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
          <button onClick={() => navigate("/dashboard")} style={navButtonStyle}>
            Dashboard
          </button>

          <button onClick={() => navigate("/projects")} style={navButtonStyle}>
            Projects
          </button>

          {/* 🔹 User Dropdown */}
          <div style={{ position: "relative" }} ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: "transparent",
                border: "none",
                color: "#e2e8f0",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
              }}
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="avatar"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #3b82f6",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "#334155",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "600",
                  }}
                >
                  {profile?.user?.username
                    ? profile.user.username.charAt(0).toUpperCase()
                    : "?"}
                </div>
              )}

              <span style={{ fontWeight: "500", fontSize: "0.95rem" }}>
                {profile?.user?.username || "..."}
              </span>
              <span style={{ fontSize: "0.7rem" }}>
                {menuOpen ? "▲" : "▼"}
              </span>
            </button>

            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "42px",
                  background: "#fff",
                  color: "#1e293b",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  minWidth: "160px",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => navigate("/profile")}
                  style={dropdownItem}
                >
                  Profile
                </button>
                <button
                  onClick={() => navigate("/settings")}
                  style={dropdownItem}
                >
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  style={{ ...dropdownItem, color: "#ef4444" }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 🔹 Page content */}
      <main style={{ flex: 1, padding: "40px 20px" }}>{children}</main>
    </div>
  );
}

const navButtonStyle = {
  background: "transparent",
  color: "#e2e8f0",
  border: "none",
  fontSize: "0.95rem",
  fontWeight: "500",
  cursor: "pointer",
  transition: "color 0.2s ease",
};

const dropdownItem = {
  display: "block",
  width: "100%",
  padding: "10px 15px",
  textAlign: "left",
  background: "transparent",
  border: "none",
  fontSize: "0.9rem",
  cursor: "pointer",
  transition: "background 0.2s ease",
};

export default Layout;