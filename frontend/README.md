# Report Management System - Frontend

A modern React/Next.js frontend for the Report Management System that connects to the Railway backend.

## 🚀 Features

- **Authentication**: Session-based login with the Railway backend
- **Dashboard**: Overview of reports, stats, and system status
- **Report Management**: Create, view, edit, and approve reports
- **Multi-stage Approval Workflow**: AE → Supervisor → Accounting → Approved
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Backend Connection**: Shows connection status to Railway API

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Frontend**: React 18
- **HTTP Client**: Axios
- **Styling**: CSS Modules with custom styles
- **Deployment**: Vercel

## 📦 Quick Deploy to Vercel

### Method 1: Deploy from GitHub (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add Next.js frontend"
   git push
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Select your repository
   - **Set Root Directory**: `frontend` (if in monorepo)
   - **Add Environment Variable**:
     ```
     NEXT_PUBLIC_API_URL=https://your-railway-backend-url.railway.app
     ```
   - Click "Deploy"

3. **Success!** Your frontend will be live at `https://your-app.vercel.app`

### Method 2: Direct Upload

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   cd frontend
   vercel
   # Follow prompts and set environment variable
   ```

## 🔧 Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set Environment Variables**:
   ```bash
   # Create .env.local
   NEXT_PUBLIC_API_URL=https://your-railway-backend-url.railway.app
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Open**: http://localhost:3000

## 🔑 Default Login Credentials

Use these credentials to test the system:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tegpr.com | admin123 |
| Account Executive | ae@tegpr.com | ae123 |
| Supervisor | supervisor@tegpr.com | super123 |

## 🌐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Railway backend URL | `https://your-app.railway.app` |

## 📱 Pages & Features

### Authentication
- **Login Page** (`/login`): Session-based authentication
- **Auto-redirect**: Redirects to dashboard if already logged in

### Dashboard
- **Home** (`/`): Overview, stats, recent reports
- **Backend Status**: Shows connection to Railway API
- **Quick Actions**: Create reports, manage users (admin)

### Reports
- **All Reports** (`/reports`): List all reports with filtering
- **View Report** (`/reports/[id]`): Detailed report view with approval actions
- **Create Report** (`/reports/new`): Form to create new reports
- **Edit Report** (`/reports/[id]/edit`): Edit draft reports

### User Management
- **Users** (`/users`): Manage system users (admin only)

## 🔐 Authentication Flow

1. **Login**: User enters credentials
2. **Backend Validation**: Credentials verified against Railway backend
3. **Session Storage**: SessionId stored in localStorage
4. **API Requests**: SessionId included in Authorization header
5. **Auto-logout**: Invalid sessions automatically cleared

## 🎨 Styling

The frontend uses custom CSS with:
- **Responsive Grid System**: Works on all screen sizes
- **Modern Design**: Clean, professional interface
- **Status Badges**: Color-coded report statuses
- **Loading States**: Spinner animations
- **Alert Messages**: Success/error notifications

## 🔧 API Integration

The frontend communicates with the Railway backend using:

```javascript
// API Base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Authentication
POST /api/auth/login
GET /api/auth/me
POST /api/auth/logout

// Reports
GET /api/reports
POST /api/reports
GET /api/reports/:id
PATCH /api/reports/:id/status

// Users (admin only)
GET /api/users
```

## 🚀 Deployment Checklist

- ✅ Set `NEXT_PUBLIC_API_URL` environment variable
- ✅ Verify Railway backend is running
- ✅ Test login with demo credentials
- ✅ Confirm API connectivity
- ✅ Check responsive design on mobile

## 🔍 Troubleshooting

### Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check Railway backend is running
- Look for CORS errors in browser console

### Authentication Issues
- Clear localStorage and try again
- Verify demo credentials are working
- Check network requests in browser dev tools

### Build Issues
- Ensure all dependencies are installed
- Check for any TypeScript/ESLint errors
- Verify Next.js version compatibility

## 🆘 Support

If you encounter issues:

1. **Check Browser Console**: Look for JavaScript errors
2. **Verify Environment Variables**: Ensure API URL is correct
3. **Test Backend**: Try API endpoints directly
4. **Clear Cache**: Clear browser cache and localStorage

## 📈 Next Steps

Once deployed, you can:

1. **Add Real Database**: Connect to PostgreSQL
2. **Harvest Integration**: Pull real time tracking data
3. **OpenAI Reports**: AI-generated report content
4. **File Uploads**: Document attachments
5. **Email Notifications**: Alert users of status changes

---

**This frontend is ready for production deployment on Vercel! 🚀**
