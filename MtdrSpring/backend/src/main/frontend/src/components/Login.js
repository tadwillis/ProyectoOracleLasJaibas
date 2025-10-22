import { useState } from "react";
import { Box, Button, TextField, Typography, Link, Grid, Paper, Alert } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Campo obligatorio";
    if (!formData.password.trim()) newErrors.password = "Campo obligatorio";
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data["jwt-token"]); // guardar el token JWT
        localStorage.setItem("username", formData.username);
        setServerMessage("✅ Login exitoso, redirigiendo...");
        setTimeout(() => navigate("/taskList"), 1500);
      } else {
        const errorData = await response.json();
        setServerMessage(errorData.error || "❌ Credenciales incorrectas");
      }
    } catch (err) {
      setServerMessage("⚠️ Error de conexión con el servidor");
    }
  };

  return (
    <Grid container component="main" sx={{ height: "100vh" }}>
      <Grid item xs={12} sm={6} md={6} component={Paper} elevation={6} square
        sx={{ p: 4, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Box display="flex" alignItems="center" mb={2}>
          <img
            src="/img/Oracle-Symbol.png"
            alt="logo"
            style={{ width: 50, marginRight: 10 }}
          />
          <Typography variant="h5" component="h1">Java Bot</Typography>
        </Box>

        <Typography variant="h4" gutterBottom>Iniciar sesión</Typography>

        {serverMessage && <Alert severity="info" sx={{ mb: 2 }}>{serverMessage}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            name="username"
            margin="normal"
            fullWidth
            label="Usuario"
            value={formData.username}
            onChange={handleChange}
            error={!!errors.username}
            helperText={errors.username}
          />
          <TextField
            name="password"
            margin="normal"
            fullWidth
            type="password"
            label="Contraseña"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, bgcolor: "#1e1e1e", "&:hover": { bgcolor: "#333" } }}
          >
            Conectar
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 2 }}>
          ¿No tienes una cuenta?{" "}
          <Link component={RouterLink} to="/register">Crear cuenta</Link>
        </Typography>
      </Grid>

      <Grid
          item
          xs={false}
          sm={6}
          md={6}
          sx={{
          backgroundColor: "#2f3b3a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          }}
      >
          <Box sx={{ color: "#f4a300", fontSize: "100px", zIndex: 1 }}>[ ]</Box>
          <Box sx={{
          position: "absolute",
          bottom: -100,
          left: -100,
          width: 300,
          height: 300,
          bgcolor: "#d9534f",
          borderRadius: "50%"
          }} />
          <Box sx={{
          position: "absolute",
          bottom: -50,
          right: -100,
          width: 250,
          height: 250,
          bgcolor: "#6c757d",
          borderRadius: "50%"
          }} />
      </Grid>
    </Grid>
  );
}

export default Login;
