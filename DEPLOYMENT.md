# SmartSeason Deployment Guide

This guide covers deploying both the frontend and backend to production.

## Architecture Overview

```
┌─────────────────────┐
│  Vercel (Frontend)  │  React/Vite SPA
│  smartseason.vercel │
└──────────┬──────────┘
           │ HTTPS
           ↓
┌─────────────────────────────┐
│  Railway/Render (Backend)   │  Express API
│  smartseason-api.railway.app│
└─────────────────────────────┘
           │
           ↓
┌─────────────────────┐
│   MySQL Database    │  AWS RDS / Railway DB
│                     │
└─────────────────────┘
```

## Frontend Deployment to Vercel

### Prerequisites

- Vercel account (free at [vercel.com](https://vercel.com))
- GitHub repository with this code
- Deployed backend API (see Backend Deployment below)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit for deployment"
git remote add origin https://github.com/YOUR_USERNAME/SmartSeason-Field-Monitoring-System.git
git push -u origin main
```

### Step 2: Create Vercel Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Select `frontend` as the root directory
4. Configure build settings:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Set Environment Variables

In Vercel project settings → Environment Variables, add:

```
VITE_API_BASE_URL=https://your-backend-url.com/api
```

### Step 4: Deploy

Click "Deploy" - Vercel will automatically:
- Install dependencies
- Build the React/Vite app
- Deploy to CDN
- Generate SSL certificate

**Frontend URL**: `https://smartseason.vercel.app`

### Redeployment

Any push to main branch automatically redeploys. To manually redeploy:

```bash
vercel --prod
```

## Backend Deployment Options

### Option 1: Railway (Recommended - Easiest)

Railway is the easiest option with MySQL database hosting included.

#### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "Create New Project"
3. Select "Deploy from GitHub"
4. Connect your GitHub repository

#### Step 2: Add MySQL Database

1. In Railway dashboard, click "+ New"
2. Select "MySQL" database
3. Railway automatically creates database and provides connection string

#### Step 3: Deploy Backend

1. Select your repo → `backend` folder
2. Add environment variables from `backend/.env.production.example`
3. Set MySQL connection from Railway's provided credentials
4. Deploy

**Backend URL**: `https://smartseason-api-production-xxxx.railway.app`

### Option 2: Render

Similar to Railway but requires separate database setup.

#### Step 1: Create Render Service

1. Go to [render.com](https://render.com)
2. Create new "Web Service"
3. Connect GitHub repository
4. Set build command: `npm install` (in backend folder)
5. Set start command: `npm start`

#### Step 2: Set Environment Variables

In Render dashboard, add all variables from `backend/.env.production.example`

#### Step 3: Provision Database (Optional)

Render integrates with AWS RDS. Create PostgreSQL database and update credentials.

**Backend URL**: `https://smartseason-api.render.com`

### Option 3: Traditional Hosting (AWS, Google Cloud, Azure)

For advanced deployments:

1. Set up EC2/App Engine/App Service instance
2. Install Node.js and MySQL driver
3. Deploy using CI/CD pipeline
4. Set up SSL with Let's Encrypt

## Database Setup

### Railway MySQL (Easiest)

1. Railway automatically provisions MySQL
2. Connection string: `mysql://user:password@host:port/database`
3. Update `DB_*` environment variables

### AWS RDS

```bash
aws rds create-db-instance \
  --db-instance-identifier smartseason-mysql \
  --db-instance-class db.t3.micro \
  --engine mysql
```

### Manual MySQL Server

Ensure MySQL 8+ is installed and accessible:

```bash
mysql -h your-db-host -u root -p < database/schema.sql
mysql -h your-db-host -u root -p < database/seed.sql
```

## Environment Variables

### Frontend (.env.production.local)

```env
VITE_API_BASE_URL=https://smartseason-api-production-xxxx.railway.app/api
```

### Backend (.env production)

```env
PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://smartseason.vercel.app
JWT_SECRET=your-very-strong-random-secret-min-32-chars
JWT_EXPIRES_IN=1d
DB_HOST=smartseason.railway.internal
DB_PORT=3306
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=smartseason
```

## Production Checklist

- [ ] JWT_SECRET changed from default (at least 32 random characters)
- [ ] DATABASE credentials set to production values
- [ ] CORS_ORIGIN set to production frontend URL
- [ ] SSL/TLS enabled on all connections
- [ ] Database backups configured
- [ ] Environment variables are NOT committed to git
- [ ] .env files are in .gitignore
- [ ] Build process tested locally: `npm run build`
- [ ] Health check endpoint accessible: `/api/health`
- [ ] HTTPS enforced on all connections

## Testing Production Environment

After deployment, verify everything works:

```bash
# Test frontend
curl https://smartseason.vercel.app

# Test backend health
curl https://smartseason-api-production-xxxx.railway.app/api/health

# Test auth endpoint
curl -X POST https://smartseason-api-production-xxxx.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123456"}'
```

## Troubleshooting

### Frontend won't build
```bash
# Check build locally
cd frontend
npm run build

# Check for environment variables
echo $VITE_API_BASE_URL
```

### Backend won't start
```bash
# Check database connection
npm run dev  # Should show "API running on http://localhost:4000"

# Verify environment variables are set
env | grep DB_
```

### CORS errors
- Verify `CORS_ORIGIN` matches frontend URL exactly
- Check browser console for the rejected origin
- Ensure trailing slashes are consistent

### Database connection errors
- Verify credentials in `.env`
- Check network/firewall rules allow connection
- Confirm database service is running
- Test connection locally first

## Continuous Deployment

### Automatic Frontend Deployment (Vercel)

Already configured - any push to main branch deploys automatically.

### Automatic Backend Deployment (Railway)

1. Connect GitHub repository to Railway
2. Select deployment branch (main)
3. Configure deploy on every push

### Manual Deployment

```bash
# Frontend
vercel --prod

# Backend (Railway CLI)
railway up

# Backend (Render)
# Push to your repository - Render auto-deploys
```

## Monitoring & Logs

### Vercel
- Dashboard: [vercel.com/dashboard](https://vercel.com/dashboard)
- Logs: Click project → "Deployments" → "Functions"

### Railway
- Dashboard: [railway.app](https://railway.app)
- Logs: Real-time streaming in project view

### Render
- Dashboard: [render.com/dashboard](https://render.com/dashboard)
- Logs: Service → "Logs"

## Rollback

### Frontend (Vercel)
1. Go to "Deployments"
2. Click "..." on previous deployment
3. Select "Rollback to this deployment"

### Backend (Railway)
1. Go to "Deployments"
2. Select previous deployment
3. Click "Redeploy"

## Cost Estimates

| Service | Tier | Cost |
|---------|------|------|
| Vercel | Free | $0/month |
| Railway | Starter | ~$5/month |
| MySQL (Railway) | Included | Included |
| Total | | ~$5/month |

## Support & Resources

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Express Deployment: https://expressjs.com/en/advanced/best-practice-performance.html
- MySQL Best Practices: https://dev.mysql.com/doc/

## Next Steps

1. Deploy frontend to Vercel
2. Deploy backend to Railway/Render
3. Update frontend API endpoint
4. Test all RBAC flows in production
5. Set up monitoring and alerts
6. Configure automated backups
