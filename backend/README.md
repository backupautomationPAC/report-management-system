# Report Management System - Backend

A Node.js/Express backend API for managing client reports with Harvest time tracking integration and OpenAI-powered report generation.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access control
- 📊 **Harvest Integration** - Fetch time entries, clients, and projects
- 🤖 **AI Report Generation** - OpenAI-powered report content generation
- 📄 **Document Generation** - Create Word documents from report data
- 🔄 **Approval Workflow** - Multi-stage approval process (AE → Supervisor → Accounting)
- 👥 **User Management** - Admin interface for managing users
- 🛡️ **Security** - Rate limiting, CORS, Helmet security headers
- 📁 **File Management** - Document storage and download

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed default users
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

The server will start at `http://localhost:3001`

## Railway Deployment

### Quick Deploy
1. **Create Railway Project**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login and deploy
   railway login
   railway init
   railway up
   ```

2. **Add PostgreSQL Database**
   - In Railway dashboard → Add → Database → PostgreSQL
   - Railway will auto-populate DATABASE_URL

3. **Set Environment Variables**
   ```
   DATABASE_URL=(auto-populated by Railway)
   JWT_SECRET=your-secure-jwt-secret
   HARVEST_TOKEN=your-harvest-token
   HARVEST_ACCOUNT_ID=your-harvest-account-id
   OPENAI_API_KEY=your-openai-key
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

4. **Initialize Database**
   ```bash
   railway run npx prisma migrate deploy
   railway run npm run db:seed
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password

### Reports
- `GET /api/reports` - List all reports
- `GET /api/reports/:id` - Get single report
- `POST /api/reports` - Create new report
- `POST /api/reports/:id/approve` - Approve/reject report
- `GET /api/reports/:id/download` - Download report file

### Users (Admin only)
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Harvest Integration
- `GET /api/harvest/time-entries` - Get time entries
- `GET /api/harvest/clients` - Get clients
- `GET /api/harvest/projects` - Get projects

## Default Users

After seeding, these accounts are available:

- **Admin**: admin@tegpr.com / admin123
- **AE**: ae@tegpr.com / ae123
- **Supervisor**: supervisor@tegpr.com / super123
- **Accounting**: accounting@tegpr.com / acc123

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma      # Database schema
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── reports.js        # Report management routes
│   ├── users.js          # User management routes
│   └── harvest.js        # Harvest API routes
├── services/
│   ├── harvest.js        # Harvest API integration
│   ├── openai.js         # OpenAI integration
│   └── document.js       # Document generation
├── middleware/
│   └── auth.js           # Authentication middleware
├── uploads/              # Generated files storage
├── server.js             # Main application file
├── seed.js               # Database seeding
└── package.json          # Dependencies and scripts
```

## Development Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run build` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with default users
- `npm run db:studio` - Open Prisma Studio

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for JWT token signing | Yes |
| `HARVEST_TOKEN` | Harvest Personal Access Token | Yes |
| `HARVEST_ACCOUNT_ID` | Harvest Account ID | Yes |
| `OPENAI_API_KEY` | OpenAI API Key | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | No |
| `PORT` | Server port (default: 3001) | No |

## Troubleshooting

### Common Issues

1. **npm install fails**
   - Ensure Node.js 18+ is installed
   - Clear npm cache: `npm cache clean --force`

2. **Database connection fails**
   - Check DATABASE_URL format
   - Ensure PostgreSQL is running

3. **Prisma errors**
   - Regenerate client: `npx prisma generate`
   - Reset database: `npx prisma migrate reset`

4. **API key errors**
   - Verify all API keys are set in environment variables
   - Check API key permissions and quotas

## Security

- Passwords are hashed with bcrypt
- JWT tokens expire in 24 hours
- Rate limiting: 100 requests per 15 minutes
- CORS configured for frontend domain
- Helmet.js for security headers
- Input validation with express-validator

## Monitoring

Health check endpoint available at `/health` returns:
```json
{
  "status": "OK", 
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

## Updates

To update the application:
1. Pull latest changes
2. Install dependencies: `npm install`
3. Run migrations: `npx prisma migrate deploy`
4. Restart server

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Railway/Vercel deployment logs
3. Ensure all environment variables are set correctly
