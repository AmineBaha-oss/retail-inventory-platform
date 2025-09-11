# Railway Deployment Troubleshooting

## 🚨 **Current Issue: Health Check Failure**

Your deployment is building successfully but failing health checks. Here's how to fix it:

### **Problem Analysis:**
- ✅ Build: **SUCCESS** (57.61 seconds)
- ❌ Health Check: **FAILING** on `/api/actuator/health`
- 🔄 Status: **RESTARTING** (multiple restarts)

### **Root Causes:**
1. **Missing curl** in Docker image for health checks
2. **Insufficient startup time** for Spring Boot application
3. **Missing environment variables** for database connection
4. **Port configuration** issues

## 🛠️ **Immediate Fixes Applied:**

### **1. Fixed Dockerfile Health Check**
```dockerfile
# Added curl installation
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Increased startup time and timeout
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/actuator/health || exit 1
```

### **2. Updated Railway Configuration**
```json
{
  "healthcheckTimeout": 300,  // Increased from 100 to 300 seconds
  "healthcheckPath": "/api/actuator/health"
}
```

## 🚀 **Next Steps to Fix Your Deployment:**

### **Step 1: Add Required Environment Variables**

In your Railway service settings, add these environment variables:

```bash
# Application Configuration
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080
JWT_SECRET=your-secure-jwt-secret-here

# Database Configuration (if you have PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=retail_inventory
DB_USERNAME=retail_user
DB_PASSWORD=your-db-password

# Redis Configuration (if you have Redis)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Disable database for now (to get basic deployment working)
SPRING_DATASOURCE_URL=jdbc:h2:mem:testdb
SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.H2Dialect
SPRING_H2_CONSOLE_ENABLED=true
```

### **Step 2: Add PostgreSQL Database**

1. **In Railway Dashboard:**
   - Go to your project
   - Click "New" → "Database" → "PostgreSQL"
   - Name: `retail-inventory-db`

2. **Connect to your service:**
   - Go to your Spring Boot service
   - Add these environment variables:
   ```bash
   DB_HOST=${{Postgres.RAILWAY_TCP_PROXY_DOMAIN}}
   DB_PORT=${{Postgres.RAILWAY_TCP_PROXY_PORT}}
   DB_NAME=${{Postgres.PGDATABASE}}
   DB_USERNAME=${{Postgres.PGUSER}}
   DB_PASSWORD=${{Postgres.PGPASSWORD}}
   ```

### **Step 3: Redeploy**

1. **Push the updated code:**
   ```bash
   git add .
   git commit -m "fix: Improve Railway health checks and startup time"
   git push origin main
   ```

2. **Railway will automatically redeploy** with the fixes

## 🔍 **Alternative: Quick Test Deployment**

If you want to test the deployment quickly without databases:

### **Minimal Environment Variables:**
```bash
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080
JWT_SECRET=test-secret-key
SPRING_DATASOURCE_URL=jdbc:h2:mem:testdb
SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.H2Dialect
SPRING_H2_CONSOLE_ENABLED=true
```

This will use an in-memory H2 database for testing.

## 📊 **Monitoring Your Deployment:**

### **Check Deployment Logs:**
1. Go to Railway Dashboard
2. Click on your service
3. Go to "Deploy Logs" tab
4. Look for:
   - ✅ "Started RetailInventoryApplication"
   - ✅ "Tomcat started on port(s): 8080"
   - ❌ Any error messages

### **Test Health Endpoint:**
Once deployed, test: `https://your-app.railway.app/api/actuator/health`

## 🚨 **Common Issues & Solutions:**

### **Issue 1: "Connection refused"**
- **Cause**: Application not starting
- **Solution**: Check environment variables and logs

### **Issue 2: "Database connection failed"**
- **Cause**: Missing database or wrong credentials
- **Solution**: Add PostgreSQL service and environment variables

### **Issue 3: "Port already in use"**
- **Cause**: Port configuration conflict
- **Solution**: Use `$PORT` environment variable

### **Issue 4: "Health check timeout"**
- **Cause**: Application taking too long to start
- **Solution**: Increase health check timeout (already done)

## 🎯 **Expected Result:**

After applying these fixes, you should see:
- ✅ Build: **SUCCESS**
- ✅ Health Check: **PASSING**
- ✅ Status: **RUNNING**
- 🌐 **Live URL**: `https://your-app.railway.app`

## 📞 **Still Having Issues?**

1. **Check the deploy logs** for specific error messages
2. **Verify all environment variables** are set correctly
3. **Start with minimal configuration** (H2 database)
4. **Add databases gradually** once basic deployment works

Your deployment should work now! 🚀
