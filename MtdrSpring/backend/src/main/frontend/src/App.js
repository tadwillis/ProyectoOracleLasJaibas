import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import TaskList from "./components/TaskList";
import Register from "./components/Register";

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
      </Routes>
    </Router>
  );
}

export default App;
