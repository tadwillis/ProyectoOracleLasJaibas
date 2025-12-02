import React, { useState, useEffect, useContext } from "react";
import {
  Box, Paper, Typography, Grid, TextField, MenuItem, Chip, Card, CardContent,
  Stack, Divider, Alert, LinearProgress, Button, Container
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import TopBar from '../shared/TopBar';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

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

function ManagerSprints() {
  const { selectedUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [sprints, setSprints] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    if (selectedUser) {
        loadProjectsForUser(selectedUser.id);
        loadSprintsForUser(selectedUser.id);
    }
  }, [selectedUser]);

  const loadProjectsForUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/projects/user/${userId}`, {
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Error al cargar proyectos");
      setProjects(await res.json());
    } catch {
      setError("Error al cargar proyectos del usuario.");
    }
  };

  const loadSprintsForUser = async (userId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      // This endpoint needs to be created
      const res = await fetch(`${API_BASE}/sprints/user/${userId}`, {
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Error al cargar sprints");
      setSprints(await res.json());
    } catch {
      setError("Error al cargar sprints del usuario. El endpoint puede no existir aún.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = sprints.filter(
    s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.goal && s.goal.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!selectedUser) {
    return (
      <>
        <TopBar />
        <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
          <Paper sx={{p: 4}}>
            <Typography variant="h6">Por favor, selecciona un usuario primero.</Typography>
            <Button variant="contained" sx={{mt: 2}} onClick={() => navigate('/manager')}>
              Ir a la selección de usuario
            </Button>
          </Paper>
        </Container>
      </>
    );
  }

  return (
    <>
      <TopBar />
      <Box sx={{
        position: "relative", left: "50%", right: "50%", ml: "-50vw", mr: "-50vw", width: "100vw",
        backgroundImage: `linear-gradient(rgba(46,94,115,0.55), rgba(46,94,115,0.55)), url(${BANNER_SRC})`,
        backgroundRepeat: "no-repeat", backgroundSize: "cover", backgroundPosition: "center", py: { xs: 4, sm: 5 }
      }}>
        <Box sx={{ maxWidth: 1600, mx: "auto", px: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#fff", textShadow: "0 2px 4px rgba(0,0,0,.35)" }}>
            Sprints de {selectedUser.fullName}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", p: 4 }}>
        <Box sx={{ maxWidth: 1400, mx: "auto" }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Paper elevation={3} sx={{ p: 2.5, mb: 4, borderRadius: 3, backgroundColor: "#fff", boxShadow: "0 4px 10px rgba(0,0,0,0.06)" }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField fullWidth size="small" placeholder="Buscar sprints..."
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                    sx: { borderRadius: 2, backgroundColor: "#fafafa" }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField select fullWidth size="small" label="Filtrar por proyecto"
                  value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: "#fafafa" } }}>
                  <MenuItem value="all">Todos</MenuItem>
                  {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField select fullWidth size="small" label="Filtrar por estado"
                  value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: "#fafafa" } }}>
                  <MenuItem value="all">Todos</MenuItem>
                  {STATUS_OPTIONS.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          {isLoading && <LinearProgress sx={{ mb: 2, bgcolor: "#d6d6d6", "& .MuiLinearProgress-bar": { backgroundColor: "#313131" } }} />}

          <Grid container spacing={3}>
            {filtered.length === 0 && !isLoading && (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: "center" }}>
                  <CalendarMonthIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">No hay sprints para este usuario.</Typography>
                </Paper>
              </Grid>
            )}

            {filtered.map(s => {
              const duration = calculateDuration(s.startDate, s.endDate);
              return (
                <Grid item xs={12} sm={6} md={4} key={s.id}>
                  <Card elevation={2} sx={{
                    height: "100%", display: "flex", flexDirection: "column", borderRadius: 3,
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
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Box>
    </>
  );
}

export default ManagerSprints;
