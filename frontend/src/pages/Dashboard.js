import React, { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/v1/projects/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProjects(response.data.results || response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        if (error.response?.status === 401) {
          alert("Session expired. Please log in again.");
          localStorage.removeItem("token");
          window.location.href = "/";
        }
      }
    };

    fetchProjects();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/v1/projects/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProjects(projects.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete project");
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">My Projects</h1>

      <button
        className="primary-btn"
        onClick={() => (window.location.href = "/add-project")}
      >
        + Add Project
      </button>

      {projects.length === 0 ? (
        <p className="no-projects">No projects found. Start by adding one!</p>
      ) : (
        <ul className="project-list">
          {projects.map((project) => (
            <li key={project.id} className="project-item">
              <div className="project-details">
                <h3>{project.name}</h3>
                <p>{project.description || "No description available."}</p>
              </div>

              <div className="project-actions">
                <button
                  className="edit-btn"
                  onClick={() => (window.location.href = `/edit/${project.id}`)}
                >
                  Edit
                </button>
                <button
                  className="edit-btn"
                  onClick={() =>
                    (window.location.href = `/projects/${project.id}/members`)
                  }
                >
                  Manage Members
                </button>
                <button
                  className="edit-btn"
                  onClick={() =>
                    (window.location.href = `/projects/${project.id}/tasks`)
                  }
                >
                  Manage Tasks
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(project.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;
