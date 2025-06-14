const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, requireRole } = require('../middleware/auth');
const harvestService = require('../services/harvest');
const openaiService = require('../services/openai');
const router = express.Router();

// In-memory reports store (replace with database in production)
let reports = [
  {
    id: 1,
    clientName: 'BESH RESTAURANT GROUP',
    reportPeriod: 'May 2025',
    startDate: '2025-05-01',
    endDate: '2025-05-31',
    status: 'pending_ae',
    createdAt: new Date().toISOString(),
    submittedBy: 'admin@tegpr.com',
    content: 'Sample report content for Besh Restaurant Group...'
  }
];

// Get all reports
router.get('/', auth, (req, res) => {
  try {
    const userReports = req.user.role === 'admin' ? reports : 
                       reports.filter(r => r.submittedBy === req.user.email);

    res.json({ reports: userReports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single report
router.get('/:id', auth, (req, res) => {
  try {
    const report = reports.find(r => r.id === parseInt(req.params.id));
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && report.submittedBy !== req.user.email) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new report
router.post('/', [
  auth,
  body('clientName').notEmpty(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { clientName, startDate, endDate } = req.body;

    // Fetch Harvest data
    let harvestData = [];
    try {
      harvestData = await harvestService.getTimeEntries(startDate, endDate, clientName);
    } catch (error) {
      console.warn('Harvest API error:', error.message);
      // Continue with empty data if Harvest fails
    }

    // Generate content with OpenAI
    let content = `Monthly Status Report for ${clientName}\n\nReporting Period: ${startDate} to ${endDate}\n\n`;

    try {
      if (harvestData.length > 0) {
        content = await openaiService.generateReportContent(harvestData, clientName, startDate, endDate);
      } else {
        content += 'No time entries found for this period. Please add manual content.';
      }
    } catch (error) {
      console.warn('OpenAI API error:', error.message);
      content += 'Report content generation failed. Please add manual content.';
    }

    // Create report
    const newReport = {
      id: reports.length + 1,
      clientName,
      reportPeriod: new Date(startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      startDate,
      endDate,
      status: 'draft',
      createdAt: new Date().toISOString(),
      submittedBy: req.user.email,
      content
    };

    reports.push(newReport);

    res.status(201).json(newReport);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve report
router.post('/:id/approve', auth, (req, res) => {
  try {
    const report = reports.find(r => r.id === parseInt(req.params.id));
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Status progression logic
    const statusFlow = {
      'draft': 'pending_ae',
      'pending_ae': 'pending_supervisor',
      'pending_supervisor': 'pending_accounting',
      'pending_accounting': 'approved'
    };

    // Role permissions
    const rolePermissions = {
      'ae': ['draft'],
      'supervisor': ['pending_ae'],
      'accounting': ['pending_supervisor'],
      'admin': ['draft', 'pending_ae', 'pending_supervisor', 'pending_accounting']
    };

    if (!rolePermissions[req.user.role]?.includes(report.status)) {
      return res.status(403).json({ error: 'Not authorized to approve this report at current stage' });
    }

    report.status = statusFlow[report.status];
    report[`${req.user.role}ApprovedBy`] = req.user.email;
    report[`${req.user.role}ApprovedAt`] = new Date().toISOString();

    res.json(report);
  } catch (error) {
    console.error('Error approving report:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject report
router.post('/:id/reject', auth, (req, res) => {
  try {
    const report = reports.find(r => r.id === parseInt(req.params.id));
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    report.status = 'rejected';
    report.rejectedBy = req.user.email;
    report.rejectedAt = new Date().toISOString();
    report.rejectionReason = req.body.reason || 'No reason provided';

    res.json(report);
  } catch (error) {
    console.error('Error rejecting report:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
