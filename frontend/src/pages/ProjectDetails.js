import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";

function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [role, setRole] = useState("VIEWER");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const canManage = role === "OWNER" || role === "ADMIN";

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        let decoded = {};
        try {
          decoded = JSON.parse(atob(token.split(".")[1]));
        } catch {
          console.warn("❌ Failed to decode token");
        }
        const userId = decoded.user_id || decoded.id || decoded.sub || null;

        const [projectRes, tasksRes] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/api/v1/projects/${id}/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://127.0.0.1:8000/api/v1/projects/${id}/tasks/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const projectData = projectRes.data;
        setProject(projectData);

        const members = projectData.members || [];
        const me = members.find((m) => String(m.user.id) === String(userId));
        setRole(me ? me.role : "VIEWER");

        const sortedTasks = (tasksRes.data.results || tasksRes.data)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3);
        setTasks(sortedTasks);
      } catch (error) {
        console.error("Error fetching project details:", error);
        alert("Failed to load project details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id, token]);

  const handleToggleArchive = async () => {
    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/v1/projects/${project.id}/archive/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      setProject((prev) => ({ ...prev, is_archived: !prev.is_archived }));
    } catch (err) {
      console.error("Failed to toggle archive:", err);
      alert("Failed to update project status.");
    }
  };

  if (loading)
    return (
      <Layout>
        <p style={{ textAlign: "center", color: "#64748b" }}>
          Loading project details...
        </p>
      </Layout>
    );

  if (!project)
    return (
      <Layout>
        <p style={{ textAlign: "center", color: "red" }}>Project not found.</p>
      </Layout>
    );

  return (
    <Layout>
      <div
        style={{
          maxWidth: "900px",
          margin: "auto",
          background: "#fff",
          padding: "35px",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        }}
      >
        {/* Header */}
        <h1
          style={{
            fontSize: "28px",
            color: "#1e293b",
            fontWeight: "700",
            marginBottom: "10px",
          }}
        >
          📁 {project.name}
        </h1>
        <p style={{ color: "#475569", marginBottom: "20px" }}>
          {project.description || "No description provided."}
        </p>

        <p style={{ color: "#94a3b8", marginBottom: "25px" }}>
          <strong>Your Role:</strong> {role}
        </p>

        {/* Quick Info */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "25px",
          }}
        >
          <InfoCard
            title="Created By"
            value={project.created_by?.username || "Unknown"}
          />
          <InfoCard
            title="Created At"
            value={new Date(project.created_at).toLocaleDateString()}
          />
          {/* Status with toggle */}
          <div
            style={{
              flex: 1,
              background: "#f1f5f9",
              borderRadius: "10px",
              padding: "15px",
              minWidth: "200px",
              textAlign: "center",
            }}
          >
            <h4 style={{ color: "#64748b", margin: 0 }}>Status</h4>
            <p
              style={{
                fontWeight: "600",
                color: project.is_archived ? "#ef4444" : "#22c55e",
                margin: "0 0 10px 0",
              }}
            >
              {project.is_archived ? "Archived" : "Active"}
            </p>
            {canManage && (
              <button
                onClick={handleToggleArchive}
                style={{
                  background: project.is_archived ? "#22c55e" : "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                {project.is_archived ? "Unarchive" : "Archive"}
              </button>
            )}
          </div>
        </div>

        {/* Members */}
        <Section title="👥 Members">
          {project.members && project.members.length > 0 ? (
            <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
              {project.members.map((m) => (
                <li key={m.id} style={{ marginBottom: "5px", color: "#475569" }}>
                  <strong>{m.user?.username}</strong> – {m.role}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: "#64748b" }}>No members yet.</p>
          )}
        </Section>

        {/* Labels */}
        <Section title="🏷 Labels">
          {project.labels && project.labels.length > 0 ? (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {project.labels.map((label) => (
                <span
                  key={label.id}
                  style={{
                    background: label.color_hex || "#e2e8f0",
                    color: "#1e293b",
                    padding: "5px 10px",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ color: "#64748b" }}>No labels created yet.</p>
          )}
        </Section>

        {/* Tasks */}
        <Section title="🧾 Recent Tasks">
          {tasks.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0, marginTop: "10px" }}>
              {tasks.map((task) => (
                <li
                  key={task.id}
                  style={{
                    background: "#f8fafc",
                    borderRadius: "8px",
                    padding: "15px",
                    marginBottom: "10px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
                  }}
                >
                  <strong>{task.title}</strong>{" "}
                  <span
                    style={{
                      color:
                        task.status === "DONE"
                          ? "#22c55e"
                          : task.status === "IN_PROGRESS"
                          ? "#f59e0b"
                          : "#64748b",
                      fontWeight: "500",
                    }}
                  >
                    {task.status.replace("_", " ")}
                  </span>
                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#475569",
                      fontSize: "14px",
                    }}
                  >
                    {task.description || "No description"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: "#64748b" }}>No tasks yet.</p>
          )}
        </Section>

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <ActionButton
            color="#0ea5e9"
            text="📊 Project Dashboard"
            onClick={() =>
              (window.location.href = `/projects/${project.id}/dashboard`)
            }
          />
          {canManage ? (
            <>
              <ActionButton
                color="#3b82f6"
                text="✏️ Edit Project"
                onClick={() =>
                  (window.location.href = `/edit/${project.id}`)
                }
              />
              <ActionButton
                color="#22c55e"
                text="👥 Manage Members"
                onClick={() =>
                  (window.location.href = `/projects/${project.id}/members`)
                }
              />
              <ActionButton
                color="#f59e0b"
                text="🧩 Manage Tasks"
                onClick={() =>
                  (window.location.href = `/projects/${project.id}/tasks`)
                }
              />
              <ActionButton
                color="#a855f7"
                text="🏷 Manage Labels"
                onClick={() =>
                  (window.location.href = `/projects/${project.id}/labels`)
                }
              />
            </>
          ) : (
            <>
              <ActionButton
                color="#22c55e"
                text="👥 View Members"
                onClick={() =>
                  (window.location.href = `/projects/${project.id}/members`)
                }
              />
              <ActionButton
                color="#f59e0b"
                text="🧾 View Tasks"
                onClick={() =>
                  (window.location.href = `/projects/${project.id}/tasks`)
                }
              />
              <ActionButton
                color="#a855f7"
                text="🏷 View Labels"
                onClick={() =>
                  (window.location.href = `/projects/${project.id}/labels`)
                }
              />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

// Helper Components
function InfoCard({ title, value, color }) {
  return (
    <div
      style={{
        flex: 1,
        background: "#f1f5f9",
        borderRadius: "10px",
        padding: "15px",
        minWidth: "200px",
        textAlign: "center",
      }}
    >
      <h4 style={{ color: "#64748b", margin: 0 }}>{title}</h4>
      <p style={{ fontWeight: "600", color: color || "#1e293b", margin: 0 }}>
        {value}
      </p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "25px" }}>
      <h2 style={{ color: "#1e293b", fontSize: "20px" }}>{title}</h2>
      {children}
    </div>
  );
}

function ActionButton({ color, text, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: color,
        color: "#fff",
        border: "none",
        padding: "10px 16px",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "500",
      }}
    >
      {text}
    </button>
  );
}

export default ProjectDetails;