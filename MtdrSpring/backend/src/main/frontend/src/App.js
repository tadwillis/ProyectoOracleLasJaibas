import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import TaskList from "./components/TaskList";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import UserStories from "./components/UserStories";
import Sprints from "./components/Sprints";
import Projects from "./components/Projects";
import Teams from "./components/Teams";

function App() {
  return (
    <Router>
      <Routes>
        {/* Pantalla inicial */}
        <Route path="/" element={<Login />} />
        {/* Crear Cuenta */}
        <Route path="/register" element={<Register />} />
        {/* Tablero Kanban */}
        <Route path="/taskList" element={<TaskList />} />
        {/* Dashboard para KPIs */}
        <Route path="/dashboard" element={<Dashboard />} />
        {/* User Stories */}
        <Route path="/stories" element={<UserStories />} />
        {/* Sprints */}
        <Route path="/sprints" element={<Sprints />} />
        {/* Projects */}
        <Route path="/projects" element={<Projects />} />
        {/* Teams */}
        <Route path="/teams" element={<Teams />} />
      </Routes>
    </Router>
  );
}

export default App;