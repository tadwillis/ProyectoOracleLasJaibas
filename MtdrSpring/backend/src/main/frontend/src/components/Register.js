import { useState } from "react";
import { Box, Button, TextField, Typography, Link, Grid, Paper, Alert } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

const MotionBox = motion(Box);

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', fullName: '', password: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");

  const MOTION = { enter: 0.45, exit: 0.30, stagger: 0.12, delayChildren: 0.08, underline: 0.55, hover: 0.22, reduced: 0.25 };
  const prefersReducedMotion = useReducedMotion();
  const fadeInUp = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: MOTION.reduced } }, exit: { opacity: 0, transition: { duration: MOTION.reduced } } }
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0, transition: { duration: MOTION.enter, ease: [0.16, 1, 0.3, 1] } }, exit: { opacity: 0, y: 8, transition: { duration: MOTION.exit } } };
  const staggerContainer = { animate: { transition: { staggerChildren: MOTION.stagger, delayChildren: MOTION.delayChildren } } };
  const underlineProps = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: MOTION.reduced } } }
    : { initial: { scaleX: 0 }, animate: { scaleX: 1, transition: { duration: MOTION.underline } }, style: { originX: 0 } };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validatePassword = (password) => /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.entries(formData).forEach(([k, v]) => { if (!v.trim()) newErrors[k] = "Este campo es obligatorio."; });
    if (formData.password && !validatePassword(formData.password)) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.";
    }
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    try {
      const response = await fetch("/api/auth/register", {
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
    } catch {
      setServerMessage("⚠️ Error de conexión con el servidor.");
    }
  };

  return (
    <Grid container component="main" sx={{ height: "100vh", bgcolor: "#f5f5f5" }}
    direction={{ xs: "column", md: "row-reverse" }}
    >
      {/* Lado Formulario */}
      <Grid
        item
        xs={12}
        sm={6}
        md={6}
        component={Paper}
        elevation={6}
        square
        sx={{ p: { xs: 3, sm: 4 }, display: "flex", flexDirection: "column", justifyContent: "center", borderRadius: 0 }}
      >
        <Box component={motion.div} variants={fadeInUp} initial="initial" animate="animate" exit="exit">
          {/* Branding */}
          <Box display="flex" alignItems="center" mb={1.5}>
            <img src="/img/Oracle-Symbol.png" alt="logo" style={{ width: 46, marginRight: 10 }} />
            <Typography variant="h6" component="h1" sx={{ fontWeight: 800, letterSpacing: 0.4 }}>
              Java Bot
            </Typography>
          </Box>

          {/* Título */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#1f2a37" }}>
              Crear cuenta
            </Typography>
            <motion.div {...underlineProps}>
              <Box sx={{ mt: 1, height: 4, width: 120, bgcolor: "#F84600", borderRadius: 2 }} />
            </motion.div>
          </Box>

          {serverMessage && (
            <Alert severity="info" sx={{ mb: 2 }} component={motion.div} variants={fadeInUp}>
              {serverMessage}
            </Alert>
          )}

          <MotionBox
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 1 }}
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {["username", "email", "fullName", "password", "phone"].map((field) => (
              <Box key={field} component={motion.div} variants={fadeInUp}>
                <TextField
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
              </Box>
            ))}

            <Box component={motion.div} variants={fadeInUp}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  bgcolor: "#313131",
                  fontWeight: 700,
                  borderRadius: 2,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#1f1f1f" }
                }}
                component={motion.button}
                whileHover={!prefersReducedMotion ? { scale: 1.01 } : {}}
                transition={{ type: "tween", duration: MOTION.hover }}
              >
                Registrar
              </Button>
            </Box>
          </MotionBox>

          <Typography variant="body2" sx={{ mt: 2 }}>
            ¿Ya tienes una cuenta?{" "}
            <Link component={RouterLink} to="/" underline="hover" sx={{ fontWeight: 700 }}>
              Inicia sesión
            </Link>
          </Typography>
        </Box>
      </Grid>

      {/* Lado Visual */}
      <Grid
        item
        xs={false}
        sm={6}
        md={6}
        sx={{
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#2f3b3a",   
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          component={motion.div}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: MOTION.enter } }}
          sx={{
            color: "#f4a300",            
            fontSize: { xs: 64, sm: 90 },
            fontWeight: 800,
            textShadow: "0 4px 10px rgba(0,0,0,.35)"
          }}
        >
          {`[ ]`}
        </Box>

        <Box
          component={motion.div}
          animate={!prefersReducedMotion ? { y: [0, -8, 0] } : {}}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          sx={{ position: "absolute", bottom: -100, left: -100, width: 300, height: 300, bgcolor: "#d9534f", borderRadius: "50%", opacity: 0.9 }}
        />
        <Box
          component={motion.div}
          animate={!prefersReducedMotion ? { y: [0, -6, 0] } : {}}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
          sx={{ position: "absolute", bottom: -50, right: -100, width: 250, height: 250, bgcolor: "#6c757d", borderRadius: "50%", opacity: 0.9 }}
        />
      </Grid>
    </Grid>
  );
}

export default Register;
