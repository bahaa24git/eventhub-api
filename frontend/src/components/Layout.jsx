import React from "react";
import { Link, useLocation } from "react-router-dom";

function Layout({ children }) {
  const location = useLocation();

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
          <h2
            style={{
              fontSize: "22px",
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: "25px",
            }}
          >
            EventHub
          </h2>

          <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Link
              to="/dashboard"
              style={{
                color: location.pathname.includes("dashboard")
                  ? "#38bdf8"
                  : "#e2e8f0",
                textDecoration: "none",
              }}
            >
              📊 Dashboard
            </Link>

            <Link
              to="/dashboard"
              style={{
                color: location.pathname.includes("projects")
                  ? "#38bdf8"
                  : "#e2e8f0",
                textDecoration: "none",
              }}
            >
              📁 Projects
            </Link>
          </nav>
        </div>

        <div>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            style={{
              background: "#ef4444",
              color: "#fff",
              border: "none",
              padding: "8px 10px",
              width: "100%",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "30px 50px", marginLeft: "220px" }}>{children}</main>
    </div>
  );
}

export default Layout;