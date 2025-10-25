import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";

function TaskSubtasks() {
  const { id, taskId } = useParams(); // project id + task id
  const token = localStorage.getItem("token");

  const [subtasks, setSubtasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [role, setRole] = useState("VIEWER");

  // ✅ Fetch subtasks + user role
  useEffect(() => {
    const fetchSubtasksAndRole = async () => {
      try {
        // decode JWT
        let decoded = {};
        try {
          decoded = JSON.parse(atob(token.split(".")[1]));
        } catch {
          console.warn("❌ Failed to decode token");
        }
        const userId = decoded.user_id || decoded.id || decoded.sub || null;

        // get project details for role
        const projectRes = await axios.get(
          `http://127.0.0.1:8000/api/v1/projects/${id}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const members = projectRes.data.members || [];
        const myMember = members.find((m) => String(m.user.id) === String(userId));
        setRole(myMember ? myMember.role : "VIEWER");

        // get subtasks
        const res = await axios.get(
          `http://127.0.0.1:8000/api/v1/projects/${id}/tasks/${taskId}/subtasks/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSubtasks(res.data.results || res.data);
      } catch (err) {
        console.error("Error fetching subtasks:", err);
      }
    };
    fetchSubtasksAndRole();
  }, [id, taskId, token]);

  const canManage = role === "OWNER" || role === "ADMIN";
  const canToggle = canManage || role === "MEMBER"; // ✅ allow members to mark done

  // ➕ Add new subtask (admins/owners only)
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!canManage) return alert("You do not have permission to add subtasks.");
    if (!newTitle.trim()) return;

    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/v1/projects/${id}/tasks/${taskId}/subtasks/`,
        { title: newTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubtasks([...subtasks, res.data]);
      setNewTitle("");
    } catch (err) {
      console.error("Error adding subtask:", err);
      alert("Failed to add subtask");
    }
  };

  // ✅ Toggle done/undone (members + admins/owners)
  const toggleDone = async (subtask) => {
    if (!canToggle) return;
    try {
      const res = await axios.patch(
        `http://127.0.0.1:8000/api/v1/projects/${id}/tasks/${taskId}/subtasks/${subtask.id}/`,
        { is_done: !subtask.is_done },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubtasks(subtasks.map((s) => (s.id === subtask.id ? res.data : s)));
    } catch (err) {
      console.error("Error updating subtask:", err);
      alert("Failed to update subtask.");
    }
  };

  // ❌ Delete subtask (admins/owners only)
  const handleDelete = async (subtaskId) => {
    if (!canManage) return alert("You do not have permission to delete subtasks.");
    if (!window.confirm("Delete this subtask?")) return;
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/v1/projects/${id}/tasks/${taskId}/subtasks/${subtaskId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubtasks(subtasks.filter((s) => s.id !== subtaskId));
    } catch (err) {
      console.error("Error deleting subtask:", err);
    }
  };

  return (
    <Layout>
      <div
        style={{
          maxWidth: "700px",
          margin: "40px auto",
          background: "#fff",
          borderRadius: "12px",
          padding: "30px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        }}
      >
        <h1 style={{ color: "#1e293b", marginBottom: "10px" }}>🧩 Subtasks</h1>
        <p style={{ color: "#64748b", marginBottom: "20px" }}>
          <strong>Your Role:</strong> {role}
        </p>

        {/* Add subtask (Admins/Owners only) */}
        {canManage && (
          <form onSubmit={handleAdd} style={{ marginBottom: "25px" }}>
            <input
              type="text"
              placeholder="New subtask title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                marginBottom: "10px",
                fontSize: "15px",
              }}
            />
            <button
              type="submit"
              style={{
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              + Add Subtask
            </button>
          </form>
        )}

        {/* Subtasks list */}
        {subtasks.length === 0 ? (
          <p style={{ color: "#64748b" }}>No subtasks yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {subtasks.map((subtask) => (
              <li
                key={subtask.id}
                style={{
                  background: "#f8fafc",
                  borderRadius: "8px",
                  padding: "15px",
                  marginBottom: "10px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  onClick={() => canToggle && toggleDone(subtask)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: canToggle ? "pointer" : "default",
                    flex: 1,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={subtask.is_done}
                    readOnly
                    style={{ transform: "scale(1.3)" }}
                  />
                  <div>
                    <span
                      style={{
                        textDecoration: subtask.is_done ? "line-through" : "none",
                        color: subtask.is_done ? "#94a3b8" : "#1e293b",
                        fontWeight: "500",
                      }}
                    >
                      {subtask.title}
                    </span>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        color: subtask.is_done ? "#10b981" : "#f59e0b",
                      }}
                    >
                      <strong>Status:</strong>{" "}
                      {subtask.is_done ? "Done ✅" : "Pending ⏳"}
                    </p>
                  </div>
                </div>

                {canManage && (
                  <button
                    onClick={() => handleDelete(subtask.id)}
                    style={{
                      background: "#ef4444",
                      border: "none",
                      color: "#fff",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    🗑️
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={() => window.history.back()}
          style={{
            marginTop: "30px",
            background: "#94a3b8",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          ← Back
        </button>
      </div>
    </Layout>
  );
}

export default TaskSubtasks;