// src/components/UserDetails.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import TopBar from './TopBar';

const API_BASE = 'http://localhost:8080/api';

function UserDetails() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch user details
        const userResponse = await fetch(`${API_BASE}/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!userResponse.ok) throw new Error('Error al cargar los detalles del usuario');
        const userData = await userResponse.json();
        setUser(userData);

        // Fetch user tasks
        const tasksResponse = await fetch(`${API_BASE}/manager/users/${userId}/tasks`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!tasksResponse.ok) throw new Error('Error al cargar las tareas del usuario');
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);

        // Fetch user metrics
        const hoursMetricsResponse = await fetch(`${API_BASE}/tasks/kpiUser/hours/${userData.username}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!hoursMetricsResponse.ok) throw new Error('Error al cargar las métricas de horas');
        const hoursMetricsData = await hoursMetricsResponse.json();

        const tasksMetricsResponse = await fetch(`${API_BASE}/tasks/kpiUser/tasks/${userData.username}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!tasksMetricsResponse.ok) throw new Error('Error al cargar las métricas de tareas');
        const tasksMetricsData = await tasksMetricsResponse.json();

        setMetrics({ ...hoursMetricsData, ...tasksMetricsData });

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Detalles de {user?.fullName}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            @{user?.username}
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          {/* Métricas */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>Métricas</Typography>
            {metrics && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary">Total Tareas</Typography>
                            <Typography variant="h5">{metrics.total_tasks}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary">Tareas Completadas</Typography>
                            <Typography variant="h5">{metrics.done_tasks}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary">Total Horas</Typography>
                            <Typography variant="h5">{metrics.total_hours?.toFixed(2)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary">Promedio Horas/Tarea</Typography>
                            <Typography variant="h5">{metrics.avg_hours_per_task?.toFixed(2)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
              </Grid>
            )}
          </Grid>

          {/* Lista de Tareas */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>Tareas Asignadas</Typography>
            <Paper>
              <List>
                {tasks.length > 0 ? (
                  tasks.map((task, index) => (
                    <React.Fragment key={task.id}>
                      <ListItem>
                        <ListItemText
                          primary={task.title}
                          secondary={`Estado: ${task.status} - Horas estimadas: ${task.estimatedHours}`}
                        />
                      </ListItem>
                      {index < tasks.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No hay tareas asignadas a este usuario." />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default UserDetails;
