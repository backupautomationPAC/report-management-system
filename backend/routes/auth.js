const express = require('express');
const db = require('../data/store');

const router = express.Router();

// Login endpoint - no external JWT library needed
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    if (!db.verifyPassword(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create session
    const sessionId = db.createSession(user.id);

    res.json({
      sessionId,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', (req, res) => {
  try {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');

    if (!sessionId) {
      return res.status(401).json({ message: 'No session provided' });
    }

    const session = db.getSession(sessionId);
    if (!session) {
      return res.status(401).json({ message: 'Invalid session' });
    }

    const user = db.findUserById(session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  try {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');

    if (sessionId) {
      db.deleteSession(sessionId);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
