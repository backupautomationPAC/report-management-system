const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Mock Harvest API data
const mockHarvestData = {
  time_entries: [
    {
      id: 1,
      client: { name: 'BESH RESTAURANT GROUP' },
      project: { name: 'Media Relations' },
      task: { name: 'Social Media Management' },
      hours: 8.5,
      spent_date: '2024-05-15',
      notes: 'Updated social calendars and posted content',
      user: { name: 'John Doe' }
    },
    {
      id: 2,
      client: { name: 'BESH RESTAURANT GROUP' },
      project: { name: 'Event Planning' },
      task: { name: 'NOWFE Wine Dinner' },
      hours: 4.0,
      spent_date: '2024-05-16',
      notes: 'Coordinated media interviews and logistics',
      user: { name: 'Jane Smith' }
    }
  ],
  clients: [
    { id: 1, name: 'BESH RESTAURANT GROUP' },
    { id: 2, name: 'OCHSNER HEALTH' }
  ],
  projects: [
    { id: 1, name: 'Media Relations', client_id: 1 },
    { id: 2, name: 'Event Planning', client_id: 1 },
    { id: 3, name: 'Crisis Communications', client_id: 2 }
  ]
};

// Get time entries
router.get('/time-entries', authMiddleware, (req, res) => {
  try {
    const { from, to, client } = req.query;
    let entries = mockHarvestData.time_entries;

    // Simple filtering by client name if provided
    if (client) {
      entries = entries.filter(entry => 
        entry.client.name.toLowerCase().includes(client.toLowerCase())
      );
    }

    // Simple date filtering (in real implementation, you'd use proper date comparison)
    if (from && to) {
      entries = entries.filter(entry => 
        entry.spent_date >= from && entry.spent_date <= to
      );
    }

    res.json({ time_entries: entries });
  } catch (error) {
    console.error('Get time entries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get clients
router.get('/clients', authMiddleware, (req, res) => {
  try {
    res.json({ clients: mockHarvestData.clients });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get projects
router.get('/projects', authMiddleware, (req, res) => {
  try {
    res.json({ projects: mockHarvestData.projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
