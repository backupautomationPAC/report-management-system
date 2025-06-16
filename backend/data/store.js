const crypto = require('crypto');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        report_period VARCHAR(100) NOT NULL,
        start_date DATE,
        end_date DATE,
        content TEXT,
        harvest_data JSONB,
        file_path VARCHAR(500),
        status VARCHAR(50) DEFAULT 'draft',
        submitted_by VARCHAR(255),
        ae_approved_by VARCHAR(255),
        ae_approved_at TIMESTAMP,
        supervisor_approved_by VARCHAR(255),
        supervisor_approved_at TIMESTAMP,
        accounting_approved_by VARCHAR(255),
        accounting_approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(64) PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
      )
    `);

    // Insert default users if they don't exist
    const defaultUsers = [
      {
        email: 'admin@tegpr.com',
        password: simpleHash('admin123'),
        role: 'admin',
        name: 'Admin User'
      },
      {
        email: 'ae@tegpr.com',
        password: simpleHash('ae123'),
        role: 'ae',
        name: 'Account Executive'
      },
      {
        email: 'supervisor@tegpr.com',
        password: simpleHash('super123'),
        role: 'supervisor',
        name: 'Supervisor'
      },
      {
        email: 'accounting@tegpr.com',
        password: simpleHash('acc123'),
        role: 'accounting',
        name: 'Accounting'
      }
    ];

    for (const user of defaultUsers) {
      await pool.query(`
        INSERT INTO users (email, password_hash, role, name)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO NOTHING
      `, [user.email, user.password, user.role, user.name]);
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
}

// Simple hash function using built-in crypto
function simpleHash(password) {
  return crypto.createHash('sha256').update(password + 'salt123').digest('hex');
}

function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

// Database access functions
const db = {
  // User functions
  findUserByEmail: async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },
  
  findUserById: async (id) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },
  
  getAllUsers: async () => {
    const result = await pool.query('SELECT id, email, role, name FROM users ORDER BY name');
    return result.rows;
  },
  
  verifyPassword: (password, hashedPassword) => {
    return simpleHash(password) === hashedPassword;
  },
  
  // Session functions
  createSession: async (userId) => {
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await pool.query(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)',
      [sessionId, userId, expiresAt]
    );
    
    return sessionId;
  },
  
  getSession: async (sessionId) => {
    const result = await pool.query(`
      SELECT s.*, u.id as user_id, u.email, u.role, u.name 
      FROM sessions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.id = $1 AND s.expires_at > NOW()
    `, [sessionId]);
    
    return result.rows[0];
  },
  
  deleteSession: async (sessionId) => {
    await pool.query('DELETE FROM sessions WHERE id = $1', [sessionId]);
  },
  
  // Report functions
  getAllReports: async () => {
    const result = await pool.query(`
      SELECT * FROM reports 
      ORDER BY created_at DESC
    `);
    return result.rows;
  },
  
  createReport: async (reportData) => {
    const result = await pool.query(`
      INSERT INTO reports (client_name, report_period, start_date, end_date, content, harvest_data, submitted_by, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      reportData.client_name,
      reportData.report_period,
      reportData.start_date,
      reportData.end_date,
      reportData.content,
      JSON.stringify(reportData.harvest_data),
      reportData.submitted_by,
      'draft'
    ]);
    
    return result.rows[0];
  },
  
  findReportById: async (id) => {
    const result = await pool.query('SELECT * FROM reports WHERE id = $1', [id]);
    return result.rows[0];
  },
  
  updateReport: async (id, updateData) => {
    const fields = [];
    const values = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(updateData)) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
    
    fields.push(`updated_at = NOW()`);
    values.push(id);
    
    const query = `
      UPDATE reports 
      SET ${fields.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
};

// Initialize database on startup
initializeDatabase();

module.exports = db;
