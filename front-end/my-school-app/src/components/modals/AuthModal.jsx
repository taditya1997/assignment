/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, Button, Tab, Tabs, Box } from '@mui/material';
import { useApi } from '../../hooks/useApi';
import { toast } from 'react-toastify';

const AuthModal = ({ open, onClose, onAuthSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const { apiCall } = useApi();

  const handleLogin = async () => {
    try {
      const response = await apiCall('post', '/auth/login', { username, password });
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      onAuthSuccess();
      toast.success('Login successful!');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Invalid username or password. Please try again.');
    }
  };

  const handleSignUp = async () => {
    try {
      await apiCall('post', '/auth/register', { username, email, password });
      toast.success('Sign up successful! Please log in.');
      setAuthMode('login');
      setPassword('');
    } catch (error) {
      console.error('Sign up failed:', error);
      toast.error('Sign up failed. Please try again.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (authMode === 'login') {
      handleLogin();
    } else {
      handleSignUp();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <Tabs value={authMode} onChange={(_, newValue) => setAuthMode(newValue)} centered>
          <Tab label="Login" value="login" />
          <Tab label="Sign Up" value="signup" />
        </Tabs>
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {authMode === 'signup' && (
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {authMode === 'login' ? 'Login' : 'Sign Up'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
