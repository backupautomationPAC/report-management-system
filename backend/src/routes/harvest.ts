import express from 'express';
import { authenticate } from '../middleware/auth';
import { validateQuery, schemas } from '../middleware/validation';
import harvestService from '../services/harvestService';

const router = express.Router();

// @route   GET /api/harvest/clients
// @desc    Get Harvest clients
// @access  Private
router.get('/clients', authenticate, async (req, res, next) => {
  try {
    const clients = await harvestService.getClients();

    res.json({
      success: true,
      data: clients,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/harvest/projects
// @desc    Get Harvest projects
// @access  Private
router.get('/projects', authenticate, async (req, res, next) => {
  try {
    const projects = await harvestService.getProjects();

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/harvest/time-entries
// @desc    Get Harvest time entries
// @access  Private
router.get('/time-entries', authenticate, validateQuery(schemas.harvestQuery), async (req, res, next) => {
  try {
    const { from, to, client, project } = req.query;

    const timeEntries = await harvestService.getTimeEntries(
      from as string,
      to as string,
      client as string,
      project as string
    );

    res.json({
      success: true,
      data: timeEntries,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
