// src/components/manager/ManagerUserSelection.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Button
} from '@mui/material';
import TopBar from '../shared/TopBar';
import { UserContext } from '../../context/UserContext';

const API_BASE = 'http://localhost:8080/api/manager';

function ManagerUserSelection() {
  const navigate = useNavigate();
  const { setSelectedUser } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error al cargar usuarios');
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleUserSelect = () => {
    if (selectedUserId) {
      const user = users.find(u => u.id === selectedUserId);
      setSelectedUser(user);
      navigate('/manager/dashboard');
    }
  };

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
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Seleccionar Usuario
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Por favor, selecciona un usuario para ver sus métricas y detalles.
          </Typography>
          <TextField
            select
            fullWidth
            label="Usuario"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            sx={{ mb: 3 }}
          >
            <MenuItem value="">
              <em>Ninguno</em>
            </MenuItem>
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.fullName} (@{user.username})
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            fullWidth
            disabled={!selectedUserId}
            onClick={handleUserSelect}
          >
            Ver Dashboard del Usuario
          </Button>
        </Paper>
      </Container>
    </div>
  );
}

export default ManagerUserSelection;
