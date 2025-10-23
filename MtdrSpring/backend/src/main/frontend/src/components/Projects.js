// src/components/Projects.js
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Paper, Typography, Grid, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton, Card, CardContent,
  CardActions, Stack, Divider, Alert, LinearProgress, Tooltip, Chip, Badge
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import TopBar from './TopBar';

const API_BASE = '/api';
const BANNER_SRC = "/img/banner-top.png";

// Fecha
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
};

function Projects() {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');

  // Dialogs
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [detailsProject, setDetailsProject] = useState(null);

  // Form
  const [form, setForm] = useState({ name: '', description: '', teamId: '' });

  // Cargar datos
  useEffect(() => {
    loadTeams();
    loadProjects();
    loadSprints();
  }, []);

  const loadTeams = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/teams`, {
        headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar equipos');
      const data = await res.json();
      setTeams(data);
    } catch {
      setError('Error al cargar equipos');
    }
  };

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/projects`, {
        headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar proyectos');
      const data = await res.json();
      setProjects(data);
    } catch {
      setError('Error al cargar proyectos');
    } finally {
      setLoading(false);
    }
  };

  const loadSprints = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/sprints`, {
        headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar sprints');
      const data = await res.json();
      setSprints(data);
    } catch {
      /* silencio */
    }
  };

  const loadProjectsByTeam = async (teamId) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/projects/team/${teamId}`, {
        headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar proyectos del equipo');
      const data = await res.json();
      setProjects(data);
    } catch {
      setError('Error al cargar proyectos del equipo');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamFilterChange = (teamId) => {
    setSelectedTeam(teamId);
    teamId === 'all' ? loadProjects() : loadProjectsByTeam(teamId);
  };

  // CRUD
  const handleCreateProject = async () => {
    if (!form.name.trim()) return setError('El nombre es obligatorio');
    if (!form.teamId) return setError('Debe seleccionar un equipo');

    try {
      const userId = localStorage.getItem('userId') || 1;
      const payload = { name: form.name, description: form.description };
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/projects?teamId=${form.teamId}&createdBy=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Error al crear proyecto');
      setOpenCreate(false);
      resetForm();
      loadProjects();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateProject = async () => {
    if (!form.name.trim()) return setError('El nombre es obligatorio');
    try {
      const payload = { name: form.name, description: form.description };
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Error al actualizar proyecto');
      setOpenEdit(false);
      setEditingProject(null);
      resetForm();
      loadProjects();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este proyecto? Esto eliminará todos los sprints asociados.')) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al eliminar proyecto');
      loadProjects();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Open dialogs
  const openEditDialog = (project) => {
    setEditingProject(project);
    setForm({ name: project.name || '', description: project.description || '', teamId: project.team?.id || '' });
    setOpenEdit(true);
  };

  const openDetailsDialog = (project) => {
    setDetailsProject(project);
    setOpenDetails(true);
  };

  const resetForm = () => setForm({ name: '', description: '', teamId: '' });

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getSprintsCount = (id) => sprints.filter(s => s.project?.id === id).length;
  const getActiveSprintsCount = (id) => sprints.filter(s => s.project?.id === id && s.status === 'active').length;

  return (
    <>
      <TopBar />

      {/* Banner */}
      <Box
        sx={{
          position: 'relative',
          left: '50%', right: '50%', ml: '-50vw', mr: '-50vw',
          width: '100vw',
          backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${BANNER_SRC})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          py: { xs: 4, sm: 5 },
        }}
      >
        <Box sx={{ maxWidth: 1600, mx: 'auto', px: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,.35)' }}>
            Proyectos
          </Typography>
          <Box sx={{ mt: 1, height: 3, width: 80, bgcolor: '#f84600ff', borderRadius: 2 }} />
        </Box>
      </Box>

      {/* Main content */}
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: 4 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Toolbar */}
          <Paper elevation={3} sx={{ p: 2.5, mb: 4, borderRadius: 3, backgroundColor: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.06)' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar proyectos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    sx: { borderRadius: 2, backgroundColor: '#fafafa' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Filtrar por equipo"
                  value={selectedTeam}
                  onChange={(e) => handleTeamFilterChange(e.target.value)}
                  SelectProps={{ native: true }}
                >
                  <option value="all">Todos los equipos</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenCreate(true)}
                  sx={{
                    bgcolor: '#f84600ff',
                    '&:hover': { bgcolor: '#d6370fff' },
                    borderRadius: 2, textTransform: 'none', fontWeight: 600
                  }}
                >
                  Nuevo Proyecto
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Loading */}
          {isLoading && (
            <LinearProgress
              sx={{
                mb: 2,
                bgcolor: '#d6d6d6',
                '& .MuiLinearProgress-bar': { backgroundColor: '#313131' },
              }}
            />
          )}

          {/* Cards */}
          <Grid container spacing={3}>
            {filteredProjects.length === 0 && !isLoading && (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <FolderIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No hay proyectos disponibles
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {searchTerm ? 'No se encontraron resultados para tu búsqueda' : 'Crea tu primer proyecto para comenzar'}
                  </Typography>
                </Paper>
              </Grid>
            )}

            {filteredProjects.map(project => {
              const sprintsCount = getSprintsCount(project.id);
              const activeSprintsCount = getActiveSprintsCount(project.id);

              return (
                <Grid item xs={12} sm={6} md={4} key={project.id}>
                  <Card
                    elevation={2}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                      '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 6px 16px rgba(0,0,0,0.12)' },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <FolderIcon color="primary" />
                        {project.team && (
                          <Chip icon={<GroupIcon />} label={project.team.name} size="small" variant="outlined" />
                        )}
                      </Stack>

                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ fontWeight: 700, color: '#313131', cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                        onClick={() => openDetailsDialog(project)}
                      >
                        {project.name}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
                        {project.description || 'Sin descripción'}
                      </Typography>

                      <Divider sx={{ my: 1 }} />

                      <Stack spacing={1} sx={{ mt: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Badge badgeContent={sprintsCount} color="primary">
                            <DirectionsRunIcon fontSize="small" color="action" />
                          </Badge>
                          <Typography variant="caption" color="text.secondary">
                            {sprintsCount} {sprintsCount === 1 ? 'Sprint' : 'Sprints'}
                          </Typography>
                          {activeSprintsCount > 0 && (
                            <Chip
                              label={`${activeSprintsCount} activo${activeSprintsCount > 1 ? 's' : ''}`}
                              size="small"
                              color="success"
                            />
                          )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          <strong>Creado:</strong> {formatDate(project.createdAt)}
                        </Typography>
                      </Stack>
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                      <Tooltip title="Ver detalles">
                        <IconButton size="small" color="info" onClick={() => openDetailsDialog(project)}>
                          <AssignmentIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => openEditDialog(project)}
                          sx={{ bgcolor: '#313131', color: '#fff', '&:hover': { bgcolor: '#1f1f1f' } }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" color="error" onClick={() => handleDeleteProject(project.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Box>

      {/* CREATE */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            🟠
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Crear Nuevo Proyecto</Typography>
          </Box>
          <Box sx={{ mt: 1, height: 3, width: '100%', bgcolor: '#f84600ff', borderRadius: 2 }} />
        </DialogTitle>
        <DialogContent>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: '#f9f9f9' }}>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Nombre del Proyecto *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                select
                fullWidth
                label="Equipo *"
                value={form.teamId}
                onChange={(e) => setForm({ ...form, teamId: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="">Seleccionar equipo</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </TextField>
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => { setOpenCreate(false); resetForm(); }} sx={{ color: '#757575', textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateProject}
            variant="contained"
            sx={{ bgcolor: '#f84600ff', '&:hover': { bgcolor: '#d6370fff' } }}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            ✏️
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Editar Proyecto</Typography>
          </Box>
          <Box sx={{ mt: 1, height: 3, width: '100%', bgcolor: '#313131', borderRadius: 2 }} />
        </DialogTitle>
        <DialogContent>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: '#f9f9f9' }}>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Nombre del Proyecto *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                sx={{ mb: 2 }}
              />
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => { setOpenEdit(false); setEditingProject(null); resetForm(); }} sx={{ color: '#757575', textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpdateProject}
            variant="contained"
            sx={{ bgcolor: '#313131', '&:hover': { bgcolor: '#1f1f1f' } }}
          >
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* DETAILS */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            🔵
            <Typography variant="h6" sx={{ fontWeight: 600 }}>{detailsProject?.name || 'Detalles del Proyecto'}</Typography>
          </Box>
          <Box sx={{ mt: 1, height: 3, width: '100%', bgcolor: '#1976d2', borderRadius: 2 }} />
        </DialogTitle>
        <DialogContent>
          {detailsProject && (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: '#f9f9f9' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Descripción</Typography>
              <Typography variant="body1" paragraph>{detailsProject.description || 'Sin descripción'}</Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Equipo</Typography>
                  <Chip icon={<GroupIcon />} label={detailsProject.team?.name || 'N/A'} color="primary" sx={{ mt: 1 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Sprints</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip label={`${getSprintsCount(detailsProject.id)} Total`} color="info" />
                    <Chip label={`${getActiveSprintsCount(detailsProject.id)} Activos`} color="success" />
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Fecha de Creación</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>{formatDate(detailsProject.createdAt)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Última Actualización</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>{formatDate(detailsProject.updatedAt)}</Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Sprints del Proyecto</Typography>
              <Stack spacing={1} sx={{ mt: 2 }}>
                {sprints.filter(s => s.project?.id === detailsProject.id).map(sprint => (
                  <Paper key={sprint.id} elevation={1} sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{sprint.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                        </Typography>
                      </Box>
                      <Chip label={sprint.status} size="small" color={sprint.status === 'active' ? 'success' : 'default'} />
                    </Stack>
                  </Paper>
                ))}
                {sprints.filter(s => s.project?.id === detailsProject.id).length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No hay sprints asociados a este proyecto
                  </Typography>
                )}
              </Stack>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDetails(false)} sx={{ color: '#757575', textTransform: 'none' }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Projects;
