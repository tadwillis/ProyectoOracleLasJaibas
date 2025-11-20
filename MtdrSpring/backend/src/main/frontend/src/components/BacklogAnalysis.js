// BacklogAnalysis.js
import React, { useState, useEffect } from 'react';
import {
  Button, Paper, LinearProgress, Typography, Box, Grid, Stack,
  Card, CardContent, CardActions, Chip
} from '@mui/material';
import TopBar from '../components/TopBar';
import { motion, useReducedMotion } from 'framer-motion';

const BANNER_SRC = "/img/banner-top.png";
const heroSx = {
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
};

const PRIORITY_LABEL = (n) => ({ 0: 'Bajo', 1: 'Medio', 2: 'Alto' }[Number(n)] ?? 'Bajo');
const PRIORITY_COLOR = (n) => {
  const v = Number(n);
  if (v === 2) return 'error';
  if (v === 1) return 'warning';
  return 'success';
};

function BacklogAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [todoTasks, setTodoTasks] = useState([]);
  const [error, setError] = useState();
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    loadTodoTasks();
  }, []);

  async function loadTodoTasks() {
    setIsLoading(true);
    setError(undefined);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch('/api/tasks', {
        headers: {
          'Accept': 'application/json',
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Error al obtener tareas');
      }

      const data = await res.json();
      // Filter only TODO tasks
      const todos = data.filter(task => 
        task.status && task.status.toLowerCase() === 'todo'
      );
      setTodoTasks(todos);
    } catch (e) {
      console.error(e);
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function analyzeTask(taskId) {
    setSelectedTaskId(taskId);
    setIsAnalyzing(true);
    setAnalysis('🤖 Analizando tarea con IA...');

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/tasks/${taskId}/analyze`, {
        headers: {
          'Accept': 'application/json',
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Error al analizar la tarea');
      }

      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (e) {
      console.error('Error analyzing task:', e);
      setAnalysis('❌ Error al analizar la tarea. Por favor intenta de nuevo.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  const underlineProps = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.25 } } }
    : { initial: { scaleX: 0 }, animate: { scaleX: 1, transition: { duration: 0.55 } }, style: { originX: 0 } };

  return (
    <>
      <TopBar />

      {/* Banner */}
      <Box sx={heroSx}>
        <Box sx={{ maxWidth: 1680, mx: 'auto', px: 2 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,.35)' }}
          >
            🤖 Análisis de Backlog con IA
          </Typography>
          <motion.div {...underlineProps}>
            <Box sx={{ mt: 1, height: 3, width: 80, bgcolor: '#f84600ff', borderRadius: 2 }} />
          </motion.div>
          <Typography variant="body2" sx={{ color: '#fff', mt: 1, opacity: 0.9 }}>
            Analiza las tareas en tu backlog TODO y obtén recomendaciones de IA
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
        <Box sx={{ maxWidth: 1680, mx: "auto", px: 2 }}>
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              Error: {error.message}
            </Typography>
          )}

          {isLoading && (
            <LinearProgress
              sx={{
                mb: 2,
                bgcolor: '#d6d6d6',
                '& .MuiLinearProgress-bar': { bgcolor: '#f84600' },
              }}
            />
          )}

          <Grid container spacing={3}>
            {/* Left: Task List */}
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                  Tareas en TODO ({todoTasks.length})
                </Typography>

                {todoTasks.length === 0 && !isLoading && (
                  <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', py: 4 }}>
                    No hay tareas en TODO
                  </Typography>
                )}

                <Stack spacing={1.5}>
                  {todoTasks.map((task) => (
                    <Card
                      key={task.id}
                      elevation={selectedTaskId === task.id ? 4 : 1}
                      sx={{
                        border: selectedTaskId === task.id ? '2px solid #f84600' : '1px solid #e0e0e0',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 3
                        }
                      }}
                    >
                      <CardContent sx={{ pb: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {task.title}
                          </Typography>
                          <Chip
                            label={PRIORITY_LABEL(task.priority)}
                            color={PRIORITY_COLOR(task.priority)}
                            size="small"
                          />
                        </Stack>

                        {task.description && (
                          <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#666' }}>
                            {task.description.length > 100
                              ? `${task.description.substring(0, 100)}...`
                              : task.description}
                          </Typography>
                        )}

                        {task.estimatedHours && (
                          <Typography variant="caption" sx={{ display: 'block', color: '#999' }}>
                            ⏱️ {task.estimatedHours} horas estimadas
                          </Typography>
                        )}
                      </CardContent>

                      <CardActions sx={{ pt: 0 }}>
                        <Button
                          size="small"
                          variant={selectedTaskId === task.id ? "contained" : "outlined"}
                          onClick={() => analyzeTask(task.id)}
                          disabled={isAnalyzing}
                          sx={{
                            bgcolor: selectedTaskId === task.id ? '#f84600' : 'transparent',
                            color: selectedTaskId === task.id ? '#fff' : '#f84600',
                            borderColor: '#f84600',
                            '&:hover': {
                              bgcolor: selectedTaskId === task.id ? '#d6370f' : 'rgba(248, 70, 0, 0.04)',
                              borderColor: '#d6370f'
                            }
                          }}
                        >
                          {selectedTaskId === task.id && isAnalyzing ? 'Analizando...' : '🤖 Analizar'}
                        </Button>
                      </CardActions>
                    </Card>
                  ))}
                </Stack>
              </Paper>
            </Grid>

            {/* Right: Analysis Result */}
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 3, borderRadius: 2, minHeight: 400 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                  Análisis de IA
                </Typography>

                {!selectedTaskId && !analysis && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      py: 8,
                      color: '#999'
                    }}
                  >
                    <Typography variant="h1" sx={{ fontSize: 80, mb: 2 }}>
                      🤖
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666' }}>
                      Selecciona una tarea de la izquierda para analizarla
                    </Typography>
                  </Box>
                )}

                {isAnalyzing && (
                  <>
                    <LinearProgress
                      sx={{
                        mb: 2,
                        bgcolor: '#f5f5f5',
                        '& .MuiLinearProgress-bar': { bgcolor: '#f84600' }
                      }}
                    />
                    <Typography variant="body2" sx={{ textAlign: 'center', color: '#666' }}>
                      Analizando tarea con Gemini AI...
                    </Typography>
                  </>
                )}

                {!isAnalyzing && analysis && (
                  <Paper elevation={0} sx={{ p: 3, bgcolor: '#fcfcfc', borderRadius: 2 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        whiteSpace: 'pre-line',
                        lineHeight: 1.8,
                        color: '#333'
                      }}
                    >
                      {analysis}
                    </Typography>
                  </Paper>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
}

export default BacklogAnalysis;