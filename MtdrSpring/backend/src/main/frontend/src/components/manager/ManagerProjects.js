import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Paper, Typography, Grid, TextField, Card, CardContent,
  Stack, Divider, Alert, LinearProgress, Chip, Badge, Button, Container
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import GroupIcon from '@mui/icons-material/Group';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import TopBar from '../shared/TopBar';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

const API_BASE = '/api';
const BANNER_SRC = "/img/banner-top3.png";

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
};

function ManagerProjects() {
  const { selectedUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedUser) {
      loadProjectsForUser(selectedUser.id);
      loadSprints();
    }
  }, [selectedUser]);

  const loadProjectsForUser = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      // This endpoint needs to be created in the backend
      const res = await fetch(`${API_BASE}/projects/user/${userId}`, {
        headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar proyectos para el usuario');
      const data = await res.json();
      setProjects(data);
    } catch {
      setError('Error al cargar proyectos para el usuario. El endpoint puede no existir aún.');
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
      //
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getSprintsCount = (id) => sprints.filter(s => s.project?.id === id).length;
  const getActiveSprintsCount = (id) => sprints.filter(s => s.project?.id === id && s.status === 'active').length;

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
          backgroundImage: `linear-gradient(rgba(46,94,115,0.55), rgba(46,94,115,0.55)), url(${BANNER_SRC})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          py: { xs: 4, sm: 5 },
        }}>
        <Box sx={{ maxWidth: 1600, mx: 'auto', px: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,.35)' }}>
            Proyectos de {selectedUser.fullName}
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
                  placeholder="Buscar proyectos..."
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
            {filteredProjects.length === 0 && !isLoading && (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <FolderIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">No hay proyectos para este usuario.</Typography>
                </Paper>
              </Grid>
            )}

            {filteredProjects.map(project => {
              const sprintsCount = getSprintsCount(project.id);
              const activeSprintsCount = getActiveSprintsCount(project.id);
              return (
                <Grid item xs={12} sm={6} md={4} key={project.id}>
                  <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3 }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <FolderIcon color="primary" />
                        {project.team && <Chip icon={<GroupIcon />} label={project.team.name} size="small" variant="outlined" />}
                      </Stack>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#313131' }}>
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
                            <Chip label={`${activeSprintsCount} activo${activeSprintsCount > 1 ? 's' : ''}`} size="small" color="success" />
                          )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          <strong>Creado:</strong> {formatDate(project.createdAt)}
                        </Typography>
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

export default ManagerProjects;