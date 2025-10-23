// src/components/UserStories.js
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Paper, Typography, Grid, Card, CardContent, CardActions,
  Chip, Stack, Divider, IconButton, Tooltip, LinearProgress, TextField, MenuItem, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TopBar from './TopBar';

const API_BASE = '/api';
const BANNER_SRC = "/img/banner-top.png";

const STATUS_OPTIONS = [
  { value: 'backlog', label: 'Backlog', color: 'default' },
  { value: 'in_progress', label: 'En Progreso', color: 'primary' },
  { value: 'testing', label: 'Testing', color: 'warning' },
  { value: 'done', label: 'Completado', color: 'success' }
];

const PRIORITY_OPTIONS = [
  { value: 0, label: 'Baja', color: 'success' },
  { value: 1, label: 'Media', color: 'warning' },
  { value: 2, label: 'Alta', color: 'error' }
];

const getPriorityLabel = (p) => PRIORITY_OPTIONS.find(x => x.value === p)?.label || 'Baja';
const getPriorityColor = (p) => PRIORITY_OPTIONS.find(x => x.value === p)?.color || 'default';
const getStatusLabel = (s) => STATUS_OPTIONS.find(x => x.value === s)?.label || s;
const getStatusColor = (s) => STATUS_OPTIONS.find(x => x.value === s)?.color || 'default';

function UserStories() {
  const [stories, setStories] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', storyPoints: '', estimatedHours: '',
    priority: 0, status: 'backlog', teamId: ''
  });

  useEffect(() => {
    loadTeams();
    loadStories();
  }, []);

  const loadTeams = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/teams`, {
        headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar equipos');
      setTeams(await res.json());
    } catch {
      setError('Error al cargar equipos');
    }
  };

  const loadStories = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/stories`, {
        headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar user stories');
      setStories(await res.json());
    } catch {
      setError('Error al cargar user stories');
    } finally {
      setLoading(false);
    }
  };

  const loadStoriesByTeam = async (teamId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/stories/team/${teamId}`, {
        headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar user stories del equipo');
      setStories(await res.json());
    } catch {
      setError('Error al cargar user stories del equipo');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamFilterChange = (id) => {
    setSelectedTeam(id);
    id === 'all' ? loadStories() : loadStoriesByTeam(id);
  };

  const handleDeleteStory = async (id) => {
    if (!window.confirm('¿Eliminar esta user story?')) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/stories/${id}`, {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al eliminar');
      loadStories();
    } catch {
      setError('Error al eliminar user story');
    }
  };

  const handleCreateStory = async () => {
    if (!form.title.trim()) return setError('El título es obligatorio');
    if (!form.teamId) return setError('Debe seleccionar un equipo');

    try {
      const userId = localStorage.getItem('userId') || 1;
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

      if (!res.ok) throw new Error('Error al crear user story');
      setOpenCreate(false);
      resetForm();
      loadStories();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateStory = async () => {
    if (!form.title.trim()) return setError('El título es obligatorio');
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
      if (!res.ok) throw new Error('Error al actualizar');
      setOpenEdit(false);
      setEditingStory(null);
      resetForm();
      loadStories();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

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

  const resetForm = () => {
    setForm({
      title: '', description: '', storyPoints: '', estimatedHours: '',
      priority: 0, status: 'backlog', teamId: ''
    });
  };

  const filteredStories = stories.filter(
    s =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <TopBar />

      {/* Banner */}
      <Box
        sx={{
          position: 'relative',
          left: '50%',
          right: '50%',
          ml: '-50vw',
          mr: '-50vw',
          width: '100vw',
          backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${BANNER_SRC})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          py: { xs: 4, sm: 5 },
        }}
      >
        <Box
          sx={{
            maxWidth: 1600,
            mx: 'auto',
            px: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,.35)' }}>
              User Stories
            </Typography>
            <Box sx={{ mt: 1, height: 3, width: 80, bgcolor: '#f84600ff', borderRadius: 2 }} />
          </Box>
        </Box>
      </Box>

      {/* Contenido principal */}
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: 4 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

          {/* Toolbar */}
          <Paper elevation={3} sx={{ p: 2.5, mb: 4, borderRadius: 3, backgroundColor: '#ffffff', boxShadow: '0 4px 10px rgba(0,0,0,0.06)' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth size="small" placeholder="Buscar user stories..."
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    sx: { borderRadius: 2, backgroundColor: '#fafafa' }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  select fullWidth size="small" label="Filtrar por equipo"
                  value={selectedTeam} onChange={(e) => handleTeamFilterChange(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#fafafa' } }}
                >
                  <MenuItem value="all">Todos los equipos</MenuItem>
                  {teams.map(team => (<MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}
                  sx={{ bgcolor: '#f84600ff', '&:hover': { bgcolor: '#d6370fff' }, borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2.5 }}
                >
                  Nueva User Story
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {isLoading && (
            <LinearProgress sx={{ mb: 2, bgcolor: '#d6d6d6', '& .MuiLinearProgress-bar': { backgroundColor: '#313131' } }} />
          )}

          {/* Grid de historias */}
          <Grid container spacing={3}>
            {filteredStories.length === 0 && !isLoading && (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No hay user stories disponibles
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {searchTerm ? 'No se encontraron resultados' : 'Crea tu primera user story para comenzar'}
                  </Typography>
                </Paper>
              </Grid>
            )}

            {filteredStories.map(story => (
              <Grid item xs={12} sm={6} md={4} key={story.id}>
                <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, transition: 'transform 0.25s ease, box-shadow 0.25s ease', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 6px 16px rgba(0,0,0,0.12)' } }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip label={getPriorityLabel(story.priority)} color={getPriorityColor(story.priority)} size="small" />
                      <Chip label={getStatusLabel(story.status)} color={getStatusColor(story.status)} size="small" />
                    </Stack>

                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#313131' }}>
                      {story.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
                      {story.description || 'Sin descripción'}
                    </Typography>
                    <Divider sx={{ my: 1 }} />

                    <Stack spacing={0.5} sx={{ mt: 2 }}>
                      {story.storyPoints && (<Typography variant="caption" color="text.secondary"><strong>Story Points:</strong> {story.storyPoints}</Typography>)}
                      {story.estimatedHours && (<Typography variant="caption" color="text.secondary"><strong>Horas estimadas:</strong> {story.estimatedHours}h</Typography>)}
                      {story.team && (<Typography variant="caption" color="text.secondary"><strong>Equipo:</strong> {story.team.name}</Typography>)}
                    </Stack>
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => openEditDialog(story)} sx={{ bgcolor: '#313131', color: '#fff', '&:hover': { bgcolor: '#1f1f1f' } }}>
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

      {/* CREATE DIALOG */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            📝
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Crear Nueva User Story
            </Typography>
          </Box>
          <Box sx={{ mt: 1, height: 3, width: '100%', bgcolor: '#f84600ff', borderRadius: 2 }} />
        </DialogTitle>
        <DialogContent>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: '#f9f9f9', boxShadow: '0px 4px 12px rgba(0,0,0,0.08)' }}>
            <Box sx={{ pt: 2 }}>
              <TextField fullWidth label="Título *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} sx={{ mb: 2 }} />
              <TextField fullWidth label="Descripción" multiline rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Story Points" type="number" value={form.storyPoints} onChange={(e) => setForm({ ...form, storyPoints: e.target.value })} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Horas Estimadas" type="number" value={form.estimatedHours} onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })} /></Grid>
                <Grid item xs={12} sm={6}><TextField select fullWidth label="Prioridad" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{PRIORITY_OPTIONS.map(opt => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}</TextField></Grid>
                <Grid item xs={12} sm={6}><TextField select fullWidth label="Estado" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{STATUS_OPTIONS.map(opt => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}</TextField></Grid>
                <Grid item xs={12}><TextField select fullWidth label="Equipo *" value={form.teamId} onChange={(e) => setForm({ ...form, teamId: e.target.value })}>{teams.map(team => (<MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>))}</TextField></Grid>
              </Grid>
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => { setOpenCreate(false); resetForm(); }} sx={{ color: '#757575', textTransform: 'none', fontWeight: 500 }}>Cancelar</Button>
          <Button onClick={handleCreateStory} variant="contained" sx={{ bgcolor: '#f84600ff', '&:hover': { bgcolor: '#d6370fff' }, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Crear</Button>
        </DialogActions>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            ✏️
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Editar User Story
            </Typography>
          </Box>
          <Box sx={{ mt: 1, height: 3, width: '100%', bgcolor: '#313131', borderRadius: 2 }} />
        </DialogTitle>
        <DialogContent>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: '#f9f9f9', boxShadow: '0px 4px 12px rgba(0,0,0,0.08)' }}>
            <Box sx={{ pt: 2 }}>
              <TextField fullWidth label="Título *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} sx={{ mb: 2 }} />
              <TextField fullWidth label="Descripción" multiline rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Story Points" type="number" value={form.storyPoints} onChange={(e) => setForm({ ...form, storyPoints: e.target.value })} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Horas Estimadas" type="number" value={form.estimatedHours} onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })} /></Grid>
                <Grid item xs={12} sm={6}><TextField select fullWidth label="Prioridad" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{PRIORITY_OPTIONS.map(opt => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}</TextField></Grid>
                <Grid item xs={12} sm={6}><TextField select fullWidth label="Estado" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{STATUS_OPTIONS.map(opt => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}</TextField></Grid>
              </Grid>
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => { setOpenEdit(false); setEditingStory(null); resetForm(); }} sx={{ color: '#757575', textTransform: 'none', fontWeight: 500 }}>Cancelar</Button>
          <Button onClick={handleUpdateStory} variant="contained" sx={{ bgcolor: '#313131', '&:hover': { bgcolor: '#1f1f1f' }, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Actualizar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default UserStories;
