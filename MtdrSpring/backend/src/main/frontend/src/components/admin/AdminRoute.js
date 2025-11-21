// src/components/AdminRoute.js
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function AdminRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    // No hay token, redirigir al login
    return <Navigate to="/" replace />;
  }

  try {
    const decodedToken = jwtDecode(token);
    const userRole = decodedToken.role;

    if (userRole === "ADMIN") {
      // Si el rol es ADMIN, permite el acceso al componente hijo
      return children;
    } else {
      // Si el rol no es ADMIN, redirige a la página de inicio
      console.warn("Acceso denegado. Se requiere rol de ADMIN.");
      return <Navigate to="/Inicio" replace />;
    }
  } catch (error) {
    // Si el token es inválido, redirigir al login
    console.error("Token inválido:", error);
    return <Navigate to="/" replace />;
  }
}

export default AdminRoute;
