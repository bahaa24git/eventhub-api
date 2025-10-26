import React, { useState } from "react";
import axios from "axios";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/auth/login/",
        { username, password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        localStorage.setItem("token", response.data.access);
        localStorage.setItem("refresh", response.data.refresh);
        const profile = await axios.get("http://127.0.0.1:8000/api/v1/auth/me/", {
        headers: { Authorization: `Bearer ${response.data.access}` },
        });

        // ✅ save the user profile locally for the navbar
        localStorage.setItem("user", JSON.stringify(profile.data));

        alert("✅ Login successful!");
        window.location.href = "/dashboard";
      }
      
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      alert("❌ Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #3b82f6, #1e3a8a)",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "40px 35px",
          borderRadius: "12px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "25px",
            color: "#1e293b",
            fontWeight: "600",
          }}
        >
          🔐 Login to EventHub
        </h2>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              fontSize: "15px",
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "20px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              fontSize: "15px",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "6px",
              border: "none",
              background: loading ? "#93c5fd" : "#3b82f6",
              color: "#fff",
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "500",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            color: "#475569",
            fontSize: "14px",
          }}
        >
          Don’t have an account?{" "}
          <a
            href="/register"
            style={{ color: "#3b82f6", textDecoration: "none", fontWeight: "500" }}
          >
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;