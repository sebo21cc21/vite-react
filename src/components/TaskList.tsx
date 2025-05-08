import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { TaskListProps, Task } from '../types';
import { Paper, Typography, Box, Chip, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, RadioGroup, FormControlLabel, Radio, IconButton, Tooltip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useState } from 'react';

const TaskContainer = styled(Paper)`
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #2d2d2d;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
`;

const TaskHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const TaskTitle = styled(Typography)`
  font-weight: 600;
  color: #fff;
`;

const TaskDescription = styled(Typography)`
  color: #b0b0b0;
  margin-bottom: 1rem;
`;

const TaskStatus = styled(Chip)`
  &.completed {
    background-color: #4CAF50;
    color: white;
  }
  
  &.in-progress {
    background-color: #FFA726;
    color: white;
  }
`;

const TaskRequirements = styled(Box)`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #1e1e1e;
  border-radius: 4px;
`;

const TaskList = ({ tasks, userLocation, onTaskComplete }: TaskListProps) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showHint, setShowHint] = useState(false);

  const calculateDistance = (taskLocation: google.maps.LatLngLiteral) => {
    if (!userLocation) return null;

    const R = 6371000;
    const dLat = toRad(taskLocation.lat - userLocation.lat);
    const dLon = toRad(taskLocation.lng - userLocation.lng);
    const lat1 = toRad(userLocation.lat);
    const lat2 = toRad(taskLocation.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) *
              Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance);
  };

  const toRad = (value: number) => {
    return value * Math.PI / 180;
  };

  const handleTaskClick = (task: Task) => {
    if (!task.completed) {
      setSelectedTask(task);
      setInputValue('');
    }
  };

  const handleSubmit = () => {
    if (!selectedTask) return;

    let isValid = false;

    switch (selectedTask.requirements.type) {
      case 'code':
        isValid = inputValue === selectedTask.requirements.validation.code;
        break;
      case 'location':
        if (userLocation && selectedTask.requirements.validation.exactLocation) {
          const distance = calculateDistance(selectedTask.requirements.validation.exactLocation);
          isValid = distance !== null && distance <= (selectedTask.requirements.validation.exactLocationRadius || 10);
        }
        break;
      case 'quiz':
        isValid = inputValue === selectedTask.requirements.validation.quizAnswer;
        break;
      case 'photo':
        if (userLocation && selectedTask.requirements.validation.exactLocation) {
          const distance = calculateDistance(selectedTask.requirements.validation.exactLocation);
          isValid = distance !== null && distance <= (selectedTask.requirements.validation.exactLocationRadius || 50);
        }
        break;
    }

    if (isValid) {
      onTaskComplete(selectedTask.id);
      setSelectedTask(null);
    } else {
      alert('Nieprawidłowa odpowiedź. Spróbuj ponownie!');
    }
  };

  const renderTaskDialog = () => {
    if (!selectedTask) return null;

    return (
      <Dialog open={!!selectedTask} onClose={() => setSelectedTask(null)}>
        <DialogTitle>{selectedTask.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {selectedTask.requirements.description}
          </Typography>
          
          {selectedTask.requirements.type === 'code' && (
            <TextField
              fullWidth
              label="Wpisz kod"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              sx={{ mb: 2 }}
            />
          )}

          {selectedTask.requirements.type === 'quiz' && (
            <RadioGroup
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            >
              {selectedTask.requirements.validation.quizOptions?.map((option: string) => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          )}

          {selectedTask.hint && (
            <Box sx={{ mt: 2 }}>
              <Button
                startIcon={<HelpOutlineIcon />}
                onClick={() => setShowHint(!showHint)}
              >
                {showHint ? 'Ukryj podpowiedź' : 'Pokaż podpowiedź'}
              </Button>
              {showHint && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {selectedTask.hint}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTask(null)}>Anuluj</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Sprawdź
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#fff' }}>
        Zadania do wykonania
      </Typography>
      {tasks.map((task, index) => {
        const distance = calculateDistance(task.location);
        const isNearby = distance !== null && distance <= task.radius;

        return (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <TaskContainer onClick={() => handleTaskClick(task)}>
              <TaskHeader>
                <TaskTitle variant="h6">
                  {task.title}
                </TaskTitle>
                <TaskStatus
                  icon={task.completed ? <CheckCircleIcon /> : <LocationOnIcon />}
                  label={task.completed ? "Ukończone" : isNearby ? "Jesteś blisko!" : "Do wykonania"}
                  className={task.completed ? "completed" : isNearby ? "in-progress" : ""}
                />
              </TaskHeader>
              <TaskDescription>
                {task.description}
              </TaskDescription>
              {!task.completed && (
                <TaskRequirements>
                  <Typography variant="body2" color="text.secondary">
                    {task.requirements.description}
                  </Typography>
                  {task.hint && (
                    <Tooltip title="Pokaż podpowiedź">
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TaskRequirements>
              )}
              {distance !== null && !task.completed && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Odległość: {distance} metrów
                </Typography>
              )}
            </TaskContainer>
          </motion.div>
        );
      })}
      {renderTaskDialog()}
    </Box>
  );
};

export default TaskList; 