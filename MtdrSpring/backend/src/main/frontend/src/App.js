import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import TaskList from "./components/user/TaskList";
import MyTasks from "./components/user/MyTasks";
import Dashboard from "./components/user/Dashboard";
import UserStories from "./components/user/UserStories";
import Sprints from "./components/user/Sprints";
import Projects from "./components/user/Projects";
import Teams from "./components/user/Teams";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import AdminRoute from "./components/admin/AdminRoute";
import Admin from "./components/admin/Admin";
import ManagerRoute from "./components/manager/ManagerRoute";
import ManagerUserSelection from "./components/manager/ManagerUserSelection";
import ManagerDashboard from "./components/manager/ManagerDashboard";
import ManagerUsers from "./components/manager/ManagerUsers";
import UserDetails from "./components/manager/UserDetails";
import ManagerProjects from "./components/manager/ManagerProjects";
import ManagerSprints from "./components/manager/ManagerSprints";
import ManagerTeams from "./components/manager/ManagerTeams";
import ManagerTasks from "./components/manager/ManagerTasks";
import Inicio from "./components/user/Inicio";
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
        

        {/* Rutas de Manager */}
        <Route
          path="/manager"
          element={
            <ManagerRoute>
              <ManagerUserSelection />
            </ManagerRoute>
          }
        />
        <Route
          path="/manager/dashboard"
          element={
            <ManagerRoute>
              <ManagerDashboard />
            </ManagerRoute>
          }
        />
        <Route
          path="/manager/users"
          element={
            <ManagerRoute>
              <ManagerUsers />
            </ManagerRoute>
          }
        />
        <Route
          path="/manager/user/:userId"
          element={
            <ManagerRoute>
              <UserDetails />
            </ManagerRoute>
          }
        />
        <Route
          path="/manager/projects"
          element={
            <ManagerRoute>
              <ManagerProjects />
            </ManagerRoute>
          }
        />
        <Route
          path="/manager/sprints"
          element={
            <ManagerRoute>
              <ManagerSprints />
            </ManagerRoute>
          }
        />
        <Route
          path="/manager/teams"
          element={
            <ManagerRoute>
              <ManagerTeams />
            </ManagerRoute>
          }
        />
        <Route
          path="/manager/tasks"
          element={
            <ManagerRoute>
              <ManagerTasks />
            </ManagerRoute>
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
