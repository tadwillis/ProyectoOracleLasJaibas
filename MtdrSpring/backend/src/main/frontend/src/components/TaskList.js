import React, { useState, useEffect } from 'react';
import NewItem from '../NewItem';
import API_LIST from '../API';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button,
  Paper,
  CircularProgress,
  Typography,
  Box,
  Grid,
  Stack
} from '@mui/material';
import Moment from 'react-moment';
import {
  DragDropContext,
  Droppable,
  Draggable
} from "react-beautiful-dnd";

function TaskList() {
  const [isLoading, setLoading] = useState(false);
  const [isInserting, setInserting] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState();

  // === CRUD ===
  function deleteItem(deleteId) {
    fetch(API_LIST + "/" + deleteId, { method: 'DELETE' })
      .then(response => {
        if (response.ok) {
          const remainingItems = items.filter(item => item.id !== deleteId);
          setItems(remainingItems);
        } else {
          throw new Error('Error deleting item');
        }
      })
      .catch(err => setError(err));
  }

  function updateStatus(id, description, status) {
    fetch(API_LIST + "/" + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, status })
    })
      .then(response => {
        if (!response.ok) throw new Error('Error updating item');
        return response.json();
      })
      .then(() => {
        const updated = items.map(x =>
          x.id === id ? { ...x, description, status } : x
        );
        setItems(updated);
      })
      .catch(err => setError(err));
  }

  useEffect(() => {
    setLoading(true);
    fetch(API_LIST)
      .then(response => {
        if (response.ok) return response.json();
        throw new Error('Error fetching list');
      })
      .then(result => {
        setItems(result);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  function addItem(text) {
    setInserting(true);
    fetch(API_LIST, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: text, status: "todo" })
    })
      .then(response => {
        if (!response.ok) throw new Error('Error adding item');
        return response;
      })
      .then(result => {
        const id = result.headers.get('location');
        const newItem = { id, description: text, status: "todo", createdAt: new Date() };
        setItems([newItem, ...items]);
        setInserting(false);
      })
      .catch(err => {
        setError(err);
        setInserting(false);
      });
  }

  // === Drag & Drop handler ===
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const taskId = draggableId;
    const newStatus = destination.droppableId;

    const draggedTask = items.find(i => i.id === taskId);
    if (draggedTask && draggedTask.status !== newStatus) {
      updateStatus(draggedTask.id, draggedTask.description, newStatus);
    }
  };

  const columns = [
    { key: "todo", label: "To Do" },
    { key: "inprogress", label: "In Progress" },
    { key: "done", label: "Done" },
    { key: "cancelled", label: "Cancelled" }
  ];

  return (
    <Box sx={{ maxWidth: "1400px", margin: "2rem auto", p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3}}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Tareas
        </Typography>
        <NewItem addItem={addItem} isInserting={isInserting} />
      </Box>

      {error && <Typography color="error">Error: {error.message}</Typography>}
      {isLoading && <CircularProgress sx={{ display: "block", margin: "2rem auto" }} />}

      {!isLoading && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Grid container spacing={2}>
            {columns.map(col => (
              <Grid item xs={12} md={3} key={col.key}>
                <Typography variant="h6" align="center" sx={{ mb: 2, fontWeight: "bold" }}>
                  {col.label}
                </Typography>
                <Droppable droppableId={col.key}>
                  {(provided) => (
                    <Stack
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      spacing={2}
                      sx={{
                        minHeight: "400px",
                        maxHeight: "600px",
                        overflowY: "auto",
                        backgroundColor: "#f9f9f9",
                        p: 1,
                        borderRadius: 2
                      }}
                    >
                      {items.filter(i => i.status === col.key).map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided) => (
                            <Paper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              elevation={3}
                              sx={{ p: 2, borderRadius: 2 }}
                            >
                              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                                {item.description}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Creado: <Moment format="MMM Do, YYYY">{item.createdAt}</Moment>
                              </Typography>
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                                <Button
                                  startIcon={<DeleteIcon />}
                                  variant="outlined"
                                  size="small"
                                  color="error"
                                  onClick={() => deleteItem(item.id)}
                                >
                                  Delete
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
