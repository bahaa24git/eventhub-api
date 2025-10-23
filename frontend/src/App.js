import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import AddProject from "./pages/AddProject";
import EditProject from "./pages/EditProject";
import ProjectMembers from "./pages/ProjectMembers";
import ProjectTasks from "./pages/ProjectTasks";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-project" element={<AddProject />} />
        <Route path="/edit/:id" element={<EditProject />} />
        <Route path="/projects/:id/members" element={<ProjectMembers />} />
        <Route path="/projects/:id/tasks" element={<ProjectTasks />} />

      </Routes>
    </Router>
  );
}

export default App;
