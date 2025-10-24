import { useState } from "react";
import { Box, Button, TextField, Typography, Link, Grid, Paper, Alert } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

const MotionBox = motion(Box);

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");

  // Motion timings
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
        localStorage.setItem("token", data["jwt-token"]);
        localStorage.setItem("username", formData.username);
        setServerMessage("✅ Login exitoso, redirigiendo...");
        setTimeout(() => navigate("/Inicio"), 1500);
      } else {
        const errorData = await response.json();
        setServerMessage(errorData.error || "❌ Credenciales incorrectas");
      }
    } catch {
      setServerMessage("⚠️ Error de conexión con el servidor");
    }
  };

  return (
    <Grid container component="main" sx={{ height: "100vh", bgcolor: "#f5f5f5" }}>
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
        {/* Animación en el contenido */}
        <Box component={motion.div} variants={fadeInUp} initial="initial" animate="animate" exit="exit">
          {/* Branding */}
          <Box display="flex" alignItems="center" mb={1.5}>
            <img src="/img/Oracle-Symbol.png" alt="logo" style={{ width: 46, marginRight: 10 }} />
            <Typography variant="h6" component="h1" sx={{ fontWeight: 800, letterSpacing: 0.4 }}>
              Java Bot
            </Typography>
          </Box>

          {/* Título  */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#1f2a37" }}>
              Iniciar sesión
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
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <Box component={motion.div} variants={fadeInUp}>
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
            </Box>

            <Box component={motion.div} variants={fadeInUp}>
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
            </Box>

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
                Conectar
              </Button>
            </Box>
          </MotionBox>

          <Typography variant="body2" sx={{ mt: 2 }}>
            ¿No tienes una cuenta?{" "}
            <Link component={RouterLink} to="/register" underline="hover" sx={{ fontWeight: 700 }}>
              Crear cuenta
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

export default Login;
