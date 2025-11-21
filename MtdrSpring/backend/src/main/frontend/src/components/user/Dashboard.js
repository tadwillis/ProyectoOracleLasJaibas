// Dashboard.js
import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, Box, Grid, Divider, Avatar, Chip,
  IconButton, TextField, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import TopBar from '../shared/TopBar';
import { motion, useReducedMotion } from 'framer-motion';

// ----------------- Tiempos -----------------
const MOTION = {
  enter: 0.45,         // duración de entrada de cards
  exit: 0.30,          // duración de salida de cards
  stagger: 0.12,       // desfase entre cards
  delayChildren: 0.08, // retraso inicial del grupo
  underline: 0.55,     // subrayado naranja
  hover: 0.22,         // hover sutil en cards
  reduced: 0.25,       // modo "reduce motion"
  muiProgressMs: 450   // transición visual de LinearProgress (no FM)
};
// ---------------------------------------------------------------------


const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: MOTION.enter, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: 8,  transition: { duration: MOTION.exit } }
};
const staggerContainer = {
  animate: { transition: { staggerChildren: MOTION.stagger, delayChildren: MOTION.delayChildren } }
};
const reduced = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: MOTION.reduced } },
  exit:    { opacity: 0, transition: { duration: MOTION.reduced } }
};

const BANNER_SRC = "/img/banner-top3.png";
const heroSx = {
  position: 'relative',
  left: '50%', right: '50%', ml: '-50vw', mr: '-50vw',
  width: '100vw',
  backgroundImage: `linear-gradient(rgba(46,94,115,0.55), rgba(46,94,115,0.55)), url(${BANNER_SRC})`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  py: { xs: 4, sm: 5 },
};

function Dashboard() {
  const [sprints, setSprints] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedProjectHours, setSelectedProjectHours] = useState(null);
  const [selectedProjectGlobal, setSelectedProjectGlobal] = useState(null);
  const [selectedProjectTeam, setSelectedProjectTeam] = useState("");
  const [selectedProjectTasks, setSelectedProjectTasks] = useState("");
  const [selectedTeamHours, setSelectedTeamHours] = useState("");
  const [selectedSprintTasks, setSelectedSprintTasks] = useState("");
  const [teamSprintHoursMatrix, setTeamSprintHours] = useState(null);
  const [sprintGlobalHours, setSprintGlobalHours] = useState([]);
  const [sprintHoursList, setSprintHoursList] = useState([]);
  const [kpiHours, setKpiHours] = useState();
  const [kpiTasks, setKpiTasks] = useState();
  const [sprintTasksTable, setSprintTasksTable] = useState(null);
  const [user, setUser] = useState();
  const username = localStorage.getItem('username') || 'Usuario';

//grafica kpi desempeño en horas
  const estimatedHours = Number(kpiHours?.totalEstimatedHours ?? 0);
  const realHours = Number(kpiHours?.totalEffortHours ?? 0);
  const hoursEfficiency = Number(kpiHours?.efficiency ?? 0);

  const maxHours = Math.max(estimatedHours, realHours, 1); 

  const HOURS_MAX_BAR_HEIGHT = 90; 
  const estimatedBarHeight = (estimatedHours / maxHours) * HOURS_MAX_BAR_HEIGHT;
  const realBarHeight = (realHours / maxHours) * HOURS_MAX_BAR_HEIGHT;
//--------------------------------------------------------------------
  const userSprintChartWidth = Math.max(260, 80 + sprintHoursList.length * 60);
  const maxUserSprintHours = sprintHoursList.reduce((max, s) => {
    const h = Number(s.totalHours ?? 0);
    return h > max ? h : max;
  }, 0);


  // --- Máximo de horas globales por sprint (para escalar las barras) ---
  const maxGlobalSprintHours = sprintGlobalHours.reduce((max, s) => {
  const h = Number(s.totalHours ?? 0);
  return h > max ? h : max;
  }, 0);

  // --- Máximo de horas del equipo por sprint (para escalar las barras) ---
  const maxTeamSprintHours = teamSprintHoursMatrix
    ? teamSprintHoursMatrix.rows.reduce((max, row) => {
        return row.hours.reduce((m2, h) => {
          const val = Number(h ?? 0);
          return val > m2 ? val : m2;
        }, max);
      }, 0)
    : 0;

  const teamSprintChartWidth = teamSprintHoursMatrix
    ? Math.max(
        260,
        80 +
          teamSprintHoursMatrix.sprints.length *
            (40 + teamSprintHoursMatrix.rows.length * 18)
      )
    : 260;

  const TEAM_BASE_COLORS = [
    '#4caf50', 
    '#2196f3', 
    '#ff9800', 
    '#ab47bc', 
    '#f44336', 
    '#00897b', 
  ];
  const getMemberColor = (index, totalMembers) => {
    if (index < TEAM_BASE_COLORS.length) {
      return TEAM_BASE_COLORS[index];
    }
    const hue = Math.round((index / Math.max(totalMembers, 1)) * 360);
    return `hsl(${hue}, 65%, 50%)`;
  };



  const globalSprintChartWidth = Math.max(260, 80 + sprintGlobalHours.length * 60);

// grafica kpi desempeño en tareas
  const plannedTasks = Number(kpiTasks?.totalPlannedTasks ?? 0);
  const doneTasks = Number(kpiTasks?.totalDoneTasks ?? 0);
  const tasksEfficiency = Number(kpiTasks?.efficiency ?? 0);

  const pendingTasks = Math.max(plannedTasks - doneTasks, 0);

  const donePercentOfPlan =
  plannedTasks > 0 ? Math.min((doneTasks / plannedTasks) * 100, 100) : 0;

  const DONUT_RADIUS = 36;
  const DONUT_CIRC = 2 * Math.PI * DONUT_RADIUS;
  const DONUT_OFFSET = DONUT_CIRC - (donePercentOfPlan / 100) * DONUT_CIRC;


  // =======================================================

  async function loadUser() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/users/username/${username}`, {
        headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al obtener el usuario');
      const data = await res.json();
      setUser(data);
    } catch (e) { console.error('Error usuarios:', e); }
  }

  async function loadProjects() {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/projects", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    setProjects(await res.json());
  }

  async function loadTeams() {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/teams`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    setTeams(await res.json());
  }

  async function loadProjectsByTeam(teamId) {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/projects/team/${teamId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    setProjects(await res.json());
  }

  async function loadTeamSprintMatrix(projectId, teamId) {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/sprints/project/${projectId}/team/${teamId}/sprint-hours`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await res.json();
    setTeamSprintHours(data); 
  }

  async function loadSprintsByProject(projectId) {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/sprints/project/${projectId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    setSprints(await res.json());
  }

  async function loadSprintTasksTable(sprintId) {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/tasks/kpiTeam/sprint/${sprintId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await res.json();
    setSprintTasksTable(data);
  }

  async function loadKPIUserHours() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/tasks/kpiUser/hours/${username}`, {
        headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al obtener el KPI');
      const data = await res.json();
      setKpiHours(data);
    } catch (e) { console.error('Error al cargar KPI:', e); }
  }

  async function loadKPIUserTasks() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/tasks/kpiUser/tasks/${username}`, {
        headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al obtener el KPI');
      const data = await res.json();
      setKpiTasks(data);
    } catch (e) { console.error('Error al cargar KPI:', e); }
  }

  const loadGlobalSprintHours = async (projectId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/sprints/project/${projectId}/globalHours`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await res.json();
    setSprintGlobalHours(data);
  };


  const loadSprintHours = async (projectId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/sprints/project/${projectId}/hours?username=${username}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await res.json();
    setSprintHoursList(data);
  };


  useEffect(() => {
    loadKPIUserHours();
    loadKPIUserTasks();
    loadProjects();
    loadTeams();
    loadUser();
  }, [loadKPIUserHours, loadKPIUserTasks, loadUser]);

  // === Preferencias de accesibilidad (reduce motion) ===
  const prefersReducedMotion = useReducedMotion();
  const cardVariants = prefersReducedMotion ? reduced : fadeInUp;
  const underlineProps = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: MOTION.reduced } } }
    : { initial: { scaleX: 0 }, animate: { scaleX: 1, transition: { duration: MOTION.underline } }, style: { originX: 0 } };
    

  // ------------ UI -----------------
  return (
    <>
      <TopBar />

      {/* Banner */}
      <Box sx={heroSx}>
        <Box sx={{ maxWidth: 1600, mx: 'auto', px: 3 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,.35)' }}
          >
            Dashboard
          </Typography>
          <motion.div {...underlineProps}>
            <Box sx={{ mt: 1, height: 3, width: 80, bgcolor: '#f84600ff', borderRadius: 2 }} />
          </motion.div>
        </Box>
      </Box>

      {/* Contenido principal */}
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: 4 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          {/* Stagger general de la malla de tarjetas */}
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <Grid container spacing={3}>
              {/* Panel izquierdo (perfil) */}
              <Grid item xs={12} md={3} lg={3}>
                <motion.div
                  variants={cardVariants}
                  whileHover={!prefersReducedMotion ? { y: -2, scale: 1.01 } : {}}
                  transition={{ type: 'tween', duration: MOTION.hover }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3, borderRadius: 3, bgcolor: '#fff',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                      textAlign: 'center'
                    }}
                  >
                    <Avatar
                      sx={{ width: 120, height: 120, bgcolor: '#4a6f83', fontSize: 40, mb: 2, mx: 'auto' }}
                    >
                      {user?.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}
                    </Avatar>

                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {user ? user.fullName : 'Cargando...'}
                    </Typography>

                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Bienvenido a tu panel. Revisa tus KPIs y avances.
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>

              {/* Columna derecha */}
              <Grid item xs={12} md={9} lg={9}>
                <Grid container spacing={3}>
                  {/* KPI Eficiencia en Tareas */}
                  <Grid item xs={12} md={6} lg={6}>
                    <motion.div
                      variants={cardVariants}
                      whileHover={!prefersReducedMotion ? { y: -2, scale: 1.01 } : {}}
                      transition={{ type: 'tween', duration: MOTION.hover }}
                    >
                      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, bgcolor: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.06)' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          KPI de Desempeño en Tareas
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>
                          Comparativa de tareas planeadas vs terminadas
                        </Typography>

                        {kpiTasks ? (
                          <Box sx={{ mt: 2 }}>
                            <Grid container spacing={2} alignItems="center">
                              {/* Resumen textual a la izquierda */}
                              <Grid item xs={12} md={5}>
                                <Typography variant="body2">
                                  <b>Total planeadas:</b> {kpiTasks.totalPlannedTasks} tareas
                                </Typography>
                                <Typography variant="body2">
                                  <b>Total terminadas:</b> {kpiTasks.totalDoneTasks} tareas
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    Eficiencia:
                                  </Typography>
                                  <Chip
                                    label={`${tasksEfficiency.toFixed(1)}%`}
                                    color={tasksEfficiency >= 100 ? 'success' : 'warning'}
                                    sx={{ fontWeight: 700 }}
                                  />
                                </Box>
                              </Grid>

                              {/* Gráfico de dona a la derecha*/}
                              <Grid item xs={12} md={7}>
                                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 1 }}>
                                  <svg width="180" height="180" viewBox="0 0 120 120">
                                    {/* Círculo de fondo (pendientes) */}
                                    <circle
                                      cx="60"
                                      cy="60"
                                      r={DONUT_RADIUS}
                                      stroke="#e0e0e0"
                                      strokeWidth="12"
                                      fill="none"
                                    />
                                    {/* Arco de tareas terminadas */}
                                    <circle
                                      cx="60"
                                      cy="60"
                                      r={DONUT_RADIUS}
                                      stroke="#4caf50"
                                      strokeWidth="12"
                                      fill="none"
                                      strokeDasharray={`${DONUT_CIRC} ${DONUT_CIRC}`}
                                      strokeDashoffset={DONUT_OFFSET}
                                      strokeLinecap="round"
                                      transform="rotate(-90 60 60)"
                                    />
                                    {/* Texto central */}
                                    <text
                                      x="50%"
                                      y="50%"
                                      textAnchor="middle"
                                      dominantBaseline="central"
                                      fontSize="18"
                                      fontWeight="700"
                                      fill="#333"
                                    >
                                      {`${donePercentOfPlan.toFixed(0)}%`}
                                    </text>
                                  </svg>
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
                            Cargando KPI...
                          </Typography>
                        )}
                      </Paper>
                    </motion.div>
                  </Grid>

                  {/* KPI Eficiencia en Horas */}
                  <Grid item xs={12} md={6} lg={6}>
                    <motion.div
                      variants={cardVariants}
                      whileHover={!prefersReducedMotion ? { y: -2, scale: 1.01 } : {}}
                      transition={{ type: 'tween', duration: MOTION.hover }}
                    >
                      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, bgcolor: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.06)' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          KPI de Desempeño en Horas
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>
                          Comparativa de horas estimadas vs reales
                        </Typography>

                        { kpiHours ? (
                          <Box sx={{ mt: 2 }}>
                            <Grid container spacing={2} alignItems="center">
                              {/* Resumen textual a la izquierda */}
                              <Grid item xs={12} md={5}>
                                <Typography variant="body2">
                                  <b>Total estimado:</b> {estimatedHours.toFixed(2)} h
                                </Typography>
                                <Typography variant="body2">
                                  <b>Total real:</b> {realHours.toFixed(2)} h
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    Eficiencia:
                                  </Typography>
                                  <Chip
                                    label={`${hoursEfficiency.toFixed(1)}%`}
                                    color={hoursEfficiency >= 100 ? 'warning' : 'success'}
                                    sx={{ fontWeight: 700 }}
                                  />
                                </Box>
                              </Grid>

                              {/* Gráfico de barras verticales con ejes (SVG) */}
                              <Grid item xs={12} md={7}>
                                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
                                  <svg width="220" height="160" viewBox="0 0 220 160">
                                    {/* Eje Y */}
                                    <line
                                      x1="40"
                                      y1="20"
                                      x2="40"
                                      y2="130"
                                      stroke="#bdbdbd"
                                      strokeWidth="1"
                                    />
                                    {/* Eje X */}
                                    <line
                                      x1="40"
                                      y1="130"
                                      x2="200"
                                      y2="130"
                                      stroke="#bdbdbd"
                                      strokeWidth="1"
                                    />

                                    {/* Barra de horas estimadas */}
                                    <rect
                                      x="80"
                                      y={130 - estimatedBarHeight}
                                      width="30"
                                      height={estimatedBarHeight}
                                      fill="#2196f3"
                                      rx="4"
                                    />

                                    {/* Barra de horas reales */}
                                    <rect
                                      x="140"
                                      y={130 - realBarHeight}
                                      width="30"
                                      height={realBarHeight}
                                      fill="#4caf50"
                                      rx="4"
                                    />

                                    {/* Etiquetas debajo de las barras */}
                                    <text
                                      x="95"
                                      y="145"
                                      textAnchor="middle"
                                      fontSize="11"
                                      fill="#555"
                                    >
                                      Estimadas
                                    </text>
                                    <text
                                      x="155"
                                      y="145"
                                      textAnchor="middle"
                                      fontSize="11"
                                      fill="#555"
                                    >
                                      Reales
                                    </text>

                                    {/* Valores encima de las barras */}
                                    <text
                                      x="95"
                                      y={130 - estimatedBarHeight - 6}
                                      textAnchor="middle"
                                      fontSize="10"
                                      fill="#333"
                                    >
                                      {estimatedHours.toFixed(1)}h
                                    </text>
                                    <text
                                      x="155"
                                      y={130 - realBarHeight - 6}
                                      textAnchor="middle"
                                      fontSize="10"
                                      fill="#333"
                                    >
                                      {realHours.toFixed(1)}h
                                    </text>
                                  </svg>
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
                            Cargando KPI...
                          </Typography>
                        )}
                      </Paper>
                    </motion.div>
                  </Grid>
                  {/* KPI Horas por sprint y usuario*/}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>Tus Horas trabajadas por Sprint</Typography>

                      {/* Selección de Proyecto */}
                      <Box sx={{ mt: 2 }}>
                        <TextField
                          select
                          label="Selecciona Proyecto"
                          value={selectedProjectHours || ""}
                          onChange={(e) => {
                            const projectId = e.target.value;
                            setSelectedProjectHours(projectId);
                            loadSprintHours(projectId);
                          }}
                          SelectProps={{ native: true }}
                          fullWidth
                        >

                          <option value="" disabled>Selecciona...</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </TextField>
                      </Box>

                      {/* Resultado */}
                      {sprintHoursList.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Horas trabajadas por sprint
                          </Typography>

                          <Box
                            sx={{
                              mt: 2,
                              display: 'flex',
                              justifyContent: 'center',
                              overflowX: 'auto',
                            }}
                          >
                            <svg
                              width={userSprintChartWidth}
                              height={200}
                              viewBox={`0 0 ${userSprintChartWidth} 200`}
                            >
                              {/* Ejes */}
                              <line
                                x1="50"
                                y1="20"
                                x2="50"
                                y2="160"
                                stroke="#bdbdbd"
                                strokeWidth="1"
                              />
                              <line
                                x1="50"
                                y1="160"
                                x2={userSprintChartWidth - 20}
                                y2="160"
                                stroke="#bdbdbd"
                                strokeWidth="1"
                              />

                              {/* Barras por sprint */}
                              {sprintHoursList.map((s, index) => {
                                const hours = Number(s.totalHours ?? 0);
                                const plotHeight = 120;
                                const barHeight =
                                  maxUserSprintHours > 0
                                    ? (hours / maxUserSprintHours) * plotHeight
                                    : 0;

                                const barWidth = 30;
                                const gap = 30;
                                const x =
                                  50 + gap + index * (barWidth + gap);
                                const y = 160 - barHeight;

                                return (
                                  <g key={s.sprintId}>
                                    {/* Barra */}
                                    <rect
                                      x={x}
                                      y={y}
                                      width={barWidth}
                                      height={barHeight}
                                      fill="#2e5e73"
                                      rx="4"
                                    />

                                    {/* Valor encima de la barra */}
                                    <text
                                      x={x + barWidth / 2}
                                      y={y - 6}
                                      textAnchor="middle"
                                      fontSize="10"
                                      fill="#333"
                                    >
                                      {hours.toFixed(1)}h
                                    </text>

                                    {/* Nombre del sprint en el eje X */}
                                    <text
                                      x={x + barWidth / 2}
                                      y={175}
                                      textAnchor="middle"
                                      fontSize="10"
                                      fill="#555"
                                    >
                                      {s.sprintName}
                                    </text>
                                  </g>
                                );
                              })}
                            </svg>
                          </Box>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                  {/* KPI Horas globales por sprint y usuario */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>Horas globales trabajadas por Sprint</Typography>

                      {/* Selección de Proyecto */}
                      <Box sx={{ mt: 2 }}>
                        <TextField
                          select
                          label="Selecciona Proyecto"
                          value={selectedProjectGlobal || ""}
                          onChange={(e) => {
                            const projectId = e.target.value;
                            setSelectedProjectGlobal(projectId);
                            loadGlobalSprintHours(projectId);
                          }}
                          SelectProps={{ native: true }}
                          fullWidth
                        >
                          <option value="" disabled>Selecciona...</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </TextField>
                      </Box>

                      {/* Resultado */}
                      {sprintGlobalHours.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Horas trabajadas por sprint (global)
                          </Typography>

                          <Box
                            sx={{
                              mt: 2,
                              display: 'flex',
                              justifyContent: 'center',
                              overflowX: 'auto',
                            }}
                          >
                            <svg
                              width={globalSprintChartWidth}
                              height={200}
                              viewBox={`0 0 ${globalSprintChartWidth} 200`}
                            >
                              {/* Ejes */}
                              <line
                                x1="50"
                                y1="20"
                                x2="50"
                                y2="160"
                                stroke="#bdbdbd"
                                strokeWidth="1"
                              />
                              <line
                                x1="50"
                                y1="160"
                                x2={globalSprintChartWidth - 20}
                                y2="160"
                                stroke="#bdbdbd"
                                strokeWidth="1"
                              />

                              {/* Barras por sprint (GLOBAL) */}
                              {sprintGlobalHours.map((s, index) => {
                                const hours = Number(s.totalHours ?? 0);
                                const plotHeight = 120;
                                const barHeight =
                                  maxGlobalSprintHours > 0
                                    ? (hours / maxGlobalSprintHours) * plotHeight
                                    : 0;

                                const barWidth = 30;
                                const gap = 30;
                                const x =
                                  50 + gap + index * (barWidth + gap);
                                const y = 160 - barHeight;

                                return (
                                  <g key={s.sprintId}>
                                    {/* Barra */}
                                    <rect
                                      x={x}
                                      y={y}
                                      width={barWidth}
                                      height={barHeight}
                                      fill="#f84600" 
                                      rx="4"
                                    />

                                    {/* Valor encima de la barra */}
                                    <text
                                      x={x + barWidth / 2}
                                      y={y - 6}
                                      textAnchor="middle"
                                      fontSize="10"
                                      fill="#333"
                                    >
                                      {hours.toFixed(1)}h
                                    </text>

                                    {/* Nombre del sprint en el eje X */}
                                    <text
                                      x={x + barWidth / 2}
                                      y={175}
                                      textAnchor="middle"
                                      fontSize="10"
                                      fill="#555"
                                    >
                                      {s.sprintName}
                                    </text>
                                  </g>
                                );
                              })}
                            </svg>
                          </Box>
                        </Box>
                      )}
                    </Paper>
                  </Grid>

                  {/* KPI Horas por miembro del equipo por sprint */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                      
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Horas por Sprint por cada Miembro del Equipo
                      </Typography>
                      {/* Selección de Proyecto */}
                      <Box sx={{ mt: 2 }}>
                        <TextField
                          select
                          fullWidth
                          label="Selecciona Proyecto"
                          value={selectedProjectTeam || ""}
                          onChange={(e) => {
                            setSelectedProjectTeam(e.target.value);
                          }}
                          SelectProps={{ native: true }}
                        >
                          <option value="" disabled>Selecciona...</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </TextField>
                      </Box>

                      {/* Selección de Equipo */}
                      {selectedProjectTeam && (
                        <Box sx={{ mt: 2 }}>
                          <TextField
                            select
                            fullWidth
                            label="Selecciona Equipo"
                            value={selectedTeamHours || ""}
                            onChange={(e) => {
                              const teamId = e.target.value;
                              setSelectedTeamHours(teamId);

                              // cargar tabla
                              loadTeamSprintMatrix(selectedProjectTeam, teamId);
                            }}
                            SelectProps={{ native: true }}
                          >
                            <option value="" disabled>Selecciona...</option>
                            {teams.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </TextField>
                        </Box>
                      )}

                      {/* TABLA */}
                      {teamSprintHoursMatrix && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Horas del equipo por sprint
                          </Typography>
                          <Box
                            sx={{
                              mt: 2,
                              display: 'flex',
                              justifyContent: 'center',
                              overflowX: 'auto',
                            }}
                          >
                            <svg
                              width={teamSprintChartWidth}
                              height={230}
                              viewBox={`0 0 ${teamSprintChartWidth} 230`}
                            >
                              {/* Ejes */}
                              <line
                                x1="60"
                                y1="20"
                                x2="60"
                                y2="180"
                                stroke="#bdbdbd"
                                strokeWidth="1"
                              />
                              <line
                                x1="60"
                                y1="180"
                                x2={teamSprintChartWidth - 20}
                                y2="180"
                                stroke="#bdbdbd"
                                strokeWidth="1"
                              />
                              {/* Barras agrupadas por sprint */}
                              {teamSprintHoursMatrix.sprints.map((sprintName, sprintIdx) => {
                                const barWidth = 12;
                                const barGap = 4;
                                const plotHeight = 140;
                                const baseY = 180;

                                const groupWidth =
                                  teamSprintHoursMatrix.rows.length * (barWidth + barGap);
                                const groupStartX =
                                  60 + 24 + sprintIdx * (groupWidth + 24);
                                return (
                                  <g key={sprintName}>
                                    {teamSprintHoursMatrix.rows.map((row, userIdx) => {
                                      const hoursVal = Number(row.hours[sprintIdx] ?? 0);
                                      const barHeight =
                                        maxTeamSprintHours > 0
                                          ? (hoursVal / maxTeamSprintHours) * plotHeight
                                          : 0;

                                      const x =
                                        groupStartX + userIdx * (barWidth + barGap);
                                      const y = baseY - barHeight;

                                      return (
                                        <g key={`${row.user}-${sprintIdx}`}>
                                          <rect
                                            x={x}
                                            y={y}
                                            width={barWidth}
                                            height={barHeight}
                                            fill={getMemberColor(userIdx, teamSprintHoursMatrix.rows.length)} 
                                            rx="3"
                                          />
                                          {barHeight > 10 && (
                                            <text
                                              x={x + barWidth / 2}
                                              y={y - 4}
                                              textAnchor="middle"
                                              fontSize="9"
                                              fill="#333"
                                            >
                                              {hoursVal.toFixed(1)}
                                            </text>
                                          )}
                                        </g>
                                      );
                                    })}

                                    {/* Nombre del sprint en el eje X (centro del grupo) */}
                                    <text
                                      x={groupStartX + groupWidth / 2}
                                      y={200}
                                      textAnchor="middle"
                                      fontSize="10"
                                      fill="#555"
                                    >
                                      {sprintName}
                                    </text>
                                  </g>
                                );
                              })}
                            </svg>
                          </Box>

                          {/* Leyenda de usuarios*/}
                          <Box sx={{ mt: 1.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Orden de barras por sprint:
                            </Typography>
                            {teamSprintHoursMatrix.rows.map((row, idx) => (
                              <Box
                                key={row.user}
                                sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}
                              >
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: 2,
                                    bgcolor: getMemberColor(idx, teamSprintHoursMatrix.rows.length),
                                    mr: 1,
                                  }}
                                />
                                <Typography variant="caption">
                                  {idx + 1}. {row.user}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                  
                  {/* KPI Tareas por miembro del equipo por sprint */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                      
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Tareas por Sprint con Miembros del Equipo
                      </Typography>

                      {/* Selección de Proyecto */}
                      <Box sx={{ mt: 2 }}>
                        <TextField
                          select
                          fullWidth
                          label="Selecciona Proyecto"
                          value={selectedProjectTasks || ""}
                          onChange={(e) => {
                            const projectId = e.target.value
                            setSelectedProjectTasks(projectId);
                            loadSprintsByProject(projectId);
                          }}
                          SelectProps={{ native: true }}
                        >
                          <option value="" disabled>Selecciona...</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </TextField>
                      </Box>

                      {/* Selección de Sprint */}
                      {selectedProjectTasks && (
                        <Box sx={{ mt: 2 }}>
                          <TextField
                            select
                            fullWidth
                            label="Selecciona Sprint"
                            value={selectedSprintTasks || ""}
                            onChange={(e) => {
                              const sprintId = e.target.value;
                              setSelectedSprintTasks(sprintId);

                              // cargar tabla
                              loadSprintTasksTable(sprintId);
                            }}
                            SelectProps={{ native: true }}
                          >
                            <option value="" disabled>Selecciona...</option>
                            {sprints.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </TextField>
                        </Box>
                      )}

                      {/* TABLA */}
                      {sprintTasksTable && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Tabla de Tareas del Equipo por Sprint
                          </Typography>

                          <table style={{ width: "100%", marginTop: "15px", borderCollapse: "collapse" }}>
                            <thead>
                              <tr>
                                <th style={{ textAlign: "left", padding: "6px" }}>Usuario</th>

                                <th style={{ textAlign: "left", padding: "6px" }}>Tarea</th>
                              </tr>
                            </thead>

                            <tbody>
                              {sprintTasksTable.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                  <td style={{ padding: "6px", fontWeight: 600 }}>{row.user}</td>

                                  <td style={{ padding: "6px", fontWeight: 600 }}>{row.task}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </motion.div>
        </Box>
      </Box>
    </>
  );
}

export default Dashboard;
