# Report Management System - Backend API

A simplified, Railway-optimized Node.js backend for the Report Management System with Harvest API and OpenAI integration.

## 🚀 Quick Deploy to Railway

This backend is optimized for Railway deployment with minimal dependencies and no Docker complications.

### Prerequisites
- Railway account
- Harvest API credentials
- OpenAI API key

### 1-Click Deploy Steps

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Railway-optimized backend"
   git push origin main
   ```

2. **Deploy to Railway**:
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub repo
   - Select your repository
   - **Important**: Set Root Directory to the backend folder (if needed)
   - Railway will auto-detect Node.js and use Nixpacks

3. **Environment Variables**:
   Add these in Railway dashboard → Variables:
   ```
   JWT_SECRET=your-super-secret-jwt-key-here
   HARVEST_TOKEN=your_harvest_api_token
   HARVEST_ACCOUNT_ID=your_harvest_account_id
   OPENAI_API_KEY=your_openai_api_key
   NODE_ENV=production
   ```

## ✅ What's Optimized for Railway

- ✅ **No Dockerfile** - Uses Railway's Nixpacks auto-detection
- ✅ **Minimal Dependencies** - Only essential packages
- ✅ **Node Version Pinned** - `.nvmrc` specifies exact version
- ✅ **Railway Config** - `railway.json` for optimal settings  
- ✅ **Simple Structure** - Clean, straightforward organization
- ✅ **In-Memory Storage** - No database setup required for testing

## 📁 Project Structure

```
├── server.js              # Main application entry point
├── package.json           # Dependencies and scripts
├── .nvmrc                 # Node.js version
├── railway.json           # Railway configuration
├── .env.example           # Environment variables template
├── routes/
│   ├── auth.js           # Authentication endpoints
│   ├── reports.js        # Report management
│   ├── users.js          # User management
│   └── harvest.js        # Harvest API integration
├── middleware/
│   └── auth.js           # JWT authentication middleware
├── services/
│   ├── harvest.js        # Harvest API service
│   └── openai.js         # OpenAI integration service
└── uploads/              # File upload directory
```

## 🔑 Default Users

After deployment, you can login with these default accounts:

- **Admin**: admin@tegpr.com / admin123
- **Account Executive**: ae@tegpr.com / ae123  
- **Supervisor**: supervisor@tegpr.com / super123
- **Accounting**: accounting@tegpr.com / acc123

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Reports
- `GET /api/reports` - List reports
- `GET /api/reports/:id` - Get single report
- `POST /api/reports` - Create new report
- `POST /api/reports/:id/approve` - Approve report
- `POST /api/reports/:id/reject` - Reject report

### Users
- `GET /api/users` - List users (admin only)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Harvest Integration
- `GET /api/harvest/time-entries` - Get time entries
- `GET /api/harvest/clients` - Get clients
- `GET /api/harvest/projects` - Get projects

### System
- `GET /health` - Health check endpoint
- `GET /` - API information

## 🔧 Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# Start development server
npm run dev
```

## 🚨 Troubleshooting Railway Deployment

If you encounter issues:

1. **Check Build Logs**: Railway dashboard → Deployments → View logs
2. **Verify Environment Variables**: All required vars are set
3. **Node Version**: Ensure `.nvmrc` matches Railway's supported versions
4. **Dependencies**: All packages in package.json are available on npm

## 📊 Monitoring

- Health check: `GET /health`
- Railway provides built-in monitoring and logs
- All errors are logged to console for Railway's log aggregation

## 🔒 Security Features

- JWT authentication
- Password hashing with bcryptjs
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation

## 📈 Next Steps

1. **Add Database**: Replace in-memory storage with PostgreSQL
2. **File Storage**: Implement cloud storage for generated reports
3. **Email Notifications**: Add email alerts for report approvals
4. **Advanced Harvest Integration**: Implement more Harvest API features
5. **Report Templates**: Add customizable report templates

## 🆘 Support

- Check Railway documentation: [docs.railway.app](https://docs.railway.app)
- Review logs in Railway dashboard
- Verify all environment variables are correctly set

---

**Built for Railway** ⚡ **Optimized for Performance** 🚀 **Ready to Scale** 📈
