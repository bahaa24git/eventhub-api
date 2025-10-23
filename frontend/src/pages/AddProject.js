import React, { useState } from "react";
import axios from "axios";

function AddProject() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/v1/projects/",
        { name, description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Project created successfully!");
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error creating project:", error.response?.data || error.message);
      alert("Failed to create project");
    }
  };

  return (
    <div className="form-container">
      <h2>Add New Project</h2>
      <form onSubmit={handleSubmit} className="project-form">
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
          <button type="submit" className="primary-btn">Create</button>
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

export default AddProject;
