import React, { useEffect, useState } from "react";
import axios from "axios";

function ProjectList() {
  const [projects, setProjects] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/v1/projects/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, [token]);

  return (
    <div className="project-list">
      <h2>My Projects</h2>
      {projects.length > 0 ? (
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <h3>{project.name}</h3>
              <p>{project.description || "No description available."}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No projects yet.</p>
      )}
    </div>
  );
}

export default ProjectList;
