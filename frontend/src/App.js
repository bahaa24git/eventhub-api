import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import AddProject from "./pages/AddProject";
import EditProject from "./pages/EditProject";
import ProjectMembers from "./pages/ProjectMembers";
import ProjectTasks from "./pages/ProjectTasks";        
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import ProjectLabels from "./pages/ProjectLabels";
import ProjectAttachments from "./pages/ProjectAttachments";
import TaskComments from "./pages/TaskComments";
import TaskSubtasks from "./pages/SubTasks";
import ProjectDashboard from "./pages/ProjectDashboard";
import Settings from "./pages/Settings";

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
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id/details" element={<ProjectDetails />} />
        <Route path="/projects/:id/labels" element={<ProjectLabels />} />
        <Route path="/projects/:projectId/tasks/:taskId/attachments" element={<ProjectAttachments />} />
        <Route path="/projects/:id/tasks/:taskId/comments" element={<TaskComments />} />
        <Route path="/projects/:id/tasks/:taskId/subtasks" element={<TaskSubtasks />} />
        <Route path="/projects/:id/dashboard" element={<ProjectDashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;
