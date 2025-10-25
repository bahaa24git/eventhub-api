import React from "react";
import { Link, useLocation } from "react-router-dom";

function Layout({ children }) {
  const location = useLocation();

  const linkStyle = (path) => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 15px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "500",
    color: location.pathname.includes(path) ? "#38bdf8" : "#e2e8f0",
    backgroundColor: location.pathname.includes(path)
      ? "rgba(56, 189, 248, 0.1)"
      : "transparent",
    transition: "all 0.2s ease-in-out",
  });

  const hoverStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f9fafb" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "220px",
          background: "#1e293b",
          color: "#fff",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          overflowY: "auto",
        }}
      >
        <div>
          {/* Logo */}
          <div
            style={{
              textAlign: "center",
              background: "#0f172a",
              borderRadius: "10px",
              padding: "15px 10px",
              marginBottom: "25px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "bold",
                color: "#38bdf8",
                margin: 0,
              }}
            >
              EventHub
            </h2>
            <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
              Manage Projects & Teams
            </p>
          </div>

          {/* Navigation Links */}
          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              background: "#0f172a",
              padding: "15px 12px",
              borderRadius: "10px",
              boxShadow: "inset 0 0 10px rgba(0,0,0,0.2)",
            }}
          >
            <Link to="/dashboard" style={linkStyle("dashboard")}>
              <span style={{ fontSize: "18px" }}>📊</span> Dashboard
            </Link>

            <Link to="/projects" style={linkStyle("projects")}>
              <span style={{ fontSize: "18px" }}>📁</span> Projects
            </Link>

            <Link to="/profile" style={linkStyle("profile")}>
              <span style={{ fontSize: "18px" }}>👤</span> Profile
            </Link>
          </nav>
        </div>

        {/* Logout Button */}
        <div
          style={{
            background: "#0f172a",
            borderRadius: "10px",
            padding: "15px 12px",
            marginTop: "30px",
            boxShadow: "inset 0 0 10px rgba(0,0,0,0.2)",
          }}
        >
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            style={{
              width: "100%",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              padding: "10px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.target.style.background = "#dc2626")
            }
            onMouseLeave={(e) =>
              (e.target.style.background = "#ef4444")
            }
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "40px 60px" ,marginLeft: "220px"}}>{children}</main>
    </div>
  );
}

export default Layout;