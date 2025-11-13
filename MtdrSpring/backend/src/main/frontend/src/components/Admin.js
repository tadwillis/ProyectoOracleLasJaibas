// src/components/Admin.js
import React from 'react';
import { Typography, Container, Paper } from '@mui/material';
import TopBar from './TopBar';

function Admin() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar />
      <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Panel de Administración
          </Typography>
          <Typography variant="body1">
            Bienvenido al panel de administración. Aquí podrás gestionar usuarios, proyectos y otras configuraciones del sistema.
          </Typography>
        </Paper>
      </Container>
    </div>
  );
}

export default Admin;
