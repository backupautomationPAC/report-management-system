const express = require('express');
const db = require('../data/store');
const authMiddleware = require('./auth-middleware');

const router = express.Router();

// Get all reports
router.get('/', authMiddleware, (req, res) => {
  try {
    const reports = db.getAllReports();
    res.json({ reports });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new report
router.post('/', authMiddleware, (req, res) => {
  try {
    const { client_name, report_period, start_date, end_date, content } = req.body;

    if (!client_name || !report_period) {
      return res.status(400).json({ message: 'Client name and report period are required' });
    }

    const reportData = {
      client_name,
      report_period,
      start_date,
      end_date,
      content: content || `Sample report content for ${client_name}`,
      submitted_by: req.user.email,
      status: 'draft'
    };

    const newReport = db.createReport(reportData);
    res.status(201).json(newReport);
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific report
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const report = db.findReportById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update report status
router.patch('/:id/status', authMiddleware, (req, res) => {
  try {
    const { status } = req.body;
    const report = db.findReportById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const validStatuses = ['draft', 'pending_ae', 'pending_supervisor', 'pending_accounting', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updateData = { 
      status,
      [`${req.user.role}_approved_by`]: req.user.email,
      [`${req.user.role}_approved_at`]: new Date().toISOString()
    };

    const updatedReport = db.updateReport(req.params.id, updateData);
    res.json(updatedReport);
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
