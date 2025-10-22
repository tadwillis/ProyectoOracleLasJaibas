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

// Role configuration
const ROLE_OPTIONS = [
  { value: 'owner', label: 'Owner', color: 'error', icon: '👑' },
  { value: 'admin', label: 'Admin', color: 'warning', icon: '⚡' },
  { value: 'member', label: 'Member', color: 'primary', icon: '👤' },
  { value: 'viewer', label: 'Viewer', color: 'default', icon: '👁️' }
];

const getRoleLabel = (role) => {
  const opt = ROLE_OPTIONS.find(r => r.value === role);
  return opt ? opt.label : role;
};

const getRoleColor = (role) => {
  const opt = ROLE_OPTIONS.find(r => r.value === role);
  return opt ? opt.color : 'default';
};

const getRoleIcon = (role) => {
  const opt = ROLE_OPTIONS.find(r => r.value === role);
  return opt ? opt.icon : '👤';
};

// Format date helper
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

  // Form states
  const [form, setForm] = useState({
    name: '',
    description: ''
  });

  const [memberForm, setMemberForm] = useState({
    userId: '',
    role: 'member'
  });

  // Load teams and users on mount
  useEffect(() => {
    loadTeams();
    loadUsers();
  }, []);

  // Load all teams
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
      console.error(err);
      setError('Error al cargar equipos');
    } finally {
      setLoading(false);
    }
  };

  // Load all users
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
      console.error(err);
    }
  };

  // Load team members
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
      console.error(err);
      setError('Error al cargar miembros del equipo');
    }
  };

  // Create new team
  const handleCreateTeam = async () => {
    if (!form.name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    try {
      const userId = localStorage.getItem('userId') || 1;

      const payload = {
        name: form.name,
        description: form.description
      };

      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/teams?createdBy=${userId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Error al crear equipo');
      }

      setOpenCreate(false);
      resetForm();
      loadTeams();
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Update team
  const handleUpdateTeam = async () => {
    if (!form.name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    try {
      const payload = {
        name: form.name,
        description: form.description
      };

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
      console.error(err);
      setError(err.message);
    }
  };

  // Delete team
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
      console.error(err);
      setError(err.message);
    }
  };

  // Add member to team
  const handleAddMember = async () => {
    if (!memberForm.userId) {
      setError('Debe seleccionar un usuario');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/team-members?teamId=${selectedTeamForMember.id}&userId=${memberForm.userId}&role=${memberForm.role}`,
        {
          method: 'POST',
          headers: { "Authorization": `Bearer ${token}` }
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Error al agregar miembro');
      }

      setOpenAddMember(false);
      resetMemberForm();
      loadTeamMembers(selectedTeamForMember.id);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Remove member from team
  const handleRemoveMember = async (teamId, userId) => {
    if (!window.confirm('¿Estás seguro de remover este miembro del equipo?')) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/team-members?teamId=${teamId}&userId=${userId}`,
        {
          method: 'DELETE',
          headers: { "Authorization": `Bearer ${token}` }
        }
      );

      if (!res.ok) throw new Error('Error al remover miembro');

      loadTeamMembers(teamId);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Update member role
  const handleUpdateMemberRole = async (teamId, userId, newRole) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/team-members?teamId=${teamId}&userId=${userId}&role=${newRole}`,
        {
          method: 'PATCH',
          headers: { "Authorization": `Bearer ${token}` }
        }
      );

      if (!res.ok) throw new Error('Error al actualizar rol');

      loadTeamMembers(teamId);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Open edit dialog
  const openEditDialog = (team) => {
    setEditingTeam(team);
    setForm({
      name: team.name || '',
      description: team.description || ''
    });
    setOpenEdit(true);
  };

  // Open details dialog
  const openDetailsDialog = async (team) => {
    setDetailsTeam(team);
    await loadTeamMembers(team.id);
    setOpenDetails(true);
  };

  // Open add member dialog
  const openAddMemberDialog = (team) => {
    setSelectedTeamForMember(team);
    loadTeamMembers(team.id);
    setOpenAddMember(true);
  };

  // Reset form
  const resetForm = () => {
    setForm({
      name: '',
      description: ''
    });
  };

  // Reset member form
  const resetMemberForm = () => {
    setMemberForm({
      userId: '',
      role: 'member'
    });
  };

  // Filter teams by search term
  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (team.description && team.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get available users (not in team)
  const getAvailableUsers = () => {
    if (!selectedTeamForMember) return users;
    const memberUserIds = teamMembers.map(m => m.user.id);
    return users.filter(u => !memberUserIds.includes(u.id));
  };

  // Get member count for a team
  //const getMemberCount = (teamId) => {
    // This is a simplified version - in production you'd fetch this from the backend
    //return 0; // Placeholder
  //};

  return (
    <>
      <TopBar />

      {/* Banner */}
      <Box sx={heroSx}>
        <Box sx={{ maxWidth: 1680, mx: 'auto', px: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,.35)' }}>
            Equipos
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
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar equipos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenCreate(true)}
                  sx={{ bgcolor: '#1976d2' }}
                >
                  Nuevo Equipo
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Loading */}
          {isLoading && <LinearProgress sx={{ mb: 2 }} />}

          {/* Teams Grid */}
          <Grid container spacing={3}>
            {filteredTeams.length === 0 && !isLoading && (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <GroupIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No hay equipos disponibles
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {searchTerm ? 'No se encontraron resultados para tu búsqueda' : 'Crea tu primer equipo para comenzar'}
                  </Typography>
                </Paper>
              </Grid>
            )}

            {filteredTeams.map(team => (
              <Grid item xs={12} sm={6} md={4} key={team.id}>
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
                      <Badge badgeContent={team.members?.length || 0} color="primary">
                        <GroupIcon color="primary" fontSize="large" />
                      </Badge>
                    </Stack>

                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 600,
                        cursor: 'pointer',
                        '&:hover': { color: 'primary.main' }
                      }}
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
                      <IconButton size="small" color="success" onClick={() => openAddMemberDialog(team)}>
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
                        <IconButton size="small" color="primary" onClick={() => openEditDialog(team)}>
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
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* Create Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nuevo Equipo</DialogTitle>
        <DialogContent>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenCreate(false); resetForm(); }}>
            Cancelar
          </Button>
          <Button onClick={handleCreateTeam} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Equipo</DialogTitle>
        <DialogContent>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenEdit(false); setEditingTeam(null); resetForm(); }}>
            Cancelar
          </Button>
          <Button onClick={handleUpdateTeam} variant="contained">
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <GroupIcon color="primary" />
            <Typography variant="h6">{detailsTeam?.name}</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {detailsTeam && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Descripción
              </Typography>
              <Typography variant="body1" paragraph>
                {detailsTeam.description || 'Sin descripción'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">
                  Miembros ({teamMembers.length})
                </Typography>
                <Button
                  size="small"
                  startIcon={<PersonAddIcon />}
                  onClick={() => {
                    setOpenDetails(false);
                    openAddMemberDialog(detailsTeam);
                  }}
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
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetails(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={openAddMember} onClose={() => setOpenAddMember(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Miembro al Equipo</DialogTitle>
        <DialogContent>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenAddMember(false); resetMemberForm(); }}>
            Cancelar
          </Button>
          <Button onClick={handleAddMember} variant="contained">
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Teams;