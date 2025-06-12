# Modern Report Management System

A comprehensive web-based report management system with Harvest API integration, OpenAI-powered report generation, and multi-stage approval workflows.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- PostgreSQL (or use managed database)

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd modern-report-system
   ```

2. **Install dependencies:**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup:**
   ```bash
   # Copy environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

4. **Configure your environment variables** (see Environment Variables section below)

5. **Run the development servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

Visit `http://localhost:3000` to access the application.

## 🌐 Deployment Options

### Option 1: Free Tier Deployment (Recommended)

**Frontend → Vercel**
**Backend → Railway**
**Database → Railway PostgreSQL**
**File Storage → Cloudinary (Free tier)**

### Option 2: Alternative Free Deployment

**Frontend → Netlify**
**Backend → Render**
**Database → Supabase**
**File Storage → AWS S3 (Free tier)**

## 📦 One-Click Deployment

### Deploy to Railway (Backend + Database)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template)

### Deploy to Vercel (Frontend)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/modern-report-system/tree/main/frontend)

## 🔧 Environment Variables

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/dbname

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# APIs
HARVEST_ACCESS_TOKEN=your-harvest-token
HARVEST_ACCOUNT_ID=your-harvest-account-id
OPENAI_API_KEY=your-openai-api-key

# File Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app
NEXT_PUBLIC_APP_NAME=Report Management System
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT with secure httpOnly cookies
- **File Storage**: Cloudinary for document storage
- **AI Integration**: OpenAI GPT-4 for report generation
- **API Integration**: Harvest API for time tracking data

### System Features
- ✅ User authentication with role-based access control
- ✅ Harvest API integration for time tracking data
- ✅ OpenAI-powered intelligent report generation
- ✅ Multi-stage approval workflow (AE → Supervisor → Accounting)
- ✅ Document generation and cloud storage
- ✅ Real-time status updates
- ✅ Responsive modern UI
- ✅ Email notifications
- ✅ Audit trails and logging

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- SQL injection prevention (Prisma ORM)
- CORS configuration
- Rate limiting
- Environment variable protection
- Secure file upload handling

## 📱 User Roles

1. **Account Executive (AE)**: Creates and submits reports
2. **Supervisor**: Reviews and approves AE submissions
3. **Accounting**: Final approval and billing processing
4. **Admin**: System administration and user management

## 🚀 Deployment Guides

### Railway Deployment (Backend)
1. Connect your GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Railway will automatically deploy on push to main branch

### Vercel Deployment (Frontend)
1. Connect your GitHub repository to Vercel
2. Set build settings: Framework = Next.js, Root directory = frontend
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Supabase Database Setup (Alternative)
1. Create new project at supabase.com
2. Copy connection string to DATABASE_URL
3. Run migrations: `npm run db:migrate`

## 📚 API Documentation

Once deployed, API documentation is available at:
- Development: `http://localhost:3001/api/docs`
- Production: `https://your-backend-domain.railway.app/api/docs`

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test
npm run test:coverage

# Frontend tests
cd frontend
npm run test
npm run test:e2e
```

## 🛠️ Development Tools

- **Code Quality**: ESLint, Prettier
- **Type Safety**: TypeScript
- **Database**: Prisma ORM with migrations
- **Testing**: Jest, React Testing Library
- **Containerization**: Docker & Docker Compose

## 📊 Monitoring & Analytics

- Error tracking with Sentry (optional)
- Performance monitoring
- Database query optimization
- API response time tracking

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](./docs)
- 🐛 [Report Issues](https://github.com/your-username/modern-report-system/issues)
- 💬 [Discussions](https://github.com/your-username/modern-report-system/discussions)

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Bulk report generation
- [ ] Integration with more time tracking tools
- [ ] Advanced AI features for insights
- [ ] Multi-tenant support
