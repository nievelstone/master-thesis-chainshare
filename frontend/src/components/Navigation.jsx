import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button, 
  useTheme,
  useMediaQuery,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Upload, FolderOpen, Coins, LogOut, Menu } from 'lucide-react';
import { styled } from '@mui/system';
import TokenDisplay from './TokenDisplay';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  boxShadow: 'none',
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: '#ffffff',
  marginLeft: theme.spacing(2),
  borderRadius: '20px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
}));

const LogoLink = styled(Link)({
  textDecoration: 'none',
  color: 'inherit',
  '&:hover': {
    textDecoration: 'none',
  },
});

const Navigation = ({ isAuthenticated, setIsAuthenticated }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const navigationItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/chat", icon: MessageSquare, label: "AI Chat" },
    { to: "/upload", icon: Upload, label: "Upload" },
    { to: "/documents", icon: FolderOpen, label: "Documents" },
    { to: "/token", icon: Coins, label: "Tokens" },
  ];

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          ChainShare
        </Typography>
      </Box>
      <Divider />
      <List>
        {navigationItems.map(({ to, icon: Icon, label }) => (
          <ListItem key={to} disablePadding>
            <ListItemButton
              selected={location.pathname === to}
              onClick={() => {
                navigate(to);
                handleDrawerToggle();
              }}
              sx={{
                mx: 1,
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 138, 0, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 138, 0, 0.12)',
                  }
                }
              }}
            >
              <ListItemIcon>
                <Icon size={20} />
              </ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              mx: 1,
              borderRadius: 1,
              color: theme.palette.error.main
            }}
          >
            <ListItemIcon>
              <LogOut size={20} color={theme.palette.error.main} />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <StyledAppBar position="static">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isAuthenticated && isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              data-testid="main-menu"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <Menu />
            </IconButton>
          )}
          <LogoLink to="/">
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
              ChainShare
            </Typography>
          </LogoLink>
        </Box>
        
        {isAuthenticated && (
          <>
            {isMobile ? (
              <>
                <TokenDisplay />
                <Drawer
                  variant="temporary"
                  anchor="left"
                  open={mobileOpen}
                  onClose={handleDrawerToggle}
                  ModalProps={{
                    keepMounted: true, // Better open performance on mobile
                  }}
                  sx={{
                    '& .MuiDrawer-paper': { width: 250 },
                  }}
                >
                  {drawer}
                </Drawer>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {navigationItems.map(({ to, icon: Icon, label }) => (
                    <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
                      {({ isActive }) => (
                        <NavButton
                          startIcon={<Icon size={18} />}
                          sx={{
                            ...(isActive && {
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            }),
                          }}
                        >
                          {label}
                        </NavButton>
                      )}
                    </NavLink>
                  ))}
                </Box>
                
                <TokenDisplay />
                
                <NavButton startIcon={<LogOut size={18} />} onClick={handleLogout}>
                  Logout
                </NavButton>
              </Box>
            )}
          </>
        )}
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navigation;