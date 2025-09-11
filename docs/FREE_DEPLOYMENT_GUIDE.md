# Free Deployment Guide

## 🚀 Option 1: Railway (BEST FREE OPTION)

### Why Railway?
- ✅ **$5 free credit monthly** (enough for small apps)
- ✅ **Zero configuration**
- ✅ **Automatic deployments**
- ✅ **Built-in databases**
- ✅ **Custom domains**
- ✅ **SSL certificates**

### Steps

1. **Go to Railway**
   - Visit [railway.app](https://railway.app)
   - Sign up with GitHub (free)

2. **Deploy Your App**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `retail-inventory-platform` repository
   - Railway auto-detects your services!

3. **Add Databases**
   - Click "New" → "Database" → "PostgreSQL"
   - Click "New" → "Database" → "Redis"

4. **Configure Environment Variables**
   ```bash
   # Database (auto-configured)
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   
   # Redis (auto-configured)
   REDIS_URL=${{Redis.REDIS_URL}}
   
   # Security
   JWT_SECRET=your-secure-jwt-secret-here
   CORS_ALLOWED_ORIGINS=https://your-app.railway.app
   ```

5. **Deploy**
   - Railway automatically deploys all services
   - Get your live URLs in minutes!

**Cost: FREE (with $5 monthly credit)**
**Setup time: 5-10 minutes**

---

## 🆓 Option 2: Render (Great Free Tier)

### Why Render?
- ✅ **Free tier available**
- ✅ **Automatic SSL**
- ✅ **Custom domains**
- ✅ **Built-in databases**

### Steps

1. **Go to Render**
   - Visit [render.com](https://render.com)
   - Sign up with GitHub

2. **Create Services**
   - **Web Service**: Spring Boot API
   - **Web Service**: ML API  
   - **Static Site**: Frontend
   - **PostgreSQL**: Database
   - **Redis**: Cache

3. **Configure Each Service**
   ```bash
   # Spring Boot API
   Build Command: cd backend && ./mvnw clean package -DskipTests
   Start Command: java -jar target/retail-inventory-platform-1.0.0.jar
   
   # ML API
   Build Command: cd backend && pip install -r requirements.txt
   Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
   
   # Frontend
   Build Command: cd frontend && npm install && npm run build
   Publish Directory: frontend/dist
   ```

4. **Set Environment Variables**
   ```bash
   # Database
   DATABASE_URL=postgresql://user:pass@host:port/db
   
   # Redis
   REDIS_URL=redis://user:pass@host:port
   
   # Security
   JWT_SECRET=your-secure-jwt-secret
   ```

**Cost: FREE (with limitations)**
**Setup time: 15-20 minutes**

---

## 🆓 Option 3: Fly.io (Developer Friendly)

### Why Fly.io?
- ✅ **Free tier available**
- ✅ **Global edge deployment**
- ✅ **Docker-based**
- ✅ **Great performance**

### Steps

1. **Install Fly CLI**
   ```bash
   # macOS
   brew install flyctl
   
   # Or download from fly.io
   ```

2. **Login and Initialize**
   ```bash
   fly auth login
   fly launch
   ```

3. **Deploy Services**
   ```bash
   # Deploy Spring Boot API
   cd backend
   fly deploy --dockerfile Dockerfile.spring
   
   # Deploy ML API
   fly deploy --dockerfile Dockerfile
   
   # Deploy Frontend
   cd ../frontend
   fly deploy --dockerfile Dockerfile.prod
   ```

4. **Add Databases**
   ```bash
   # PostgreSQL
   fly postgres create --name retail-inventory-db
   
   # Redis
   fly redis create --name retail-inventory-redis
   ```

**Cost: FREE (with usage limits)**
**Setup time: 20-30 minutes**

---

## 🆓 Option 4: Vercel + PlanetScale (Frontend + Backend)

### Why This Combo?
- ✅ **Vercel**: Free frontend hosting
- ✅ **PlanetScale**: Free MySQL database
- ✅ **Supabase**: Free PostgreSQL alternative

### Steps

1. **Deploy Frontend to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set root directory to `frontend/`
   - Deploy!

2. **Set up Database**
   - Go to [planetscale.com](https://planetscale.com) (MySQL)
   - Or [supabase.com](https://supabase.com) (PostgreSQL)
   - Create free database

3. **Deploy Backend to Railway/Render**
   - Use Railway or Render for backend services
   - Connect to your database

**Cost: FREE**
**Setup time: 15-25 minutes**

---

## 🆓 Option 5: GitHub Codespaces + ngrok (Development)

### Why This Option?
- ✅ **Completely free**
- ✅ **Full development environment**
- ✅ **Public URLs via ngrok**

### Steps

1. **Enable Codespaces**
   - Go to your GitHub repository
   - Click "Code" → "Codespaces" → "Create codespace"

2. **Install Dependencies**
   ```bash
   # In Codespace terminal
   ./setup.sh
   ```

3. **Start Services**
   ```bash
   docker-compose up -d
   ```

4. **Expose with ngrok**
   ```bash
   # Install ngrok
   npm install -g ngrok
   
   # Expose frontend
   ngrok http 3000
   
   # Expose Spring Boot API
   ngrok http 8080
   
   # Expose ML API
   ngrok http 8000
   ```

**Cost: FREE (GitHub Pro required for private repos)**
**Setup time: 10-15 minutes**

---

## 🏆 **RECOMMENDATION: Railway**

For the **easiest and most reliable free deployment**, I recommend **Railway**:

### Why Railway is Best for Free Deployment:
1. **$5 free credit monthly** - enough for small applications
2. **Zero configuration** - just connect GitHub and deploy
3. **Built-in databases** - PostgreSQL and Redis included
4. **Automatic deployments** - updates on every push
5. **Custom domains** - add your own domain for free
6. **SSL certificates** - automatic HTTPS
7. **Great documentation** - easy to follow

### Quick Railway Setup:
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add PostgreSQL and Redis databases
6. Set environment variables
7. Deploy!

**Total time: 5-10 minutes**
**Cost: FREE (with $5 monthly credit)**

---

## 💡 **Pro Tips for Free Deployment**

1. **Optimize Images**: Use multi-stage Docker builds to reduce image size
2. **Environment Variables**: Use free tier limits efficiently
3. **Database Connections**: Use connection pooling
4. **Caching**: Implement Redis caching to reduce database calls
5. **Monitoring**: Use free monitoring tools like UptimeRobot

## 🚨 **Free Tier Limitations**

- **Railway**: 500 hours/month, $5 credit
- **Render**: 750 hours/month, sleep after inactivity
- **Fly.io**: 3 shared-cpu-1x VMs, 160GB bandwidth
- **Vercel**: 100GB bandwidth, 100 serverless functions

## 🎯 **Next Steps**

1. **Choose Railway** (recommended)
2. **Follow the Railway setup guide**
3. **Deploy your app**
4. **Share your live URL!**

Your retail inventory platform will be live and accessible worldwide in minutes! 🚀
