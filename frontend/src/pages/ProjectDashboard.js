import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";

export default function ProjectDashboard() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("VIEWER");

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Decode user for role
        let decoded = {};
        try {
          decoded = JSON.parse(atob(token.split(".")[1]));
        } catch {
          console.warn("Failed to decode token");
        }
        const userId = decoded.user_id || decoded.id || decoded.sub || null;

        // Get project info (for role)
        const projectRes = await axios.get(`http://127.0.0.1:8000/api/v1/projects/${id}/`, {
          headers,
        });
        const members = projectRes.data.members || [];
        const me = members.find((m) => String(m.user.id) === String(userId));
        setRole(me ? me.role : "VIEWER");

        // Get dashboard metrics
        const res = await axios.get(`http://127.0.0.1:8000/api/v1/projects/${id}/dashboard/`, {
          headers,
        });
        setData(res.data);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        alert("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [id, token]);

  if (loading)
    return (
      <Layout>
        <p style={{ textAlign: "center", color: "#64748b" }}>Loading dashboard...</p>
      </Layout>
    );

  if (!data)
    return (
      <Layout>
        <p style={{ textAlign: "center", color: "red" }}>No dashboard data available.</p>
      </Layout>
    );

  const progress =
    data.total_tasks > 0 ? Math.round((data.completed_tasks / data.total_tasks) * 100) : 0;
  const subProgress =
    data.total_subtasks > 0
      ? Math.round((data.completed_subtasks / data.total_subtasks) * 100)
      : 0;

  const StatCard = ({ title, value, color }) => (
    <div
      style={{
        flex: 1,
        background: "#f8fafc",
        borderRadius: "10px",
        padding: "20px",
        minWidth: "200px",
        textAlign: "center",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
      }}
    >
      <h3 style={{ color: "#64748b", fontSize: "15px", margin: 0 }}>{title}</h3>
      <p
        style={{
          color: color || "#1e293b",
          fontWeight: "700",
          fontSize: "26px",
          margin: "8px 0 0",
        }}
      >
        {value}
      </p>
    </div>
  );

  return (
    <Layout>
      <div
        style={{
          maxWidth: "950px",
          margin: "40px auto",
          background: "#fff",
          borderRadius: "12px",
          padding: "35px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        }}
      >
        <h1 style={{ fontSize: "26px", color: "#1e293b", fontWeight: "700" }}>
          📊 Project Dashboard
        </h1>
        <p style={{ color: "#64748b", marginBottom: "25px" }}>
          <strong>Project:</strong> {data.project_name} &nbsp;|&nbsp;
          <strong>Your Role:</strong> {role}
        </p>

        {/* Summary Stats */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
            marginBottom: "25px",
          }}
        >
            
          <StatCard title="📋Total Tasks" value={data.total_tasks || 0} />
          <StatCard title="✅Completed Tasks" value={data.completed_tasks || 0} />
          <StatCard title="⚙️Subtasks" value={data.total_subtasks || 0} />
          <StatCard title="💬Comments" value={data.comments_count || 0} />
          <StatCard title="📎Attachments" value={data.attachments_count || 0} />
          <StatCard title="👥Members" value={data.members_count || 0} />
          <StatCard title="🏷Labels" value={data.labels_count || 0} />
          <StatCard title="⏰Overdue Tasks" value={data.overdue_tasks || 0} />
        </div>

        {/* Progress bars */}
        <div style={{ marginTop: "25px" }}>
          <h2 style={{ color: "#1e293b", fontSize: "20px" }}>Progress Overview</h2>

          <div style={{ marginTop: "12px" }}>
            <p style={{ marginBottom: "6px", color: "#475569" }}>Task Completion</p>
            <div
              style={{
                height: "12px",
                borderRadius: "8px",
                background: "#e2e8f0",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  background: "#3b82f6",
                  height: "100%",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <p style={{ color: "#64748b", marginTop: "5px" }}>{progress}% completed</p>
          </div>

          <div style={{ marginTop: "15px" }}>
            <p style={{ marginBottom: "6px", color: "#475569" }}>Subtask Completion</p>
            <div
              style={{
                height: "12px",
                borderRadius: "8px",
                background: "#e2e8f0",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${subProgress}%`,
                  background: "#10b981",
                  height: "100%",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <p style={{ color: "#64748b", marginTop: "5px" }}>{subProgress}% completed</p>
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginTop: "30px",
          }}
        >
          <button
            style={btn("#3b82f6")}
            onClick={() => (window.location.href = `/projects/${id}/tasks`)}
          >
            🧾 View Tasks
          </button>
          <button
            style={btn("#a855f7")}
            onClick={() => (window.location.href = `/projects/${id}/details`)}
          >
            📁 Back to Details
          </button>
          {role === "OWNER" || role === "ADMIN" ? (
            <button
              style={btn("#22c55e")}
              onClick={() => alert("Report generation coming soon!")}
            >
              📊 Generate Report
            </button>
          ) : null}
          <button
          onClick={() => (window.location.href = `/projects/${id}/details`)}
          style={btn("#64748b")}
        >
          ← Back to Project
        </button>
        </div>
      </div>
    </Layout>
  );
}

const btn = (bg) => ({
  background: bg,
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "10px 16px",
  cursor: "pointer",
  fontWeight: "500",
});