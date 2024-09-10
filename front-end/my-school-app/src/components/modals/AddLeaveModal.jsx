/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextareaAutosize,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio
} from '@mui/material';
import PropTypes from 'prop-types';

const AddLeaveModal = ({ open, onClose, onLeaveAdded, dashboardData }) => {
  const [leaveData, setLeaveData] = useState({
    class: '',
    section: '',
    student: '',
    reason: '',
    numberOfDays: 'single',
    startDate: '',
    endDate: '',
    status: 'unapproved'
  });
  const [availableStudents, setAvailableStudents] = useState([]);
  const { apiCall } = useApi();

  useEffect(() => {
    console.log('Dashboard Data:', dashboardData);
  }, [dashboardData]);

  useEffect(() => {
    if (leaveData.class && leaveData.section) {
      console.log('Selected Class:', leaveData.class);
      console.log('Selected Section:', leaveData.section);
      
      let students = [];
      if (dashboardData && dashboardData.studentsData) {
        const classData = dashboardData.studentsData.find(c => c.class === leaveData.class);
        if (classData && classData.sections) {
          const sectionData = classData.sections.find(s => s.name === leaveData.section);
          if (sectionData && sectionData.students) {
            students = sectionData.students;
          }
        }
      }
      
      console.log('Available Students:', students);
      setAvailableStudents(students);
    } else {
      setAvailableStudents([]);
    }
  }, [leaveData.class, leaveData.section, dashboardData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeaveData(prev => ({ ...prev, [name]: value }));
    if (name === 'class' || name === 'section') {
      setLeaveData(prev => ({ ...prev, student: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        classId: leaveData.class,
        sectionId: leaveData.section,
        studentId: leaveData.student,
        reason: leaveData.reason,
        startDate: leaveData.startDate,
        endDate: leaveData.numberOfDays === 'multiple' ? leaveData.endDate : leaveData.startDate,
        status: leaveData.status
      };

      const response = await apiCall('post', '/leaves/create', formattedData);
      if (response.leaveId) {
        toast.success('Leave added successfully');
        onLeaveAdded();
        onClose();
      } else {
        toast.error(response.message || 'Failed to add leave');
      }
    } catch (error) {
      console.error('Error adding leave:', error);
      toast.error('Failed to add leave. Please try again.');
    }
  };

  const handleReset = () => {
    setLeaveData({
      class: '',
      section: '',
      student: '',
      reason: '',
      numberOfDays: 'single',
      startDate: '',
      endDate: '',
      status: 'unapproved'
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Leave</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Class</InputLabel>
              <Select
                name="class"
                value={leaveData.class}
                onChange={handleChange}
              >
                {dashboardData?.classes?.map((cls) => (
                  <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Section</InputLabel>
              <Select
                name="section"
                value={leaveData.section}
                onChange={handleChange}
              >
                {dashboardData?.sections?.map((section) => (
                  <MenuItem key={section} value={section}>{section}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Student</InputLabel>
              <Select
                name="student"
                value={leaveData.student}
                onChange={handleChange}
              >
                {availableStudents.length > 0 ? (
                  availableStudents.map((student) => (
                    <MenuItem key={student.enrollmentNumber} value={student.enrollmentNumber}>
                      {student.name} ({student.enrollmentNumber})
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="">No students available</MenuItem>
                )}
              </Select>
            </FormControl>
            <TextareaAutosize
              minRows={3}
              placeholder="Reason"
              name="reason"
              value={leaveData.reason}
              onChange={handleChange}
              style={{ width: '100%', marginTop: '16px' }}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={leaveData.numberOfDays === 'multiple'}
                  onChange={(e) => setLeaveData(prev => ({ ...prev, numberOfDays: e.target.checked ? 'multiple' : 'single' }))}
                />
              }
              label="Multiple Days"
            />
            <TextField
              fullWidth
              margin="normal"
              name="startDate"
              label="Start Date"
              type="date"
              value={leaveData.startDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            {leaveData.numberOfDays === 'multiple' && (
              <TextField
                fullWidth
                margin="normal"
                name="endDate"
                label="End Date"
                type="date"
                value={leaveData.endDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            )}
            <FormControl component="fieldset" margin="normal">
              <RadioGroup
                name="status"
                value={leaveData.status}
                onChange={handleChange}
                row
              >
                <FormControlLabel 
                  value="approved" 
                  control={<Radio sx={{ '&.Mui-checked': { color: '#ffc107' } }} />} 
                  label="Approved" 
                />
                <FormControlLabel 
                  value="unapproved" 
                  control={<Radio sx={{ '&.Mui-checked': { color: '#ffc107' } }} />} 
                  label="Unapproved" 
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset} color="secondary">
          Reset
        </Button>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" sx={{ backgroundColor: '#ffc107', color: 'black' }}>
          Add Leave
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AddLeaveModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onLeaveAdded: PropTypes.func.isRequired,
  dashboardData: PropTypes.object
};

export default AddLeaveModal;
