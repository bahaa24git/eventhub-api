import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/v1/projects/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(response.data.results || response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        if (error.response?.status === 401) {
          alert("Session expired. Please log in again.");
          localStorage.removeItem("token");
          window.location.href = "/";
        }
      }
    };
    fetchProjects();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/v1/projects/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(projects.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete project");
    }
  };

  return (
    <Layout>
      <div
        style={{
          maxWidth: "900px",
          margin: "auto",
          background: "#fff",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "24px", color: "#1e293b", fontWeight: "600" }}>My Projects</h1>
          <button
            onClick={() => (window.location.href = "/add-project")}
            style={{
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            + Add Project
          </button>
        </div>

        {projects.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              marginTop: "40px",
              color: "#64748b",
              fontSize: "16px",
            }}
          >
            No projects found. Start by adding one!
          </p>
        ) : (
          <ul style={{ marginTop: "25px", listStyle: "none", padding: 0 }}>
            {projects.map((project) => (
              <li
                key={project.id}
                style={{
                  background: "#f8fafc",
                  borderRadius: "8px",
                  padding: "20px",
                  marginBottom: "15px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 5px 0", color: "#1e293b" }}>{project.name}</h3>
                  <p style={{ color: "#64748b", margin: 0 }}>
                    {project.description || "No description available."}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: "15px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <button
                    onClick={() => (window.location.href = `/edit/${project.id}`)}
                    style={{
                      background: "#38bdf8",
                      border: "none",
                      color: "#fff",
                      padding: "8px 12px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() =>
                      (window.location.href = `/projects/${project.id}/members`)
                    }
                    style={{
                      background: "#22c55e",
                      border: "none",
                      color: "#fff",
                      padding: "8px 12px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    👥 Manage Members
                  </button>

                  <button
                    onClick={() =>
                      (window.location.href = `/projects/${project.id}/tasks`)
                    }
                    style={{
                      background: "#f59e0b",
                      border: "none",
                      color: "#fff",
                      padding: "8px 12px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    🧾 Manage Tasks
                  </button>

                  <button
                    onClick={() => handleDelete(project.id)}
                    style={{
                      background: "#ef4444",
                      border: "none",
                      color: "#fff",
                      padding: "8px 12px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;