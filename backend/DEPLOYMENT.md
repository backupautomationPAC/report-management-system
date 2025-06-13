# Railway Deployment Guide

This guide provides step-by-step instructions for deploying the Report Management System backend to Railway.

## Prerequisites

- GitHub account with the backend code
- Railway account (free tier available)
- Environment variables ready (API keys, etc.)

## Step 1: Prepare Repository

### Option A: Separate Backend Repository (Recommended)
1. Create a new repository on GitHub: `report-system-backend`
2. Clone and push only the backend code:
   ```bash
   git clone https://github.com/your-username/your-main-repo.git
   cd your-main-repo
   cp -r backend ../report-system-backend
   cd ../report-system-backend
   git init
   git add .
   git commit -m "Backend for report management system"
   git branch -M main
   git remote add origin https://github.com/your-username/report-system-backend.git
   git push -u origin main
   ```

### Option B: Monorepo with Root Directory
If you prefer to keep everything in one repository, you can set Railway to use a specific root directory.

## Step 2: Create Railway Project

1. Go to [Railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your backend repository
6. Railway will automatically detect it as a Node.js project

## Step 3: Add PostgreSQL Database

1. In your Railway project dashboard
2. Click the **"+"** button
3. Select **"Database"** → **"PostgreSQL"**
4. Railway will automatically create and connect the database
5. The `DATABASE_URL` environment variable will be auto-populated

## Step 4: Configure Environment Variables

1. Go to your backend service → **"Variables"** tab
2. Add the following variables:

```
DATABASE_URL = (auto-populated by Railway)
JWT_SECRET = your-secure-random-jwt-secret-here
HARVEST_TOKEN = your-harvest-personal-access-token
HARVEST_ACCOUNT_ID = your-harvest-account-id
OPENAI_API_KEY = your-openai-api-key
FRONTEND_URL = https://your-frontend.vercel.app
NODE_ENV = production
```

### How to Get API Keys:

**Harvest API:**
1. Go to Harvest → Account Settings → Integrations
2. Create a new Personal Access Token
3. Copy the token and your Account ID

**OpenAI API:**
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Navigate to API Keys
3. Create a new secret key

**JWT Secret:**
Generate a secure random string (32+ characters):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 5: Deploy

1. Railway will automatically deploy after you add environment variables
2. Watch the build logs for any errors
3. Once deployed, you'll get a URL like: `https://your-app.railway.app`

## Step 6: Initialize Database

After successful deployment, initialize the database:

1. Go to your Railway project
2. Click on your backend service
3. Go to the **"Deployments"** tab
4. Click **"View Logs"** to monitor the process
5. In the Railway CLI or using the web interface, run:
   ```bash
   railway run npx prisma migrate deploy
   railway run npm run db:seed
   ```

Or use the Railway CLI locally:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Connect to your project
railway login
railway link

# Run database commands
railway run npx prisma migrate deploy
railway run npm run db:seed
```

## Step 7: Test Deployment

1. Visit your Railway URL + `/health` (e.g., `https://your-app.railway.app/health`)
2. You should see:
   ```json
   {
     "status": "OK",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "environment": "production"
   }
   ```

3. Test authentication:
   ```bash
   curl -X POST https://your-app.railway.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@tegpr.com", "password": "admin123"}'
   ```

## Troubleshooting

### Build Fails with "npm ci --only=production"

**Error:** `npm ci --only=production` fails
**Solution:** This is usually due to missing dependencies or version conflicts.

1. Check your `package.json` has all required dependencies
2. Ensure Node.js version compatibility in `engines` field
3. Clear Railway cache: Delete and recreate the service

### Database Connection Issues

**Error:** Cannot connect to database
**Solutions:**
1. Verify `DATABASE_URL` is set correctly
2. Check PostgreSQL service is running in Railway
3. Ensure database and backend are in the same Railway project

### Missing Environment Variables

**Error:** API keys not found
**Solutions:**
1. Double-check all required variables are set
2. Ensure no typos in variable names
3. Restart the deployment after adding variables

### Prisma Issues

**Error:** Prisma client not generated
**Solutions:**
1. Add `postinstall` script in package.json: `"postinstall": "prisma generate"`
2. Check if schema.prisma is in the correct location
3. Manually run: `railway run npx prisma generate`

### File Upload Issues

**Error:** Cannot create uploads directory
**Solutions:**
1. Ensure the uploads directory exists
2. Check file permissions
3. Use Railway's persistent storage if needed

## Alternative: Deploy to Render

If Railway doesn't work, try Render:

1. Go to [Render.com](https://render.com)
2. Connect GitHub repository
3. Choose "Web Service"
4. Set build command: `npm install && npx prisma generate`
5. Set start command: `npm start`
6. Add environment variables
7. Deploy

## Alternative: Deploy to Heroku

For Heroku deployment:

1. Create Heroku app
2. Add PostgreSQL addon
3. Set environment variables
4. Deploy with Git:
   ```bash
   git remote add heroku https://git.heroku.com/your-app.git
   git push heroku main
   ```

## Security Checklist

Before going live:
- [ ] Change all default passwords
- [ ] Use strong JWT secret
- [ ] Limit CORS to your frontend domain
- [ ] Review API rate limits
- [ ] Enable HTTPS (Railway provides this automatically)
- [ ] Monitor API usage and costs

## Next Steps

1. Deploy your frontend to Vercel/Netlify
2. Update `FRONTEND_URL` in backend environment variables
3. Test the complete system
4. Set up monitoring and logging
5. Configure backup strategies

## Support

If you encounter issues:
1. Check Railway deployment logs
2. Verify all environment variables
3. Test locally first
4. Check Railway status page for service issues
