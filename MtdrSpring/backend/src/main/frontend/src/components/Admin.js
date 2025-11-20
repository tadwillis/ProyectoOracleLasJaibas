// src/components/Admin.js
import React, { useState } from 'react';
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Assignment as ProjectIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Storage as DatabaseIcon
} from '@mui/icons-material';
import TopBar from './TopBar';
import AdminUsers from './AdminUsers'; // Importar el nuevo componente

// Componente para el panel de tabs
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

// Componente Dashboard Overview
function DashboardOverview() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
          Panel de Control
        </Typography>
      </Grid>
      
      {/* Tarjetas de estadísticas */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Usuarios
            </Typography>
            <Typography variant="h4">
              150
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Equipos Activos
            </Typography>
            <Typography variant="h4">
              12
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Proyectos
            </Typography>
            <Typography variant="h4">
              28
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Tareas Completadas
            </Typography>
            <Typography variant="h4">
              432
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Sección de accesos rápidos */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Accesos Rápidos
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Gestión de Usuarios" secondary="Administrar cuentas de usuario" />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary="Gestión de Equipos" secondary="Configurar equipos y miembros" />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <ProjectIcon />
              </ListItemIcon>
              <ListItemText primary="Proyectos" secondary="Supervisar todos los proyectos" />
            </ListItem>
          </List>
        </Paper>
      </Grid>
      
      {/* Sección de actividad reciente */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Actividad Reciente
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Nuevo usuario registrado" 
                secondary="hace 5 minutos" 
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText 
                primary="Proyecto 'Sprint 2024' completado" 
                secondary="hace 2 horas" 
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText 
                primary="Equipo 'Desarrollo Frontend' actualizado" 
                secondary="hace 1 día" 
              />
            </ListItem>
          </List>
        </Paper>
      </Grid>
    </Grid>
  );
}

// Componente placeholder para equipos
function AdminTeams() {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Gestión de Equipos
      </Typography>
      <Typography variant="body1">
        Funcionalidad de gestión de equipos próximamente...
      </Typography>
    </Box>
  );
}

// Componente placeholder para proyectos
function AdminProjects() {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Gestión de Proyectos
      </Typography>
      <Typography variant="body1">
        Funcionalidad de gestión de proyectos próximamente...
      </Typography>
    </Box>
  );
}

// Componente placeholder para configuración
function AdminSettings() {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Configuración del Sistema
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Seguridad
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Política de contraseñas" 
                  secondary="Configurar requisitos de contraseña"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Autenticación de dos factores" 
                  secondary="Habilitar 2FA para todos los usuarios"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <DatabaseIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Base de Datos
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Respaldos automáticos" 
                  secondary="Configurar frecuencia de backups"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Limpieza de datos" 
                  secondary="Eliminar datos antiguos"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function Admin() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar />
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
          Panel de Administración
        </Typography>
        
        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="admin tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab 
                label="Dashboard" 
                icon={<DashboardIcon />} 
                iconPosition="start"
                {...a11yProps(0)} 
              />
              <Tab 
                label="Usuarios" 
                icon={<PersonIcon />} 
                iconPosition="start"
                {...a11yProps(1)} 
              />
              <Tab 
                label="Equipos" 
                icon={<GroupIcon />} 
                iconPosition="start"
                {...a11yProps(2)} 
              />
              <Tab 
                label="Proyectos" 
                icon={<ProjectIcon />} 
                iconPosition="start"
                {...a11yProps(3)} 
              />
              <Tab 
                label="Configuración" 
                icon={<SettingsIcon />} 
                iconPosition="start"
                {...a11yProps(4)} 
              />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <DashboardOverview />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <AdminUsers />
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <AdminTeams />
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <AdminProjects />
          </TabPanel>
          
          <TabPanel value={tabValue} index={4}>
            <AdminSettings />
          </TabPanel>
        </Paper>
      </Container>
    </div>
  );
}

export default Admin;