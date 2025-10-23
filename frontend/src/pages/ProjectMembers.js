import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function ProjectMembers() {
  const { id } = useParams(); // project id
  const token = localStorage.getItem("token");

  const [members, setMembers] = useState([]);
  const [role, setRole] = useState("MEMBER");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  // Fetch current project members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/v1/projects/${id}/members/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembers(res.data.results || res.data);
      } catch (err) {
        console.error("Error fetching members:", err);
      }
    };
    fetchMembers();
  }, [id, token]);

  // Detect click outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live user search from backend
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

  // Add member
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUser) return alert("Please select a user first!");
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/v1/projects/${id}/members/`,
        { user: selectedUser.id, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Member added!");
      setSearch("");
      setSelectedUser(null);
      setShowDropdown(false);

      const refreshed = await axios.get(`http://127.0.0.1:8000/api/v1/projects/${id}/members/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(refreshed.data.results || refreshed.data);
    } catch (err) {
      console.error("Add member failed:", err.response?.data || err.message);
      alert("Failed to add member");
    }
  };

  // Remove member
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

  return (
    <div className="dashboard-container" style={{ maxWidth: "650px", margin: "50px auto" }}>
      <h1 className="dashboard-title" style={{ textAlign: "center" }}>Project Members</h1>

      {/* Add Member Form */}
      <form onSubmit={handleAddMember} className="project-form" style={{ position: "relative" }} ref={dropdownRef}>
        <input
          type="text"
          placeholder="Type username..."
          value={selectedUser ? selectedUser.username : search}
          onChange={handleSearch}
          onFocus={() => setShowDropdown(true)}
          className="form-input"
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />

        {/* Dropdown suggestions */}
        {showDropdown && users.length > 0 && (
          <ul
            style={{
              position: "absolute",
              top: "45px",
              left: 0,
              right: 0,
              background: "#fff",
              listStyle: "none",
              padding: "0",
              borderRadius: "6px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              zIndex: 10,
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {users.map((u) => (
              <li
                key={u.id}
                style={{
                  padding: "10px 15px",
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onClick={() => {
                  setSelectedUser(u);
                  setSearch(u.username);
                  setShowDropdown(false);
                }}
                onMouseEnter={(e) => (e.target.style.background = "#f2f2f2")}
                onMouseLeave={(e) => (e.target.style.background = "#fff")}
              >
                {u.username} <span style={{ color: "#777", fontSize: "0.85rem" }}>({u.email})</span>
              </li>
            ))}
          </ul>
        )}

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ marginTop: "10px", padding: "8px", width: "100%", borderRadius: "6px", border: "1px solid #ccc" }}
        >
          <option value="OWNER">Owner</option>
          <option value="ADMIN">Admin</option>
          <option value="MEMBER">Member</option>
          <option value="VIEWER">Viewer</option>
        </select>

        <button
          type="submit"
          className="primary-btn"
          style={{
            marginTop: "10px",
            width: "100%",
            background: "#007bff",
            color: "white",
            padding: "10px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Add Member
        </button>
      </form>

      {/* Member List */}
      <ul className="project-list" style={{ marginTop: "30px", padding: 0 }}>
        {members.length === 0 ? (
          <p className="no-projects" style={{ textAlign: "center", color: "#777" }}>
            No members yet.
          </p>
        ) : (
          members.map((m) => (
            <li
              key={m.id}
              className="project-item"
              style={{
                background: "#fff",
                padding: "15px 20px",
                marginBottom: "12px",
                borderRadius: "8px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 5px 0" }}>{m.user.username}</h3>
                <p style={{ margin: "0", color: "#555" }}>Role: {m.role}</p>
                <p style={{ margin: "0", color: "#777" }}>
                  Joined: {new Date(m.joined_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleRemove(m.id)}
                className="delete-btn"
                style={{
                  background: "#e63946",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  padding: "6px 12px",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </li>
          ))
        )}
      </ul>

      <button
        className="cancel-btn"
        onClick={() => (window.location.href = "/dashboard")}
        style={{
          display: "block",
          margin: "25px auto",
          background: "#adb5bd",
          color: "white",
          border: "none",
          borderRadius: "6px",
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        Back to Dashboard
      </button>
    </div>
  );
}

export default ProjectMembers;