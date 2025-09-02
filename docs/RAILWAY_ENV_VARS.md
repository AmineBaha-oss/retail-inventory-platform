# Railway Environment Variables Setup

## 🚨 **Critical Fix: Health Check Path**

The issue was that Spring Boot has a context path `/api`, making the health endpoint `/api/api/actuator/health`. I've created a production configuration that removes the context path.

## 🛠️ **Required Environment Variables for Railway**

### **Step 1: Basic Configuration (Required)**
```bash
SPRING_PROFILES_ACTIVE=prod
PORT=8080
JWT_SECRET=your-secure-jwt-secret-here
```

### **Step 2: Database Configuration (Choose One)**

#### **Option A: H2 In-Memory Database (Quick Test)**
```bash
SPRING_DATASOURCE_URL=jdbc:h2:mem:testdb
SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.H2Dialect
SPRING_H2_CONSOLE_ENABLED=true
SPRING_JPA_HIBERNATE_DDL_AUTO=create-drop
```

#### **Option B: PostgreSQL Database (Production)**
```bash
DB_HOST=${{Postgres.RAILWAY_TCP_PROXY_DOMAIN}}
DB_PORT=${{Postgres.RAILWAY_TCP_PROXY_PORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
```

### **Step 3: Redis Configuration (Optional)**
```bash
REDIS_HOST=${{Redis.RAILWAY_TCP_PROXY_DOMAIN}}
REDIS_PORT=${{Redis.RAILWAY_TCP_PROXY_PORT}}
REDIS_PASSWORD=${{Redis.RAILWAY_TCP_PROXY_PASSWORD}}
```

## 🚀 **Quick Setup Instructions**

### **1. Add Environment Variables in Railway:**
1. Go to Railway Dashboard
2. Click on your service (`retail-inventory-platform`)
3. Go to "Variables" tab
4. Add the variables above

### **2. For Quick Testing (Recommended):**
Use the H2 database configuration - it will work immediately without needing to set up PostgreSQL.

### **3. For Production:**
1. Add PostgreSQL database in Railway
2. Use the PostgreSQL configuration variables
3. Add Redis if needed

## 🔍 **Health Check Fix Applied**

- ✅ **Created `application-prod.yml`** with context path removed
- ✅ **Updated health check path** to `/actuator/health`
- ✅ **Fixed port configuration** to use `$PORT` environment variable
- ✅ **Simplified configuration** for Railway deployment

## 📋 **Environment Variables Checklist**

### **Minimum Required:**
- [ ] `SPRING_PROFILES_ACTIVE=prod`
- [ ] `PORT=8080`
- [ ] `JWT_SECRET=your-secure-jwt-secret-here`

### **For H2 Database (Quick Test):**
- [ ] `SPRING_DATASOURCE_URL=jdbc:h2:mem:testdb`
- [ ] `SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.H2Dialect`
- [ ] `SPRING_H2_CONSOLE_ENABLED=true`
- [ ] `SPRING_JPA_HIBERNATE_DDL_AUTO=create-drop`

### **For PostgreSQL (Production):**
- [ ] `DB_HOST=${{Postgres.RAILWAY_TCP_PROXY_DOMAIN}}`
- [ ] `DB_PORT=${{Postgres.RAILWAY_TCP_PROXY_PORT}}`
- [ ] `DB_NAME=${{Postgres.PGDATABASE}}`
- [ ] `DB_USERNAME=${{Postgres.PGUSER}}`
- [ ] `DB_PASSWORD=${{Postgres.PGPASSWORD}}`

## 🎯 **Expected Result**

After adding these environment variables:
- ✅ **Build**: SUCCESS
- ✅ **Health Check**: PASSING on `/actuator/health`
- ✅ **Status**: RUNNING
- 🌐 **Live URL**: `https://your-app.railway.app`

## 🚨 **If Still Failing**

1. **Check deploy logs** for specific error messages
2. **Verify environment variables** are set correctly
3. **Start with H2 database** for quick testing
4. **Check the health endpoint** manually: `https://your-app.railway.app/actuator/health`

Your deployment should work now! 🚀
