import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/v1/projects/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allProjects = response.data.results || response.data;
        setTotalProjects(allProjects.length); // ✅ Actual total
        setProjects(allProjects.slice(0, 3)); // ✅ Only 3 recent
      } catch (error) {
        console.error("Error fetching projects:", error);
        if (error.response?.status === 401) {
          alert("Session expired. Please log in again.");
          localStorage.removeItem("token");
          window.location.href = "/";
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [token]);

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
        <h1
          style={{
            fontSize: "26px",
            color: "#1e293b",
            fontWeight: "700",
            marginBottom: "25px",
          }}
        >
          🏠 Dashboard Overview
        </h1>

        {/* Stats Section */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              flex: 1,
              background: "#f1f5f9",
              borderRadius: "10px",
              padding: "20px",
              minWidth: "200px",
              textAlign: "center",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
            }}
          >
            <h3 style={{ margin: 0, color: "#64748b", fontSize: "16px" }}>
              Total Projects
            </h3>
            <p
              style={{
                fontSize: "28px",
                color: "#1e293b",
                fontWeight: "700",
                margin: "10px 0 0",
              }}
            >
              {totalProjects}
            </p>
          </div>

          <div
            style={{
              flex: 1,
              background: "#f1f5f9",
              borderRadius: "10px",
              padding: "20px",
              minWidth: "200px",
              textAlign: "center",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
            }}
          >
            <h3 style={{ margin: 0, color: "#64748b", fontSize: "16px" }}>
              Recent Activity
            </h3>
            <p
              style={{
                fontSize: "28px",
                color: "#1e293b",
                fontWeight: "700",
                margin: "10px 0 0",
              }}
            >
              {projects.length > 0 ? "Active" : "No Activity"}
            </p>
          </div>
        </div>

        {/* Recent Projects */}
        <h2 style={{ fontSize: "20px", color: "#1e293b", marginBottom: "15px" }}>
          Recent Projects
        </h2>
        {loading ? (
          <p style={{ textAlign: "center", color: "#64748b" }}>Loading...</p>
        ) : projects.length === 0 ? (
          <p style={{ textAlign: "center", color: "#64748b" }}>No projects yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
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
                </div>
                <button
                  onClick={() => 
                    (window.location.href = `/projects/${project.id}/details`)
                  }
                  style={{
                    marginTop: "10px",
                    background: "#3b82f6",
                    border: "none",
                    color: "#fff",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  View Details →
                </button>
              </li>
            ))}
          </ul>
        )}

        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button
            onClick={() => (window.location.href = "/projects")}
            style={{
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              padding: "10px 18px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            View All Projects →
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;