/* eslint-disable react/prop-types */
import { Box } from '@mui/material';
import Sidebar from '../components/commons/Sidebar';

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: 'calc(100% - 240px)', overflowX: 'auto' }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
