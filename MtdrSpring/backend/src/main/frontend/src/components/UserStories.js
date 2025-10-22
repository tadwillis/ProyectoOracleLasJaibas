// src/components/UserStories.js
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
import AssignmentIcon from '@mui/icons-material/Assignment';
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
  { value: 'backlog', label: 'Backlog', color: 'default' },
  { value: 'in_progress', label: 'En Progreso', color: 'primary' },
  { value: 'testing', label: 'Testing', color: 'warning' },
  { value: 'done', label: 'Completado', color: 'success' }
];

// Priority configuration
const PRIORITY_OPTIONS = [
  { value: 0, label: 'Baja', color: 'success' },
  { value: 1, label: 'Media', color: 'warning' },
  { value: 2, label: 'Alta', color: 'error' }
];

const getPriorityLabel = (priority) => {
  const opt = PRIORITY_OPTIONS.find(p => p.value === priority);
  return opt ? opt.label : 'Baja';
};

const getPriorityColor = (priority) => {
  const opt = PRIORITY_OPTIONS.find(p => p.value === priority);
  return opt ? opt.color : 'default';
};

const getStatusLabel = (status) => {
  const opt = STATUS_OPTIONS.find(s => s.value === status);
  return opt ? opt.label : status;
};

const getStatusColor = (status) => {
  const opt = STATUS_OPTIONS.find(s => s.value === status);
  return opt ? opt.color : 'default';
};

function UserStories() {
  const [stories, setStories] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');

  // Dialog states
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingStory, setEditingStory] = useState(null);

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    storyPoints: '',
    estimatedHours: '',
    priority: 0,
    status: 'backlog',
    teamId: ''
  });

  // Load teams and stories on mount
  useEffect(() => {
    loadTeams();
    loadStories();
  }, []);

  // Load teams
  const loadTeams = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/teams`, {
        headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar equipos');
      const data = await res.json();
      setTeams(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar equipos');
    }
  };

  // Load all stories
  const loadStories = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/stories`, {
        headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar user stories');
      const data = await res.json();
      setStories(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar user stories');
    } finally {
      setLoading(false);
    }
  };

  // Load stories by team
  const loadStoriesByTeam = async (teamId) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/stories/team/${teamId}`, {
        headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar user stories del equipo');
      const data = await res.json();
      setStories(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar user stories del equipo');
    } finally {
      setLoading(false);
    }
  };

  // Handle team filter change
  const handleTeamFilterChange = (teamId) => {
    setSelectedTeam(teamId);
    if (teamId === 'all') {
      loadStories();
    } else {
      loadStoriesByTeam(teamId);
    }
  };

  // Create new story
  const handleCreateStory = async () => {
    if (!form.title.trim()) {
      setError('El título es obligatorio');
      return;
    }
    if (!form.teamId) {
      setError('Debe seleccionar un equipo');
      return;
    }

    try {
      // Get current user ID from localStorage (assuming it's stored there)
      const userId = localStorage.getItem('userId') || 1; // Fallback to 1

      const payload = {
        title: form.title,
        description: form.description,
        storyPoints: form.storyPoints ? parseInt(form.storyPoints) : null,
        estimatedHours: form.estimatedHours ? parseFloat(form.estimatedHours) : null,
        priority: parseInt(form.priority),
        status: form.status
      };

      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/stories?teamId=${form.teamId}&createdBy=${userId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Error al crear user story');
      }

      setOpenCreate(false);
      resetForm();
      loadStories();
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Update story
  const handleUpdateStory = async () => {
    if (!form.title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    try {
      const payload = {
        title: form.title,
        description: form.description,
        storyPoints: form.storyPoints ? parseInt(form.storyPoints) : null,
        estimatedHours: form.estimatedHours ? parseFloat(form.estimatedHours) : null,
        priority: parseInt(form.priority),
        status: form.status
      };

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/stories/${editingStory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Error al actualizar user story');

      setOpenEdit(false);
      setEditingStory(null);
      resetForm();
      loadStories();
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Delete story
  const handleDeleteStory = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta user story?')) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/stories/${id}`, {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Error al eliminar user story');

      loadStories();
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Open edit dialog
  const openEditDialog = (story) => {
    setEditingStory(story);
    setForm({
      title: story.title || '',
      description: story.description || '',
      storyPoints: story.storyPoints || '',
      estimatedHours: story.estimatedHours || '',
      priority: story.priority || 0,
      status: story.status || 'backlog',
      teamId: story.team?.id || ''
    });
    setOpenEdit(true);
  };

  // Reset form
  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      storyPoints: '',
      estimatedHours: '',
      priority: 0,
      status: 'backlog',
      teamId: ''
    });
  };

  // Filter stories by search term
  const filteredStories = stories.filter(story =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (story.description && story.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <TopBar />

      {/* Banner */}
      <Box sx={heroSx}>
        <Box sx={{ maxWidth: 1680, mx: 'auto', px: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,.35)' }}>
            User Stories
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
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar user stories..."
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
                  label="Filtrar por equipo"
                  value={selectedTeam}
                  onChange={(e) => handleTeamFilterChange(e.target.value)}
                >
                  <MenuItem value="all">Todos los equipos</MenuItem>
                  {teams.map(team => (
                    <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={5} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenCreate(true)}
                  sx={{ bgcolor: '#1976d2' }}
                >
                  Nueva User Story
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Loading */}
          {isLoading && <LinearProgress sx={{ mb: 2 }} />}

          {/* Stories Grid */}
          <Grid container spacing={3}>
            {filteredStories.length === 0 && !isLoading && (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No hay user stories disponibles
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {searchTerm ? 'No se encontraron resultados para tu búsqueda' : 'Crea tu primera user story para comenzar'}
                  </Typography>
                </Paper>
              </Grid>
            )}

            {filteredStories.map(story => (
              <Grid item xs={12} sm={6} md={4} key={story.id}>
                <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip
                        label={getPriorityLabel(story.priority)}
                        color={getPriorityColor(story.priority)}
                        size="small"
                      />
                      <Chip
                        label={getStatusLabel(story.status)}
                        color={getStatusColor(story.status)}
                        size="small"
                      />
                    </Stack>

                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {story.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
                      {story.description || 'Sin descripción'}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <Stack spacing={0.5} sx={{ mt: 2 }}>
                      {story.storyPoints && (
                        <Typography variant="caption" color="text.secondary">
                          <strong>Story Points:</strong> {story.storyPoints}
                        </Typography>
                      )}
                      {story.estimatedHours && (
                        <Typography variant="caption" color="text.secondary">
                          <strong>Horas estimadas:</strong> {story.estimatedHours}h
                        </Typography>
                      )}
                      {story.team && (
                        <Typography variant="caption" color="text.secondary">
                          <strong>Equipo:</strong> {story.team.name}
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                    <Tooltip title="Editar">
                      <IconButton size="small" color="primary" onClick={() => openEditDialog(story)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" color="error" onClick={() => handleDeleteStory(story.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* Create Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nueva User Story</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Título *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
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

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Story Points"
                  type="number"
                  value={form.storyPoints}
                  onChange={(e) => setForm({ ...form, storyPoints: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Horas Estimadas"
                  type="number"
                  value={form.estimatedHours}
                  onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Prioridad"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  {PRIORITY_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </TextField>
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
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Equipo *"
                  value={form.teamId}
                  onChange={(e) => setForm({ ...form, teamId: e.target.value })}
                >
                  {teams.map(team => (
                    <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
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
          <Button onClick={handleCreateStory} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar User Story</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Título *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
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

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Story Points"
                  type="number"
                  value={form.storyPoints}
                  onChange={(e) => setForm({ ...form, storyPoints: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Horas Estimadas"
                  type="number"
                  value={form.estimatedHours}
                  onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Prioridad"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  {PRIORITY_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </TextField>
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
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenEdit(false); setEditingStory(null); resetForm(); }}>
            Cancelar
          </Button>
          <Button onClick={handleUpdateStory} variant="contained">
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default UserStories;