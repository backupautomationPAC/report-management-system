// Simple authentication middleware using built-in Node.js only
const db = require('../data/store');

function authMiddleware(req, res, next) {
  try {
    // Get session ID from Authorization header or cookies
    const sessionId = req.headers.authorization?.replace('Bearer ', '') || 
                     req.headers.cookie?.split('sessionId=')[1]?.split(';')[0];

    if (!sessionId) {
      return res.status(401).json({ message: 'No session provided' });
    }

    // Verify session
    const session = db.getSession(sessionId);
    if (!session) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    // Get user info
    const user = db.findUserById(session.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Add user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
}

module.exports = authMiddleware;
