import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import { Add, Visibility, Description } from '@mui/icons-material';
import AddLeaveModal from '../modals/AddLeaveModal';

const Dashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [isAddLeaveModalOpen, setIsAddLeaveModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const { apiCall } = useApi();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeaves();
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchLeaves = async () => {
    try {
      const data = await apiCall('get', '/leaves/all');
      console.log('Fetched leaves data:', data); // Add this line
      setLeaves(data);
    } catch {
      toast.error('Failed to fetch leaves data');
    }
  };

  const fetchDashboardData = async () => {
    try {
      const data = await apiCall('get', '/students/dashboard-data');
      setDashboardData(data);
    } catch {
      toast.error('Failed to fetch dashboard data');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const filteredLeaves = leaves.filter(leave => 
    (leave.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     leave.student.enrollmentId.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedYear ? leave.leaveDate.startsWith(selectedYear) : true)
  );

  const yearOptions = ['2020-2021', '2021-2022', '2022-2023', '2023-2024'];

  return isAuthenticated ? (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Student Leaves</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Select
            value={selectedYear}
            onChange={handleYearChange}
            displayEmpty
            size="small"
          >
            <MenuItem value="">All Years</MenuItem>
            {yearOptions.map(year => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => setIsAddLeaveModalOpen(true)}
          >
            Add Leave
          </Button>
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Enrollment ID</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Section</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Leave Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLeaves.map(leave => (
              <TableRow key={leave._id}>
                <TableCell>
                  {leave.student.enrollmentId || leave.student.enrollmentNumber || leave.student.id || 'N/A'}
                </TableCell>
                <TableCell>{leave.student.name}</TableCell>
                <TableCell>{leave.student.class}</TableCell>
                <TableCell>{leave.student.section}</TableCell>
                <TableCell>{leave.reason}</TableCell>
                <TableCell>{leave.leaveDate}</TableCell>
                <TableCell>{leave.status}</TableCell>
                <TableCell>
                  <IconButton size="small">
                    <Visibility />
                  </IconButton>
                  <IconButton size="small">
                    <Description />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {isAddLeaveModalOpen && (
        <AddLeaveModal 
          open={isAddLeaveModalOpen} 
          onClose={() => setIsAddLeaveModalOpen(false)} 
          onLeaveAdded={fetchLeaves}
          dashboardData={dashboardData}
        />
      )}
    </Box>
  ) : null;
};

export default Dashboard;
