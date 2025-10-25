import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";

const API = "http://127.0.0.1:8000/api/v1";

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  background: "#f8fafc",
  color: "#1e293b",
  fontSize: 15,
  outline: "none",
};

const selectStyle = {
  width: "150px",
  padding: "10px 12px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  background: "#f8fafc",
  color: "#1e293b",
  fontSize: "15px",
  cursor: "pointer",
  outline: "none",
};

const button = (bg) => ({
  background: bg,
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "8px 12px",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 500,
});

function MultiSelect({ label, items, selected, onChange, colorKey, displayKey = "name" }) {
  const [search, setSearch] = useState("");
  const [show, setShow] = useState(false);

  const filtered = items.filter(
    (i) =>
      i[displayKey].toLowerCase().includes(search.toLowerCase()) &&
      !selected.includes(i.id)
  );

  return (
    <div style={{ marginBottom: 15, position: "relative" }}>
      <label style={{ fontWeight: 500, color: "#475569" }}>{label}:</label>
      <div
        style={{
          ...inputStyle,
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          minHeight: 45,
          alignItems: "center",
        }}
      >
        {selected.length > 0 ? (
          selected.map((id) => {
            const item = items.find((i) => i.id === id);
            return (
              <div
                key={id}
                style={{
                  background: item?.[colorKey] || "#e2e8f0",
                  color: colorKey ? "#fff" : "#1e293b",
                  borderRadius: 9999,
                  padding: "4px 10px",
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                <span>{item?.[displayKey]}</span>
                <button
                  onClick={() => onChange(selected.filter((x) => x !== id))}
                  style={{
                    background: "none",
                    border: "none",
                    color: "inherit",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  ×
                </button>
              </div>
            );
          })
        ) : (
          <span style={{ color: "#94a3b8", fontSize: 14 }}>None selected</span>
        )}
      </div>

      <input
        placeholder={`Search ${label.toLowerCase()}...`}
        style={{ ...inputStyle, marginTop: 6 }}
        onFocus={() => setShow(true)}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {show && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 6,
            listStyle: "none",
            marginTop: 4,
            padding: 0,
            maxHeight: 150,
            overflowY: "auto",
            zIndex: 10,
          }}
        >
          {filtered.map((i) => (
            <li
              key={i.id}
              onClick={() => {
                onChange([...selected, i.id]);
                setSearch("");
                setShow(false);
              }}
              style={{ padding: "10px 14px", cursor: "pointer" }}
            >
              <strong style={{ color: i[colorKey] || "#1e293b" }}>
                {i[displayKey]}
              </strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TaskCard({ task, canManage, id, onEdit, onDelete }) {
  return (
    <li
      style={{
        background: "#f8fafc",
        padding: 15,
        marginBottom: 12,
        borderRadius: 8,
        border: "1px solid #e2e8f0",
      }}
    >
      <h3 style={{ margin: 0, color: "#1e293b" }}>{task.title}</h3>
      <p style={{ margin: "5px 0", color: "#475569" }}>
        {task.description || "No description"}
      </p>
      <p style={{ fontSize: 14, color: "#64748b" }}>
        <strong>Status:</strong> {task.status.replace("_", " ")} |{" "}
        <strong>Priority:</strong> {task.priority}
      </p>

      {task.due_date && (
        <p style={{ fontSize: 13, color: "#f97316", margin: "5px 0" }}>
          <strong>🕓 Due Date:</strong>{" "}
          {new Date(task.due_date).toLocaleDateString()}
        </p>
      )}

      {task.labels?.length > 0 && (
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {task.labels.map((l) => (
            <span
              key={l.id}
              style={{
                background: l.color_hex,
                color: "#fff",
                borderRadius: 9999,
                padding: "2px 8px",
                fontSize: 13,
              }}
            >
              {l.name}
            </span>
          ))}
        </div>
      )}

      <p style={{ fontSize: 13, color: "#94a3b8" }}>
        <strong>Assigned by:</strong> {task.creator?.username}
        {task.assignees?.length > 0 && (
          <>
            {" "}
            | <strong>To:</strong>{" "}
            {task.assignees.map((a) => a.user.username).join(", ")}
          </>
        )}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
        {canManage && (
          <>
            <button onClick={() => onEdit(task)} style={button("#60a5fa")}>
              ✏️ Edit
            </button>
            <button onClick={() => onDelete(task.id)} style={button("#ef4444")}>
              🗑️ Delete
            </button>
          </>
        )}
        <button
          style={button("#8b5cf6")}
          onClick={() =>
            (window.location.href = `/projects/${id}/tasks/${task.id}/attachments`)
          }
        >
          📎 Attachments
        </button>
        <button
          style={button("#06b6d4")}
          onClick={() =>
            (window.location.href = `/projects/${id}/tasks/${task.id}/comments`)
          }
        >
          💬 Comments
        </button>
        <button
          style={button("#0ea5e9")}
          onClick={() =>
            (window.location.href = `/projects/${id}/tasks/${task.id}/subtasks`)
          }
        >
          🧩 Subtasks
        </button>
      </div>
    </li>
  );
}

export default function ProjectTasks() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [labels, setLabels] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "LOW",
    due_date: "",
    assignees: [],
    selectedLabels: [],
  });
  const [editing, setEditing] = useState(null);
  const [role, setRole] = useState("VIEWER");
  const canManage = role === "OWNER" || role === "ADMIN";
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const init = async () => {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        const userId = decoded.user_id || decoded.id;
        const proj = await axios.get(`${API}/projects/${id}/`, { headers });
        setMembers(proj.data.members || []);
        setLabels(proj.data.labels || []);
        const me = proj.data.members.find((m) => String(m.user.id) === String(userId));
        setRole(me ? me.role : "VIEWER");
        const res = await axios.get(`${API}/projects/${id}/tasks/`, { headers });
        setTasks(res.data.results || res.data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    init();
  }, [id, token]);

  const resetForm = () =>
    setForm({
      title: "",
      description: "",
      status: "TODO",
      priority: "LOW",
      due_date: "",
      assignees: [],
      selectedLabels: [],
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canManage) return alert("No permission.");

    const payload = {
      ...form,
      assignee_ids: form.assignees,
      label_ids: form.selectedLabels,
    };
    try {
      if (editing) {
        const res = await axios.put(`${API}/projects/${id}/tasks/${editing.id}/`, payload, {
          headers,
        });
        setTasks(tasks.map((t) => (t.id === editing.id ? res.data : t)));
        setEditing(null);
      } else {
        const res = await axios.post(`${API}/projects/${id}/tasks/`, payload, { headers });
        setTasks([...tasks, res.data]);
      }
      resetForm();
    } catch {
      alert("Failed to save task.");
    }
  };

  const handleEdit = (task) => {
    if (!canManage) return alert("No permission.");
    setEditing(task);
    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: task.due_date ? task.due_date.split("T")[0] : "",
      assignees: task.assignees.map((a) => a.user.id),
      selectedLabels: task.labels.map((l) => l.id),
    });
  };

  const handleDelete = async (idToDelete) => {
    if (!canManage || !window.confirm("Delete this task?")) return;
    await axios.delete(`${API}/projects/${id}/tasks/${idToDelete}/`, { headers });
    setTasks(tasks.filter((t) => t.id !== idToDelete));
  };

  return (
    <Layout>
      <div
        style={{
          maxWidth: 750,
          margin: "40px auto",
          background: "#fff",
          borderRadius: 12,
          padding: 30,
        }}
      >
        <h1 style={{ textAlign: "center", color: "#1e293b" }}>🗂️ Project Tasks</h1>
        <p style={{ textAlign: "center", color: "#64748b" }}>
          <strong>Your Role:</strong> {role}
        </p>

        {canManage && (
          <form onSubmit={handleSubmit} style={{ marginBottom: 25 }}>
            <input
              placeholder="Task Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={inputStyle}
              required
            />
            <textarea
              placeholder="Task Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ ...inputStyle, minHeight: 70 }}
            />

            {/* ✅ Styled Status & Priority */}
            <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                style={selectStyle}
              >
                {["TODO", "IN_PROGRESS", "DONE", "BLOCKED"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                style={selectStyle}
              >
                {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* 📅 Keep Date Input same as before */}
            <div style={{ marginBottom: 15 }}>
              <label style={{ fontWeight: 500, color: "#475569" }}>🕓 Due Date:</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                style={{ ...inputStyle, marginTop: 6 }}
              />
            </div>

            <MultiSelect
              label="Members"
              items={members.map((m) => ({ id: m.user.id, name: m.user.username }))}
              selected={form.assignees}
              onChange={(val) => setForm({ ...form, assignees: val })}
            />
            <MultiSelect
              label="Labels"
              items={labels}
              selected={form.selectedLabels}
              onChange={(val) => setForm({ ...form, selectedLabels: val })}
              colorKey="color_hex"
            />

            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" style={button("#3b82f6")}>
                {editing ? "Update Task" : "Add Task"}
              </button>
              {editing && (
                <button onClick={resetForm} type="button" style={button("#94a3b8")}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        {tasks.length === 0 ? (
          <p style={{ textAlign: "center", color: "#64748b" }}>No tasks yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {tasks.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                canManage={canManage}
                id={id}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}

        <button
          style={{ ...button("#64748b"), display: "block", margin: "20px auto 0" }}
          onClick={() => (window.location.href = `/projects/${id}/details`)}
        >
          ← Back to Project
        </button>
      </div>
    </Layout>
  );
}