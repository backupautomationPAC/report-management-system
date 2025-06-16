const express = require('express');
const authMiddleware = require('./auth-middleware');
const harvestService = require('../services/harvest');

const router = express.Router();

// Get time entries
router.get('/time-entries', authMiddleware, async (req, res) => {
  try {
    const { from, to, client } = req.query;
    console.log('Time entries request:', { from, to, client });
    
    const entries = await harvestService.getTimeEntries(from, to, client);
    res.json({ time_entries: entries });
  } catch (error) {
    console.error('Get time entries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get clients - IMPORTANT: This is what your frontend needs
router.get('/clients', authMiddleware, async (req, res) => {
  try {
    console.log('Clients request received');
    const clients = await harvestService.getClients();
    res.json({ clients });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get projects
router.get('/projects', authMiddleware, async (req, res) => {
  try {
    const projects = await harvestService.getProjects();
    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
