import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("token");

  const [id, setId] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Fetch current user profile
  useEffect(() => {
    if (!token) {
      window.location.href = "/";
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/v1/auth/me/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
        setId(res.data.id || "");
        setUsername(res.data.username || "");
        setEmail(res.data.email || "");
        setPhone(res.data.phone || "");
      } catch (err) {
        console.error("Error fetching profile:", err.response?.data || err.message);
        alert("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  // Handle profile update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put(
        "http://127.0.0.1:8000/api/v1/auth/profile/",
        { username, email, phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(res.data);
      alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
      alert("❌ Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p style={{ textAlign: "center", marginTop: "60px" }}>Loading profile...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        style={{
          maxWidth: "600px",
          margin: "50px auto",
          background: "#fff",
          borderRadius: "12px",
          padding: "35px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#1e293b",
            fontSize: "1.8rem",
            fontWeight: "700",
            marginBottom: "25px",
          }}
        >
          👤 My Profile
        </h2>

        <form onSubmit={handleUpdate}>
          {/* ID (read-only) */}
          <label style={{ display: "block", marginBottom: "6px", color: "#475569" }}>
            ID
          </label>
          <input
            type="text"
            value={id}
            readOnly
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "15px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              background: "#f1f5f9",
              color: "#475569",
            }}
          />

          {/* Username */}
          <label style={{ display: "block", marginBottom: "6px", color: "#475569" }}>
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "15px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
            }}
          />

          {/* Email */}
          <label style={{ display: "block", marginBottom: "6px", color: "#475569" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "15px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
            }}
          />

          {/* Phone */}
          <label style={{ display: "block", marginBottom: "6px", color: "#475569" }}>
            Phone Number
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +201112223334"
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "20px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
            }}
          />

          <button
            type="submit"
            disabled={saving}
            style={{
              width: "100%",
              padding: "10px",
              background: saving ? "#93c5fd" : "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <button
          onClick={() => (window.location.href = "/dashboard")}
          style={{
            display: "block",
            width: "100%",
            background: "#94a3b8",
            color: "#fff",
            border: "none",
            padding: "10px",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "15px",
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </Layout>
  );
}

export default Profile;