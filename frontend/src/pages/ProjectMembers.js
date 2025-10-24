import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function ProjectMembers() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [members, setMembers] = useState([]);
  const [role, setRole] = useState("MEMBER");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  // fetch current project members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/v1/projects/${id}/members/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMembers(res.data.results || res.data);
      } catch (err) {
        console.error("Error fetching members:", err);
      }
    };
    fetchMembers();
  }, [id, token]);

  // click outside → close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // live search
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearch(value);
    setShowDropdown(true);
    setSelectedUser(null);
    if (value.trim().length < 1) return setUsers([]);

    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/v1/auth/users/?q=${value}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(res.data.results || res.data);
    } catch (err) {
      console.error("User search error:", err);
    }
  };

  // add member
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUser) return alert("Please select a user first!");
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/v1/projects/${id}/members/`,
        { user: selectedUser.id, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Member added!");
      setSearch("");
      setSelectedUser(null);
      setShowDropdown(false);
      const refreshed = await axios.get(
        `http://127.0.0.1:8000/api/v1/projects/${id}/members/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMembers(refreshed.data.results || refreshed.data);
    } catch (err) {
      console.error("Add member failed:", err.response?.data || err.message);
      alert("❌ Failed to add member");
    }
  };

  // remove member
  const handleRemove = async (memberId) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/v1/projects/${id}/members/${memberId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMembers(members.filter((m) => m.id !== memberId));
    } catch (err) {
      console.error("Remove failed:", err);
    }
  };
// ✅ role-based gradient styles (Discord look)
const getRoleStyle = (role) => {
  switch (role) {
    case "OWNER":
      return {
        background: "linear-gradient(135deg, #fef3c7, #fde68a)",
        color: "#78350f",
        boxShadow: "0 2px 5px rgba(250, 204, 21, 0.3)",
        transition: "all 0.25s ease-in-out",
      };
    case "ADMIN":
      return {
        background: "linear-gradient(135deg, #dbeafe, #93c5fd)",
        color: "#1e3a8a",
        boxShadow: "0 2px 5px rgba(59,130,246,0.3)",
        transition: "all 0.25s ease-in-out",
      };
    case "MEMBER":
      return {
        background: "linear-gradient(135deg, #dcfce7, #86efac)",
        color: "#065f46",
        boxShadow: "0 2px 5px rgba(34,197,94,0.3)",
        transition: "all 0.25s ease-in-out",
      };
    case "VIEWER":
      return {
        background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
        color: "#374151",
        boxShadow: "0 2px 5px rgba(156,163,175,0.3)",
        transition: "all 0.25s ease-in-out",
      };
    default:
      return {
        background: "#f3f4f6",
        color: "#374151",
        transition: "all 0.25s ease-in-out",
      };
  }
};
  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "60px auto",
        background: "#fff",
        borderRadius: "12px",
        padding: "30px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontWeight: "700",
          color: "#1e293b",
          fontSize: "1.8rem",
          marginBottom: "25px",
        }}
      >
        👥 Project Members
      </h1>

      {/* add member */}
      <form
        onSubmit={handleAddMember}
        ref={dropdownRef}
        style={{ position: "relative", marginBottom: "25px" }}
      >
        <input
          type="text"
          placeholder="Search username..."
          value={selectedUser ? selectedUser.username : search}
          onChange={handleSearch}
          onFocus={() => setShowDropdown(true)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            fontSize: "15px",
            marginBottom: "10px",
          }}
        />

        {showDropdown && users.length > 0 && (
          <ul
            style={{
              position: "absolute",
              top: "48px",
              left: 0,
              right: 0,
              background: "#fff",
              listStyle: "none",
              padding: 0,
              borderRadius: "6px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              zIndex: 20,
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {users.map((u) => (
              <li
                key={u.id}
                onClick={() => {
                  setSelectedUser(u);
                  setSearch(u.username);
                  setShowDropdown(false);
                }}
                style={{
                  padding: "10px 15px",
                  borderBottom: "1px solid #f1f5f9",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#f1f5f9")}
                onMouseLeave={(e) => (e.target.style.background = "#fff")}
              >
                <strong>{u.username}</strong>{" "}
                <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
                  ({u.email})
                </span>
              </li>
            ))}
          </ul>
        )}

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            fontSize: "15px",
            marginTop: "8px",
            marginBottom: "12px",
          }}
        >
          <option value="OWNER">Owner</option>
          <option value="ADMIN">Admin</option>
          <option value="MEMBER">Member</option>
          <option value="VIEWER">Viewer</option>
        </select>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          ➕ Add Member
        </button>
      </form>

      {/* members list */}
      {members.length === 0 ? (
        <p style={{ textAlign: "center", color: "#64748b" }}>No members yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {members.map((m) => (
            <li
              key={m.id}
              style={{
                background: "#f8fafc",
                padding: "15px 20px",
                marginBottom: "10px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 5px", color: "#1e293b" }}>
                  {m.user.username}
                </h3>
<div
  style={{
    ...getRoleStyle(m.role),
    display: "inline-block",
    padding: "6px 14px",
    borderRadius: "9999px",
    fontSize: "13px",
    fontWeight: "600",
    marginTop: "6px",
    transform: "translateY(0)",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-2px) scale(1.05)";
    e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = getRoleStyle(m.role).boxShadow;
  }}
>
  {m.role}
</div>
                <p
                  style={{ margin: "0", color: "#94a3b8", fontSize: "0.85rem" }}
                >
                  Joined {new Date(m.joined_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleRemove(m.id)}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => (window.location.href = "/dashboard")}
        style={{
          display: "block",
          margin: "25px auto 0",
          background: "#94a3b8",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}

export default ProjectMembers;
