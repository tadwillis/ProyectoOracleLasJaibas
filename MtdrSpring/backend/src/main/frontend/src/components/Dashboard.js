// TaskList.js
import React, { useState, useEffect } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Button, Paper, LinearProgress, Typography, Box, Grid, Stack,
  Divider, Avatar, TextField, MenuItem, Chip, IconButton
} from '@mui/material';
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TopBar from '../components/TopBar';

const BANNER_SRC = "/img/banner-top2.png";
const heroSx = {
  position: 'relative',
  left: '50%', right: '50%', ml: '-50vw', mr: '-50vw',
  width: '100vw',
  backgroundImage: `url(${BANNER_SRC})`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  py: { xs: 3, sm: 4 }, // (padding vertical)
};


function Dashboard() {
    const [kpi, setKpi] = useState(null);

    useEffect(() => {
    fetch("/api/tasks/kpi/hours")
        .then((res) => res.json())
        .then((data) => setKpi(data))
        .catch((err) => console.error("Error al cargar KPI:", err));
    }, []);
    
    return (
        <>
    
          <TopBar />
    
          {/* imagen detrás del título */}
          <Box sx={heroSx}>
            <Box
              sx={{
                maxWidth: 1680,
                mx: 'auto',
                px: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,.35)' }}
              >
                Dashboard
              </Typography>
            </Box>
          </Box>
    
          {/* separador */}
          <Box sx={{ mt: 3 }} />
    
          <Box sx={{ bgcolor: "#f7f4ed", minHeight: "100vh", p: 4 }}>
            <Grid container spacing={2}>
                {/* Panel izquierdo */}
                <Grid item xs={12} md={3} lg={2.5}>
                <Paper
                    elevation={0}
                    sx={{
                    bgcolor: "#2e5e73",
                    color: "white",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    p: 3,
                    height: "100%",
                    }}
                >
                    <Avatar
                    sx={{
                        width: 120,
                        height: 120,
                        bgcolor: "#4a6f83",
                        fontSize: 40,
                        mb: 2,
                    }}
                    >
                    SM
                    </Avatar>
                    <Typography variant="subtitle1" align="center" sx={{ fontWeight: 600 }}>
                    Santiago Alonso
                    <br />
                    Mendoza Franco
                    </Typography>
                </Paper>
                </Grid>

                {/* Contenido principal */}
                <Grid item xs={12} md={9} lg={9.5}>
                <Grid container spacing={4}>
                    {/* --- Progreso e historial --- */}
                    <Grid item xs={12} md={6} lg={3}>
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                        Progreso e Historial
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mt: 1, mb: 2 }}>
                        Mira tu recorrido
                    </Typography>
                    <Typography variant="body2">
                        <b>8</b> Horas, <b>1</b> Proyecto, <b>2</b> Tareas
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                        {[
                        { name: "Autenticación segura", value: 100 },
                        { name: "Activar notificaciones de Telegram", value: 100 },
                        { name: "Parámetro de tiempo invertido", value: 100 },
                        { name: "Métricas de productividad", value: 25 },
                        ].map((task, i) => (
                        <Box key={i} sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {task.name}
                            </Typography>
                            <LinearProgress
                            variant="determinate"
                            value={task.value}
                            sx={{ height: 6, borderRadius: 2, mt: 0.5 }}
                            />
                        </Box>
                        ))}
                    </Box>
                    </Grid>

                    {/* --- Distinciones --- */}
                    <Grid item xs={12} md={6} lg={3}>
                        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                            KPI de Desempeño
                        </Typography>
                        <Typography variant="subtitle1" sx={{ mt: 1 }}>
                            Comparativa de horas estimadas vs reales
                        </Typography>

                        {kpi ? (
                            <Box sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                <b>Total estimado:</b> {kpi.totalEstimatedHours.toFixed(2)} h
                            </Typography>
                            <Typography variant="body2">
                                <b>Total real:</b> {kpi.totalEffortHours.toFixed(2)} h
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                <b>Eficiencia:</b>{" "}
                                <Chip
                                label={`${kpi.efficiency.toFixed(1)}%`}
                                color={kpi.efficiency >= 100 ? "success" : "warning"}
                                sx={{ fontWeight: "bold" }}
                                />
                            </Typography>

                            <Box sx={{ mt: 2 }}>
                                <LinearProgress
                                variant="determinate"
                                value={Math.min(kpi.efficiency, 100)}
                                sx={{ height: 8, borderRadius: 2 }}
                                />
                            </Box>
                            </Box>
                        ) : (
                            <Typography variant="body2" sx={{ mt: 2 }}>
                            Cargando KPI...
                            </Typography>
                        )}
                    </Grid>


                    {/* --- Acerca de mí --- */}
                    <Grid item xs={12} md={6} lg={3}>
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                        Acerca de mí
                    </Typography>
                    <Divider sx={{ my: 1, width: "60px", borderColor: "#d4a017", borderBottomWidth: 3 }} />
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>
                        Cuéntanos sobre ti
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Estudiante de ingeniería en sistemas, apasionado por la nube y DevOps.
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>
                        Años de experiencia
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        1 año en Oracle Academy
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>
                        Habilidades
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Backend con Spring Boot y automatización en la nube.
                    </Typography>
                    </Grid>

                    {/* --- Capacitaciones --- */}
                    <Grid item xs={12} md={6} lg={3}>
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                        Capacitaciones
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mt: 1 }}>
                        3 Capacitaciones asignadas
                    </Typography>

                    {[
                        { name: "Certificación OCI Foundations", value: 100 },
                        { name: "Badge Cloud Native", value: 100 },
                        { name: "OCI DevOps", value: 0 },
                    ].map((course, i) => (
                        <Box key={i} sx={{ mt: 2 }}>
                        <Typography variant="body2">{course.name}</Typography>
                        <LinearProgress
                            variant="determinate"
                            value={course.value}
                            sx={{ height: 6, borderRadius: 2, mt: 0.5 }}
                        />
                        </Box>
                    ))}
                    </Grid>
                </Grid>
                </Grid>
            </Grid>
            </Box>
        </>
      );
}

export default Dashboard;