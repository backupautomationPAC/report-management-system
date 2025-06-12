import express from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Build where clause based on user role
    const whereClause: any = {};
    if (userRole === UserRole.AE) {
      whereClause.createdById = userId;
    }

    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get statistics
    const [
      totalReports,
      pendingApproval,
      approvedThisMonth,
      rejectedThisMonth,
      recentReports,
    ] = await Promise.all([
      // Total reports
      prisma.report.count({ where: whereClause }),

      // Pending approval
      prisma.report.count({
        where: {
          ...whereClause,
          status: {
            in: ['PENDING_AE', 'PENDING_SUPERVISOR', 'PENDING_ACCOUNTING'],
          },
        },
      }),

      // Approved this month
      prisma.report.count({
        where: {
          ...whereClause,
          status: 'APPROVED',
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),

      // Rejected this month
      prisma.report.count({
        where: {
          ...whereClause,
          status: 'REJECTED',
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),

      // Recent reports
      prisma.report.findMany({
        where: whereClause,
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
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalReports,
        pendingApproval,
        approvedThisMonth,
        rejectedThisMonth,
        recentReports,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
