// src/components/TopBar.js
import * as React from 'react';
import {
  AppBar, Toolbar, Box, Typography, IconButton, Button, Avatar,
  Menu, MenuItem, Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { NavLink } from 'react-router-dom';

// Ruta del logo
const ORACLE_LOGO = '/img/Oracle-Symbol.png';

const links = [
  { to: '/',           label: 'Inicio' },
  { to: '/dashboard',  label: 'Dashboard' },
  { to: '/teams',      label: 'Equipos' },
  { to: '/projects',   label: 'Proyectos' },
  { to: '/taskList',   label: 'Tareas' },
  { to: '/ranking',    label: 'Ranking' },
];

export default function TopBar() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const activeStyle = ({ isActive }) => ({
    color: isActive ? '#fff' : '#ddd',
    fontWeight: isActive ? 700 : 500,
    textTransform: 'none',
  });

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: '#212121',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Toolbar sx={{ maxWidth: 1680, mx: 'auto', width: '100%' }}>
        {/* Izquierda: logo + marca */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src={ORACLE_LOGO}
            alt="Oracle"
            sx={{ height: 22, width: 'auto' }}
          />
          <Typography sx={{ color: '#fff', fontWeight: 700 }}>Java</Typography>
          <Typography sx={{ color: '#bdbdbd' }}>Bot</Typography>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 1.5, borderColor: 'rgba(255,255,255,0.18)' }}
          />
          <Typography sx={{ color: '#e0e0e0' }}>Equipo 3</Typography>
        </Box>

        {/* Navegación: desktop */}
        <Box sx={{ ml: 4, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          {links.map((l) => (
            <Button
              key={l.to}
              component={NavLink}
              to={l.to}
              sx={activeStyle}
            >
              {l.label}
            </Button>
          ))}
        </Box>

        {/* Espaciador */}
        <Box sx={{ flex: 1 }} />

        {/* Usuario (avatar) */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
          <Avatar sx={{ width: 28, height: 28, bgcolor: '#000' }}>
            <AccountCircle htmlColor="#fff" fontSize="small" />
          </Avatar>
        </Box>

        {/* Menú móvil */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 1 }}>
          <IconButton color="inherit" onClick={handleMenu} size="small">
            <MenuIcon htmlColor="#fff" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            {links.map((l) => (
              <MenuItem
                key={l.to}
                component={NavLink}
                to={l.to}
                onClick={handleClose}
              >
                {l.label}
              </MenuItem>
            ))}
            <Divider />
            <MenuItem disabled>Perfil</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
