import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";

function TaskComments() {
  const { id, taskId } = useParams(); // project id + task id
  const token = localStorage.getItem("token");

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [userId, setUserId] = useState(null);

  // ✅ Fetch user role from project
  useEffect(() => {
    const fetchRole = async () => {
      try {
        let decoded = {};
        try {
          decoded = JSON.parse(atob(token.split(".")[1]));
        } catch {
          console.warn("❌ Failed to decode token");
        }
        const idFromToken = decoded.user_id || decoded.id || decoded.sub || null;
        setUserId(idFromToken);

        const projectRes = await axios.get(
          `http://127.0.0.1:8000/api/v1/projects/${id}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const me = projectRes.data.members.find(
          (m) => String(m.user.id) === String(idFromToken)
        );
        setRole(me ? me.role : "VIEWER");
      } catch (err) {
        console.error("Error fetching role:", err);
      }
    };
    fetchRole();
  }, [id, token]);

  // ✅ Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/v1/projects/${id}/tasks/${taskId}/comments/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setComments(res.data.results || res.data);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };
    fetchComments();
  }, [id, taskId, token]);

  const canComment = role === "OWNER" || role === "ADMIN" || role === "MEMBER";
  const canDelete = role === "OWNER" || role === "ADMIN";

  // ✅ Add comment
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/v1/projects/${id}/tasks/${taskId}/comments/`,
        { body: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment("");
      const res = await axios.get(
        `http://127.0.0.1:8000/api/v1/projects/${id}/tasks/${taskId}/comments/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(res.data.results || res.data);
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Failed to add comment");
    }
  };

  // ✅ Edit comment (only if author or admin/owner)
  const handleEditStart = (comment) => {
    setEditingComment(comment.id);
    setEditedText(comment.body);
  };

  const handleEditSave = async (commentId) => {
    if (!editedText.trim()) return;
    try {
      const res = await axios.patch(
        `http://127.0.0.1:8000/api/v1/projects/${id}/tasks/${taskId}/comments/${commentId}/`,
        { body: editedText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(comments.map((c) => (c.id === commentId ? res.data : c)));
      setEditingComment(null);
      setEditedText("");
    } catch (err) {
      console.error("Error editing comment:", err);
      alert("Failed to update comment");
    }
  };

  // ✅ Delete (admin/owner only)
  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/v1/projects/${id}/tasks/${taskId}/comments/${commentId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
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
        <h1 style={{ color: "#1e293b", marginBottom: "20px" }}>💬 Task Comments</h1>
        <p style={{ color: "#94a3b8", marginBottom: "15px" }}>
          <strong>Your Role:</strong> {role}
        </p>

        {/* Add comment form */}
        {canComment && (
          <form onSubmit={handleAdd} style={{ marginBottom: "25px" }}>
            <textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                marginBottom: "10px",
                fontSize: "15px",
              }}
            />
            <button
              type="submit"
              style={{
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Add Comment
            </button>
          </form>
        )}

        {/* Comments */}
        {comments.length === 0 ? (
          <p style={{ color: "#64748b" }}>No comments yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {comments.map((comment) => {
              const isAuthor = String(comment.author?.id) === String(userId);
              const canEdit =
                isAuthor || role === "ADMIN" || role === "OWNER";

              return (
                <li
                  key={comment.id}
                  style={{
                    background: "#f8fafc",
                    borderRadius: "8px",
                    padding: "15px",
                    marginBottom: "10px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ marginBottom: "5px" }}>
                    <strong style={{ color: "#1e293b" }}>
                      {comment.author?.username || "Unknown User"}
                    </strong>
                    <span
                      style={{
                        color: "#94a3b8",
                        fontSize: "13px",
                        marginLeft: "8px",
                      }}
                    >
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                  </div>

                  {editingComment === comment.id ? (
                    <>
                      <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          marginBottom: "8px",
                        }}
                      />
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => handleEditSave(comment.id)}
                          style={buttonStyle("#22c55e")}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingComment(null)}
                          style={buttonStyle("#94a3b8")}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p style={{ color: "#334155", margin: "5px 0" }}>
                        {comment.body}
                      </p>
                      {comment.edited_at && (
                        <p style={{ color: "#94a3b8", fontSize: "12px" }}>
                          (Edited {new Date(comment.edited_at).toLocaleString()})
                        </p>
                      )}

                      {canComment && (
                        <div
                          style={{ display: "flex", gap: "6px", marginTop: "5px" }}
                        >
                          {canEdit && (
                            <button
                              onClick={() => handleEditStart(comment)}
                              style={buttonStyle("#38bdf8")}
                            >
                              ✏️ Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(comment.id)}
                              style={buttonStyle("#ef4444")}
                            >
                              🗑️ Delete
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <button
          onClick={() => window.history.back()}
          style={{
            marginTop: "30px",
            background: "#94a3b8",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
      </div>
    </Layout>
  );
}

const buttonStyle = (bg) => ({
  background: bg,
  border: "none",
  color: "#fff",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
});

export default TaskComments;