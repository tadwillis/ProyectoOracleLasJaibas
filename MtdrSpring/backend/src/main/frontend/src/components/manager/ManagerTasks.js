import React, { useState, useEffect, useContext } from 'react';
import {
  Typography, Box, Grid, Stack,
  LinearProgress, Chip, Paper, Button, Container
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import TopBar from '../shared/TopBar';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

const API_BASE = '/api';

const normalizeStatus = (s) => {
  if (!s) return 'todo';
  const x = String(s).toLowerCase();
  if (x === 'in_progress' || x === 'in-progress') return 'inprogress';
  return x;
};

const PRIORITY_LABEL = (n) => ({0:'Bajo',1:'Medio',2:'Alto'}[Number(n)] ?? 'Bajo');
const PRIORITY_COLOR = (n) => {
  const v = Number(n);
  if (v === 2) return 'error';
  if (v === 1) return 'warning';
  return 'success';
};

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

function ManagerTasks() {
  const { selectedUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState();

  useEffect(() => {
    if (selectedUser) {
      loadTasksForUser(selectedUser.id);
    }
  }, [selectedUser]);

  async function loadTasksForUser(userId) {
    setLoading(true); setError(undefined);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/tasks/user/${userId}`, {
        headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` },
        cache: 'no-store',
        credentials: 'same-origin'
      });
      if (!res.ok) {
        const t = await res.text().catch(()=> '');
        throw new Error(`Error al obtener tareas (HTTP ${res.status}) ${t}`);
      }
      const data = await res.json();
      const rows = (Array.isArray(data) ? data : []).map(t => {
        const status = normalizeStatus(t.status);
        const assignedUserId = t?.assignedTo?.id ?? t?.assignedUserId ?? t?.ASSIGNED_USER_ID ?? null;
        const assignedTo = t.assignedTo ?? (assignedUserId != null ? { id: Number(assignedUserId), fullName: t.assignedTo?.fullName ?? t.assignedUserName ?? null } : null);
        return { ...t, status, assignedTo, ASSIGNED_USER_ID: assignedUserId };
      });
      setItems(rows);
    } catch (e) {
      console.error(e); setError(e);
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    { key: "todo",       label: "To Do" },
    { key: "inprogress", label: "In Progress" },
    { key: "done",       label: "Done" },
    { key: "cancelled",  label: "Cancelled" }
  ];

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
    <Box sx={heroSx}>
      <Box sx={{ maxWidth: 1680, mx: 'auto', px: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,.35)' }}>
          Tareas de {selectedUser.fullName}
        </Typography>
      </Box>
    </Box>

    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Box sx={{ maxWidth: 1680, mx: "auto", px: 2 }}>
        {error && <Typography color="error" variant="body2">Error: {error.message}</Typography>}
        {isLoading && <LinearProgress sx={{ mb: 2, bgcolor: '#d6d6d6', '& .MuiLinearProgress-bar': { backgroundColor: '#313131' } }} />}
        {!isLoading && (
          <DragDropContext onDragEnd={() => {}}>
            <Grid container spacing={1.5}>
              {columns.map(col => (
                <Grid item xs={12} sm={6} md={3} key={col.key}>
                  <Typography variant="subtitle1" align="center" sx={{ mb: 1.2, fontWeight: 700, letterSpacing: 0.2 }}>
                    {col.label}
                  </Typography>
                  <Droppable droppableId={col.key}>
                    {(provided) => (
                      <Stack
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        spacing={1}
                        sx={{
                          minHeight: 300,
                          maxHeight: '55vh',
                          overflowY: 'auto',
                          backgroundColor: '#ffffff',
                          p: 1.25,
                          borderRadius: 2,
                          border: '1px solid #e0e0e0',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                      >
                        {items
                          .filter(i => i.status === col.key)
                          .map((item, index) => (
                            <Draggable key={String(item.id)} draggableId={String(item.id)} index={index}>
                              {(provided) => (
                                <Paper
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  elevation={1}
                                  style={{ ...provided.draggableProps.style }}
                                  sx={{ p: 1.25, borderRadius: 2, border: '1px solid #ececec' }}
                                >
                                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.15 }}>
                                      {item.title}
                                    </Typography>
                                    <Chip
                                      label={PRIORITY_LABEL(item.priority)}
                                      color={PRIORITY_COLOR(item.priority)}
                                      size="small"
                                      variant="filled"
                                    />
                                  </Stack>
                                  {(item.assignedTo?.fullName || item.assignedTo?.id != null || item.ASSIGNED_USER_ID != null) && (
                                    <Typography variant="caption" sx={{ display: 'block', mb: 0.3 }}>
                                      Asignado a: {item.assignedTo?.fullName ?? '—'}
                                    </Typography>
                                  )}
                                  {item.description && (
                                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                      {item.description}
                                    </Typography>
                                  )}
                                  {item.sprint?.name && (
                                    <Typography variant="caption" sx={{ display: 'block', mb: 0.3 }}>
                                      <b>Sprint:</b> {item.sprint.name}
                                    </Typography>
                                  )}
                                  <Stack spacing={0.25}>
                                    {item.estimatedHours != null && (
                                      <Typography variant="caption"><b>Estimado:</b> {item.estimatedHours} h</Typography>
                                    )}
                                    {item.effortHours != null && (
                                      <Typography variant="caption"><b>Tiempo Esfuerzo:</b> {item.effortHours} h</Typography>
                                    )}
                                  </Stack>
                                </Paper>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </Stack>
                    )}
                  </Droppable>
                </Grid>
              ))}
            </Grid>
          </DragDropContext>
        )}
      </Box>
    </Box>
  </>
);
}

export default ManagerTasks;
