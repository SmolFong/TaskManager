const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// In-memory database (will replace with real DB in Week 2)
let tasks = [
    {
        id: 1,
        text: "Sample Task 1",
        dueDate: "2023-12-01",
        priority: "medium",
        completed: false
    },
    {
        id: 2,
        text: "Sample Task 2",
        dueDate: "2023-12-15",
        priority: "high",
        completed: false
    }
];
let currentId = 3;

// API Routes

// GET all tasks
app.get('/tasks', (req, res) => {
    try {
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// POST new task
app.post('/tasks', (req, res) => {
    try {
        console.log('Received task data:', req.body); // Debug log
        
        const { text, dueDate, priority, completed = false } = req.body;
        
        // Validation
        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Valid task text is required' });
        }

        const newTask = {
            id: currentId++,
            text: text.trim(),
            dueDate: dueDate || null,
            priority: priority || 'medium',
            completed
        };
        
        tasks.push(newTask);
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// PUT update task (edit)
app.put('/tasks/:id', (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Update only provided fields
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            ...req.body,
            id: taskId // Prevent ID change
        };

        res.json(tasks[taskIndex]);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// DELETE task
app.delete('/tasks/:id', (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const initialLength = tasks.length;
        
        tasks = tasks.filter(t => t.id !== taskId);
        
        if (tasks.length === initialLength) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`\nServer running on http://localhost:${PORT}`);
    console.log('API Endpoints:');
    console.log(`- GET    /tasks`);
    console.log(`- POST   /tasks`);
    console.log(`- PUT    /tasks/:id`);
    console.log(`- DELETE /tasks/:id\n`);
});