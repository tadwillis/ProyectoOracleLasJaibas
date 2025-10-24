// src/components/Sprints.js
import React, { useState, useEffect } from "react";
import {
  Box, Button, Paper, Typography, Grid, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Chip, IconButton, Card, CardContent,
  CardActions, Stack, Divider, Alert, LinearProgress, Tooltip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import TopBar from "./TopBar";
import { motion, useReducedMotion } from "framer-motion";

// ----------------- Tiempos  -----------------
const MOTION = {
  enter: 0.45,         // duración de entrada de toolbar/cards
  exit: 0.30,          // duración de salida
  stagger: 0.12,       // desfase entre cards
  delayChildren: 0.08, // retraso inicial del grupo
  underline: 0.55,     // subrayado naranja
  hover: 0.22,         // hover sutil en cards
  reduced: 0.25        // modo "reduce motion"
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

const API_BASE = "/api";
const BANNER_SRC = "/img/banner-top3.png";

const STATUS_OPTIONS = [
  { value: "planned", label: "Planeado", color: "default" },
  { value: "active", label: "Activo", color: "success" },
  { value: "completed", label: "Completado", color: "info" },
  { value: "cancelled", label: "Cancelado", color: "error" },
];

const getStatusLabel = (s) => STATUS_OPTIONS.find(x => x.value === s)?.label || s;
const getStatusColor = (s) => STATUS_OPTIONS.find(x => x.value === s)?.color || "default";

const formatDate = (d) => {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" });
};

const calculateDuration = (start, end) => {
  if (!start || !end) return 0;
  const diff = Math.abs(new Date(end) - new Date(start));
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

function Sprints() {
  const [sprints, setSprints] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);

  const [form, setForm] = useState({
    name: "", goal: "", startDate: "", endDate: "", status: "planned", projectId: ""
  });

  useEffect(() => {
    loadProjects();
    loadSprints();
  }, []);

  const loadProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/projects`, {
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Error al cargar proyectos");
      setProjects(await res.json());
    } catch {
      setError("Error al cargar proyectos");
    }
  };

  const loadSprints = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/sprints`, {
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Error al cargar sprints");
      setSprints(await res.json());
    } catch {
      setError("Error al cargar sprints");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectFilterChange = (id) => {
    setSelectedProject(id);
    setSelectedStatus("all");
    if (id === "all") loadSprints();
    else loadSprintsByProject(id);
  };

  const handleStatusFilterChange = (s) => {
    setSelectedStatus(s);
    setSelectedProject("all");
    if (s === "all") loadSprints();
    else loadSprintsByStatus(s);
  };

  const loadSprintsByProject = async (projectId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/sprints/project/${projectId}`, {
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      setSprints(await res.json());
    } catch {
      setError("Error al cargar sprints del proyecto");
    } finally {
      setLoading(false);
    }
  };

  const loadSprintsByStatus = async (status) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/sprints/status/${status}`, {
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      setSprints(await res.json());
    } catch {
      setError("Error al cargar sprints por estado");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSprint = async (id) => {
    if (!window.confirm("¿Eliminar este sprint?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/sprints/${id}`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      loadSprints();
    } catch {
      setError("Error al eliminar sprint");
    }
  };

  const handleCreateSprint = async () => {
    if (!form.name.trim()) return setError("El nombre es obligatorio");
    if (!form.projectId) return setError("Debe seleccionar un proyecto");
    if (!form.startDate || !form.endDate) return setError("Las fechas son obligatorias");
    if (new Date(form.endDate) <= new Date(form.startDate))
      return setError("La fecha de fin debe ser posterior");

    try {
      const userId = localStorage.getItem("userId") || 1;
      const payload = { name: form.name, goal: form.goal, startDate: form.startDate, endDate: form.endDate, status: form.status };
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/sprints?projectId=${form.projectId}&createdBy=${userId}`, {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Error al crear sprint");
      setOpenCreate(false);
      resetForm();
      loadSprints();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateSprint = async () => {
    if (!form.name.trim()) return setError("El nombre es obligatorio");
    if (!form.startDate || !form.endDate) return setError("Las fechas son obligatorias");
    if (new Date(form.endDate) <= new Date(form.startDate))
      return setError("La fecha de fin debe ser posterior");

    try {
      const payload = { name: form.name, goal: form.goal, startDate: form.startDate, endDate: form.endDate, status: form.status };
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/sprints/${editingSprint.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error();
      setOpenEdit(false);
      setEditingSprint(null);
      resetForm();
      loadSprints();
    } catch {
      setError("Error al actualizar sprint");
    }
  };

  const handleUpdateSprintStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/sprints/${id}/status?status=${newStatus}`, {
        method: "PATCH", headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      loadSprints();
    } catch {
      setError("Error al actualizar estado");
    }
  };

  const openEditDialog = (sprint) => {
    setEditingSprint(sprint);
    setForm({
      name: sprint.name || "", goal: sprint.goal || "",
      startDate: sprint.startDate || "", endDate: sprint.endDate || "",
      status: sprint.status || "planned", projectId: sprint.project?.id || ""
    });
    setOpenEdit(true);
  };

  const resetForm = () => {
    setForm({ name: "", goal: "", startDate: "", endDate: "", status: "planned", projectId: "" });
  };

  const filtered = sprints.filter(
    s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.goal && s.goal.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Preferencias de accesibilidad
  const prefersReducedMotion = useReducedMotion();
  const cardVariants = prefersReducedMotion ? reduced : fadeInUp;
  const underlineProps = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: MOTION.reduced } } }
    : { initial: { scaleX: 0 }, animate: { scaleX: 1, transition: { duration: MOTION.underline } }, style: { originX: 0 } };

  return (
    <>
      <TopBar />

      {/* Banner */}
      <Box sx={{
        position: "relative", left: "50%", right: "50%", ml: "-50vw", mr: "-50vw", width: "100vw",
        backgroundImage: `linear-gradient(rgba(46,94,115,0.55), rgba(46,94,115,0.55)), url(${BANNER_SRC})`,
        backgroundRepeat: "no-repeat", backgroundSize: "cover", backgroundPosition: "center", py: { xs: 4, sm: 5 }
      }}>
        <Box sx={{ maxWidth: 1600, mx: "auto", px: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#fff", textShadow: "0 2px 4px rgba(0,0,0,.35)" }}>
            Sprints
          </Typography>
          <motion.div {...underlineProps}>
            <Box sx={{ mt: 1, height: 3, width: 80, bgcolor: "#f84600ff", borderRadius: 2 }} />
          </motion.div>
        </Box>
      </Box>

      {/* Main content */}
      <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", p: 4 }}>
        <Box sx={{ maxWidth: 1400, mx: "auto" }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Toolbar */}
          <motion.div variants={cardVariants} initial="initial" animate="animate" exit="exit">
            <Paper elevation={3} sx={{ p: 2.5, mb: 4, borderRadius: 3, backgroundColor: "#fff", boxShadow: "0 4px 10px rgba(0,0,0,0.06)" }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth size="small" placeholder="Buscar sprints..."
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                      sx: { borderRadius: 2, backgroundColor: "#fafafa" }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField select fullWidth size="small" label="Filtrar por proyecto"
                    value={selectedProject} onChange={(e) => handleProjectFilterChange(e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: "#fafafa" } }}>
                    <MenuItem value="all">Todos</MenuItem>
                    {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField select fullWidth size="small" label="Filtrar por estado"
                    value={selectedStatus} onChange={(e) => handleStatusFilterChange(e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: "#fafafa" } }}>
                    <MenuItem value="all">Todos</MenuItem>
                    {STATUS_OPTIONS.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}
                    sx={{ bgcolor: "#f84600ff", "&:hover": { bgcolor: "#d6370fff" }, borderRadius: 2, textTransform: "none", fontWeight: 600 }}>
                    Nuevo Sprint
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>

          {isLoading && <LinearProgress sx={{ mb: 2, bgcolor: "#d6d6d6", "& .MuiLinearProgress-bar": { backgroundColor: "#313131" } }} />}

          {/* Grid con stagger */}
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <Grid container spacing={3}>
              {filtered.length === 0 && !isLoading && (
                <Grid item xs={12}>
                  <motion.div variants={cardVariants}>
                    <Paper sx={{ p: 4, textAlign: "center" }}>
                      <CalendarMonthIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">No hay sprints disponibles</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {searchTerm ? "No se encontraron resultados" : "Crea tu primer sprint para comenzar"}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              )}

              {filtered.map(s => {
                const duration = calculateDuration(s.startDate, s.endDate);
                return (
                  <Grid item xs={12} sm={6} md={4} key={s.id}>
                    <motion.div
                      variants={cardVariants}
                      whileHover={!prefersReducedMotion ? { y: -5, scale: 1.01 } : {}}
                      transition={{ type: "tween", duration: MOTION.hover }}
                    >
                      <Card elevation={2} sx={{
                        height: "100%", display: "flex", flexDirection: "column", borderRadius: 3,
                        transition: "transform 0.25s ease, box-shadow 0.25s ease",
                        "&:hover": { transform: "translateY(-5px)", boxShadow: "0 6px 16px rgba(0,0,0,0.12)" }
                      }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <Chip label={getStatusLabel(s.status)} color={getStatusColor(s.status)} size="small" />
                            {s.status === "active" && (
                              <Chip icon={<PlayArrowIcon />} label="En curso" color="success" size="small" variant="outlined" />
                            )}
                          </Stack>

                          <Typography variant="h6" sx={{ fontWeight: 700, color: "#313131", mb: 1 }}>{s.name}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
                            {s.goal || "Sin objetivo definido"}
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          <Stack spacing={0.5} sx={{ mt: 2 }}>
                            <Typography variant="caption" color="text.secondary"><strong>Inicio:</strong> {formatDate(s.startDate)}</Typography>
                            <Typography variant="caption" color="text.secondary"><strong>Fin:</strong> {formatDate(s.endDate)}</Typography>
                            <Typography variant="caption" color="text.secondary"><strong>Duración:</strong> {duration} días</Typography>
                            {s.project && (
                              <Typography variant="caption" color="text.secondary"><strong>Proyecto:</strong> {s.project.name}</Typography>
                            )}
                          </Stack>
                        </CardContent>

                        <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                          <Box>
                            {s.status === "planned" && (
                              <Tooltip title="Iniciar Sprint">
                                <IconButton size="small" color="success" onClick={() => handleUpdateSprintStatus(s.id, "active")}>
                                  <PlayArrowIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                          <Box>
                            <Tooltip title="Editar">
                              <IconButton size="small" onClick={() => openEditDialog(s)} sx={{ bgcolor: "#313131", color: "#fff", "&:hover": { bgcolor: "#1f1f1f" } }}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton size="small" color="error" onClick={() => handleDeleteSprint(s.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </CardActions>
                      </Card>
                    </motion.div>
                  </Grid>
                );
              })}
            </Grid>
          </motion.div>
        </Box>
      </Box>

      {/* CREATE DIALOG */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            📝
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Crear Nuevo Sprint
            </Typography>
          </Box>
          <Box sx={{ mt: 1, height: 3, width: "100%", bgcolor: "#f84600ff", borderRadius: 2 }} />
        </DialogTitle>
        <DialogContent>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "#f9f9f9",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Nombre del Sprint *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                sx={{ mb: 2 }}
                placeholder="Ej: Sprint 1 - Q1 2025"
              />

              <TextField
                fullWidth
                label="Objetivo del Sprint"
                multiline
                rows={3}
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
                sx={{ mb: 2 }}
                placeholder="Define el objetivo principal de este sprint..."
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Fecha de Inicio *"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Fecha de Fin *"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Estado"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Proyecto *"
                    value={form.projectId}
                    onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                  >
                    {projects.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              setOpenCreate(false);
              resetForm();
            }}
            sx={{ color: "#757575", textTransform: "none", fontWeight: 500 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreateSprint}
            variant="contained"
            sx={{
              bgcolor: "#f84600ff",
              "&:hover": { bgcolor: "#d6370fff" },
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            ✏️
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Editar Sprint
            </Typography>
          </Box>
          <Box sx={{ mt: 1, height: 3, width: "100%", bgcolor: "#313131", borderRadius: 2 }} />
        </DialogTitle>
        <DialogContent>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "#f9f9f9",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Nombre del Sprint *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Objetivo del Sprint"
                multiline
                rows={3}
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
                sx={{ mb: 2 }}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Fecha de Inicio *"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Fecha de Fin *"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Estado"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              setOpenEdit(false);
              setEditingSprint(null);
              resetForm();
            }}
            sx={{ color: "#757575", textTransform: "none", fontWeight: 500 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpdateSprint}
            variant="contained"
            sx={{
              bgcolor: "#313131",
              "&:hover": { bgcolor: "#1f1f1f" },
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Sprints;
