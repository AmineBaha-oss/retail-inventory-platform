# Heroku Deployment Guide

## Prerequisites
- Heroku account
- Heroku CLI installed
- GitHub repository

## Steps

1. **Create Heroku Apps**
   ```bash
   # Create apps for each service
   heroku create retail-inventory-frontend
   heroku create retail-inventory-spring-api
   heroku create retail-inventory-ml-api
   ```

2. **Add Databases**
   ```bash
   # Add PostgreSQL to Spring Boot API
   heroku addons:create heroku-postgresql:mini --app retail-inventory-spring-api
   
   # Add Redis to Spring Boot API
   heroku addons:create heroku-redis:mini --app retail-inventory-spring-api
   
   # Add PostgreSQL to ML API
   heroku addons:create heroku-postgresql:mini --app retail-inventory-ml-api
   ```

3. **Configure Environment Variables**
   ```bash
   # Spring Boot API
   heroku config:set JWT_SECRET=your-jwt-secret --app retail-inventory-spring-api
   heroku config:set ML_API_BASEURL=https://retail-inventory-ml-api.herokuapp.com --app retail-inventory-spring-api
   
   # ML API
   heroku config:set ALLOWED_ORIGINS=https://retail-inventory-frontend.herokuapp.com --app retail-inventory-ml-api
   ```

4. **Deploy Services**
   ```bash
   # Deploy Spring Boot API
   git subtree push --prefix backend heroku-spring-api main
   
   # Deploy ML API
   git subtree push --prefix backend heroku-ml-api main
   
   # Deploy Frontend
   git subtree push --prefix frontend heroku-frontend main
   ```

5. **Create Procfile for each service**
   ```bash
   # backend/Procfile
   web: java -jar target/retail-inventory-platform-1.0.0.jar
   
   # backend/Procfile.ml
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   
   # frontend/Procfile
   web: npm start
   ```

## Benefits
- ✅ **Easy deployment**
- ✅ **Automatic scaling**
- ✅ **Built-in monitoring**
- ✅ **Add-on ecosystem**
- ✅ **Git-based deployments**

## Cost
- **Free tier**: Discontinued
- **Basic**: $7/month per dyno
- **Standard**: $25/month per dyno
- **Total estimated**: $21-75/month

## Limitations
- ❌ No free tier
- ❌ More expensive than alternatives
- ❌ Limited customization
