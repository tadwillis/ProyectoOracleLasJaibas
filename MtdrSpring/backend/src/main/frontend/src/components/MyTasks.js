// MyTasks.js
import React, { useState, useEffect } from 'react';
import API_LIST from '../API';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Button, Paper, LinearProgress, Typography, Box, Grid, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, IconButton
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import TopBar from '../components/TopBar';

// ===================== Utilidades =====================
const normalizeStatus = (s) => {
  if (!s) return 'todo';
  const x = String(s).toLowerCase();
  if (x === 'in_progress' || x === 'in-progress') return 'inprogress';
  return x;
};

const PRIORITY_MAP = { bajo: 0, medio: 1, alto: 2 };
const PRIORITY_LABEL = (n) => ({ 0: 'Bajo', 1: 'Medio', 2: 'Alto' }[Number(n)] ?? 'Bajo');
const PRIORITY_COLOR = (n) => {
  const v = Number(n);
  if (v === 2) return 'error';
  if (v === 1) return 'warning';
  return 'success';
};

const normDate = (s) => (s && String(s).trim() ? String(s).trim() : null);
const normNum = (s) => {
  if (s === null || s === undefined) return null;
  const t = String(s).trim();
  if (t === '') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

const TEAM_ID_DEFAULT = 1;
const STORY_ID_DEFAULT = 1;

// ======= Banner =======
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

// ===================== Componente =====================
function MyTasks() {
  const [isLoading, setLoading] = useState(false);
  const [isInserting, setInserting] = useState(false);
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [error, setError] = useState();

  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', estimatedHours: '', effortHours: '',
    priority: 'bajo', startDate: '', endDate: '', assignedUserId: '',sprintId: ''
  });

  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editStatus, setEditStatus] = useState('todo');
  const [editForm, setEditForm] = useState({
    title: '', description: '', estimatedHours: '', effortHours: '',
    priority: 'bajo', startDate: '', endDate: '', assignedUserId: '',sprintId: ''
  });

  // ======== Cargar ========
  useEffect(() => { loadTasks(); loadUsers(); loadSprints();}, []);

  async function loadUsers() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch('/api/users', { headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` } });
      if (!res.ok) throw new Error('Error al obtener usuarios');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) { console.error('Error usuarios:', e); }
  }

  async function loadTasks() {
    setLoading(true); setError(undefined);
    try {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem('username') || 'Usuario';
      const res = await fetch(`${API_LIST}/username/${username}`, {
        headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` },
        cache: 'no-store', credentials: 'same-origin'
      });
      if (!res.ok) throw new Error(`Error al obtener tareas (HTTP ${res.status})`);
      const data = await res.json();
      const rows = (Array.isArray(data) ? data : []).map(t => {
        const status = normalizeStatus(t.status);
        const assignedUserId = t?.assignedTo?.id ?? t?.assignedUserId ?? t?.ASSIGNED_USER_ID ?? null;
        const assignedTo = t.assignedTo ?? (
          assignedUserId != null
            ? { id: Number(assignedUserId), fullName: t.assignedTo?.fullName ?? t.assignedUserName ?? null }
            : null
        );
        return { ...t, status, assignedTo, ASSIGNED_USER_ID: assignedUserId };
      });
      setItems(rows);
    } catch (e) { setError(e); } finally { setLoading(false); }
  }

  async function loadSprints() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch('/api/sprints', { headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` } });
      if (!res.ok) throw new Error('Error al obtener sprints');
      const data = await res.json();
      setSprints(Array.isArray(data) ? data : []);
    } catch (e) { console.error('Error sprints:', e); }
  }

  // ========= Crear =========
  const canSubmitCreate = () => form.title.trim() !== '';
  const openCreateDialog = () => setOpenCreate(true);
  const closeCreateDialog = () => setOpenCreate(false);
  const handleCreateChange = (e) => { const { name, value } = e.target; setForm(p => ({ ...p, [name]: value })); };

  async function handleCreate(e) {
    e.preventDefault();
    if (!canSubmitCreate()) return;
    setInserting(true);
    try {
      const assignedId = form.assignedUserId === '' ? null : Number(form.assignedUserId);
      const sprintId = form.sprintId === '' ? null : Number(form.sprintId);

      const body = {
        title: form.title.trim(),
        description: form.description.trim(),
        status: 'todo',
        estimatedHours: normNum(form.estimatedHours),
        effortHours: normNum(form.effortHours),
        priority: PRIORITY_MAP[form.priority] ?? 0,
        startDate: normDate(form.startDate),
        endDate: normDate(form.endDate),
        assignedTo: assignedId ? { id: assignedId } : null,
        assignedUserId: assignedId,
        sprint: sprintId ? { id: sprintId } : null,
        ASSIGNED_USER_ID: assignedId
      };
      const qs = new URLSearchParams({ storyId: String(STORY_ID_DEFAULT), teamId: String(TEAM_ID_DEFAULT) }).toString();
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_LIST}?${qs}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', "Authorization": `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Error al crear tarea');
      await loadTasks();
      closeCreateDialog();
      setForm({ title: '', description: '', estimatedHours: '', effortHours: '', priority: 'bajo', startDate: '', endDate: '', assignedUserId: '', sprintId: '' });
    } catch (e) { console.error(e); setError(e); } finally { setInserting(false); }
  }

  // ========= Editar =========
  const openEditDialog = (task) => {
    setEditId(task.id);
    setEditStatus(task.status);
    setEditForm({
      title: task.title || '', description: task.description || '',
      estimatedHours: task.estimatedHours ?? '', effortHours: task.effortHours ?? '',
      priority: (['0', '1', '2'].includes(String(task.priority)) ? { 0: 'bajo', 1: 'medio', 2: 'alto' }[Number(task.priority)] : 'bajo'),
      startDate: task.startDate ? String(task.startDate).slice(0, 10) : '',
      endDate: task.endDate ? String(task.endDate).slice(0, 10) : '',
      assignedUserId: task.assignedTo?.id ?? task.ASSIGNED_USER_ID ?? '',sprintId: task.sprint?.id ?? ''
    });
    setOpenEdit(true);
  };
  const closeEditDialog = () => setOpenEdit(false);
  const handleEditChange = (e) => { const { name, value } = e.target; setEditForm(p => ({ ...p, [name]: value })); };

  async function handleEdit(e) {
    e.preventDefault();
    const assignedId = editForm.assignedUserId === '' ? null : Number(editForm.assignedUserId);
    const sprintId = editForm.sprintId === '' ? null : Number(editForm.sprintId);

    try {
      const body = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        status: editStatus,
        estimatedHours: normNum(editForm.estimatedHours),
        effortHours: normNum(editForm.effortHours),
        priority: PRIORITY_MAP[editForm.priority] ?? 0,
        startDate: normDate(editForm.startDate),
        endDate: normDate(editForm.endDate),
        assignedTo: assignedId ? { id: assignedId } : null,
        assignedUserId: assignedId,
        ASSIGNED_USER_ID: assignedId,
        sprint: sprintId ? { id: sprintId } : null,
      };
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_LIST}/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', "Authorization": `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Error al actualizar tarea');
      await loadTasks();
      closeEditDialog();
    } catch (e2) { console.error(e2); setError(e2); }
  }

  // ========= Eliminar =========
  async function deleteItem(id) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_LIST}/${id}`, { method: 'DELETE', headers: { "Authorization": `Bearer ${token}` } });
      if (!res.ok) throw new Error('Error al eliminar tarea');
      await loadTasks();
    } catch (e) { setError(e); }
  }

  // ========= Drag & Drop =========
  async function updateStatusOptimistic(id, newStatus) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_LIST}/${id}/status?status=${encodeURIComponent(newStatus)}`, {
        method: 'PATCH',
        headers: { 'Accept': 'application/json', "Authorization": `Bearer ${token}` },
        credentials: 'same-origin'
      });

      if (!res.ok) throw new Error('Error al actualizar estado');
      // no se vuelve a cargar todo con loadTasks()
    } catch (e) {
      console.error(e);

      // ⚠️ Si hay error, revertir el cambio local
      setItems(prev =>
        prev.map(i =>
          i.id === id ? { ...i, status: normalizeStatus(i.status) } : i
        )
      );
    }
  }

  function onDragEnd(result) {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId) return;

    const draggedColumn = source.droppableId;
    const targetColumn  = destination.droppableId;
    const filtered = items.filter(i => i.status === draggedColumn);
    const draggedItem = filtered[source.index];
    if (!draggedItem) return;

    // Actualiza inmediatamente en la interfaz
    setItems(prev =>
      prev.map(i =>
        i.id === draggedItem.id ? { ...i, status: targetColumn } : i
      )
    );

    // Sincroniza con el servidor sin recargar la pantalla
    updateStatusOptimistic(draggedItem.id, targetColumn);
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

      {/* Banner */}
      <Box sx={heroSx}>
        <Box sx={{
          maxWidth: 1680, mx: 'auto', px: 2, display: 'flex',
          justifyContent: 'space-between', alignItems: 'center'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,.35)' }}>
            Mis Tareas
          </Typography>
          <Button variant="contained" size="small" onClick={openCreateDialog}
            sx={{ bgcolor: '#f84600ff', borderRadius: 2, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: '#d6370fff' } }}>
            Agregar tarea
          </Button>
        </Box>
      </Box>

      {/* Fondo principal */}
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
        <Box sx={{ maxWidth: 1680, mx: "auto", px: 2 }}>
          {error && <Typography color="error" variant="body2">Error: {error.message}</Typography>}
          {isLoading && (
            <LinearProgress sx={{
              mb: 2, bgcolor: '#2f2f2f',
              '& .MuiLinearProgress-bar': { bgcolor: '#444' }
            }} />
          )}

          {!isLoading && (
            <DragDropContext onDragEnd={onDragEnd}>
              <Grid container spacing={1.5}>
                {columns.map(col => (
                  <Grid item xs={12} sm={6} md={3} key={col.key}>
                    <Typography variant="subtitle1" align="center"
                      sx={{ mb: 1.2, fontWeight: 700, letterSpacing: 0.2 }}>{col.label}</Typography>

                    <Droppable droppableId={col.key}>
                      {(provided) => (
                        <Stack {...provided.droppableProps} ref={provided.innerRef} spacing={1}
                          sx={{
                            minHeight: 300, maxHeight: '55vh', overflowY: 'auto',
                            backgroundColor: '#ffffff', p: 1.25, borderRadius: 2,
                            border: '1px solid #e0e0e0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                          }}>
                          {items.filter(i => i.status === col.key).map((item, index) => (
                            <Draggable key={String(item.id)} draggableId={String(item.id)} index={index}>
                              {(provided) => (
                                <Paper ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                  sx={{ p: 1.25, borderRadius: 2, border: '1px solid #ececec' }}>
                                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{item.title}</Typography>
                                    <Chip label={PRIORITY_LABEL(item.priority)} color={PRIORITY_COLOR(item.priority)} size="small" />
                                  </Stack>

                                  {item.assignedTo && (
                                    <Typography variant="caption" sx={{ display: 'block', mb: 0.3 }}>
                                      Asignado a: {item.assignedTo?.fullName ?? '—'}
                                      {` (ID: ${item.assignedTo?.id ?? item.ASSIGNED_USER_ID ?? '—'})`}
                                    </Typography>
                                  )}

                                  {item.description && (
                                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                      {item.description}
                                    </Typography>
                                  )}

                                  {/* Sprint asignado */}
                                  {item.sprint?.name && (
                                    <Typography variant="caption" sx={{ display: 'block', mb: 0.3 }}>
                                      <b>Sprint:</b> {item.sprint.name}
                                    </Typography>
                                  )}

                                  <Stack spacing={0.25}>
                                    {item.estimatedHours && (
                                      <Typography variant="caption"><b>Estimado:</b> {item.estimatedHours} h</Typography>
                                    )}
                                    {item.effortHours && (
                                      <Typography variant="caption"><b>Esfuerzo:</b> {item.effortHours} h</Typography>
                                    )}
                                  </Stack>

                                  <Box sx={{ display: 'flex', gap: 0.75, mt: 1 }}>
                                    <Button
                                      startIcon={<EditIcon />}
                                      size="small"
                                      variant="contained"
                                      onClick={() => openEditDialog(item)}
                                      sx={{
                                        bgcolor: '#313131',
                                        color: '#fff',
                                        '&:hover': { bgcolor: '#1f1f1f' },
                                        px: 1.25, py: 0.4, minHeight: 0, lineHeight: 1.15, fontSize: 12
                                      }}
                                    >
                                      Editar
                                    </Button>

                                    <IconButton
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
      </Box>

      {/* ========= Diálogo Agregar tarea ========= */}
      <Dialog open={openCreate} onClose={closeCreateDialog} fullWidth maxWidth="sm" component="form" onSubmit={handleCreate}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', gap: 1, pb: 0 }}>
          📝 Crear Nueva Tarea
        </DialogTitle>
        <Box sx={{ height: 3, bgcolor: '#f84600', mt: 1, mb: 2, borderRadius: 2 }} />
        <DialogContent dividers sx={{ py: 2.5, px: 3 }}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 3, bgcolor: '#fcfcfc' }}>
            <Stack spacing={2}>
              <TextField label="Título *" name="title" value={form.title} onChange={handleCreateChange} required fullWidth />
              <TextField label="Descripción" name="description" value={form.description} onChange={handleCreateChange} multiline minRows={3} fullWidth />

              <TextField
                select
                label="Asignar a usuario"
                name="assignedUserId"
                value={String(form.assignedUserId ?? '')}
                onChange={handleCreateChange}
                fullWidth
              >
                <MenuItem value="">Sin asignar</MenuItem>
                {users.map(u => (
                  <MenuItem key={u.id} value={String(u.id)}>{u.fullName}</MenuItem>
                ))}
              </TextField>

              {/* 👇 Nuevo campo Sprint */}
              <TextField
                select
                label="Sprint"
                name="sprintId"
                value={String(form.sprintId ?? '')}
                onChange={handleCreateChange}
                fullWidth
              >
                <MenuItem value="">Sin sprint</MenuItem>
                {sprints.map(s => (
                  <MenuItem key={s.id} value={String(s.id)}>{s.name}</MenuItem>
                ))}
              </TextField>

              {/* ... resto sin tocar ... */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Horas estimadas"
                    name="estimatedHours"
                    value={form.estimatedHours}
                    onChange={handleCreateChange}
                    type="number"
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Horas de esfuerzo"
                    name="effortHours"
                    value={form.effortHours}
                    onChange={handleCreateChange}
                    type="number"
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12}>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      select
                      label="Prioridad"
                      name="priority"
                      value={form.priority}
                      onChange={handleCreateChange}
                      fullWidth
                    >
                      <MenuItem value="bajo">Baja</MenuItem>
                      <MenuItem value="medio">Media</MenuItem>
                      <MenuItem value="alto">Alta</MenuItem>
                    </TextField>

                    <TextField
                      label="Fecha de inicio"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleCreateChange}
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />

                    <TextField
                      label="Fecha de fin"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleCreateChange}
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeCreateDialog} sx={{ color: '#757575', textTransform: 'none' }}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isInserting || !canSubmitCreate()}
            sx={{
              bgcolor: '#f84600',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              '&:hover': { bgcolor: '#d6370f' }
            }}
          >
            {isInserting ? 'Guardando…' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========= Diálogo Editar ========= */}
      <Dialog
        open={openEdit}
        onClose={closeEditDialog}
        fullWidth
        maxWidth="sm"
        component="form"
        onSubmit={handleEdit}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            pb: 0
          }}
        >
          ✏️ Editar Tarea
        </DialogTitle>
        <Box sx={{ height: 3, bgcolor: '#313131', mt: 1, mb: 2, borderRadius: 2 }} />
        <DialogContent dividers sx={{ py: 2.5, px: 3 }}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 3, bgcolor: '#fcfcfc' }}>
            <Stack spacing={2}>
              <TextField
                label="Título *"
                name="title"
                value={editForm.title}
                onChange={handleEditChange}
                required
                fullWidth
              />
              <TextField
                label="Descripción"
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                multiline
                minRows={3}
                fullWidth
              />

              <TextField
                select
                label="Asignar a usuario"
                name="assignedUserId"
                value={String(editForm.assignedUserId ?? '')}
                onChange={handleEditChange}
                fullWidth
              >
                <MenuItem value="">Sin asignar</MenuItem>
                {users.map(u => (
                  <MenuItem key={u.id} value={String(u.id)}>
                    {u.fullName}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Sprint"
                name="sprintId"
                value={String(editForm.sprintId ?? '')}
                onChange={handleEditChange}
                fullWidth
              >
                <MenuItem value="">Sin sprint</MenuItem>
                {sprints.map(s => (
                  <MenuItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </MenuItem>
                ))}
              </TextField>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Horas estimadas"
                    name="estimatedHours"
                    value={editForm.estimatedHours}
                    onChange={handleEditChange}
                    type="number"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Horas de esfuerzo"
                    name="effortHours"
                    value={editForm.effortHours}
                    onChange={handleEditChange}
                    type="number"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      select
                      label="Prioridad"
                      name="priority"
                      value={editForm.priority}
                      onChange={handleEditChange}
                      fullWidth
                    >
                      <MenuItem value="bajo">Baja</MenuItem>
                      <MenuItem value="medio">Media</MenuItem>
                      <MenuItem value="alto">Alta</MenuItem>
                    </TextField>
                    <TextField
                      label="Fecha de inicio"
                      name="startDate"
                      value={editForm.startDate}
                      onChange={handleEditChange}
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                    <TextField
                      label="Fecha de fin"
                      name="endDate"
                      value={editForm.endDate}
                      onChange={handleEditChange}
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeEditDialog} sx={{ color: '#757575', textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: '#313131',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              '&:hover': { bgcolor: '#1f1f1f' }
            }}
          >
            Guardar cambios
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default MyTasks;

