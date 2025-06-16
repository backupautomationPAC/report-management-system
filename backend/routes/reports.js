const express = require('express');
const db = require('../data/store');
const authMiddleware = require('./auth-middleware');
const harvestService = require('../services/harvest');  // ← Import from services
const openaiService = require('../services/openai');    // ← Import from services  
const documentService = require('../services/document'); // ← Import from services

const router = express.Router();

// Get all reports
router.get('/', authMiddleware, async (req, res) => {
  try {
    const reports = await db.getAllReports();
    res.json({ reports });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new report with Harvest data and AI generation
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { client_name, report_period, start_date, end_date } = req.body;
    
    if (!client_name || !report_period) {
      return res.status(400).json({ message: 'Client name and report period are required' });
    }
    
    console.log(`Generating report for ${client_name} from ${start_date} to ${end_date}`);
    
    // 1. Fetch Harvest data
    const harvestData = await harvestService.getTimeEntries(start_date, end_date, client_name);
    console.log(`Retrieved ${harvestData.length} time entries from Harvest`);
    
    // 2. Generate report content with AI
    const content = await openaiService.generateReport(harvestData, client_name, start_date, end_date);
    console.log('Generated report content');
    
    // 3. Create document (if you have document service)
    let document = null;
    if (documentService && documentService.generateWordDocument) {
      try {
        document = await documentService.generateWordDocument(content, client_name, report_period);
        console.log(`Generated document: ${document.filename}`);
      } catch (error) {
        console.warn('Document generation failed:', error.message);
      }
    }
    
    // 4. Save to database
    const reportData = {
      client_name,
      report_period,
      start_date,
      end_date,
      content,
      harvest_data: harvestData,
      submitted_by: req.user.email,
      file_path: document ? document.url : null
    };
    
    const newReport = await db.createReport(reportData);
    
    res.status(201).json({
      ...newReport,
      message: `Report generated successfully for ${client_name} with ${harvestData.length} time entries`
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ 
      message: 'Server error: ' + error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get specific report
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const report = await db.findReportById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json(report);
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update report status (approval workflow)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const report = await db.findReportById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    const validStatuses = ['draft', 'pending_ae', 'pending_supervisor', 'pending_accounting', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Approval workflow logic
    const updateData = { status };
    
    if (status === 'approved' || status === 'rejected') {
      const approvalField = `${req.user.role}_approved_by`;
      const approvalTimeField = `${req.user.role}_approved_at`;
      updateData[approvalField] = req.user.email;
      updateData[approvalTimeField] = new Date();
    }
    
    const updatedReport = await db.updateReport(req.params.id, updateData);
    
    res.json({
      ...updatedReport,
      message: `Report ${status} successfully`
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
