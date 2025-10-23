import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function ProjectMembers() {
  const { id } = useParams(); // project id
  const token = localStorage.getItem("token");
  const [members, setMembers] = useState([]);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("MEMBER");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/v1/projects/${id}/members/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMembers(response.data.results || response.data);
      } catch (error) {
        console.error("Error fetching members:", error);
        if (error.response?.status === 401) {
          alert("Session expired. Please log in again.");
          localStorage.removeItem("token");
          window.location.href = "/";
        }
      }
    };

    fetchMembers();
  }, [id, token]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/v1/projects/${id}/members/`,
        { username, role },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Member added successfully!");
      setUsername("");
      setRole("MEMBER");
      // refresh
      const refreshed = await axios.get(
        `http://127.0.0.1:8000/api/v1/projects/${id}/members/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMembers(refreshed.data);
    } catch (error) {
      console.error("Add member error:", error.response?.data || error.message);
      alert("Failed to add member");
    }
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/v1/projects/${id}/members/${memberId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMembers(members.filter((m) => m.id !== memberId));
    } catch (error) {
      console.error("Remove failed:", error);
      alert("Failed to remove member");
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Project Members</h1>

      <form onSubmit={handleAddMember} className="project-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="OWNER">Owner</option>
          <option value="ADMIN">Admin</option>
          <option value="MEMBER">Member</option>
          <option value="VIEWER">Viewer</option>
        </select>
        <button type="submit" className="primary-btn">Add Member</button>
      </form>

      <ul className="project-list">
        {members.length === 0 ? (
          <p className="no-projects">No members yet.</p>
        ) : (
          members.map((m) => (
            <li key={m.id} className="project-item">
              <div className="project-details">
                <h3>{m.user.username}</h3>
                <p>Role: {m.role}</p>
                <p>Joined: {new Date(m.joined_at).toLocaleDateString()}</p>
              </div>
              <div className="project-actions">
                <button
                  className="delete-btn"
                  onClick={() => handleRemove(m.id)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

      <button
        className="cancel-btn"
        onClick={() => (window.location.href = "/dashboard")}
      >
        Back to Dashboard
      </button>
    </div>
  );
}

export default ProjectMembers;
