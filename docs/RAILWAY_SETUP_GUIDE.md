# Railway Setup Guide - Fix Deployment Issues

## 🚨 **Current Issue: "Dockerfile cannot be empty"**

The error occurs because Railway is trying to auto-detect a Dockerfile but can't find one in the root directory. Here's how to fix it:

## 🛠️ **Solution: Deploy Services Separately**

Since your project has multiple services, you need to deploy them as separate Railway services:

### **Step 1: Deploy Spring Boot API (Main Service)**

1. **Go to Railway Dashboard**
   - Visit [railway.app](https://railway.app)
   - Go to your project

2. **Create New Service**
   - Click "New" → "Service"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Service**
   - **Name**: `retail-inventory-spring-api`
   - **Root Directory**: Leave empty (uses root)
   - **Build Command**: (Railway will use the Dockerfile)
   - **Start Command**: `java -jar /app/app.jar`

4. **Add Environment Variables**
   ```bash
   SPRING_PROFILES_ACTIVE=prod
   SERVER_PORT=8080
   JWT_SECRET=your-secure-jwt-secret-here
   ```

### **Step 2: Add PostgreSQL Database**

1. **In the same project**
   - Click "New" → "Database" → "PostgreSQL"
   - Name: `retail-inventory-db`

2. **Connect to Spring Boot API**
   - Go to Spring Boot service settings
   - Add environment variables:
   ```bash
   DB_HOST=${{Postgres.RAILWAY_TCP_PROXY_DOMAIN}}
   DB_PORT=${{Postgres.RAILWAY_TCP_PROXY_PORT}}
   DB_NAME=${{Postgres.PGDATABASE}}
   DB_USERNAME=${{Postgres.PGUSER}}
   DB_PASSWORD=${{Postgres.PGPASSWORD}}
   ```

### **Step 3: Add Redis Cache**

1. **In the same project**
   - Click "New" → "Database" → "Redis"
   - Name: `retail-inventory-redis`

2. **Connect to Spring Boot API**
   - Add environment variables:
   ```bash
   REDIS_HOST=${{Redis.RAILWAY_TCP_PROXY_DOMAIN}}
   REDIS_PORT=${{Redis.RAILWAY_TCP_PROXY_PORT}}
   REDIS_PASSWORD=${{Redis.RAILWAY_TCP_PROXY_PASSWORD}}
   ```

### **Step 4: Deploy ML API**

1. **Create New Service**
   - Click "New" → "Service"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Service**
   - **Name**: `retail-inventory-ml-api`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Add Environment Variables**
   ```bash
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   ALLOWED_ORIGINS=https://your-spring-api.railway.app
   DEBUG=false
   ```

### **Step 5: Deploy Frontend**

1. **Create New Service**
   - Click "New" → "Service"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Service**
   - **Name**: `retail-inventory-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

3. **Add Environment Variables**
   ```bash
   VITE_API_URL=https://your-spring-api.railway.app/api
   ```

## 🔧 **Alternative: Single Service Deployment**

If you want to deploy just the Spring Boot API first:

### **Quick Fix for Current Deployment**

1. **Delete the failed service**
   - Go to your Railway project
   - Delete the failed service

2. **Create new service with correct settings**
   - Use the root Dockerfile I created
   - Set proper environment variables
   - Add PostgreSQL and Redis databases

## 📋 **Environment Variables Checklist**

### **Spring Boot API**
```bash
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080
JWT_SECRET=your-secure-jwt-secret-here
DB_HOST=${{Postgres.RAILWAY_TCP_PROXY_DOMAIN}}
DB_PORT=${{Postgres.RAILWAY_TCP_PROXY_PORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
REDIS_HOST=${{Redis.RAILWAY_TCP_PROXY_DOMAIN}}
REDIS_PORT=${{Redis.RAILWAY_TCP_PROXY_PORT}}
REDIS_PASSWORD=${{Redis.RAILWAY_TCP_PROXY_PASSWORD}}
ML_API_BASEURL=https://your-ml-api.railway.app
```

### **ML API**
```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
ALLOWED_ORIGINS=https://your-frontend.railway.app
DEBUG=false
```

### **Frontend**
```bash
VITE_API_URL=https://your-spring-api.railway.app/api
```

## 🚀 **Deployment Order**

1. **First**: Deploy Spring Boot API with databases
2. **Second**: Deploy ML API (connect to same databases)
3. **Third**: Deploy Frontend (connect to Spring Boot API)

## 🔍 **Troubleshooting**

### **If deployment still fails:**

1. **Check build logs** in Railway dashboard
2. **Verify environment variables** are set correctly
3. **Ensure database connections** are working
4. **Check service URLs** are accessible

### **Common Issues:**

- **Port conflicts**: Use `$PORT` environment variable
- **Database connections**: Use Railway's database connection variables
- **CORS issues**: Set `ALLOWED_ORIGINS` correctly
- **Build failures**: Check Dockerfile paths and build commands

## 📞 **Need Help?**

1. **Check Railway logs** for specific error messages
2. **Verify all environment variables** are set
3. **Test database connections** separately
4. **Start with just the Spring Boot API** first

Your deployment should work now! 🎉
