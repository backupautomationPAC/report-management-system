const express = require('express');
const { auth } = require('../middleware/auth');
const HarvestService = require('../services/harvest');

const router = express.Router();
const harvestService = new HarvestService();

// Get time entries
router.get('/time-entries', auth, async (req, res) => {
  try {
    const { startDate, endDate, clientName } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const timeEntries = await harvestService.getTimeEntries(startDate, endDate, clientName);
    res.json(timeEntries);
  } catch (error) {
    console.error('Get time entries error:', error);
    res.status(500).json({ error: 'Failed to fetch time entries from Harvest' });
  }
});

// Get clients
router.get('/clients', auth, async (req, res) => {
  try {
    const clients = await harvestService.getClients();
    res.json(clients);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Failed to fetch clients from Harvest' });
  }
});

// Get projects
router.get('/projects', auth, async (req, res) => {
  try {
    const { clientId } = req.query;
    const projects = await harvestService.getProjects(clientId);
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects from Harvest' });
  }
});

module.exports = router;
