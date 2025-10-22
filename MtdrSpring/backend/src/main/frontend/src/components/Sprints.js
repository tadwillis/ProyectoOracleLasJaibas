// src/components/Sprints.js
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Paper, Typography, Grid, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Chip, IconButton, Card, CardContent,
  CardActions, Stack, Divider, Alert, LinearProgress, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
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

// Status options
const STATUS_OPTIONS = [
  { value: 'planned', label: 'Planeado', color: 'default' },
  { value: 'active', label: 'Activo', color: 'success' },
  { value: 'completed', label: 'Completado', color: 'info' },
  { value: 'cancelled', label: 'Cancelado', color: 'error' }
];

const getStatusLabel = (status) => {
  const opt = STATUS_OPTIONS.find(s => s.value === status);
  return opt ? opt.label : status;
};

const getStatusColor = (status) => {
  const opt = STATUS_OPTIONS.find(s => s.value === status);
  return opt ? opt.color : 'default';
};

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Calculate sprint duration
const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

function Sprints() {
  const [sprints, setSprints] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Dialog states
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
    status: 'planned',
    projectId: ''
  });

  // Load projects and sprints on mount
  useEffect(() => {
    loadProjects();
    loadSprints();
  }, []);

  // Load projects
  const loadProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/projects`, {
        headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar proyectos');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar proyectos');
    }
  };

  // Load all sprints
  const loadSprints = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/sprints`, {
        headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar sprints');
      const data = await res.json();
      setSprints(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar sprints');
    } finally {
      setLoading(false);
    }
  };

  // Load sprints by project
  const loadSprintsByProject = async (projectId) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/sprints/project/${projectId}`, {
        headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar sprints del proyecto');
      const data = await res.json();
      setSprints(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar sprints del proyecto');
    } finally {
      setLoading(false);
    }
  };

  // Load sprints by status
  const loadSprintsByStatus = async (status) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/sprints/status/${status}`, {
        headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar sprints por estado');
      const data = await res.json();
      setSprints(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar sprints por estado');
    } finally {
      setLoading(false);
    }
  };

  // Handle project filter change
  const handleProjectFilterChange = (projectId) => {
    setSelectedProject(projectId);
    setSelectedStatus('all');
    if (projectId === 'all') {
      loadSprints();
    } else {
      loadSprintsByProject(projectId);
    }
  };

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setSelectedStatus(status);
    setSelectedProject('all');
    if (status === 'all') {
      loadSprints();
    } else {
      loadSprintsByStatus(status);
    }
  };

  // Create new sprint
  const handleCreateSprint = async () => {
    if (!form.name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!form.projectId) {
      setError('Debe seleccionar un proyecto');
      return;
    }
    if (!form.startDate || !form.endDate) {
      setError('Las fechas de inicio y fin son obligatorias');
      return;
    }

    // Validate dates
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    try {
      const userId = localStorage.getItem('userId') || 1;

      const payload = {
        name: form.name,
        goal: form.goal,
        startDate: form.startDate,
        endDate: form.endDate,
        status: form.status
      };

      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/sprints?projectId=${form.projectId}&createdBy=${userId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Error al crear sprint');
      }

      setOpenCreate(false);
      resetForm();
      loadSprints();
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Update sprint
  const handleUpdateSprint = async () => {
    if (!form.name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!form.startDate || !form.endDate) {
      setError('Las fechas de inicio y fin son obligatorias');
      return;
    }

    // Validate dates
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    try {
      const payload = {
        name: form.name,
        goal: form.goal,
        startDate: form.startDate,
        endDate: form.endDate,
        status: form.status
      };

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/sprints/${editingSprint.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Error al actualizar sprint');

      setOpenEdit(false);
      setEditingSprint(null);
      resetForm();
      loadSprints();
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Delete sprint
  const handleDeleteSprint = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este sprint?')) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/sprints/${id}`, {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Error al eliminar sprint');

      loadSprints();
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Update sprint status
  const handleUpdateSprintStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/sprints/${id}/status?status=${newStatus}`, {
        method: 'PATCH',
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Error al actualizar estado del sprint');

      loadSprints();
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Open edit dialog
  const openEditDialog = (sprint) => {
    setEditingSprint(sprint);
    setForm({
      name: sprint.name || '',
      goal: sprint.goal || '',
      startDate: sprint.startDate || '',
      endDate: sprint.endDate || '',
      status: sprint.status || 'planned',
      projectId: sprint.project?.id || ''
    });
    setOpenEdit(true);
  };

  // Reset form
  const resetForm = () => {
    setForm({
      name: '',
      goal: '',
      startDate: '',
      endDate: '',
      status: 'planned',
      projectId: ''
    });
  };

  // Filter sprints by search term
  const filteredSprints = sprints.filter(sprint =>
    sprint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sprint.goal && sprint.goal.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <TopBar />

      {/* Banner */}
      <Box sx={heroSx}>
        <Box sx={{ maxWidth: 1680, mx: 'auto', px: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,.35)' }}>
            Sprints
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
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar sprints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Filtrar por proyecto"
                  value={selectedProject}
                  onChange={(e) => handleProjectFilterChange(e.target.value)}
                >
                  <MenuItem value="all">Todos los proyectos</MenuItem>
                  {projects.map(project => (
                    <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Filtrar por estado"
                  value={selectedStatus}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                >
                  <MenuItem value="all">Todos los estados</MenuItem>
                  {STATUS_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
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
                  Nuevo Sprint
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Loading */}
          {isLoading && <LinearProgress sx={{ mb: 2 }} />}

          {/* Sprints Grid */}
          <Grid container spacing={3}>
            {filteredSprints.length === 0 && !isLoading && (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <CalendarMonthIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No hay sprints disponibles
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {searchTerm ? 'No se encontraron resultados para tu búsqueda' : 'Crea tu primer sprint para comenzar'}
                  </Typography>
                </Paper>
              </Grid>
            )}

            {filteredSprints.map(sprint => {
              const duration = calculateDuration(sprint.startDate, sprint.endDate);
              
              return (
                <Grid item xs={12} sm={6} md={4} key={sprint.id}>
                  <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Chip
                          label={getStatusLabel(sprint.status)}
                          color={getStatusColor(sprint.status)}
                          size="small"
                        />
                        {sprint.status === 'active' && (
                          <Chip
                            icon={<PlayArrowIcon />}
                            label="En curso"
                            color="success"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Stack>

                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        {sprint.name}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
                        {sprint.goal || 'Sin objetivo definido'}
                      </Typography>

                      <Divider sx={{ my: 1 }} />

                      <Stack spacing={0.5} sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          <strong>Inicio:</strong> {formatDate(sprint.startDate)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          <strong>Fin:</strong> {formatDate(sprint.endDate)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          <strong>Duración:</strong> {duration} días
                        </Typography>
                        {sprint.project && (
                          <Typography variant="caption" color="text.secondary">
                            <strong>Proyecto:</strong> {sprint.project.name}
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Box>
                        {sprint.status === 'planned' && (
                          <Tooltip title="Iniciar Sprint">
                            <IconButton 
                              size="small" 
                              color="success" 
                              onClick={() => handleUpdateSprintStatus(sprint.id, 'active')}
                            >
                              <PlayArrowIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                      <Box>
                        <Tooltip title="Editar">
                          <IconButton size="small" color="primary" onClick={() => openEditDialog(sprint)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" color="error" onClick={() => handleDeleteSprint(sprint.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
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
        <DialogTitle>Crear Nuevo Sprint</DialogTitle>
        <DialogContent>
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
                  {STATUS_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
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
                  {projects.map(project => (
                    <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenCreate(false); resetForm(); }}>
            Cancelar
          </Button>
          <Button onClick={handleCreateSprint} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Sprint</DialogTitle>
        <DialogContent>
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
                  {STATUS_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenEdit(false); setEditingSprint(null); resetForm(); }}>
            Cancelar
          </Button>
          <Button onClick={handleUpdateSprint} variant="contained">
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Sprints;