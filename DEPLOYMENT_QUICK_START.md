# Deployment Quick Reference

## 📋 TL;DR - Deploy in 10 Minutes

### Prerequisites
- GitHub account with this repository
- Vercel account (free at vercel.com)
- Railway account (free at railway.app)

### Step 1: Deploy Frontend to Vercel (2 min)
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import repository → Select `frontend` folder
3. Add environment variable: `VITE_API_BASE_URL=` (we'll update this)
4. Click "Deploy"

### Step 2: Deploy Backend to Railway (5 min)
1. Go to [railway.app](https://railway.app)
2. Create new project → Import GitHub repository
3. In Railway, add MySQL plugin (automatic provisioning)
4. Deploy `backend` folder
5. Railway shows connection details - copy them

### Step 3: Update Frontend to Point to Backend (1 min)
1. Get Railway backend URL from deployment
2. In Vercel project settings → Environment Variables
3. Set `VITE_API_BASE_URL=https://your-railway-backend.com/api`
4. Trigger redeploy

### Step 4: Test
```bash
# Test backend health
curl https://your-railway-backend.com/api/health

# Test login
curl -X POST https://your-railway-backend.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123456"}'
```

## 🔗 Connection Strings

### Railway MySQL
```
Format: mysql://user:password@host:port/database
Get from: Railway Dashboard → MySQL service → Connection
```

### Frontend-to-Backend
```
Frontend: https://smartseason.vercel.app
Backend: https://smartseason-api.railway.app
Environment Variable: VITE_API_BASE_URL=https://smartseason-api.railway.app/api
```

## 🔑 Demo Credentials for Testing

```
Admin:       admin@test.com / admin123456
Agronomist:  agronomist@test.com / agro123456
Farmer:      farmer@test.com / farmer123456
```

## 🛑 Critical Settings (Don't Skip!)

### Backend Environment Variables (Railway)
```env
NODE_ENV=production
JWT_SECRET=generate-random-string-at-least-32-chars
CORS_ORIGIN=https://smartseason.vercel.app
DB_HOST=<railway-mysql-host>
DB_PORT=3306
DB_USER=<railway-user>
DB_PASSWORD=<railway-password>
DB_NAME=smartseason
```

### Frontend Environment Variables (Vercel)
```env
VITE_API_BASE_URL=https://your-railway-backend.com/api
```

## ✅ Post-Deployment Verification

```bash
# 1. Check frontend loads
curl https://smartseason.vercel.app

# 2. Check backend health
curl https://smartseason-api.railway.app/api/health

# 3. Check auth endpoint
curl -X POST https://smartseason-api.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123456"}'

# Expected response:
# {"data":{"user":{...},"token":"eyJ..."}}
```

## 🚀 Redeploy After Changes

### Frontend
```bash
git push origin main  # Auto-deploys to Vercel
# OR manually: vercel --prod
```

### Backend
```bash
git push origin main  # Railway auto-deploys if configured
# OR manually: railway up
```

## 🔄 Rollback

### Vercel (Frontend)
1. Dashboard → Deployments
2. Find previous deployment
3. Click "..." → "Promote to Production"

### Railway (Backend)
1. Dashboard → Deployments
2. Select previous deployment
3. Click "Redeploy"

## 📊 Pricing Summary

| Component | Service | Cost | 
|-----------|---------|------|
| Frontend | Vercel | Free |
| Backend | Railway | ~$5/mo |
| Database | Railway | Included |
| **Total** | | **~$5/month** |

## 🆘 Troubleshooting

### Frontend shows "API error"
- Check backend is running: `curl https://api.example.com/api/health`
- Check `VITE_API_BASE_URL` in Vercel env vars matches actual backend

### Backend won't start
- Check MySQL is running and credentials are correct
- Check `JWT_SECRET` is set (min 32 chars)
- Check `PORT` 4000 is available
- Check all `DB_*` variables are set

### CORS errors
- Check `CORS_ORIGIN` exactly matches frontend URL
- Must include protocol (https://) and domain
- No trailing slashes

### "Unknown column 'farm_id' in field list"
- Backend auto-migrates on startup - ensure it runs
- Check MySQL has permission to ALTER TABLE users

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Full Guide: See DEPLOYMENT.md

## 🎯 What's Next After Deployment?

1. Test all 3 roles (admin, agronomist, farmer)
2. Verify farm data isolation (farmers see only their farm)
3. Set up monitoring/logging
4. Configure automated backups
5. Plan maintenance windows

---

**Need detailed instructions?** See [DEPLOYMENT.md](DEPLOYMENT.md)
