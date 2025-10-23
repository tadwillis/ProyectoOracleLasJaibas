import React, { useState, useEffect } from 'react';
import TopBar from './TopBar';
import API_LIST from '../API';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  CircularProgress,
} from '@mui/material';

const normalizeStatus = (s) => {
  if (!s) return 'todo';
  const x = String(s).toLowerCase();
  if (x === 'in_progress' || x === 'in-progress') return 'inprogress';
  return x; // 'todo' | 'done' | 'cancelled' | 'inprogress'
};

const PRIORITY_LABEL = (n) =>
  ({ 0: 'Bajo', 1: 'Medio', 2: 'Alto' }[Number(n)] ?? 'Bajo');
const PRIORITY_COLOR = (n) => {
  const v = Number(n);
  if (v === 2) return '#f44336';
  if (v === 1) return '#ff9800';
  return '#4caf50';
};

const Inicio = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('inprogress');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    setLoading(true);
    setError(undefined);
    try {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username') || 'Usuario';
      const res = await fetch(`${API_LIST}/username/${username}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`Error al obtener tareas (HTTP ${res.status})`);
      const data = await res.json();

      const rows = (Array.isArray(data) ? data : []).map((t) => ({
        ...t,
        status: normalizeStatus(t.status),
        priority: Number(t.priority ?? 0),
      }));
      setTasks(rows);
    } catch (e) {
      console.error(e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  const filteredTasks =
    filter === 'priority'
      ? [...tasks].sort((a, b) => b.priority - a.priority)
      : tasks.filter((t) => t.status === filter);

  const isActive = (key) => ({
    fontWeight: filter === key ? 'bold' : 'normal',
    cursor: 'pointer',
    textDecoration: filter === key ? 'underline' : 'none',
  });

  return (
    <Box sx={{ bgcolor: '#f8f6f1', minHeight: '100vh' }}>
      <TopBar />

      {/* Banner superior */}
      <Box
        sx={{
          backgroundImage: 'url("/img/banner-top2.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: 240,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          textAlign: 'right',
          pr: 8,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: 'rgba(255,255,255,0.9)',
            textShadow: '0 2px 5px rgba(0,0,0,0.6)',
            letterSpacing: 0.5,
          }}
        >
          Bienvenido
        </Typography>
      </Box>

      {/* Franja de color azul (solo botón Telegram Bot) */}
      <Box
        sx={{
          bgcolor: '#2f5f73',
          color: 'white',
          p: 2,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Button
          variant="contained"
          sx={{
            bgcolor: '#e6e6e6',
            color: 'black',
            fontWeight: 'bold',
            textTransform: 'none',
            '&:hover': { bgcolor: '#dcdcdc' },
          }}
        >
          Telegram Bot
        </Button>
      </Box>

      {/* Sección inferior */}
      <Box sx={{ p: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'serif',
            color: '#8a8573',
            mb: 2,
          }}
        >
          Continuar mis tareas
        </Typography>

        {/* Filtros */}
        <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
          <Typography sx={isActive('inprogress')} onClick={() => setFilter('inprogress')}>
            En progreso
          </Typography>
          <Typography sx={isActive('done')} onClick={() => setFilter('done')}>
            Terminadas
          </Typography>
          <Typography sx={isActive('cancelled')} onClick={() => setFilter('cancelled')}>
            Canceladas
          </Typography>
          <Typography sx={isActive('priority')} onClick={() => setFilter('priority')}>
            Prioridad
          </Typography>
        </Box>

        {loading && (
          <CircularProgress size={28} sx={{ display: 'block', my: 3, mx: 'auto' }} />
        )}
        {error && (
          <Typography color="error">
            Error al cargar tareas: {error.message}
          </Typography>
        )}

        {!loading && filteredTasks.length === 0 && (
          <Typography sx={{ mt: 2 }}>No hay tareas para mostrar.</Typography>
        )}

        {/* Tarjetas */}
        <Grid container spacing={2}>
          {filteredTasks.map((task) => (
            <Grid item key={task.id}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  width: 220,
                  minHeight: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="subtitle2">
                    {task.assignedTo?.team?.name ?? 'Equipo'}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {task.title}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Fecha de entrega: {task.endDate ? String(task.endDate).slice(0, 10) : '—'}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Estatus: {task.status}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Prioridad:{' '}
                    <span style={{ color: PRIORITY_COLOR(task.priority) }}>
                      {PRIORITY_LABEL(task.priority)}
                    </span>
                  </Typography>
                </Box>
                <Box sx={{ alignSelf: 'flex-end', mt: 1 }}>
                  <Typography variant="body2">♡</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Inicio;
