import express from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validate, validateQuery, schemas } from '../middleware/validation';
import { createError } from '../middleware/errorHandler';
import harvestService from '../services/harvestService';
import openaiService from '../services/openaiService';
import documentService from '../services/documentService';

const router = express.Router();
const prisma = new PrismaClient();

// @route   GET /api/reports
// @desc    Get all reports with filtering
// @access  Private
router.get('/', authenticate, validateQuery(schemas.reportsQuery), async (req: AuthRequest, res, next) => {
  try {
    const { status, clientName, startDate, endDate, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    // Apply filters
    if (status) where.status = status;
    if (clientName) {
      where.clientName = {
        contains: clientName as string,
        mode: 'insensitive',
      };
    }
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.gte = new Date(startDate as string);
      if (endDate) where.startDate.lte = new Date(endDate as string);
    }

    // Role-based filtering
    if (req.user?.role === UserRole.AE) {
      where.createdById = req.user.id;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          approvals: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
          _count: {
            select: {
              harvestData: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: Number(limit),
      }),
      prisma.report.count({ where }),
    ]);

    res.json({
      success: true,
      data: reports,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/reports
// @desc    Create a new report with Harvest data
// @access  Private (AE, ADMIN)
router.post('/', authenticate, authorize(UserRole.AE, UserRole.ADMIN), validate(schemas.createReport), async (req: AuthRequest, res, next) => {
  try {
    const { clientName, startDate, endDate, title } = req.body;

    // Generate title if not provided
    const reportTitle = title || `${clientName} - Monthly Report - ${new Date(startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    const reportPeriod = new Date(startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Create report
    const report = await prisma.report.create({
      data: {
        title: reportTitle,
        clientName,
        reportPeriod,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        createdById: req.user!.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Fetch and cache Harvest data
    try {
      await harvestService.cacheTimeEntries(startDate, endDate, report.id);

      // Get cached data for report generation
      const harvestData = await prisma.harvestEntry.findMany({
        where: { reportId: report.id },
      });

      // Generate report content with AI
      if (harvestData.length > 0) {
        const reportContent = await openaiService.generateReportContent({
          clientName,
          reportPeriod,
          harvestData: harvestData.map(entry => ({
            projectName: entry.projectName,
            taskName: entry.taskName,
            hours: entry.hours,
            date: entry.date.toISOString(),
            notes: entry.notes || undefined,
            userName: entry.userName,
          })),
        });

        // Update report with generated content
        await prisma.report.update({
          where: { id: report.id },
          data: { content: reportContent },
        });
      }
    } catch (harvestError) {
      console.warn('Harvest data fetching failed:', harvestError);
      // Continue without Harvest data - report can be manually edited
    }

    res.status(201).json({
      success: true,
      data: report,
      message: 'Report created successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/reports/:id
// @desc    Get a specific report
// @access  Private
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        approvals: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        harvestData: {
          orderBy: {
            date: 'asc',
          },
        },
      },
    });

    if (!report) {
      throw createError('Report not found', 404);
    }

    // Check access permissions
    if (req.user?.role === UserRole.AE && report.createdById !== req.user.id) {
      throw createError('Not authorized to access this report', 403);
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/reports/:id
// @desc    Update a report
// @access  Private
router.put('/:id', authenticate, validate(schemas.updateReport), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const existingReport = await prisma.report.findUnique({
      where: { id },
    });

    if (!existingReport) {
      throw createError('Report not found', 404);
    }

    // Check permissions
    if (req.user?.role === UserRole.AE && existingReport.createdById !== req.user.id) {
      throw createError('Not authorized to update this report', 403);
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedReport,
      message: 'Report updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/reports/:id/approve
// @desc    Approve or reject a report
// @access  Private (SUPERVISOR, ACCOUNTING, ADMIN)
router.post('/:id/approve', authenticate, authorize(UserRole.SUPERVISOR, UserRole.ACCOUNTING, UserRole.ADMIN), validate(schemas.approveReport), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        approvals: true,
      },
    });

    if (!report) {
      throw createError('Report not found', 404);
    }

    // Create or update approval
    await prisma.approval.upsert({
      where: {
        reportId_userId: {
          reportId: id,
          userId: req.user!.id,
        },
      },
      update: {
        status: status as any,
        comments,
      },
      create: {
        reportId: id,
        userId: req.user!.id,
        status: status as any,
        comments,
      },
    });

    // Update report status based on approval workflow
    let newStatus = report.status;
    if (status === 'APPROVED') {
      if (req.user?.role === UserRole.SUPERVISOR) {
        newStatus = 'PENDING_ACCOUNTING';
      } else if (req.user?.role === UserRole.ACCOUNTING) {
        newStatus = 'APPROVED';
      }
    } else if (status === 'REJECTED') {
      newStatus = 'REJECTED';
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: { status: newStatus as any },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        approvals: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedReport,
      message: `Report ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
