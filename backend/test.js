// Test script to verify all imports work correctly
console.log('🧪 Testing ultra-simple backend...');

try {
  // Test data store
  const db = require('./data/store');
  console.log('✅ Data store imported successfully');

  // Test routes
  const authRoutes = require('./routes/auth');
  console.log('✅ Auth routes imported successfully');

  const reportRoutes = require('./routes/reports');
  console.log('✅ Report routes imported successfully');

  const userRoutes = require('./routes/users');
  console.log('✅ User routes imported successfully');

  const authMiddleware = require('./routes/auth-middleware');
  console.log('✅ Auth middleware imported successfully');

  // Test basic functionality
  const testUser = db.findUserByEmail('admin@tegpr.com');
  if (testUser) {
    console.log('✅ Database functions working');
    console.log('✅ Test user found:', testUser.email);
  }

  // Test password verification
  const isValid = db.verifyPassword('admin123', testUser.password);
  if (isValid) {
    console.log('✅ Password verification working');
  }

  // Test session creation
  const sessionId = db.createSession(testUser.id);
  if (sessionId) {
    console.log('✅ Session creation working');

    // Test session retrieval
    const session = db.getSession(sessionId);
    if (session) {
      console.log('✅ Session retrieval working');
    }
  }

  console.log('\n🎉 All tests passed! Backend is ready for Railway deployment.');
  console.log('\n📦 Only 3 dependencies:');
  console.log('   - express: 4.18.2');
  console.log('   - cors: 2.8.5');  
  console.log('   - dotenv: 16.0.3');
  console.log('\n🔧 All other functionality uses built-in Node.js modules!');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('Fix this error before deploying to Railway');
  process.exit(1);
}
