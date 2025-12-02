// src/components/Teams.js
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Paper, Typography, Grid, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton, Card, CardContent,
  CardActions, Stack, Divider, Alert, LinearProgress, Tooltip, Chip, 
  List, ListItem, ListItemText, ListItemAvatar, Avatar, ListItemSecondaryAction,
  Badge, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import InfoIcon from '@mui/icons-material/Info';
import TopBar from '../shared/TopBar';
import { motion, useReducedMotion } from 'framer-motion';

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

const API_BASE = '/api';
const BANNER_SRC = "/img/banner-top.png";

// Roles
const ROLE_OPTIONS = [
  { value: 'owner', label: 'Owner', color: 'error', icon: '👑' },
  { value: 'admin', label: 'Admin', color: 'warning', icon: '⚡' },
  { value: 'member', label: 'Member', color: 'primary', icon: '👤' },
  { value: 'viewer', label: 'Viewer', color: 'default', icon: '👁️' }
];

const getRoleLabel = (role) => ROLE_OPTIONS.find(r => r.value === role)?.label || role;
const getRoleColor = (role) => ROLE_OPTIONS.find(r => r.value === role)?.color || 'default';
const getRoleIcon  = (role) => ROLE_OPTIONS.find(r => r.value === role)?.icon  || '👤';

// Fecha
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
};

function Teams() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog states
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openAddMember, setOpenAddMember] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [detailsTeam, setDetailsTeam] = useState(null);
  const [selectedTeamForMember, setSelectedTeamForMember] = useState(null);

  // Forms
  const [form, setForm] = useState({ name: '', description: '' });
  const [memberForm, setMemberForm] = useState({ userId: '', role: 'member' });

  // Cargar datos
  useEffect(() => {
    loadTeams();
    loadUsers();
  }, []);

  const loadTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/teams`, {
        headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar equipos');
      const data = await res.json();
      setTeams(data);
    } catch (err) {
      setError('Error al cargar equipos');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/users`, {
        headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar usuarios');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      
    }
  };

  const loadTeamMembers = async (teamId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/team-members/team/${teamId}`, {
        headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar miembros del equipo');
      const data = await res.json();
      setTeamMembers(data);
    } catch (err) {
      setError('Error al cargar miembros del equipo');
    }
  };

  // Crear equipo
  const handleCreateTeam = async () => {
    if (!form.name.trim()) return setError('El nombre es obligatorio');
    try {
      const userId = localStorage.getItem('userId') || 1;
      const payload = { name: form.name, description: form.description };
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/teams?createdBy=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Error al crear equipo');
      setOpenCreate(false);
      resetForm();
      loadTeams();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Actualizar equipo
  const handleUpdateTeam = async () => {
    if (!form.name.trim()) return setError('El nombre es obligatorio');
    try {
      const payload = { name: form.name, description: form.description };
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/teams/${editingTeam.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Error al actualizar equipo');
      setOpenEdit(false);
      setEditingTeam(null);
      resetForm();
      loadTeams();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Eliminar equipo
  const handleDeleteTeam = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este equipo? Esto eliminará todos los proyectos, sprints y tareas asociados.')) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/teams/${id}`, {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al eliminar equipo');
      loadTeams();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Agregar miembro
  const handleAddMember = async () => {
    if (!memberForm.userId) return setError('Debe seleccionar un usuario');
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/team-members?teamId=${selectedTeamForMember.id}&userId=${memberForm.userId}&role=${memberForm.role}`,
        { method: 'POST', headers: { "Authorization": `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Error al agregar miembro');
      setOpenAddMember(false);
      resetMemberForm();
      loadTeamMembers(selectedTeamForMember.id);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Remover miembro
  const handleRemoveMember = async (teamId, userId) => {
    if (!window.confirm('¿Estás seguro de remover este miembro del equipo?')) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/team-members?teamId=${teamId}&userId=${userId}`, {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al remover miembro');
      loadTeamMembers(teamId);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Actualizar rol
  const handleUpdateMemberRole = async (teamId, userId, newRole) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/team-members?teamId=${teamId}&userId=${userId}&role=${newRole}`, {
        method: 'PATCH',
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al actualizar rol');
      loadTeamMembers(teamId);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Abrir diálogos
  const openEditDialog = (team) => {
    setEditingTeam(team);
    setForm({ name: team.name || '', description: team.description || '' });
    setOpenEdit(true);
  };

  const openDetailsDialog = async (team) => {
    setDetailsTeam(team);
    await loadTeamMembers(team.id);
    setOpenDetails(true);
  };

  const openAddMemberDialog = (team) => {
    setSelectedTeamForMember(team);
    loadTeamMembers(team.id);
    setOpenAddMember(true);
  };

  // Reset forms
  const resetForm = () => setForm({ name: '', description: '' });
  const resetMemberForm = () => setMemberForm({ userId: '', role: 'member' });

  // Filtrado
  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (team.description && team.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Usuarios disponibles (no miembros)
  const getAvailableUsers = () => {
    if (!selectedTeamForMember) return users;
    const memberUserIds = teamMembers.map(m => m.user.id);
    return users.filter(u => !memberUserIds.includes(u.id));
  };

  // Preferencias de accesibilidad
  const prefersReducedMotion = useReducedMotion();
  const cardVariants = prefersReducedMotion ? reduced : fadeInUp;
  const underlineProps = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: MOTION.reduced } } }
    : { initial: { scaleX: 0 }, animate: { scaleX: 1, transition: { duration: MOTION.underline } }, style: { originX: 0 } };

  return (
    <>
      <TopBar />

      {/* Banner con overlay */}
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
            Equipos
          </Typography>
          <motion.div {...underlineProps}>
            <Box sx={{ mt: 1, height: 3, width: 80, bgcolor: '#f84600ff', borderRadius: 2 }} />
          </motion.div>
        </Box>
      </Box>

      {/* Contenido principal */}
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: 4 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>

          {/* Error */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Toolbar */}
          <motion.div variants={cardVariants} initial="initial" animate="animate" exit="exit">
            <Paper elevation={3} sx={{ p: 2.5, mb: 4, borderRadius: 3, backgroundColor: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.06)' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar equipos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      sx: { borderRadius: 2, backgroundColor: '#fafafa' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
                    Nuevo Equipo
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>

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

          {/* Grid de equipos con stagger */}
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <Grid container spacing={3}>
              {filteredTeams.length === 0 && !isLoading && (
                <Grid item xs={12}>
                  <motion.div variants={cardVariants}>
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                      <GroupIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No hay equipos disponibles
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {searchTerm ? 'No se encontraron resultados para tu búsqueda' : 'Crea tu primer equipo para comenzar'}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              )}

              {filteredTeams.map(team => (
                <Grid item xs={12} sm={6} md={4} key={team.id}>
                  <motion.div
                    variants={cardVariants}
                    whileHover={!prefersReducedMotion ? { y: -5, scale: 1.01 } : {}}
                    transition={{ type: 'tween', duration: MOTION.hover }}
                  >
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
                          <Badge badgeContent={team.members?.length || 0} color="primary">
                            <GroupIcon color="primary" fontSize="large" />
                          </Badge>
                        </Stack>

                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{ fontWeight: 700, color: '#313131', cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                          onClick={() => openDetailsDialog(team)}
                        >
                          {team.name}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
                          {team.description || 'Sin descripción'}
                        </Typography>

                        <Divider sx={{ my: 1 }} />

                        <Stack spacing={0.5} sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            <strong>Miembros:</strong> {team.members?.length || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            <strong>Creado:</strong> {formatDate(team.createdAt)}
                          </Typography>
                          {team.createdBy && (
                            <Typography variant="caption" color="text.secondary">
                              <strong>Por:</strong> {team.createdBy.fullName}
                            </Typography>
                          )}
                        </Stack>
                      </CardContent>

                      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                        <Tooltip title="Agregar miembro">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => openAddMemberDialog(team)}
                          >
                            <PersonAddIcon />
                          </IconButton>
                        </Tooltip>
                        <Box>
                          <Tooltip title="Ver detalles">
                            <IconButton size="small" color="info" onClick={() => openDetailsDialog(team)}>
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => openEditDialog(team)}
                              sx={{ bgcolor: '#313131', color: '#fff', '&:hover': { bgcolor: '#1f1f1f' } }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton size="small" color="error" onClick={() => handleDeleteTeam(team.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardActions>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Box>
      </Box>

      {/* CREATE DIALOG */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            📝
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Crear Nuevo Equipo</Typography>
          </Box>
          <Box sx={{ mt: 1, height: 3, width: '100%', bgcolor: '#f84600ff', borderRadius: 2 }} />
        </DialogTitle>
        <DialogContent>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: '#f9f9f9', boxShadow: '0px 4px 12px rgba(0,0,0,0.08)' }}>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Nombre del Equipo *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                sx={{ mb: 2 }}
                placeholder="Ej: Equipo de Desarrollo"
              />
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe el propósito y objetivos del equipo..."
              />
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => { setOpenCreate(false); resetForm(); }} sx={{ color: '#757575', textTransform: 'none', fontWeight: 500 }}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateTeam}
            variant="contained"
            sx={{ bgcolor: '#f84600ff', '&:hover': { bgcolor: '#d6370fff' }, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            ✏️
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Editar Equipo</Typography>
          </Box>
        <Box sx={{ mt: 1, height: 3, width: '100%', bgcolor: '#313131', borderRadius: 2 }} />
        </DialogTitle>
        <DialogContent>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: '#f9f9f9', boxShadow: '0px 4px 12px rgba(0,0,0,0.08)' }}>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Nombre del Equipo *"
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
              />
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => { setOpenEdit(false); setEditingTeam(null); resetForm(); }} sx={{ color: '#757575', textTransform: 'none', fontWeight: 500 }}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpdateTeam}
            variant="contained"
            sx={{ bgcolor: '#313131', '&:hover': { bgcolor: '#1f1f1f' }, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* DETAILS DIALOG */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            🔵
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {detailsTeam?.name || 'Detalles del Equipo'}
            </Typography>
          </Box>
          <Box sx={{ mt: 1, height: 3, width: '100%', bgcolor: '#1976d2', borderRadius: 2 }} />
        </DialogTitle>
        <DialogContent>
          {detailsTeam && (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: '#f9f9f9', boxShadow: '0px 4px 12px rgba(0,0,0,0.08)' }}>
              <Box sx={{ pt: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Descripción
                </Typography>
                <Typography variant="body1" paragraph>
                  {detailsTeam.description || 'Sin descripción'}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6">Miembros ({teamMembers.length})</Typography>
                  <Button
                    size="small"
                    startIcon={<PersonAddIcon />}
                    onClick={() => { setOpenDetails(false); openAddMemberDialog(detailsTeam); }}
                    sx={{ textTransform: 'none' }}
                  >
                    Agregar Miembro
                  </Button>
                </Stack>

                {teamMembers.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 3 }}>
                    No hay miembros en este equipo
                  </Typography>
                ) : (
                  <List>
                    {teamMembers.map(member => (
                      <ListItem key={member.id} divider>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {member.user.fullName.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={member.user.fullName}
                          secondary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="caption">{member.user.email}</Typography>
                              <Chip
                                label={`${getRoleIcon(member.role)} ${getRoleLabel(member.role)}`}
                                size="small"
                                color={getRoleColor(member.role)}
                              />
                            </Stack>
                          }
                        />
                        <ListItemSecondaryAction>
                          <TextField
                            select
                            size="small"
                            value={member.role}
                            onChange={(e) => handleUpdateMemberRole(detailsTeam.id, member.user.id, e.target.value)}
                            sx={{ minWidth: 120, mr: 1 }}
                          >
                            {ROLE_OPTIONS.map(opt => (
                              <MenuItem key={opt.value} value={opt.value}>
                                {opt.icon} {opt.label}
                              </MenuItem>
                            ))}
                          </TextField>
                          <IconButton
                            edge="end"
                            size="small"
                            color="error"
                            onClick={() => handleRemoveMember(detailsTeam.id, member.user.id)}
                          >
                            <PersonRemoveIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Fecha de Creación
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {formatDate(detailsTeam.createdAt)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Creado Por
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {detailsTeam.createdBy?.fullName || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDetails(false)} sx={{ color: '#757575', textTransform: 'none', fontWeight: 500 }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ADD MEMBER DIALOG */}
      <Dialog open={openAddMember} onClose={() => setOpenAddMember(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            🟡
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Agregar Miembro al Equipo</Typography>
          </Box>
          <Box sx={{ mt: 1, height: 3, width: '100%', bgcolor: '#ffb300', borderRadius: 2 }} />
        </DialogTitle>
        <DialogContent>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: '#f9f9f9', boxShadow: '0px 4px 12px rgba(0,0,0,0.08)' }}>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Equipo: <strong>{selectedTeamForMember?.name}</strong>
              </Typography>

              <TextField
                select
                fullWidth
                label="Usuario *"
                value={memberForm.userId}
                onChange={(e) => setMemberForm({ ...memberForm, userId: e.target.value })}
                sx={{ mb: 2 }}
                SelectProps={{ native: true }}
              >
                <option value="">Seleccionar usuario</option>
                {getAvailableUsers().map(user => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} ({user.email})
                  </option>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="Rol *"
                value={memberForm.role}
                onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
              >
                {ROLE_OPTIONS.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.icon} {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => { setOpenAddMember(false); resetMemberForm(); }} sx={{ color: '#757575', textTransform: 'none', fontWeight: 500 }}>
            Cancelar
          </Button>
          <Button
            onClick={handleAddMember}
            variant="contained"
            sx={{ bgcolor: '#ffb300', '&:hover': { bgcolor: '#e6a100' }, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Teams;
