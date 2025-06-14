const express = require('express');
const { Report } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all reports
router.get('/', authMiddleware, (req, res) => {
  try {
    const reports = Report.getAll();
    res.json({ reports });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new report
router.post('/', authMiddleware, (req, res) => {
  try {
    const { client_name, report_period, start_date, end_date } = req.body;

    if (!client_name || !report_period) {
      return res.status(400).json({ message: 'Client name and report period are required' });
    }

    const reportData = {
      client_name,
      report_period,
      start_date,
      end_date,
      submitted_by: req.user.email,
      status: 'draft',
      content: 'Sample report content generated for ' + client_name
    };

    const newReport = Report.create(reportData);
    res.status(201).json(newReport);
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific report
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const report = Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update report status (approve/reject)
router.patch('/:id/status', authMiddleware, (req, res) => {
  try {
    const { status } = req.body;
    const report = Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const validStatuses = ['draft', 'pending_ae', 'pending_supervisor', 'pending_accounting', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updatedReport = Report.update(req.params.id, { 
      status,
      [`${req.user.role}_approved_by`]: req.user.email,
      [`${req.user.role}_approved_at`]: new Date().toISOString()
    });

    res.json(updatedReport);
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
