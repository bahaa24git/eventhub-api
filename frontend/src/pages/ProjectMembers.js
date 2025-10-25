import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API = "http://127.0.0.1:8000/api/v1";

export default function ProjectMembers() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [addRole, setAddRole] = useState("MEMBER");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  const canManage = ["OWNER", "ADMIN"].includes(role);

  // 🔹 Fetch members + role
  useEffect(() => {
    (async () => {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        const userId = decoded.user_id || decoded.id;
        const res = await axios.get(`${API}/projects/${id}/members/`, { headers });
        const list = res.data.results || res.data;
        setMembers(list);
        const me = list.find((m) => String(m.user.id) === String(userId));
        setRole(me ? me.role : "VIEWER");
      } catch {
        alert("Failed to load members");
      }
    })();
  }, [id, token]);

  // 🔹 Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) =>
      dropdownRef.current && !dropdownRef.current.contains(e.target) && setShowDropdown(false);
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // 🔹 Search users
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearch(value);
    setSelectedUser(null);
    if (!value.trim()) return setUsers([]);
    setShowDropdown(true);
    const res = await axios.get(`${API}/auth/users/?q=${value}`, { headers });
    setUsers(res.data.results || res.data);
  };

  // 🔹 Add member
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedUser) return alert("Select a user first!");
    try {
      await axios.post(
        `${API}/projects/${id}/members/`,
        { user_id: selectedUser.id, role: addRole },
        { headers }
      );
      setSearch("");
      setSelectedUser(null);
      setShowDropdown(false);
      const refresh = await axios.get(`${API}/projects/${id}/members/`, { headers });
      setMembers(refresh.data.results || refresh.data);
    } catch {
      alert("Failed to add member");
    }
  };

  // 🔹 Remove member
  const handleRemove = async (mid) => {
    if (!window.confirm("Remove this member?")) return;
    await axios.delete(`${API}/projects/${id}/members/${mid}/`, { headers });
    setMembers(members.filter((m) => m.id !== mid));
  };

  // 🔹 Role style
  const roleStyle = {
    OWNER: { bg: "#fde68a", color: "#78350f" },
    ADMIN: { bg: "#93c5fd", color: "#1e3a8a" },
    MEMBER: { bg: "#86efac", color: "#065f46" },
    VIEWER: { bg: "#e5e7eb", color: "#374151" },
  };

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "60px auto",
        background: "#fff",
        borderRadius: 12,
        padding: 30,
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#1e293b" }}>👥 Project Members</h1>
      <p style={{ textAlign: "center", color: "#64748b" }}>
        <strong>Your Role:</strong> {role}
      </p>

      {/* Add Member */}
      {canManage && (
        <form
          onSubmit={handleAdd}
          ref={dropdownRef}
          style={{ position: "relative", marginBottom: 25 }}
        >
          <input
            type="text"
            placeholder="Search username..."
            value={selectedUser ? selectedUser.username : search}
            onChange={handleSearch}
            onFocus={() => setShowDropdown(true)}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              marginBottom: 10,
            }}
          />
          {showDropdown && users.length > 0 && (
            <ul
              style={{
                position: "absolute",
                top: 50,
                left: 0,
                right: 0,
                background: "#fff",
                borderRadius: 6,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                maxHeight: 200,
                overflowY: "auto",
                zIndex: 10,
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
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>({u.email})</span>
                </li>
              ))}
            </ul>
          )}

          <select
            value={addRole}
            onChange={(e) => setAddRole(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              marginBottom: 12,
            }}
          >
            {["OWNER", "ADMIN", "MEMBER", "VIEWER"].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: 12,
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            ➕ Add Member
          </button>
        </form>
      )}

      {/* Member List */}
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
                marginBottom: 10,
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ margin: 0, color: "#1e293b" }}>{m.user.username}</h3>
                <div
                  style={{
                    background: roleStyle[m.role]?.bg,
                    color: roleStyle[m.role]?.color,
                    display: "inline-block",
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 600,
                    marginTop: 6,
                  }}
                >
                  {m.role}
                </div>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
                  Joined {new Date(m.joined_at).toLocaleDateString()}
                </p>
              </div>
              {canManage && (
                <button
                  onClick={() => handleRemove(m.id)}
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 10px",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <button
          onClick={() => (window.location.href = `/projects/${id}/details`)}
          style={{
            display: "block",
            margin: "30px auto 0",
            background: "#64748b",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          ← Back to Project
        </button>
    </div>
  );
}