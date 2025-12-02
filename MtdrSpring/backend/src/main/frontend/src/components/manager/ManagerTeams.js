import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Paper, Typography, Grid, TextField, Card, CardContent,
  Stack, Divider, Alert, LinearProgress, Badge, Button, Container
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import TopBar from '../shared/TopBar';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

const API_BASE = '/api';
const BANNER_SRC = "/img/banner-top.png";

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
};

function ManagerTeams() {
  const { selectedUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedUser) {
      loadTeamsForUser(selectedUser.id);
    }
  }, [selectedUser]);

  const loadTeamsForUser = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/teams/user/${userId}`, {
        headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar equipos del usuario');
      const data = await res.json();
      setTeams(data);
    } catch (err) {
      setError('Error al cargar equipos del usuario.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (team.description && team.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
          position: 'relative',
          left: '50%', right: '50%', ml: '-50vw', mr: '-50vw',
          width: '100vw',
          backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${BANNER_SRC})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          py: { xs: 4, sm: 5 },
        }}>
        <Box sx={{ maxWidth: 1600, mx: 'auto', px: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,.35)' }}>
            Equipos de {selectedUser.fullName}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: 4 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
          <Paper elevation={3} sx={{ p: 2.5, mb: 4, borderRadius: 3, backgroundColor: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.06)' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
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
            </Grid>
          </Paper>

          {isLoading && <LinearProgress sx={{ mb: 2, bgcolor: '#d6d6d6', '& .MuiLinearProgress-bar': { backgroundColor: '#313131' } }} />}

          <Grid container spacing={3}>
            {filteredTeams.length === 0 && !isLoading && (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <GroupIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">No hay equipos para este usuario.</Typography>
                </Paper>
              </Grid>
            )}

            {filteredTeams.map(team => (
              <Grid item xs={12} sm={6} md={4} key={team.id}>
                <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3 }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <Badge badgeContent={team.members?.length || 0} color="primary">
                        <GroupIcon color="primary" fontSize="large" />
                      </Badge>
                    </Stack>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#313131' }}>
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
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </>
  );
}

export default ManagerTeams;
