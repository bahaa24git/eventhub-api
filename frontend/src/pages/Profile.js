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
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  // Fetch user profile
  useEffect(() => {
    if (!token) {
      window.location.href = "/";
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/v1/auth/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
        setId(res.data.user?.id || res.data.id || "");
        setUsername(res.data.user?.username || res.data.username || "");
        setEmail(res.data.user?.email || res.data.email || "");
        setPhone(res.data.phone || "");
        setAvatarPreview(res.data.avatar_url || "");
      } catch (err) {
        console.error("Error fetching profile:", err.response?.data || err.message);
        alert("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  // Handle avatar selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file)); // instant preview
    }
  };

  // Handle profile update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("phone", phone);
      if (avatar) formData.append("avatar", avatar);

      const res = await axios.put(
        "http://127.0.0.1:8000/api/v1/auth/profile/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProfile(res.data);
      setAvatarPreview(res.data.avatar_url || avatarPreview);
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

        {/* Avatar Upload */}
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <img
            src={
              avatarPreview ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="Avatar"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: "10px",
              border: "2px solid #cbd5e1",
            }}
          />
          <div>
            <label
              style={{
                background: "#3b82f6",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "500",
              }}
            >
              📷 Upload Avatar
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>

        <form onSubmit={handleUpdate}>
          {/* ID (read-only) */}
          <label style={labelStyle}>ID</label>
          <input type="text" value={id} readOnly style={readonlyInput} />

          {/* Username */}
          <label style={labelStyle}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={inputStyle}
          />

          {/* Email */}
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          {/* Phone */}
          <label style={labelStyle}>Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +201112223334"
            style={inputStyle}
          />

          {/* Save Button */}
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

// Shared styles
const labelStyle = { display: "block", marginBottom: "6px", color: "#475569" };
const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
};
const readonlyInput = {
  ...inputStyle,
  background: "#f1f5f9",
  color: "#475569",
};

export default Profile;