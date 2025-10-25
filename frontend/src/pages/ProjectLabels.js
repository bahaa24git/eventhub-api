import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";

const API = "http://127.0.0.1:8000/api/v1";

export default function ProjectLabels() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [labels, setLabels] = useState([]);
  const [form, setForm] = useState({ name: "", color: "#3b82f6" });
  const [role, setRole] = useState("VIEWER");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const presets = [
    { name: "Bug", color: "#ef4444" },
    { name: "Urgent", color: "#f59e0b" },
    { name: "Research", color: "#3b82f6" },
    { name: "Improvement", color: "#10b981" },
    { name: "Frontend", color: "#a855f7" },
    { name: "Backend", color: "#6366f1" },
  ];

  const canModify = ["OWNER", "ADMIN"].includes(role);

  // 🔹 Fetch role + labels
  useEffect(() => {
    (async () => {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        const userId = decoded.user_id || decoded.id;

        const proj = await axios.get(`${API}/projects/${id}/`, { headers });
        const me = proj.data.members?.find(
          (m) => String(m.user.id) === String(userId)
        );
        setRole(me ? me.role : "VIEWER");

        const res = await axios.get(`${API}/projects/${id}/labels/`, { headers });
        setLabels(res.data.results || res.data);
      } catch {
        alert("❌ Failed to load project data");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token]);

  // 🔹 Create Label
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!canModify || !form.name.trim()) return;
    try {
      const res = await axios.post(
        `${API}/projects/${id}/labels/`,
        { name: form.name, color_hex: form.color },
        { headers }
      );
      setLabels([...labels, res.data]);
      setForm({ name: "", color: "#3b82f6" });
      setSelected(null);
    } catch {
      alert("❌ Failed to create label");
    }
  };

  // 🔹 Delete Label
  const handleDelete = async (lid) => {
    if (!canModify || !window.confirm("Delete this label?")) return;
    await axios.delete(`${API}/projects/${id}/labels/${lid}/`, { headers });
    setLabels(labels.filter((l) => l.id !== lid));
  };

  return (
    <Layout>
      <div
        style={{
          maxWidth: 800,
          margin: "40px auto",
          background: "#fff",
          borderRadius: 12,
          padding: 30,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <h1 style={{ color: "#1e293b", textAlign: "center" }}>🏷 Project Labels</h1>
        <p style={{ textAlign: "center", color: "#64748b" }}>
          <strong>Your Role:</strong> {role}
        </p>

        {/* Preset Buttons */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "20px 0" }}>
          {presets.map((p) => (
            <button
              key={p.name}
              disabled={!canModify}
              onClick={() => {
                setForm(p);
                setSelected(p.name);
              }}
              style={{
                background: p.color,
                color: "#fff",
                padding: "8px 12px",
                borderRadius: 8,
                border: selected === p.name ? "2px solid #1e293b" : "none",
                opacity: canModify ? 1 : 0.5,
                cursor: canModify ? "pointer" : "not-allowed",
              }}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Add Label Form */}
        {canModify && (
          <form
            onSubmit={handleAdd}
            style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}
          >
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Label name..."
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 6,
                border: "1px solid #cbd5e1",
              }}
            />
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              style={{ width: 50, height: 40, border: "1px solid #cbd5e1" }}
            />
            <button
              type="submit"
              style={{
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "10px 15px",
                cursor: "pointer",
              }}
            >
              + Add
            </button>
          </form>
        )}

        {/* Labels */}
        {loading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : labels.length === 0 ? (
          <p style={{ textAlign: "center", color: "#64748b" }}>No labels yet.</p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            {labels.map((l) => (
              <li
                key={l.id}
                style={{
                  background: l.color_hex,
                  color: "#fff",
                  padding: "8px 12px",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {l.name}
                {canModify && (
                  <button
                    onClick={() => handleDelete(l.id)}
                    style={{
                      background: "rgba(0,0,0,0.2)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    ✖
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={() => (window.location.href = `/projects/${id}/details`)}
          style={{
            display: "block",
            margin: "30px auto 0",
            background: "#64748b",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          ← Back to Project
        </button>
      </div>
    </Layout>
  );
}   