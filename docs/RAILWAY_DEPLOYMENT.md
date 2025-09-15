# Railway Deployment Guide

## Prerequisites
- Railway account (free tier available)
- GitHub repository

## Steps

1. **Connect to Railway**
   - Go to [Railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your retail-inventory-platform repository

2. **Configure Services**
   - **Frontend**: Deploy from `frontend/` directory
   - **Spring Boot API**: Deploy from `backend/` with `Dockerfile.spring`
   - **ML API**: Deploy from `backend/` with `Dockerfile`
   - **Database**: Add PostgreSQL service
   - **Cache**: Add Redis service

3. **Environment Variables**
   ```bash
   # Database (auto-configured by Railway)
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   
   # Redis (auto-configured by Railway)
   REDIS_URL=${{Redis.REDIS_URL}}
   
   # Security
   JWT_SECRET=your-secure-jwt-secret
   CORS_ALLOWED_ORIGINS=https://your-app.railway.app
   ```

4. **Deploy**
   - Railway automatically detects your services
   - Deploys each service independently
   - Provides public URLs for each service

## Benefits
- ✅ **Free tier available**
- ✅ **Zero configuration**
- ✅ **Automatic deployments**
- ✅ **Built-in databases**
- ✅ **Custom domains**
- ✅ **SSL certificates**
- ✅ **GitHub integration**

## Cost
- **Free tier**: $0/month (limited usage)
- **Pro tier**: $5/month per service
- **Total estimated**: $0-25/month

## Perfect for:
- ✅ Personal projects
- ✅ Prototypes
- ✅ Small businesses
- ✅ Learning and development

## Quick Start
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway handles the rest!

**Total setup time: 5-10 minutes**
