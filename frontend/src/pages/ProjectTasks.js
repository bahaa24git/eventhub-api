import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";

function ProjectTasks() {
  const { id } = useParams(); // project id
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const token = localStorage.getItem("token");

  // ✅ fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/v1/projects/${id}/tasks/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTasks(res.data.results || res.data);
      } catch (error) {
        console.error("Error fetching tasks:", error.response?.data || error.message);
      }
    };
    fetchTasks();
  }, [id, token]);

  // ✅ add/update task
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        const res = await axios.put(
          `http://127.0.0.1:8000/api/v1/projects/${id}/tasks/${editingTask.id}/`,
          { title, description },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTasks(tasks.map((t) => (t.id === editingTask.id ? res.data : t)));
        setEditingTask(null);
      } else {
        const res = await axios.post(
          `http://127.0.0.1:8000/api/v1/projects/${id}/tasks/`,
          { title, description },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTasks([...tasks, res.data]);
      }
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Error saving task:", error.response?.data || error.message);
      alert("Failed to save task");
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/v1/projects/${id}/tasks/${taskId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error.response?.data || error.message);
      alert("Failed to delete task");
    }
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
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
        <h1
          style={{
            textAlign: "center",
            color: "#1e293b",
            fontSize: "1.8rem",
            fontWeight: "700",
            marginBottom: "25px",
          }}
        >
          {editingTask ? "✏️ Edit Task" : "🗂️ Project Tasks"}
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: "25px" }}>
          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "10px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              fontSize: "15px",
            }}
          />
          <textarea
            placeholder="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "10px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              fontSize: "15px",
              minHeight: "80px",
            }}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              style={{
                flex: 1,
                background: "#3b82f6",
                color: "#fff",
                padding: "10px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              {editingTask ? "Update Task" : "Add Task"}
            </button>
            {editingTask && (
              <button
                type="button"
                onClick={cancelEdit}
                style={{
                  flex: 1,
                  background: "#e2e8f0",
                  color: "#1e293b",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Task list */}
        {tasks.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "#64748b",
              marginTop: "10px",
            }}
          >
            No tasks yet. Add your first task!
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {tasks.map((task) => (
              <li
                key={task.id}
                style={{
                  background: "#f8fafc",
                  padding: "15px",
                  marginBottom: "12px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: "0 0 5px",
                      color: "#1e293b",
                      fontWeight: "600",
                    }}
                  >
                    {task.title}
                  </h3>
                  <p style={{ margin: 0, color: "#475569" }}>
                    {task.description || "No description"}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => handleEdit(task)}
                    style={{
                      background: "#60a5fa",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    style={{
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* ✅ Back Button - Neutral Gray */}
        <button
          onClick={() => (window.location.href = "/dashboard")}
          style={{
            display: "block",
            margin: "25px auto 0",
            padding: "10px 20px",
            background: "#94a3b8",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </Layout>
  );
}

export default ProjectTasks;