// Dashboard.js
import React, { useState, useEffect } from 'react';
import {
  Paper, LinearProgress, Typography, Box, Grid, Divider, Avatar, Chip,
  IconButton, TextField, Tooltip, Slider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import TopBar from '../components/TopBar';
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
  const [selectedTeamHours, setSelectedTeamHours] = useState("");
  const [teamSprintHoursMatrix, setTeamSprintHours] = useState(null);
  const [sprintGlobalHours, setSprintGlobalHours] = useState([]);
  const [sprintHoursList, setSprintHoursList] = useState([]);
  const [kpiHours, setKpiHours] = useState();
  const [kpiTasks, setKpiTasks] = useState();
  const [user, setUser] = useState();
  const username = localStorage.getItem('username') || 'Usuario';

  // ====== Estados locales solo de UI (sin backend) ======
  const [aboutMe, setAboutMe] = useState("Estudiante de ingeniería en sistemas, apasionado por la nube y DevOps.");
  const [aboutMeEditing, setAboutMeEditing] = useState(false);
  const [aboutMeDraft, setAboutMeDraft] = useState(aboutMe);

  const [expYears, setExpYears] = useState("1 año en Oracle Academy");
  const [expYearsEditing, setExpYearsEditing] = useState(false);
  const [expYearsDraft, setExpYearsDraft] = useState(expYears);

  const [skills, setSkills] = useState("Backend con Spring Boot y automatización en la nube.");
  const [skillsEditing, setSkillsEditing] = useState(false);
  const [skillsDraft, setSkillsDraft] = useState(skills);

  const [courses, setCourses] = useState([
    { name: "Certificación OCI Foundations", value: 100 },
    { name: "Badge Cloud Native", value: 100 },
    { name: "OCI DevOps", value: 0 },
  ]);
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
    setTeamSprintHours(data);   //  👈 guarda { sprints, rows }
  }

  async function loadSprintsByProject(projectId) {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/sprints/project/${projectId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    setSprints(await res.json());
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
  }, []);

  const GreyEditBtn = ({ onClick, label }) => (
    <Tooltip title={`Editar ${label}`} arrow>
      <IconButton size="small" onClick={onClick} sx={{ color: '#9e9e9e', ml: 1 }}>
        <EditIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  const SaveBtn = ({ onClick }) => (
    <Tooltip title="Guardar" arrow>
      <IconButton size="small" onClick={onClick} sx={{ color: '#4caf50', ml: 0.5 }}>
        <CheckIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  const CancelBtn = ({ onClick }) => (
    <Tooltip title="Cancelar" arrow>
      <IconButton size="small" onClick={onClick} sx={{ color: '#b0b0b0', ml: 0.5 }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );

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
                            <Typography variant="body2">
                              <b>Total planeadas:</b> {kpiTasks.totalPlannedTasks} tareas
                            </Typography>
                            <Typography variant="body2">
                              <b>Total terminadas:</b> {kpiTasks.totalDoneTasks} tareas
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>Eficiencia:</Typography>
                              <Chip
                                label={`${kpiTasks.efficiency.toFixed(1)}%`}
                                color={kpiTasks.efficiency >= 100 ? 'success' : 'warning'}
                                sx={{ fontWeight: 700 }}
                              />
                            </Box>

                            <LinearProgress
                              variant="determinate"
                              value={Math.min(kpiTasks.efficiency, 100)}
                              sx={{ mt: 2, height: 8, borderRadius: 2, '& .MuiLinearProgress-bar': { transition: `width ${MOTION.muiProgressMs}ms ease` } }}
                            />
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

                        {kpiHours ? (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2"><b>Total estimado:</b> {kpiHours.totalEstimatedHours.toFixed(2)} h</Typography>
                            <Typography variant="body2"><b>Total real:</b> {kpiHours.totalEffortHours.toFixed(2)} h</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>Eficiencia:</Typography>
                              <Chip
                                label={`${kpiHours.efficiency.toFixed(1)}%`}
                                color={kpiHours.efficiency >= 100 ? 'warning' : 'success'}
                                sx={{ fontWeight: 700 }}
                              />
                            </Box>

                            <LinearProgress
                              variant="determinate"
                              value={Math.min(kpiHours.efficiency, 100)}
                              sx={{ mt: 2, height: 8, borderRadius: 2, '& .MuiLinearProgress-bar': { transition: `width ${MOTION.muiProgressMs}ms ease` } }}
                            />
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
                            loadSprintHours(projectId); // 👈 carga los sprints + horas
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

                          <table style={{ width: "100%", marginTop: "15px" }}>
                            <thead>
                              <tr>
                                <th style={{ textAlign: "left" }}>Sprint</th>
                                <th style={{ textAlign: "left" }}>Horas Totales</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sprintHoursList.map((s) => (
                                <tr key={s.sprintId}>
                                  <td>{s.sprintName}</td>
                                  <td>{s.totalHours.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
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
                            loadGlobalSprintHours(projectId); // 👈 carga los sprints + horas
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
                            Horas trabajadas por sprint
                          </Typography>

                          <table style={{ width: "100%", marginTop: "15px" }}>
                            <thead>
                              <tr>
                                <th style={{ textAlign: "left" }}>Sprint</th>
                                <th style={{ textAlign: "left" }}>Horas Totales</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sprintGlobalHours.map((s) => (
                                <tr key={s.sprintId}>
                                  <td>{s.sprintName}</td>
                                  <td>{s.totalHours.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
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
                            Tabla de Horas del Equipo
                          </Typography>

                          <table style={{ width: "100%", marginTop: "15px", borderCollapse: "collapse" }}>
                            <thead>
                              <tr>
                                <th style={{ textAlign: "left", padding: "6px" }}>Usuario</th>

                                {teamSprintHoursMatrix.sprints.map((sprintName, idx) => (
                                  <th key={idx} style={{ textAlign: "left", padding: "6px" }}>
                                    {sprintName}
                                  </th>
                                ))}
                              </tr>
                            </thead>

                            <tbody>
                              {teamSprintHoursMatrix.rows.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                  <td style={{ padding: "6px", fontWeight: 600 }}>{row.user}</td>

                                  {row.hours.map((h, hIdx) => (
                                    <td key={hIdx} style={{ padding: "6px" }}>{h}</td>
                                  ))}
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
