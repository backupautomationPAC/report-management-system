const express = require('express');
const db = require('../data/store');
const authMiddleware = require('./auth-middleware');

const router = express.Router();

// Get all users (admin only)
router.get('/', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = db.getAllUsers();
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
