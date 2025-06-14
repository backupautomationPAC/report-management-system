const bcrypt = require('bcryptjs');

// Simple in-memory user storage
const users = [
  {
    id: 1,
    email: 'admin@tegpr.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: admin123
    role: 'admin',
    name: 'Admin User'
  },
  {
    id: 2,
    email: 'ae@tegpr.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: ae123
    role: 'ae',
    name: 'Account Executive'
  },
  {
    id: 3,
    email: 'supervisor@tegpr.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: super123
    role: 'supervisor',
    name: 'Supervisor'
  },
  {
    id: 4,
    email: 'accounting@tegpr.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: acc123
    role: 'accounting',
    name: 'Accounting'
  }
];

// Simple reports storage
const reports = [];

const User = {
  findByEmail: (email) => {
    return users.find(user => user.email === email);
  },

  findById: (id) => {
    return users.find(user => user.id === parseInt(id));
  },

  getAll: () => {
    return users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    }));
  },

  create: (userData) => {
    const newUser = {
      id: users.length + 1,
      ...userData,
      password: bcrypt.hashSync(userData.password, 10)
    };
    users.push(newUser);
    return { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name };
  },

  comparePassword: (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword);
  }
};

const Report = {
  getAll: () => {
    return reports;
  },

  create: (reportData) => {
    const newReport = {
      id: reports.length + 1,
      ...reportData,
      created_at: new Date().toISOString(),
      status: 'draft'
    };
    reports.push(newReport);
    return newReport;
  },

  findById: (id) => {
    return reports.find(report => report.id === parseInt(id));
  },

  update: (id, updateData) => {
    const reportIndex = reports.findIndex(report => report.id === parseInt(id));
    if (reportIndex !== -1) {
      reports[reportIndex] = { ...reports[reportIndex], ...updateData };
      return reports[reportIndex];
    }
    return null;
  }
};

module.exports = { User, Report };
