// TaskList.js
import React, { useState, useEffect } from 'react';
import NewItem from '../NewItem';
import API_LIST from '../API';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button, Paper, CircularProgress, Typography, Box, Grid, Stack
} from '@mui/material';
import Moment from 'react-moment';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";


const normalizeStatus = (s) => {
  if (!s) return 'todo';
  const x = String(s).toLowerCase();
  if (x === 'in_progress' || x === 'in-progress') return 'inprogress';
  return x; // 'todo' | 'done' | 'cancelled' | 'inprogress'
};

function TaskList() {
  const [isLoading, setLoading] = useState(false);
  const [isInserting, setInserting] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState();

  const STORY_ID = 1;
  const TEAM_ID  = 1;

  useEffect(() => { loadTasks(); }, []);

  async function loadTasks() {
    setLoading(true); setError(undefined);
    try {
      let res = await fetch(`${API_LIST}/story/${STORY_ID}`, {
        cache: 'no-store', credentials: 'same-origin', headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) {
        const t = await res.text().catch(()=>'');
        throw new Error(`Error al obtener tareas (HTTP ${res.status}) ${t}`);
      }
      const data = await res.json();
      setItems((Array.isArray(data)?data:[]).map(t => ({ ...t, status: normalizeStatus(t.status) })));
    } catch (e) {
      console.error(e); setError(e);
    } finally {
      setLoading(false);
    }
  }

  // Crear tarea -> siempre con status 'todo' (columna "To Do")
  async function addItem(description) {
    if (!description.trim()) return;
    setInserting(true); setError(undefined);
    const body = {
      title: description,            
      description: description || '',
      status: 'todo',               
      priority: 0
    };
    try {
      const res = await fetch(`${API_LIST}?storyId=${STORY_ID}&teamId=${TEAM_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const t = await res.text().catch(()=> '');
        throw new Error(`Error al crear la tarea (HTTP ${res.status}) ${t}`);
      }
      // Recarga desde el back para evitar inconsistencias
      await loadTasks();
    } catch (e) {
      console.error(e); setError(e);
    } finally {
      setInserting(false);
    }
  }

  // Eliminar
  async function deleteItem(id) {
    setError(undefined);
    try {
      const res = await fetch(`${API_LIST}/${id}`, { method: 'DELETE', credentials: 'same-origin' });
      if (!res.ok) throw new Error('Error al eliminar tarea');
      await loadTasks();
    } catch (e) { setError(e); }
  }

  // Actualizar estado usando PATCH /{id}/status?status=...
  async function updateStatus(id, _description, newStatus) {
    setError(undefined);
    try {
      const res = await fetch(`${API_LIST}/${id}/status?status=${encodeURIComponent(newStatus)}`, {
        method: 'PATCH', headers: { 'Accept':'application/json' }, credentials: 'same-origin'
      });
      if (!res.ok) throw new Error('Error al actualizar estado');
      await loadTasks();
    } catch (e) { setError(e); }
  }

  // Drag & Drop
  function onDragEnd(result) {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId) return;

    const draggedColumn = source.droppableId;
    const targetColumn = destination.droppableId;
    const filtered = items.filter(i => i.status === draggedColumn);
    const draggedItem = filtered[source.index];
    if (draggedItem) updateStatus(draggedItem.id, draggedItem.description || draggedItem.title, targetColumn);
  }

  const columns = [
    { key: "todo",       label: "To Do" },
    { key: "inprogress", label: "In Progress" },
    { key: "done",       label: "Done" },
    { key: "cancelled",  label: "Cancelled" }
  ];

  return (
    <Box sx={{ maxWidth: "1400px", margin: "2rem auto", p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>Tablero de Tareas</Typography>
        <NewItem addItem={addItem} isInserting={isInserting} />
      </Box>

      {error && <Typography color="error">Error: {error.message}</Typography>}
      {isLoading && <CircularProgress sx={{ display: 'block', m: '2rem auto' }} />}

      {!isLoading && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Grid container spacing={2}>
            {columns.map(col => (
              <Grid item xs={12} md={3} key={col.key}>
                <Typography variant="h6" align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
                  {col.label}
                </Typography>
                <Droppable droppableId={col.key}>
                  {(provided) => (
                    <Stack
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      spacing={2}
                      sx={{ minHeight: 400, maxHeight: '70vh', overflowY: 'auto', backgroundColor: '#f9f9f9', p: 2, borderRadius: 2 }}
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
                                elevation={3}
                                sx={{ p: 2, borderRadius: 2 }}
                              >
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                  {item.title || item.description}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Creado:{' '}
                                  <Moment format="MMM Do, YYYY">
                                    {item.createdAt}
                                  </Moment>
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                                  <Button
                                    startIcon={<DeleteIcon />}
                                    variant="outlined"
                                    size="small"
                                    color="error"
                                    onClick={() => deleteItem(item.id)}
                                  >
                                    Eliminar
                                  </Button>
                                </Box>
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
  );
}

export default TaskList;
