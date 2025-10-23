import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function EditProject() {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/v1/projects/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Project updated successfully!");
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Update failed:", error.response?.data || error.message);
      alert("Failed to update project");
    }
  };

  return (
    <div className="form-container">
      <h2>Edit Project</h2>
      <form onSubmit={handleUpdate} className="project-form">
        <input
          type="text"
          placeholder="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <textarea
          placeholder="Project Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="form-actions">
          <button type="submit" className="primary-btn">Update</button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => (window.location.href = "/dashboard")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProject;
