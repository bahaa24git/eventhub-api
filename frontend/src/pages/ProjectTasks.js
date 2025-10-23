import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function ProjectTasks() {
  const { id } = useParams(); // id = project_pk
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const token = localStorage.getItem("token");

  // ✅ Fetch all tasks for this project
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/v1/projects/${id}/tasks/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTasks(response.data.results || response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error.response?.data || error.message);
      }
    };
    fetchTasks();
  }, [id, token]);

  // ✅ Add or Update Task
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingTask) {
        // PUT → update an existing task
        const response = await axios.put(
          `http://127.0.0.1:8000/api/v1/projects/${id}/tasks/${editingTask.id}/`,
          { title, description },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTasks(tasks.map((t) => (t.id === editingTask.id ? response.data : t)));
        setEditingTask(null);
      } else {
        // POST → create new task
        const response = await axios.post(
          `http://127.0.0.1:8000/api/v1/projects/${id}/tasks/`,
          { title, description },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTasks([...tasks, response.data]);
      }

      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Error saving task:", error.response?.data || error.message);
      alert("Failed to save task");
    }
  };

  // ✅ Edit mode
  const handleEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
  };

  // ✅ Delete task
  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/v1/projects/${id}/tasks/${taskId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error.response?.data || error.message);
      alert("Failed to delete task");
    }
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">
        {editingTask ? "Edit Task" : "Project Tasks"}
      </h1>

      <form onSubmit={handleSubmit} className="project-form">
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="form-actions">
          <button type="submit" className="primary-btn">
            {editingTask ? "Update Task" : "Add Task"}
          </button>
          {editingTask && (
            <button type="button" className="cancel-btn" onClick={cancelEdit}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <ul className="project-list">
        {tasks.length === 0 ? (
          <p className="no-projects">No tasks yet</p>
        ) : (
          tasks.map((task) => (
            <li key={task.id} className="project-item">
              <div className="project-details">
                <h3>{task.title}</h3>
                <p>{task.description}</p>
              </div>
              <div className="project-actions">
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(task)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(task.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

      <button
        className="cancel-btn"
        onClick={() => (window.location.href = "/dashboard")}
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}

export default ProjectTasks;
