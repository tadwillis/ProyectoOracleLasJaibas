// TaskList.js
import React, { useState, useEffect } from 'react';
import API_LIST from '../API';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Button, Paper, CircularProgress, Typography, Box, Grid, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, IconButton
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import TopBar from '../components/TopBar';

// ===================== Utilidades =====================
const normalizeStatus = (s) => {
  if (!s) return 'todo';
  const x = String(s).toLowerCase();
  if (x === 'in_progress' || x === 'in-progress') return 'inprogress';
  return x; // 'todo' | 'done' | 'cancelled' | 'inprogress'
};

const PRIORITY_MAP   = { bajo: 0, medio: 1, alto: 2 };
const PRIORITY_LABEL = (n) => ({0:'Bajo',1:'Medio',2:'Alto'}[Number(n)] ?? 'Bajo');
const PRIORITY_COLOR = (n) => {
  const v = Number(n);
  if (v === 2) return 'error';   // rojo
  if (v === 1) return 'warning'; // amarillo
  return 'success';              // verde
};

const normDate = (s) => (s && String(s).trim() ? String(s).trim() : null);
const normNum  = (s) => {
  if (s === null || s === undefined) return null;
  const t = String(s).trim();
  if (t === '') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

// IDs por defecto para crear (el back los pide como query params)
const TEAM_ID_DEFAULT  = 1;
const STORY_ID_DEFAULT = 1;

// ======= Banner =======
const BANNER_SRC = "/img/banner-top.png";
const heroSx = {
  position: 'relative',
  left: '50%', right: '50%', ml: '-50vw', mr: '-50vw',
  width: '100vw',
  backgroundImage: `url(${BANNER_SRC})`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  py: { xs: 3, sm: 4 }, // (padding vertical)
};

// ===================== Componente =====================
function TaskList() {
  const [isLoading, setLoading] = useState(false);
  const [isInserting, setInserting] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState();

  // Diálogo "Agregar tarea"
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    estimatedHours: '',
    effortHours: '',
    priority: 'bajo',
    startDate: '',
    endDate: '',
  });

  // Diálogo "Editar tarea"
  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editStatus, setEditStatus] = useState('todo');
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    estimatedHours: '',
    effortHours: '',
    priority: 'bajo',
    startDate: '',
    endDate: '',
  });

  // Cargar tareas
  useEffect(() => { loadTasks(); }, []);

  async function loadTasks() {
    setLoading(true); setError(undefined);
    try {
      const res = await fetch(`${API_LIST}`, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
        credentials: 'same-origin'
      });
      if (!res.ok) {
        const t = await res.text().catch(()=> '');
        throw new Error(`Error al obtener tareas (HTTP ${res.status}) ${t}`);
      }
      const data = await res.json();
      const rows = (Array.isArray(data) ? data : []).map(t => ({
        ...t,
        status: normalizeStatus(t.status)
      }));
      setItems(rows);
    } catch (e) {
      console.error(e); setError(e);
    } finally {
      setLoading(false);
    }
  }

  // =========== Crear ==============
  const canSubmitCreate = () => form.title.trim() !== '';
  const openCreateDialog = () => setOpenCreate(true);
  const closeCreateDialog = () => setOpenCreate(false);
  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  async function handleCreate(e) {
    e.preventDefault();
    if (!canSubmitCreate()) {
      setError(new Error('El Título es obligatorio.'));
      return;
    }
    setInserting(true); setError(undefined);

    const body = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: 'todo',
      estimatedHours: normNum(form.estimatedHours),
      effortHours:   normNum(form.effortHours),
      priority: PRIORITY_MAP[form.priority] ?? 0,
      startDate: normDate(form.startDate),
      endDate:   normDate(form.endDate)
    };

    const qs = new URLSearchParams({
      storyId: String(STORY_ID_DEFAULT),
      teamId:  String(TEAM_ID_DEFAULT)
    }).toString();

    try {
      const res = await fetch(`${API_LIST}?${qs}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const t = await res.text().catch(()=> '');
        throw new Error(`Error al crear la tarea (HTTP ${res.status}) ${t}`);
      }
      await loadTasks();
      setOpenCreate(false);
      setForm({
        title: '',
        description: '',
        estimatedHours: '',
        effortHours: '',
        priority: 'bajo',
        startDate: '',
        endDate: ''
      });
    } catch (e) {
      console.error(e); setError(e);
    } finally {
      setInserting(false);
    }
  }

  // =========== Editar =============
  const openEditDialog = (task) => {
    setEditId(task.id);
    setEditStatus(task.status);
    setEditForm({
      title: task.title || '',
      description: task.description || '',
      estimatedHours: task.estimatedHours ?? '',
      effortHours: task.effortHours ?? '',
      priority: (['0','1','2'].includes(String(task.priority)) ?
                 {0:'bajo',1:'medio',2:'alto'}[Number(task.priority)] : 'bajo'),
      startDate: task.startDate ? String(task.startDate).slice(0,10) : '',
      endDate:   task.endDate   ? String(task.endDate).slice(0,10)   : ''
    });
    setOpenEdit(true);
  };

  const closeEditDialog = () => setOpenEdit(false);
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };
  const canSubmitEdit = () => editForm.title.trim() !== '';

  async function handleEdit(e) {
    e.preventDefault();
    if (!canSubmitEdit()) {
      setError(new Error('El Título es obligatorio.'));
      return;
    }
    setError(undefined);

    const body = {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      status: editStatus,
      estimatedHours: normNum(editForm.estimatedHours),
      effortHours:   normNum(editForm.effortHours),
      priority: PRIORITY_MAP[editForm.priority] ?? 0,
      startDate: normDate(editForm.startDate),
      endDate:   normDate(editForm.endDate)
    };

    try {
      const res = await fetch(`${API_LIST}/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const t = await res.text().catch(()=> '');
        throw new Error(`Error al actualizar la tarea (HTTP ${res.status}) ${t}`);
      }
      await loadTasks();
      setOpenEdit(false);
    } catch (e2) {
      console.error(e2); setError(e2);
    }
  }

  // ============ Eliminar ==============
  async function deleteItem(id) {
    setError(undefined);
    try {
      const res = await fetch(`${API_LIST}/${id}`, { method: 'DELETE', credentials: 'same-origin' });
      if (!res.ok) throw new Error('Error al eliminar tarea');
      await loadTasks();
    } catch (e) { setError(e); }
  }

  // ============ Drag & Drop ==============
  async function updateStatus(id, _description, newStatus) {
    setError(undefined);
    try {
      const res = await fetch(`${API_LIST}/${id}/status?status=${encodeURIComponent(newStatus)}`, {
        method: 'PATCH',
        headers: { 'Accept': 'application/json' },
        credentials: 'same-origin'
      });
      if (!res.ok) throw new Error('Error al actualizar estado');
      await loadTasks();
    } catch (e) { setError(e); }
  }

  function onDragEnd(result) {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId) return;

    const draggedColumn = source.droppableId;
    const targetColumn  = destination.droppableId;
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

  // ===================== UI =====================
  return (
    <>

      <TopBar />

      {/* imagen detrás del título */}
      <Box sx={heroSx}>
        <Box
          sx={{
            maxWidth: 1680,
            mx: 'auto',
            px: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,.35)' }}
          >
            Tablero de Tareas
          </Typography>

          <Button
            variant="contained"
            size="small"
            onClick={openCreateDialog}
            sx={{
              bgcolor: '#f84600ff',
              '&:hover': { bgcolor: '#d6370fff' }
            }}
          >
            Agregar tarea
          </Button>
        </Box>
      </Box>

      {/* separador */}
      <Box sx={{ mt: 3 }} />

      {/* Contenedor principal del tablero */}
      <Box sx={{ maxWidth: 1680, mx: "auto", p: 2 }}>
        {error && <Typography color="error" variant="body2">Error: {error.message}</Typography>}
        {isLoading && <CircularProgress size={28} sx={{ display: 'block', my: 3, mx: 'auto' }} />}

        {!isLoading && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Grid container spacing={1.5}>
              {columns.map(col => (
                <Grid item xs={12} sm={6} md={3} key={col.key}>
                  <Typography
                    variant="subtitle1"
                    align="center"
                    sx={{ mb: 1.2, fontWeight: 700, letterSpacing: 0.2 }}
                  >
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
                          backgroundColor: '#fafafa',
                          p: 1.25,
                          borderRadius: 1.5,
                          border: '1px solid #eee'
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
                                  sx={{
                                    p: 1,
                                    borderRadius: 1.5,
                                    border: '1px solid #ececec'
                                  }}
                                >
                                  {/* Encabezado */}
                                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                                    <Typography
                                      variant="subtitle2"
                                      sx={{ fontWeight: 700, lineHeight: 1.15 }}
                                    >
                                      {item.title}
                                    </Typography>
                                    <Chip
                                      label={PRIORITY_LABEL(item.priority)}
                                      color={PRIORITY_COLOR(item.priority)}
                                      size="small"
                                      variant="filled"
                                    />
                                  </Stack>

                                  {/* Descripción */}
                                  {item.description && (
                                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                      {item.description}
                                    </Typography>
                                  )}

                                  {/* Detalles */}
                                  <Stack spacing={0.25}>
                                    <Typography variant="caption"><b>Estimado:</b> {item.estimatedHours ?? '-'} h</Typography>
                                    <Typography variant="caption"><b>Tiempo Esfuerzo:</b> {item.effortHours ?? '-'} h</Typography>
                                    <Typography variant="caption"><b>Inicio:</b> {item.startDate ? String(item.startDate).slice(0,10) : '-'}</Typography>
                                    <Typography variant="caption"><b>Fin:</b> {item.endDate ? String(item.endDate).slice(0,10) : '-'}</Typography>
                                  </Stack>

                                  {/* Acciones */}
                                  <Box sx={{ display: 'flex', gap: 0.75, mt: 1, alignItems: 'center' }}>
                                    <Button
                                      startIcon={<EditIcon />}
                                      variant="contained"
                                      size="small"
                                      onClick={() => openEditDialog(item)}
                                      sx={{
                                        bgcolor: '#313131',        // gris resaltado
                                        color: '#ffffff',
                                        '&:hover': { bgcolor: '#313131' },
                                        px: 1.25, py: 0.4, minHeight: 0, lineHeight: 1.15, fontSize: 12
                                      }}
                                    >
                                      Editar
                                    </Button>

                                    {/* Solo ícono, centrado */}
                                    <IconButton
                                      aria-label="Eliminar"
                                      color="error"
                                      size="small"
                                      onClick={() => deleteItem(item.id)}
                                      sx={{ width: 32, height: 32 }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
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

      {/* Diálogo Agregar tarea */}
      <Dialog open={openCreate} onClose={closeCreateDialog} fullWidth maxWidth="sm" component="form" onSubmit={handleCreate}>
        <DialogTitle sx={{ py: 1.25, fontSize: 18 }}>Nueva tarea</DialogTitle>
        <DialogContent dividers sx={{ py: 1.5 }}>
          <Stack spacing={1.25}>
            <TextField label="Título" name="title" value={form.title} onChange={handleCreateChange} required size="small" fullWidth />
            <TextField label="Descripción" name="description" value={form.description} onChange={handleCreateChange} multiline minRows={2} size="small" fullWidth />
            <Stack direction="row" spacing={1.25}>
              <TextField label="Horas estimadas" name="estimatedHours" value={form.estimatedHours} onChange={handleCreateChange} type="number" inputProps={{ step: '1', min: '0' }} size="small" fullWidth />
              <TextField label="Horas de esfuerzo" name="effortHours" value={form.effortHours} onChange={handleCreateChange} type="number" inputProps={{ step: '1', min: '0' }} size="small" fullWidth />
            </Stack>
            <TextField select label="Prioridad" name="priority" value={form.priority} onChange={handleCreateChange} size="small" fullWidth>
              <MenuItem value="bajo">Bajo</MenuItem>
              <MenuItem value="medio">Medio</MenuItem>
              <MenuItem value="alto">Alto</MenuItem>
            </TextField>
            <Stack direction="row" spacing={1.25}>
              <TextField label="Fecha de inicio" name="startDate" value={form.startDate} onChange={handleCreateChange} type="date" InputLabelProps={{ shrink: true }} size="small" fullWidth />
              <TextField label="Fecha de fin" name="endDate" value={form.endDate} onChange={handleCreateChange} type="date" InputLabelProps={{ shrink: true }} size="small" fullWidth />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ py: 1 }}>
          <Button onClick={closeCreateDialog} size="small">Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isInserting || !canSubmitCreate()}
            size="small"
            sx={{ bgcolor: '#F80000', '&:hover': { bgcolor: '#C00000' } }}
          >
            {isInserting ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo Editar tarea */}
      <Dialog open={openEdit} onClose={closeEditDialog} fullWidth maxWidth="sm" component="form" onSubmit={handleEdit}>
        <DialogTitle sx={{ py: 1.25, fontSize: 18 }}>Editar tarea</DialogTitle>
        <DialogContent dividers sx={{ py: 1.5 }}>
          <Stack spacing={1.25}>
            <TextField label="Título" name="title" value={editForm.title} onChange={handleEditChange} required size="small" fullWidth />
            <TextField label="Descripción" name="description" value={editForm.description} onChange={handleEditChange} multiline minRows={2} size="small" fullWidth />
            <Stack direction="row" spacing={1.25}>
              <TextField label="Horas estimadas" name="estimatedHours" value={editForm.estimatedHours} onChange={handleEditChange} type="number" inputProps={{ step: '0.25', min: '0' }} size="small" fullWidth />
              <TextField label="Horas de esfuerzo" name="effortHours" value={editForm.effortHours} onChange={handleEditChange} type="number" inputProps={{ step: '0.25', min: '0' }} size="small" fullWidth />
            </Stack>
            <TextField select label="Prioridad" name="priority" value={editForm.priority} onChange={handleEditChange} size="small" fullWidth>
              <MenuItem value="bajo">Bajo</MenuItem>
              <MenuItem value="medio">Medio</MenuItem>
              <MenuItem value="alto">Alto</MenuItem>
            </TextField>
            <Stack direction="row" spacing={1.25}>
              <TextField label="Fecha de inicio" name="startDate" value={editForm.startDate} onChange={handleEditChange} type="date" InputLabelProps={{ shrink: true }} size="small" fullWidth />
              <TextField label="Fecha de fin" name="endDate" value={editForm.endDate} onChange={handleEditChange} type="date" InputLabelProps={{ shrink: true }} size="small" fullWidth />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ py: 1 }}>
          <Button onClick={closeEditDialog} size="small">Cancelar</Button>
          <Button type="submit" variant="contained" size="small" sx={{ bgcolor: '#313131', color:'#ffffff', '&:hover': { bgcolor: '#313131' } }}>
            Guardar cambios
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default TaskList;
