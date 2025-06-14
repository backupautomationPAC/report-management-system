// Simple test script to verify routes work
const express = require('express');

// Test that all route files can be imported without errors
try {
  console.log('Testing route imports...');

  const authRoutes = require('./routes/auth');
  console.log('✅ Auth routes imported successfully');

  const reportRoutes = require('./routes/reports');
  console.log('✅ Report routes imported successfully');

  const userRoutes = require('./routes/users');
  console.log('✅ User routes imported successfully');

  const harvestRoutes = require('./routes/harvest');
  console.log('✅ Harvest routes imported successfully');

  const authMiddleware = require('./middleware/auth');
  console.log('✅ Auth middleware imported successfully');

  const { User, Report } = require('./models');
  console.log('✅ Models imported successfully');

  console.log('\n🎉 All imports successful! Backend should work on Railway.');

} catch (error) {
  console.error('❌ Import error:', error.message);
  console.error('Fix this error before deploying to Railway');
  process.exit(1);
}
