// BacklogAnalysis.js
import React, { useState, useEffect } from 'react';
import {
  Button, Paper, LinearProgress, Typography, Box, Grid, Stack,
  Card, CardContent, CardActions, Chip, Divider, List, ListItem, ListItemIcon, ListItemText,
  CircularProgress
} from '@mui/material';
import {
  CheckCircleOutline as CheckIcon,
  Lightbulb as IdeaIcon,
  Speed as SpeedIcon,
  Assignment as TaskIcon,
  Psychology as BrainIcon
} from '@mui/icons-material';
import TopBar from './shared/TopBar';
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
  const [analysisData, setAnalysisData] = useState(null);
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
    setAnalysisData(null);

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
      // data.analysis should now be the structured object
      setAnalysisData(data.analysis);
    } catch (e) {
      console.error('Error analyzing task:', e);
      // Fallback error state
      setAnalysisData({
        complexity: "Error",
        recommendations: ["No se pudo analizar la tarea. Intenta de nuevo."]
      });
    } finally {
      setIsAnalyzing(false);
    }
  }

  const underlineProps = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.25 } } }
    : { initial: { scaleX: 0 }, animate: { scaleX: 1, transition: { duration: 0.55 } }, style: { originX: 0 } };

  // Helper to determine color based on quality score
  const getScoreColor = (score) => {
    if (!score) return '#e0e0e0';
    if (score >= 80) return '#4caf50';
    if (score >= 50) return '#ff9800';
    return '#f44336';
  };

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
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                  Análisis de IA
                </Typography>

                {!selectedTaskId && !analysisData && (
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
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CircularProgress sx={{ color: '#f84600', mb: 2 }} />
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Analizando tarea con Gemini AI...
                    </Typography>
                  </Box>
                )}

                {!isAnalyzing && analysisData && (
                  <Stack spacing={3}>
                    {/* Top Stats Row */}
                    <Grid container spacing={2}>
                      {/* Quality Score */}
                      <Grid item xs={12} sm={4}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            bgcolor: '#fafafa',
                            border: '1px solid #e0e0e0',
                            borderRadius: 2,
                            textAlign: 'center',
                            height: '100%'
                          }}
                        >
                          <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                            CALIDAD
                          </Typography>
                          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                            <CircularProgress
                              variant="determinate"
                              value={analysisData.quality_score || 0}
                              size={60}
                              thickness={4}
                              sx={{ color: getScoreColor(analysisData.quality_score) }}
                            />
                            <Box
                              sx={{
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                position: 'absolute',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography variant="caption" component="div" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                {analysisData.quality_score || 0}%
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>

                      {/* Story Points */}
                      <Grid item xs={6} sm={4}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            bgcolor: '#fafafa',
                            border: '1px solid #e0e0e0',
                            borderRadius: 2,
                            textAlign: 'center',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                            STORY POINTS
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <SpeedIcon sx={{ color: '#2196f3' }} />
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3' }}>
                              {analysisData.story_points || '-'}
                            </Typography>
                          </Stack>
                        </Paper>
                      </Grid>

                      {/* Complexity */}
                      <Grid item xs={6} sm={4}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            bgcolor: '#fafafa',
                            border: '1px solid #e0e0e0',
                            borderRadius: 2,
                            textAlign: 'center',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                            COMPLEJIDAD
                          </Typography>
                          <Chip
                            label={analysisData.complexity || 'Desconocida'}
                            color={analysisData.complexity === 'simple' ? 'success' : analysisData.complexity === 'complex' ? 'error' : 'default'}
                            variant="outlined"
                            sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                          />
                        </Paper>
                      </Grid>
                    </Grid>

                    {/* Recommendations Section */}
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <IdeaIcon sx={{ color: '#f84600' }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>
                          Recomendaciones
                        </Typography>
                      </Stack>
                      
                      <Paper
                        elevation={0}
                        sx={{
                          bgcolor: '#fff',
                          border: '1px solid #e0e0e0',
                          borderRadius: 2,
                          overflow: 'hidden'
                        }}
                      >
                        <List sx={{ py: 0 }}>
                          {analysisData.recommendations && analysisData.recommendations.length > 0 ? (
                            analysisData.recommendations.map((rec, idx) => (
                              <React.Fragment key={idx}>
                                {idx > 0 && <Divider />}
                                <ListItem sx={{ py: 2, px: 3, alignItems: 'flex-start' }}>
                                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                                    <CheckIcon sx={{ color: '#4caf50' }} />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={rec}
                                    primaryTypographyProps={{
                                      variant: 'body2',
                                      sx: { lineHeight: 1.6, color: '#444' }
                                    }}
                                  />
                                </ListItem>
                              </React.Fragment>
                            ))
                          ) : (
                            <ListItem sx={{ py: 3, justifyContent: 'center' }}>
                              <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>
                                No hay recomendaciones específicas para esta tarea.
                              </Typography>
                            </ListItem>
                          )}
                        </List>
                      </Paper>
                    </Box>
                  </Stack>
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