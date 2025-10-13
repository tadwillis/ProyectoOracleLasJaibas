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
import SprintIcon from '@mui/icons-material/DirectionsRun';
import TopBar from './TopBar';

const API_BASE = '/api';

// Banner configuration
const BANNER_SRC = "/img/banner-top.png";
const heroSx = {
  position: 'relative',
  left: '50%', right: '50%', ml: '-50vw', mr: '-50vw',
  width: '100vw',
  backgroundImage: `url(${BANNER_SRC})`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  py: { xs: 3, sm: 4 },
};

// Format date helper
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

  // Dialog states
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [detailsProject, setDetailsProject] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    teamId: ''
  });

  // Load teams, projects, and sprints on mount
  useEffect(() => {
    loadTeams();
    loadProjects();
    loadSprints();
  }, []);

  // Load teams
  const loadTeams = async () => {
    try {
      const res = await fetch(`${API_BASE}/teams`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error('Error al cargar equipos');
      const data = await res.json();
      setTeams(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar equipos');
    }
  };

  // Load all projects
  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error('Error al cargar proyectos');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar proyectos');
    } finally {
      setLoading(false);
    }
  };

  // Load sprints
  const loadSprints = async () => {
    try {
      const res = await fetch(`${API_BASE}/sprints`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error('Error al cargar sprints');
      const data = await res.json();
      setSprints(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Load projects by team
  const loadProjectsByTeam = async (teamId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/projects/team/${teamId}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error('Error al cargar proyectos del equipo');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar proyectos del equipo');
    } finally {
      setLoading(false);
    }
  };

  // Handle team filter change
  const handleTeamFilterChange = (teamId) => {
    setSelectedTeam(teamId);
    if (teamId === 'all') {
      loadProjects();
    } else {
      loadProjectsByTeam(teamId);
    }
  };

  // Create new project
  const handleCreateProject = async () => {
    if (!form.name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!form.teamId) {
      setError('Debe seleccionar un equipo');
      return;
    }

    try {
      const userId = localStorage.getItem('userId') || 1;

      const payload = {
        name: form.name,
        description: form.description
      };

      const res = await fetch(
        `${API_BASE}/projects?teamId=${form.teamId}&createdBy=${userId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Error al crear proyecto');
      }

      setOpenCreate(false);
      resetForm();
      loadProjects();
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Update project
  const handleUpdateProject = async () => {
    if (!form.name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    try {
      const payload = {
        name: form.name,
        description: form.description
      };

      const res = await fetch(`${API_BASE}/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Error al actualizar proyecto');

      setOpenEdit(false);
      setEditingProject(null);
      resetForm();
      loadProjects();
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Delete project
  const handleDeleteProject = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este proyecto? Esto eliminará todos los sprints asociados.')) return;

    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Error al eliminar proyecto');

      loadProjects();
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Open edit dialog
  const openEditDialog = (project) => {
    setEditingProject(project);
    setForm({
      name: project.name || '',
      description: project.description || '',
      teamId: project.team?.id || ''
    });
    setOpenEdit(true);
  };

  // Open details dialog
  const openDetailsDialog = (project) => {
    setDetailsProject(project);
    setOpenDetails(true);
  };

  // Reset form
  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      teamId: ''
    });
  };

  // Filter projects by search term
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get sprints count for a project
  const getSprintsCount = (projectId) => {
    return sprints.filter(s => s.project?.id === projectId).length;
  };

  // Get active sprints count for a project
  const getActiveSprintsCount = (projectId) => {
    return sprints.filter(s => s.project?.id === projectId && s.status === 'active').length;
  };

  return (
    <>
      <TopBar />

      {/* Banner */}
      <Box sx={heroSx}>
        <Box sx={{ maxWidth: 1680, mx: 'auto', px: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,.35)' }}>
            Proyectos
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ bgcolor: '#f7f4ed', minHeight: '100vh', p: 4 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>

          {/* Error Message */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Toolbar */}
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar proyectos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
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
                  sx={{ bgcolor: '#1976d2' }}
                >
                  Nuevo Proyecto
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Loading */}
          {isLoading && <LinearProgress sx={{ mb: 2 }} />}

          {/* Projects Grid */}
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
                    elevation={3} 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <FolderIcon color="primary" />
                        {project.team && (
                          <Chip
                            icon={<GroupIcon />}
                            label={project.team.name}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Stack>

                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 600,
                          cursor: 'pointer',
                          '&:hover': { color: 'primary.main' }
                        }}
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
                            <SprintIcon fontSize="small" color="action" />
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
                        <IconButton size="small" color="primary" onClick={() => openEditDialog(project)}>
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

      {/* Create Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Nombre del Proyecto *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              sx={{ mb: 2 }}
              placeholder="Ej: Sistema de Inventario"
            />

            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              sx={{ mb: 2 }}
              placeholder="Describe el objetivo y alcance del proyecto..."
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenCreate(false); resetForm(); }}>
            Cancelar
          </Button>
          <Button onClick={handleCreateProject} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Proyecto</DialogTitle>
        <DialogContent>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenEdit(false); setEditingProject(null); resetForm(); }}>
            Cancelar
          </Button>
          <Button onClick={handleUpdateProject} variant="contained">
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <FolderIcon color="primary" />
            <Typography variant="h6">{detailsProject?.name}</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {detailsProject && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Descripción
              </Typography>
              <Typography variant="body1" paragraph>
                {detailsProject.description || 'Sin descripción'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Equipo
                  </Typography>
                  <Chip
                    icon={<GroupIcon />}
                    label={detailsProject.team?.name || 'N/A'}
                    color="primary"
                    sx={{ mt: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sprints
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip
                      label={`${getSprintsCount(detailsProject.id)} Total`}
                      color="info"
                    />
                    <Chip
                      label={`${getActiveSprintsCount(detailsProject.id)} Activos`}
                      color="success"
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha de Creación
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {formatDate(detailsProject.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Última Actualización
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {formatDate(detailsProject.updatedAt)}
                  </Typography>
                </Grid>
              </Grid>

              {/* Sprints List */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Sprints del Proyecto
              </Typography>
              <Stack spacing={1} sx={{ mt: 2 }}>
                {sprints
                  .filter(s => s.project?.id === detailsProject.id)
                  .map(sprint => (
                    <Paper key={sprint.id} elevation={1} sx={{ p: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {sprint.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                          </Typography>
                        </Box>
                        <Chip
                          label={sprint.status}
                          size="small"
                          color={sprint.status === 'active' ? 'success' : 'default'}
                        />
                      </Stack>
                    </Paper>
                  ))}
                {sprints.filter(s => s.project?.id === detailsProject.id).length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No hay sprints asociados a este proyecto
                  </Typography>
                )}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetails(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Projects;