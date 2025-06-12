# 🚀 Deployment Guide

## Overview

This guide covers deploying the Modern Report Management System to production using free hosting services:

- **Frontend**: Vercel (Free tier)
- **Backend**: Railway (Free tier) 
- **Database**: Railway PostgreSQL (Free tier)
- **File Storage**: Cloudinary (Free tier)

## Prerequisites

- GitHub account
- Railway account (railway.app)
- Vercel account (vercel.com)
- Cloudinary account (cloudinary.com)
- Harvest API credentials
- OpenAI API key

## Step 1: Prepare Your Repository

1. **Fork or clone this repository**
   ```bash
   git clone <your-repo-url>
   cd modern-report-system
   ```

2. **Commit all changes to your main branch**
   ```bash
   git add .
   git commit -m "Initial deployment setup"
   git push origin main
   ```

## Step 2: Set Up Railway (Backend + Database)

### 2.1 Create Railway Project

1. Visit [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `modern-report-system` repository
5. Select the `backend` folder as the root directory

### 2.2 Add PostgreSQL Database

1. In your Railway project dashboard
2. Click "New Service" → "Database" → "PostgreSQL"
3. Railway will automatically create a PostgreSQL instance

### 2.3 Configure Environment Variables

In Railway dashboard, go to your backend service → "Variables" tab and add:

```bash
# Database (Railway provides this automatically)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-please
JWT_EXPIRES_IN=7d

# Harvest API
HARVEST_ACCESS_TOKEN=your-harvest-access-token
HARVEST_ACCOUNT_ID=your-harvest-account-id

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Application Settings
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 2.4 Deploy Backend

Railway will automatically deploy when you push to main branch. Monitor deployment in the Railway dashboard.

### 2.5 Run Database Migrations

After deployment, access the Railway terminal:
1. Go to your backend service in Railway
2. Click "Deploy" → "View Logs"
3. The seed script will run automatically on first deployment

Your backend will be available at: `https://your-backend-name.railway.app`

## Step 3: Set Up Vercel (Frontend)

### 3.1 Create Vercel Project

1. Visit [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your `modern-report-system` repository
4. Set "Root Directory" to `frontend`
5. Framework preset should auto-detect as "Next.js"

### 3.2 Configure Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-name.railway.app
NEXT_PUBLIC_APP_NAME=Report Management System
```

### 3.3 Deploy Frontend

Click "Deploy". Vercel will build and deploy your frontend.

Your frontend will be available at: `https://your-project-name.vercel.app`

### 3.4 Update Backend CORS

Go back to Railway and update the `FRONTEND_URL` environment variable with your actual Vercel URL:

```bash
FRONTEND_URL=https://your-project-name.vercel.app
```

## Step 4: Configure External Services

### 4.1 Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your credentials from the dashboard
3. Update Railway environment variables with your Cloudinary credentials

### 4.2 Harvest API Setup

1. Get your Harvest API credentials:
   - Go to Harvest → Account Settings → Integrations → Personal Access Tokens
   - Create a new token
2. Update Railway environment variables with your Harvest credentials

### 4.3 OpenAI Setup

1. Get your OpenAI API key from [platform.openai.com](https://platform.openai.com)
2. Update Railway environment variables with your OpenAI key

## Step 5: Test Your Deployment

1. **Access your application**: Visit your Vercel URL
2. **Test login**: Use default credentials:
   - Admin: `admin@tegpr.com` / `admin123`
   - AE: `ae@tegpr.com` / `ae123`
3. **Test report generation**: Try creating a new report
4. **Check API**: Visit `https://your-backend-name.railway.app/health`

## Step 6: Set Up Custom Domain (Optional)

### For Vercel Frontend:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown

### For Railway Backend:
1. Go to Service Settings → Networking
2. Add custom domain
3. Configure DNS records

## Troubleshooting

### Common Issues:

**1. Database Connection Issues**
- Ensure DATABASE_URL is properly set
- Check if PostgreSQL service is running in Railway

**2. CORS Errors**
- Verify FRONTEND_URL matches your Vercel domain exactly
- Check that both HTTP and HTTPS are handled

**3. Build Failures**
- Check build logs in Railway/Vercel dashboards
- Ensure all environment variables are set
- Verify Node.js version compatibility

**4. API Integration Issues**
- Test API credentials in external service dashboards
- Check that all required environment variables are set
- Verify API endpoints are accessible

### Monitoring

- **Railway**: Check logs in the Railway dashboard
- **Vercel**: Check function logs in Vercel dashboard
- **Application**: Use browser dev tools for frontend debugging

## Security Considerations

1. **Change default passwords** for demo accounts
2. **Use strong JWT secrets** in production
3. **Enable HTTPS only** in production
4. **Regularly rotate API keys**
5. **Monitor usage** of external APIs
6. **Set up proper backup** for your database

## Scaling

**Free Tier Limits:**
- Railway: 500 hours/month, 1GB RAM, 1GB storage
- Vercel: 100GB bandwidth, 1000 serverless invocations
- Cloudinary: 25GB storage, 25GB bandwidth

**Upgrade Paths:**
- Railway Pro: $20/month for higher limits
- Vercel Pro: $20/month for teams and higher limits
- Cloudinary: Various paid plans available

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review service-specific documentation
3. Check GitHub issues for similar problems
4. Railway Discord community
5. Vercel Discord community

## Next Steps

After successful deployment:
1. Set up monitoring and alerting
2. Configure automated backups
3. Set up CI/CD pipelines
4. Implement additional security measures
5. Train users on the system
6. Plan for scaling as usage grows
