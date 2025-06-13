const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');
const HarvestService = require('../services/harvest');
const OpenAIService = require('../services/openai');
const DocumentService = require('../services/document');

const router = express.Router();
const prisma = new PrismaClient();
const harvestService = new HarvestService();
const openaiService = new OpenAIService();
const documentService = new DocumentService();

// Get all reports
router.get('/', auth, async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        submittedBy: {
          select: { id: true, name: true, email: true }
        },
        aeApprovedBy: {
          select: { id: true, name: true, email: true }
        },
        supervisorApprovedBy: {
          select: { id: true, name: true, email: true }
        },
        accountingApprovedBy: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single report
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        submittedBy: {
          select: { id: true, name: true, email: true }
        },
        aeApprovedBy: {
          select: { id: true, name: true, email: true }
        },
        supervisorApprovedBy: {
          select: { id: true, name: true, email: true }
        },
        accountingApprovedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new report
router.post('/', [
  auth,
  body('clientName').notEmpty().trim(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { clientName, startDate, endDate } = req.body;

    // Fetch data from Harvest
    const timeEntries = await harvestService.getTimeEntries(startDate, endDate, clientName);

    // Generate report content with OpenAI
    const reportContent = await openaiService.generateReport(timeEntries, clientName, startDate, endDate);

    // Create Word document
    const filePath = await documentService.generateDocument(reportContent, clientName, startDate, endDate);

    // Save to database
    const reportPeriod = new Date(startDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });

    const report = await prisma.report.create({
      data: {
        clientName,
        reportPeriod,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        content: reportContent,
        filePath,
        status: 'DRAFT',
        submittedById: req.user.id
      },
      include: {
        submittedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve report
router.post('/:id/approve', auth, async (req, res) => {
  try {
    const reportId = parseInt(req.params.id);
    const { action } = req.body; // 'approve' or 'reject'

    const report = await prisma.report.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    let updateData = {};

    // Determine approval stage based on user role and current status
    switch (req.user.role) {
      case 'AE':
        if (report.status === 'DRAFT') {
          updateData = {
            status: action === 'approve' ? 'PENDING_SUPERVISOR' : 'REJECTED',
            aeApprovedById: action === 'approve' ? req.user.id : null,
            aeApprovedAt: action === 'approve' ? new Date() : null
          };
        }
        break;

      case 'SUPERVISOR':
        if (report.status === 'PENDING_SUPERVISOR') {
          updateData = {
            status: action === 'approve' ? 'PENDING_ACCOUNTING' : 'REJECTED',
            supervisorApprovedById: action === 'approve' ? req.user.id : null,
            supervisorApprovedAt: action === 'approve' ? new Date() : null
          };
        }
        break;

      case 'ACCOUNTING':
        if (report.status === 'PENDING_ACCOUNTING') {
          updateData = {
            status: action === 'approve' ? 'APPROVED' : 'REJECTED',
            accountingApprovedById: action === 'approve' ? req.user.id : null,
            accountingApprovedAt: action === 'approve' ? new Date() : null
          };
        }
        break;

      default:
        return res.status(403).json({ error: 'Insufficient permissions' });
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Cannot approve report at this stage' });
    }

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: updateData,
      include: {
        submittedBy: { select: { id: true, name: true, email: true } },
        aeApprovedBy: { select: { id: true, name: true, email: true } },
        supervisorApprovedBy: { select: { id: true, name: true, email: true } },
        accountingApprovedBy: { select: { id: true, name: true, email: true } }
      }
    });

    res.json(updatedReport);
  } catch (error) {
    console.error('Approve report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Download report
router.get('/:id/download', auth, async (req, res) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (!report.filePath) {
      return res.status(404).json({ error: 'Report file not found' });
    }

    res.download(report.filePath, `${report.clientName}_${report.reportPeriod}.docx`);
  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
