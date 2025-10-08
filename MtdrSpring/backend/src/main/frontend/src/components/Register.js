import { useState } from "react";
import { Box, Button, TextField, Typography, Link, Grid, Paper, Alert } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    Object.entries(formData).forEach(([key, value]) => {
      if (!value.trim()) newErrors[key] = "Este campo es obligatorio.";
    });

    if (formData.password && !validatePassword(formData.password)) {
      newErrors.password =
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setServerMessage("✅ Registro exitoso. Redirigiendo...");
        navigate("/taskList");
      } else {
        setServerMessage("❌ Error al registrar usuario. Verifica los datos.");
      }
    } catch (error) {
      console.error(error);
      setServerMessage("⚠️ Error de conexión con el servidor.");
    }
  };

  return (
    <Grid container component="main" sx={{ height: "100vh" }}>
      <Grid
        item
        xs={12}
        sm={6}
        md={6}
        component={Paper}
        elevation={6}
        square
        sx={{ p: 4, display: "flex", flexDirection: "column", justifyContent: "center" }}
      >
        <Box display="flex" alignItems="center" mb={2}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Oracle_logo.svg"
            alt="logo"
            style={{ width: 50, marginRight: 10 }}
          />
          <Typography variant="h5" component="h1">Java Bot</Typography>
        </Box>

        <Typography variant="h4" gutterBottom>
          Crear cuenta
        </Typography>

        {serverMessage && <Alert severity="info" sx={{ mb: 2 }}>{serverMessage}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {["username", "email", "fullName", "password", "phone"].map((field) => (
            <TextField
              key={field}
              name={field}
              margin="normal"
              fullWidth
              label={
                field === "username" ? "Nombre de usuario" :
                field === "email" ? "Correo electrónico" :
                field === "fullName" ? "Nombre y apellidos" :
                field === "password" ? "Contraseña" : "Número de teléfono"
              }
              type={field === "password" ? "password" : field === "email" ? "email" : "text"}
              value={formData[field]}
              onChange={handleChange}
              error={!!errors[field]}
              helperText={errors[field]}
            />
          ))}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, bgcolor: "#1e1e1e", "&:hover": { bgcolor: "#333" } }}
          >
            Registrar
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 2 }}>
          ¿Ya tienes una cuenta?{" "}
          <Link component={RouterLink} to="/">Inicia sesión</Link>
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

export default Register;
