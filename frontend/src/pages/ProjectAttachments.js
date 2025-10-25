import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";

function ProjectAttachments() {
  const { projectId, taskId } = useParams();
  const token = localStorage.getItem("token");

  const [attachments, setAttachments] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("VIEWER");

  // ✅ Fetch project role and attachments
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Decode JWT for user id
        let decoded = {};
        try {
          decoded = JSON.parse(atob(token.split(".")[1]));
        } catch {
          console.warn("❌ Failed to decode token");
        }
        const userId = decoded.user_id || decoded.id || decoded.sub || null;

        // Fetch project details to determine role
        const projectRes = await axios.get(
          `http://127.0.0.1:8000/api/v1/projects/${projectId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const members = projectRes.data.members || [];
        const myMember = members.find((m) => String(m.user.id) === String(userId));
        setRole(myMember ? myMember.role : "VIEWER");

        // Fetch attachments
        const res = await axios.get(
          `http://127.0.0.1:8000/api/v1/projects/${projectId}/tasks/${taskId}/attachments/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAttachments(res.data.results || res.data);
      } catch (err) {
        console.error("Error loading attachments:", err);
        alert("Failed to load attachments.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, taskId, token]);

  // Permission helpers
  const canManage = role === "OWNER" || role === "ADMIN";
  const canUpload = canManage || role === "MEMBER";
  const canDelete = canManage;

  // 📤 Upload file
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file to upload.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await axios.post(
        `http://127.0.0.1:8000/api/v1/projects/${projectId}/tasks/${taskId}/attachments/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setAttachments([...attachments, res.data]);
      setFile(null);
      alert("✅ File uploaded successfully!");
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("❌ Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // ❌ Delete file
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this file?")) return;

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/v1/projects/${projectId}/tasks/${taskId}/attachments/${id}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAttachments(attachments.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete file.");
    }
  };

  // Helper: format file size
  const formatSize = (bytes) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
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
          📎 Task Attachments
        </h1>

        <p style={{ marginTop: "8px", fontSize: "14px", color: "#64748b" }}>
          <strong>Your Role:</strong> {role}
        </p>

        {/* Upload Form */}
        {canUpload && (
          <form
            onSubmit={handleUpload}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "20px",
              flexWrap: "wrap",
            }}
          >
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              style={{
                flex: 1,
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                padding: "8px",
              }}
            />
            <button
              type="submit"
              disabled={uploading}
              style={{
                background: uploading ? "#94a3b8" : "#3b82f6",
                color: "#fff",
                border: "none",
                padding: "10px 15px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              {uploading ? "Uploading..." : "Upload File"}
            </button>
          </form>
        )}

        {/* Attachment List */}
        {loading ? (
          <p style={{ textAlign: "center", marginTop: "30px" }}>Loading...</p>
        ) : attachments.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "#64748b",
              marginTop: "30px",
            }}
          >
            No attachments yet.
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              marginTop: "25px",
            }}
          >
            {attachments.map((att) => (
              <li
                key={att.id}
                style={{
                  background: "#f8fafc",
                  borderRadius: "8px",
                  padding: "15px 20px",
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                <div>
                  <h4 style={{ margin: 0, color: "#1e293b" }}>
                    {att.filename || "Untitled File"}
                  </h4>
                  <p style={{ color: "#64748b", margin: "3px 0" }}>
                    {formatSize(att.size)} • {att.content_type || "Unknown type"}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => {
                      const fileUrl = att.file.startsWith("http")
                        ? att.file
                        : `http://127.0.0.1:8000${att.file}`;
                      window.open(fileUrl, "_blank", "noopener,noreferrer");
                    }}
                    style={{
                      background: "#22c55e",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    🔍 View
                  </button>

                  {canDelete && (
                    <button
                      onClick={() => handleDelete(att.id)}
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
                      ❌ Delete
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Back Button */}
        <button
          onClick={() =>
            (window.location.href = `/projects/${projectId}/tasks`)
          }
          style={{
            display: "block",
            margin: "30px auto 0",
            background: "#94a3b8",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "10px 18px",
            cursor: "pointer",
          }}
        >
          ← Back to Tasks
        </button>
      </div>
    </Layout>
  );
}

export default ProjectAttachments;