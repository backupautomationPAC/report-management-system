// Ultra-simple in-memory data store using only built-in Node.js
const crypto = require('crypto');

// Simple hash function using built-in crypto
function simpleHash(password) {
  return crypto.createHash('sha256').update(password + 'salt123').digest('hex');
}

// In-memory users
const users = [
  {
    id: 1,
    email: 'admin@tegpr.com',
    password: simpleHash('admin123'),
    role: 'admin',
    name: 'Admin User'
  },
  {
    id: 2,
    email: 'ae@tegpr.com',
    password: simpleHash('ae123'),
    role: 'ae',
    name: 'Account Executive'
  },
  {
    id: 3,
    email: 'supervisor@tegpr.com',
    password: simpleHash('super123'),
    role: 'supervisor',
    name: 'Supervisor'
  }
];

// In-memory reports
const reports = [];

// Simple session store (using crypto for session IDs)
const sessions = new Map();

function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

// Data access functions
const db = {
  // User functions
  findUserByEmail: (email) => {
    return users.find(user => user.email === email);
  },

  findUserById: (id) => {
    return users.find(user => user.id === parseInt(id));
  },

  getAllUsers: () => {
    return users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    }));
  },

  verifyPassword: (password, hashedPassword) => {
    return simpleHash(password) === hashedPassword;
  },

  // Session functions
  createSession: (userId) => {
    const sessionId = generateSessionId();
    sessions.set(sessionId, {
      userId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
    return sessionId;
  },

  getSession: (sessionId) => {
    const session = sessions.get(sessionId);
    if (!session || session.expiresAt < new Date()) {
      sessions.delete(sessionId);
      return null;
    }
    return session;
  },

  deleteSession: (sessionId) => {
    sessions.delete(sessionId);
  },

  // Report functions
  getAllReports: () => {
    return reports;
  },

  createReport: (reportData) => {
    const newReport = {
      id: reports.length + 1,
      ...reportData,
      created_at: new Date().toISOString(),
      status: 'draft'
    };
    reports.push(newReport);
    return newReport;
  },

  findReportById: (id) => {
    return reports.find(report => report.id === parseInt(id));
  },

  updateReport: (id, updateData) => {
    const reportIndex = reports.findIndex(report => report.id === parseInt(id));
    if (reportIndex !== -1) {
      reports[reportIndex] = { ...reports[reportIndex], ...updateData };
      return reports[reportIndex];
    }
    return null;
  }
};

module.exports = db;
