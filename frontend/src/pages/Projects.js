import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [myRoles, setMyRoles] = useState({});
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("token");

  // ✅ Fetch all projects + user roles
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/v1/projects/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const allProjects = response.data.results || response.data;
        setProjects(allProjects);
        setFilteredProjects(allProjects);

        // Decode JWT
        let decoded = {};
        try {
          decoded = JSON.parse(atob(token.split(".")[1]));
        } catch (err) {
          console.error("❌ Failed to decode token:", err);
        }

        const userId = decoded.user_id || decoded.id || decoded.sub || null;
        const rolesMap = {};

        // Fetch project details to get members list (includes roles)
        await Promise.all(
          allProjects.map(async (proj) => {
            try {
              const res = await axios.get(
                `http://127.0.0.1:8000/api/v1/projects/${proj.id}/`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const members = res.data.members || [];
              const myMember = members.find(
                (m) => String(m.user.id) === String(userId)
              );
              rolesMap[proj.id] = myMember ? myMember.role : "VIEWER";
            } catch (err) {
              console.warn(`⚠️ Failed to fetch project detail for ${proj.name}`);
              rolesMap[proj.id] = "VIEWER";
            }
          })
        );

        console.log("✅ Roles map:", rolesMap);
        setMyRoles(rolesMap);
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

  // 🔍 Live Search
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    if (value.trim() === "") {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(
        (p) =>
          p.name.toLowerCase().includes(value) ||
          (p.description && p.description.toLowerCase().includes(value))
      );
      setFilteredProjects(filtered);
    }
  };

  // 🗑 Delete Project
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/v1/projects/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = projects.filter((p) => p.id !== id);
      setProjects(updated);
      setFilteredProjects(updated);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete project");
    }
  };

  // Helpers
  const canManage = (role) => role === "OWNER" || role === "ADMIN";
  const canCollaborate = (role) => role === "MEMBER" || canManage(role);
  const canViewOnly = (role) => role === "VIEWER";

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
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h1 style={{ fontSize: "24px", color: "#1e293b", fontWeight: "600" }}>
            My Projects
          </h1>
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

        {/* Search Bar */}
        <input
          type="text"
          placeholder="🔍 Search projects..."
          value={search}
          onChange={handleSearch}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            marginBottom: "20px",
            fontSize: "15px",
          }}
        />

        {filteredProjects.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              marginTop: "40px",
              color: "#64748b",
              fontSize: "16px",
            }}
          >
            No matching projects found.
          </p>
        ) : (
          <ul style={{ marginTop: "10px", listStyle: "none", padding: 0 }}>
            {filteredProjects.map((project) => {
              const role = myRoles[project.id] || "VIEWER";
              return (
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
                    <h3
                      style={{
                        margin: "0 0 5px 0",
                        color: "#1e293b",
                        fontWeight: "600",
                      }}
                    >
                      {project.name}
                    </h3>
                    <p style={{ color: "#64748b", margin: 0 }}>
                      {project.description || "No description available."}
                    </p>
                    <p style={{ marginTop: "8px", fontSize: "13px", color: "#94a3b8" }}>
                      <strong>Role:</strong> {role}
                    </p>
                  </div>

                  {/* Buttons */}
                  <div
                    style={{
                      marginTop: "15px",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    {/* OWNER/ADMIN → Full Access */}
                    {canManage(role) && (
                      <>
                        <button
                          onClick={() =>
                            (window.location.href = `/edit/${project.id}`)
                          }
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
                          onClick={() =>
                            (window.location.href = `/projects/${project.id}/labels`)
                          }
                          style={{
                            background: "#a855f7",
                            color: "#fff",
                            border: "none",
                            padding: "10px 16px",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          🏷 Manage Labels
                        </button>
                      </>
                    )}

                    {/* MEMBER → View Tasks & Members + Manage Labels */}
                    {canCollaborate(role) && !canManage(role) && (
                      <>
                        <button
                          onClick={() =>
                            (window.location.href = `/projects/${project.id}/members?readonly=true`)
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
                          👁 View Members
                        </button>

                        <button
                          onClick={() =>
                            (window.location.href = `/projects/${project.id}/tasks?readonly=true`)
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
                          👁 View Tasks
                        </button>

                        <button
                          onClick={() =>
                            (window.location.href = `/projects/${project.id}/labels`)
                          }
                          style={{
                            background: "#a855f7",
                            color: "#fff",
                            border: "none",
                            padding: "10px 16px",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          🏷 View Labels
                        </button>
                      </>
                    )}

                    {/* VIEWER → View only */}
                    {canViewOnly(role) && (
                      <>
                        <button
                          onClick={() =>
                            (window.location.href = `/projects/${project.id}/members?readonly=true`)
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
                          👁 View Members
                        </button>

                        <button
                          onClick={() =>
                            (window.location.href = `/projects/${project.id}/tasks?readonly=true`)
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
                          👁 View Tasks
                        </button>
                        <button
                          onClick={() =>
                            (window.location.href = `/projects/${project.id}/labels`)
                          }
                          style={{
                            background: "#a855f7",
                            color: "#fff",
                            border: "none",
                            padding: "10px 16px",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          🏷 View Labels
                        </button>
                      </>
                    )}

                    {/* OWNER/ADMIN → Delete */}
                    {canManage(role) && (
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
                    )}
                    <button
                  onClick={() => 
                    (window.location.href = `/projects/${project.id}/details`)
                  }
                  style={{
                          background: "#3b82f6",
                          border: "none",
                          color: "#fff",
                          padding: "8px 12px",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                >
                  View Details →
                </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Layout>
  );
}

export default Projects;