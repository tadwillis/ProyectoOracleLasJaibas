import './Login.css';
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  function showRegister() {
    document.getElementById("login-form").classList.add("hidden");
    document.getElementById("register-form").classList.remove("hidden");
  }

  function showLogin() {
    document.getElementById("register-form").classList.add("hidden");
    document.getElementById("login-form").classList.remove("hidden");
  }

  return (
    <div className="container">
      {/* Panel Izquierdo */}
      <div className="left-panel">
        <div className="logo">
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Oracle_logo.svg" alt="logo"/>
          <h1>Java Bot</h1>
        </div>

        {/* FORMULARIO LOGIN */}
        <div id="login-form">
          <h2>Iniciar sesión</h2>
          <p>¿No tienes una cuenta? <a href="#" onClick={showRegister}>Crear cuenta</a></p>
          <div className="form-group">
            <input type="text" placeholder="Nombre de usuario o correo electrónico"/>
          </div>
          <div className="form-group">
            <input type="password" placeholder="Contraseña"/>
          </div>
          <button className="btn" onClick={() => navigate("/taskList")}>Conectar</button>
        </div>

        {/* FORMULARIO REGISTRO */}
        <div id="register-form" className="hidden">
          <h2>Crear cuenta</h2>
          <div className="form-group">
            <input type="text" placeholder="Nombre de usuario"/>
          </div>
          <div className="form-group">
            <input type="email" placeholder="Correo electrónico"/>
          </div>
          <div className="form-group">
            <input type="text" placeholder="Nombre y apellidos"/>
          </div>
          <div className="form-group">
            <input type="password" placeholder="Mínimo 8 caracteres"/>
          </div>
          <div className="form-group">
            <input type="tel" placeholder="Número de teléfono (mínimo 8 caracteres)"/>
          </div>
          <button className="btn" onClick={() => navigate("/taskList")}>Conectar</button>
          <p>¿Ya tienes una cuenta? <a href="#" onClick={showLogin}>Inicia sesión</a></p>
        </div>
      </div>

      {/* Panel Derecho */}
      <div className="right-panel">
        <div className="brackets">[ ]</div>
      </div>
    </div>
  )
}

export default Login;
