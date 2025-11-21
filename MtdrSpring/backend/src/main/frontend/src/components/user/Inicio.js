// src/components/Inicio.js
import React, { useState, useEffect } from 'react';
import TopBar from '../shared/TopBar';
import API_LIST from '../../API';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Chip,
} from '@mui/material';

// ----------------- Tiempos  -----------------
const MOTION = {
  enter: 0.45,         // entrada de secciones/tarjetas
  exit: 0.30,          // salida
  stagger: 0.12,       // desfase entre hijos
  delayChildren: 0.08, // retraso inicial
  underline: 0.55,     // subrayado naranja
  hover: 0.22,         // hover sutil
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

  const prefersReducedMotion = useReducedMotion();
  const cardVariants = prefersReducedMotion ? reduced : fadeInUp;
  const underlineProps = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: MOTION.reduced } } }
    : { initial: { scaleX: 0 }, animate: { scaleX: 1, transition: { duration: MOTION.underline } }, style: { originX: 0 } };

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
    fontWeight: filter === key ? 800 : 500,
    cursor: 'pointer',
    color: filter === key ? '#1f2a37' : '#69707a',
  });

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <TopBar />

      {/* ===== Banner superior ===== */}
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

      {/* ===== Franja azul con botón ===== */}
      <Box
        sx={{
          bgcolor: '#2e5e73',
          color: 'white',
          py: 2,
          px: 3,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <Button
          variant="contained"
          sx={{
            bgcolor: '#e6e6e6',
            color: '#111827',
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: 2,
            px: 2.5,
            '&:hover': { bgcolor: '#dcdcdc' },
          }}
        >
          Telegram Bot
        </Button>
      </Box>

      {/* ===== Sección principal  ===== */}
      <Box sx={{ py: 4, px: 3 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          <motion.div variants={cardVariants} initial="initial" animate="animate" exit="exit">
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: '#1f2a37', textShadow: '0 1px 2px rgba(0,0,0,.06)' }}
              >
                Continuar mis tareas
              </Typography>
              <motion.div {...underlineProps}>
                <Box sx={{ mt: 1, height: 4, width: 120, bgcolor: '#F84600', borderRadius: 2 }} />
              </motion.div>
            </Box>
          </motion.div>

          {/* Filtros (chips)  */}
          <motion.div variants={cardVariants} initial="initial" animate="animate" exit="exit">
            <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
              <Chip
                label="En progreso"
                onClick={() => setFilter('inprogress')}
                sx={{
                  ...isActive('inprogress'),
                  bgcolor: filter === 'inprogress' ? '#ffffff' : '#eef2f7',
                  borderRadius: 2,
                }}
                clickable
                component={motion.div}
                whileHover={!prefersReducedMotion ? { scale: 1.03 } : {}}
                transition={{ type: 'tween', duration: MOTION.hover }}
              />
              <Chip
                label="Terminadas"
                onClick={() => setFilter('done')}
                sx={{
                  ...isActive('done'),
                  bgcolor: filter === 'done' ? '#ffffff' : '#eef2f7',
                  borderRadius: 2,
                }}
                clickable
                component={motion.div}
                whileHover={!prefersReducedMotion ? { scale: 1.03 } : {}}
                transition={{ type: 'tween', duration: MOTION.hover }}
              />
              <Chip
                label="Canceladas"
                onClick={() => setFilter('cancelled')}
                sx={{
                  ...isActive('cancelled'),
                  bgcolor: filter === 'cancelled' ? '#ffffff' : '#eef2f7',
                  borderRadius: 2,
                }}
                clickable
                component={motion.div}
                whileHover={!prefersReducedMotion ? { scale: 1.03 } : {}}
                transition={{ type: 'tween', duration: MOTION.hover }}
              />
              <Chip
                label="Prioridad"
                onClick={() => setFilter('priority')}
                sx={{
                  ...isActive('priority'),
                  bgcolor: filter === 'priority' ? '#ffffff' : '#eef2f7',
                  borderRadius: 2,
                }}
                clickable
                component={motion.div}
                whileHover={!prefersReducedMotion ? { scale: 1.03 } : {}}
                transition={{ type: 'tween', duration: MOTION.hover }}
              />
            </Box>
          </motion.div>

          {loading && (
            <CircularProgress size={28} sx={{ display: 'block', my: 3, mx: 'auto' }} />
          )}
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              Error al cargar tareas: {error.message}
            </Typography>
          )}
          {!loading && filteredTasks.length === 0 && (
            <Typography sx={{ mt: 1, color: '#6b7280' }}>No hay tareas para mostrar.</Typography>
          )}

          {/* Grid de tarjetas con stagger */}
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <Grid container spacing={2}>
              {filteredTasks.map((task) => (
                <Grid item key={task.id}>
                  <Paper
                    elevation={3}
                    component={motion.div}
                    variants={cardVariants}
                    whileHover={!prefersReducedMotion ? { y: -3, scale: 1.01 } : {}}
                    transition={{ type: 'tween', duration: MOTION.hover }}
                    sx={{
                      p: 2.2,
                      width: 260,
                      minHeight: 190,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderRadius: 3,
                      bgcolor: '#ffffff',
                      boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                      transition: 'transform .15s ease, box-shadow .15s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 22px rgba(0,0,0,0.10)',
                      },
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#4b5563', mb: 0.5 }}>
                        {task.assignedTo?.team?.name ?? 'Equipo'}
                      </Typography>

                      <Typography variant="body1" sx={{ fontWeight: 700, mb: 1, color: '#111827' }}>
                        {task.title}
                      </Typography>

                      <Typography variant="caption" display="block" sx={{ color: '#6b7280' }}>
                        Fecha de entrega:{' '}
                        {task.endDate ? String(task.endDate).slice(0, 10) : '—'}
                      </Typography>

                      <Typography variant="caption" display="block" sx={{ color: '#6b7280' }}>
                        Estatus:{' '}
                        <Chip
                          size="small"
                          label={task.status}
                          sx={{
                            height: 22,
                            bgcolor:
                              task.status === 'inprogress' ? 'rgba(46,94,115,0.12)'
                              : task.status === 'done' ? 'rgba(16,185,129,0.14)'
                              : task.status === 'cancelled' ? 'rgba(239,68,68,0.14)'
                              : 'rgba(107,114,128,0.14)',
                            color:
                              task.status === 'inprogress' ? '#2e5e73'
                              : task.status === 'done' ? '#059669'
                              : task.status === 'cancelled' ? '#b91c1c'
                              : '#374151',
                            borderRadius: 1,
                            fontWeight: 700,
                            '& .MuiChip-label': { px: 1 },
                            ml: .5
                          }}
                        />
                      </Typography>

                      <Typography variant="caption" display="block" sx={{ color: '#6b7280' }}>
                        Prioridad:{' '}
                        <Box component="span" sx={{ color: PRIORITY_COLOR(task.priority), fontWeight: 700 }}>
                          {PRIORITY_LABEL(task.priority)}
                        </Box>
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                      <Typography variant="body2" sx={{ color: '#9ca3af' }}></Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
};

export default Inicio;
