import React, { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [events, setEvents] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/v1/events/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
        if (error.response?.status === 401) {
          alert("Session expired. Please log in again.");
          localStorage.removeItem("token");
          window.location.href = "/";
        }
      }
    };

    fetchEvents();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/v1/events/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEvents(events.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete event");
    }
  };

  return (
    <div className="dashboard-container">
      <h1>My Events</h1>
      <button
        className="add-btn"
        onClick={() => (window.location.href = "/add-event")}
      >
        + Add Event
      </button>
      <ul className="events-list">
        {events.map((event) => (
          <li key={event.id} className="event-item">
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <small>{new Date(event.datetime).toLocaleString()}</small>
            <div className="actions">
              <button onClick={() => (window.location.href = `/edit/${event.id}`)}>
                Edit
              </button>
              <button onClick={() => handleDelete(event.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
