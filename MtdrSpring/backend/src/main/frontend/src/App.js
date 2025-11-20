import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import TaskList from "./components/TaskList";
import MyTasks from "./components/MyTasks";
import Dashboard from "./components/Dashboard";
import UserStories from "./components/UserStories";
import Sprints from "./components/Sprints";
import Projects from "./components/Projects";
import Teams from "./components/Teams";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute"; // Importar AdminRoute
import Admin from "./components/Admin"; // Importar Admin
import Inicio from "./components/Inicio";
import BacklogAnalysis from "./components/BacklogAnalysis";

function App() {
  return (
    <Router>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Ruta de Admin */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
        

        {/* Privadas */}
        <Route
          path="/Inicio"
          element={
            <ProtectedRoute>       
              <Inicio />
            </ProtectedRoute>
          }
        />

        <Route
          path="/backlog-analysis"
          element={
            <ProtectedRoute>
              <BacklogAnalysis />
            </ProtectedRoute>
          }
        />
        <Route
          path="/taskList"
          element={
            <ProtectedRoute>
              <TaskList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/myTasks"
          element={
            <ProtectedRoute>
              <MyTasks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stories"
          element={
            <ProtectedRoute>
              <UserStories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sprints"
          element={
            <ProtectedRoute>
              <Sprints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams"
          element={
            <ProtectedRoute>
              <Teams />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
