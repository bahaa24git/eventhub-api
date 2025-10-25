import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";

function ProjectLabels() {
  const { id } = useParams(); // project id
  const token = localStorage.getItem("token");

  const [labels, setLabels] = useState([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [loading, setLoading] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [role, setRole] = useState("VIEWER");

  // 🔹 Preset Labels
  const presetLabels = [
    { name: "Bug", color: "#ef4444" },
    { name: "Urgent", color: "#f59e0b" },
    { name: "Research", color: "#3b82f6" },
    { name: "Improvement", color: "#10b981" },
    { name: "Frontend", color: "#a855f7" },
    { name: "Backend", color: "#6366f1" },
  ];

  // ✅ Fetch project + determine role
  useEffect(() => {
    const fetchRoleAndLabels = async () => {
      try {
        // decode token → get user ID
        let decoded = {};
        try {
          decoded = JSON.parse(atob(token.split(".")[1]));
        } catch {
          console.warn("❌ Failed to decode token");
        }
        const userId = decoded.user_id || decoded.id || decoded.sub || null;

        // fetch project details (members)
        const projectRes = await axios.get(
          `http://127.0.0.1:8000/api/v1/projects/${id}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const project = projectRes.data;
        const me = project.members?.find(
          (m) => String(m.user.id) === String(userId)
        );
        setRole(me ? me.role : "VIEWER");

        // fetch labels
        const labelRes = await axios.get(
          `http://127.0.0.1:8000/api/v1/projects/${id}/labels/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLabels(labelRes.data.results || labelRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
        alert("Failed to load labels or role.");
      } finally {
        setLoading(false);
      }
    };
    fetchRoleAndLabels();
  }, [id, token]);

  const canModify = role !== "VIEWER" && role !== "MEMBER";

  // ✅ Add new label
  const handleAddLabel = async (e) => {
    e.preventDefault();
    if (!canModify) return alert("You do not have permission to add labels.");
    const finalName = name.trim();
    if (!finalName) return alert("Please enter a label name.");
    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/v1/projects/${id}/labels/`,
        { name: finalName, color_hex: color },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLabels([...labels, res.data]);
      setName("");
      setColor("#3b82f6");
      setSelectedPreset(null);
    } catch (err) {
      console.error("Error creating label:", err);
      alert("Failed to create label.");
    }
  };

  // ✅ Delete label
  const handleDelete = async (labelId) => {
    if (!canModify) return alert("You do not have permission to delete labels.");
    if (!window.confirm("Are you sure you want to delete this label?")) return;
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/v1/projects/${id}/labels/${labelId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLabels(labels.filter((l) => l.id !== labelId));
    } catch (err) {
      console.error("Error deleting label:", err);
      alert("Failed to delete label.");
    }
  };

  const handlePresetClick = (preset) => {
    setName(preset.name);
    setColor(preset.color);
    setSelectedPreset(preset.name);
  };

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
        <h1 style={{ fontSize: "26px", color: "#1e293b", fontWeight: "700" }}>
          🏷 {canModify ? "Manage Labels" : "Project Labels"}
        </h1>
        <p style={{ color: "#94a3b8", marginBottom: "15px" }}>
          <strong>Your Role:</strong> {role}
        </p>

        {/* Presets */}
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ fontSize: "16px", color: "#475569", marginBottom: "10px" }}>
            Quick Presets
          </h3>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            {presetLabels.map((preset) => (
              <button
                key={preset.name}
                onClick={() => canModify && handlePresetClick(preset)}
                style={{
                  background: preset.color,
                  color: "#fff",
                  border: selectedPreset === preset.name ? "2px solid #1e293b" : "none",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  cursor: canModify ? "pointer" : "not-allowed",
                  fontWeight: "500",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                  opacity: canModify ? 1 : 0.6,
                }}
                disabled={!canModify}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Add Form */}
        {canModify && (
          <form
            onSubmit={handleAddLabel}
            style={{
              marginTop: "10px",
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              placeholder="Label name..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSelectedPreset(null);
              }}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "15px",
              }}
            />
            <input
              type="color"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                setSelectedPreset(null);
              }}
              style={{
                width: "50px",
                height: "40px",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            />
            <button
              type="submit"
              style={{
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                padding: "10px 15px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              + Add Label
            </button>
          </form>
        )}

        {/* Labels */}
        {loading ? (
          <p style={{ textAlign: "center", marginTop: "30px" }}>Loading...</p>
        ) : labels.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "#64748b",
              marginTop: "30px",
            }}
          >
            No labels yet.
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              marginTop: "30px",
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            {labels.map((label) => (
              <li
                key={label.id}
                style={{
                  background: label.color_hex || "#e2e8f0",
                  color: "#1e293b",
                  padding: "10px 15px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{ fontWeight: "500" }}>{label.name}</span>
                {canModify && (
                  <button
                    onClick={() => handleDelete(label.id)}
                    style={{
                      background: "rgba(0,0,0,0.15)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      padding: "4px 8px",
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    ✖
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Back */}
        <button
          onClick={() => (window.location.href = "/dashboard")}
          style={{
            display: "block",
            margin: "25px auto 0",
            background: "#94a3b8",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </Layout>
  );
}

export default ProjectLabels;