# Working Backend for Report Management System

## 🚀 Features

- ✅ **Simple Express Server** - Lightweight and fast
- ✅ **Working Authentication** - JWT-based login system
- ✅ **User Management** - Role-based access control
- ✅ **Report Management** - Create, view, approve reports
- ✅ **Mock Harvest Integration** - Sample time tracking data
- ✅ **In-Memory Storage** - No database setup required
- ✅ **CORS Enabled** - Ready for frontend integration
- ✅ **Error Handling** - Proper error responses

## 🛠️ Installation

1. **Extract the backend files**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the server:**
   ```bash
   npm start
   ```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Reports
- `GET /api/reports` - Get all reports
- `POST /api/reports` - Create new report
- `GET /api/reports/:id` - Get specific report
- `PATCH /api/reports/:id/status` - Update report status

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user

### Harvest (Mock Data)
- `GET /api/harvest/time-entries` - Get time entries
- `GET /api/harvest/clients` - Get clients
- `GET /api/harvest/projects` - Get projects

### Health Check
- `GET /health` - Server health status

## 👥 Default Users

| Email | Password | Role |
|-------|----------|------|
| admin@tegpr.com | admin123 | admin |
| ae@tegpr.com | ae123 | ae |
| supervisor@tegpr.com | super123 | supervisor |
| accounting@tegpr.com | acc123 | accounting |

## 🔧 Environment Variables

Create a `.env` file:

```env
PORT=3000
NODE_ENV=production
JWT_SECRET=your_jwt_secret_here_123456789
HARVEST_TOKEN=your_harvest_token_here
HARVEST_ACCOUNT_ID=your_harvest_account_id
OPENAI_API_KEY=your_openai_api_key_here
FRONTEND_URL=http://localhost:3000
```

## 🚀 Railway Deployment

1. **Push to GitHub**
2. **Connect Railway to your repo**
3. **Set Root Directory to backend folder**
4. **Add environment variables in Railway**
5. **Deploy!**

## ✅ Testing

Test the API with curl:

```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tegpr.com","password":"admin123"}'

# Get reports (with token)
curl http://localhost:3000/api/reports \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation
- CORS protection
- Error handling without sensitive data exposure

## 📁 Project Structure

```
working-backend/
├── server.js              # Main server file
├── package.json           # Dependencies
├── .env.example          # Environment variables template
├── .nvmrc                # Node version
├── middleware/
│   └── auth.js           # Authentication middleware
├── models/
│   └── index.js          # Data models (in-memory)
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── reports.js        # Report management routes
│   ├── users.js          # User management routes
│   └── harvest.js        # Harvest API routes (mock)
└── uploads/              # File upload directory
```

## 🎯 Next Steps

1. **Deploy to Railway** - This backend is ready to deploy
2. **Connect Frontend** - Use the API endpoints in your frontend
3. **Add Real Database** - Replace in-memory storage with PostgreSQL
4. **Add Real Harvest API** - Replace mock data with actual API calls
5. **Add OpenAI Integration** - Generate real reports with AI

## 🆘 Troubleshooting

### Common Issues:

1. **Port already in use**
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. **Module not found**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **JWT errors**
   - Make sure JWT_SECRET is set in environment variables

### Railway Deployment Issues:

1. **Build fails** - Check that all dependencies are in package.json
2. **App crashes** - Check Railway logs for specific errors
3. **Routes not working** - Ensure Root Directory is set correctly

## 📈 Monitoring

Check these endpoints to verify everything is working:

- `/health` - Server status
- `/` - API information
- `/api/auth/login` - Authentication working
- `/api/reports` - Database/storage working

---

**This backend is tested and ready to deploy! 🚀**
