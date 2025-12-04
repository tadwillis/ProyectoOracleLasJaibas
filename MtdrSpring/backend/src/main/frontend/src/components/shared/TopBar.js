// src/components/TopBar.js
import * as React from 'react';
import {
  AppBar, Toolbar, Box, Typography, IconButton, Button,
  Menu, MenuItem, Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { NavLink, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Ruta del logo
const ORACLE_LOGO = '/img/Oracle-Symbol.png';

const links = [
  { to: '/Inicio', label: 'Inicio' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/stories', label: 'User Stories' },
  { to: '/sprints', label: 'Sprints' },
  { to: '/teams', label: 'Equipos' },
  { to: '/projects', label: 'Proyectos' },
  { to: '/taskList', label: 'Tareas' },
  { to: '/backlog-analysis', label: 'Análisis IA' },
];
export default function TopBar() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    navigate('/');
  };

  const activeStyle = ({ isActive }) => ({
    color: isActive ? '#fff' : '#ddd',
    fontWeight: isActive ? 600 : 400,
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.15)'
    }
  });

  const username = localStorage.getItem('username') || 'Usuario';

  let userRole = null;
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userRole = decoded.role;
    } catch (e) {
      console.error("Invalid token in TopBar:", e);
    }
  }

  return (
    <AppBar position="sticky" sx={{ bgcolor: '#1e1e1e' }}>
      <Toolbar>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
          <img
            src={ORACLE_LOGO}
            alt="Oracle Logo"
            style={{ height: 32, marginRight: 8 }}
            onError={(e) => {
              e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Oracle_logo.svg';
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
            Java Bot
          </Typography>
        </Box>

        {/* Navigation Links */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          {links.map((link) => (
            <Button
              key={link.to}
              component={NavLink}
              to={link.to}
              sx={activeStyle}
            >
              {link.label}
            </Button>
          ))}
          {userRole === 'ADMIN' && (
            <Button
              component={NavLink}
              to="/admin"
              sx={activeStyle}
            >
              Admin
            </Button>
          )}
          {(userRole === 'MANAGER' || userRole === 'ADMIN') && (
            <Button
              component={NavLink}
              to="/manager"
              sx={activeStyle}
            >
              Manager
            </Button>
          )}
        </Box>

        {/* User Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#ddd' }}>
            {username}
          </Typography>
          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {username}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { handleClose(); navigate('/dashboard'); }}>
              Mi Dashboard
            </MenuItem>
            <MenuItem onClick={() => { handleClose(); navigate('/myTasks'); }}>
              Mis Tareas
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Box>

        {/* Mobile Menu Icon */}
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          sx={{ display: { xs: 'flex', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
