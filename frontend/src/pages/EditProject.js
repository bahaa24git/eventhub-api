import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";

function EditProject() {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/v1/projects/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setName(response.data.name || "");
        setDescription(response.data.description || "");
      } catch (error) {
        console.error("Error loading project:", error.response?.data || error.message);
        alert("Failed to load project details");
        window.location.href = "/dashboard";
      }
    };
    fetchProject();
  }, [id, token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/v1/projects/${id}/`,
        { name, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Project updated successfully!");
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Update failed:", error.response?.data || error.message);
      alert("❌ Failed to update project");
    }
  };

  return (
    <Layout>
      <div
        style={{
          maxWidth: "600px",
          margin: "60px auto",
          background: "#fff",
          padding: "35px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#1e293b",
            marginBottom: "25px",
            fontWeight: "600",
          }}
        >
          ✏️ Edit Project
        </h2>

        <form onSubmit={handleUpdate}>
          <input
            type="text"
            placeholder="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              marginBottom: "15px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              fontSize: "15px",
            }}
          />

          <textarea
            placeholder="Project Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              height: "100px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              fontSize: "15px",
              resize: "none",
              marginBottom: "20px",
            }}
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              style={{
                flex: 1,
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "10px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Update
            </button>

            <button
              type="button"
              onClick={() => (window.location.href = `/projects/${id}/details`)}
              style={{
                flex: 1,
                background: "#e2e8f0",
                color: "#1e293b",
                border: "none",
                borderRadius: "6px",
                padding: "10px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default EditProject;