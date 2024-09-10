import { Drawer, List, ListItem, ListItemText, ListItemIcon, Box, Typography, Button ,CircularProgress} from '@mui/material';
import { Person, School, Assignment, ExitToApp } from '@mui/icons-material';
import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

function Sidebar() {
  const { logout } = useAuth();
  const { apiCall } = useApi();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiCall('post', '/auth/logout');
      logout(); // Make sure this clears the auth state
      toast.success('Logged out successfully');
      navigate('/login', { replace: true }); 
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#f5f5f5',
          borderRight: '1px solid #e0e0e0',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          School App
        </Typography>
      </Box>
      <List>
        {['Students', 'Classes', 'Assignments'].map((text, index) => (
          <ListItem button key={text}>
            <ListItemIcon>
              {index === 0 ? <Person /> : index === 1 ? <School /> : <Assignment />}
            </ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
      <Button
        variant="contained"
        color="secondary"
        startIcon={isLoggingOut ? <CircularProgress size={20} color="inherit" /> : <ExitToApp />}
        onClick={handleLogout}
        disabled={isLoggingOut}
        style={{ marginTop: 'auto', marginBottom: '20px' }}
      >
        {isLoggingOut ? 'Logging out...' : 'Logout'}
      </Button>
    </Drawer>
  );
}

export default Sidebar;
