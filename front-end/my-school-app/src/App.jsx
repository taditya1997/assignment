import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AuthModal from './components/modals/AuthModal';
import Dashboard from './components/commons/Dashboard';
import Layout from './Layouts/Layout';

const theme = createTheme({
  // Your theme customization
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem('token');
    setIsAuthenticated(!!accessToken);
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    setShowAuthModal(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        <Routes>
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout}>
                  <Dashboard />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AuthModal open={true} onClose={() => {}} onAuthSuccess={handleAuthSuccess} />
              )
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        {showAuthModal && (
          <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} onAuthSuccess={handleAuthSuccess} />
        )}
      </Router>
    </ThemeProvider>
  );
}

export default App;
