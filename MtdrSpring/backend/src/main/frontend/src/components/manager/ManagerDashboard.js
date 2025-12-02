import React, { useContext } from 'react';
import { Container, Grid, Card, CardActionArea, CardContent, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { People, AccountTree, Loop, Groups, Assignment } from '@mui/icons-material';
import TopBar from '../shared/TopBar';
import { UserContext } from '../../context/UserContext';

const menuItems = [
  { text: 'Usuarios', path: '/manager/users', icon: <People fontSize="large" /> },
  { text: 'Proyectos', path: '/manager/projects', icon: <AccountTree fontSize="large" /> },
  { text: 'Sprints', path: '/manager/sprints', icon: <Loop fontSize="large" /> },
  { text: 'Equipos', path: '/manager/teams', icon: <Groups fontSize="large" /> },
  { text: 'Tareas', path: '/manager/tasks', icon: <Assignment fontSize="large" /> },
];

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { selectedUser } = useContext(UserContext);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            Manager Dashboard
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/manager')}>
            Cambiar Usuario
          </Button>
        </Box>
        {selectedUser && (
          <Typography variant="h6" sx={{ mb: 4 }}>
            Viendo información para: <strong>{selectedUser.fullName}</strong>
          </Typography>
        )}
        <Grid container spacing={4}>
          {menuItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.text}>
              <Card raised sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea onClick={() => navigate(item.path)} sx={{ flexGrow: 1 }}>
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <Box sx={{ mb: 2 }}>{item.icon}</Box>
                    <Typography variant="h5" component="div">
                      {item.text}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
};

export default ManagerDashboard;
