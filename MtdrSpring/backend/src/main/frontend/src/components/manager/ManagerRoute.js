// src/components/ManagerRoute.js
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function ManagerRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    // No hay token, redirigir al login
    return <Navigate to="/" replace />;
  }

  try {
    const decodedToken = jwtDecode(token);
    const userRole = decodedToken.role;

    if (userRole === "MANAGER" || userRole === "ADMIN") {
      // Si el rol es MANAGER o ADMIN, permite el acceso al componente hijo
      return children;
    } else {
      // Si el rol no es MANAGER o ADMIN, redirige a la página de inicio
      console.warn("Acceso denegado. Se requiere rol de MANAGER o ADMIN.");
      return <Navigate to="/Inicio" replace />;
    }
  } catch (error) {
    // Si el token es inválido, redirigir al login
    console.error("Token inválido:", error);
    return <Navigate to="/" replace />;
  }
}

export default ManagerRoute;
