# Library Management System - Deployment Guide

This guide will help you deploy the Library Management System to a production environment.

## 🚀 Quick Start (Current Setup)

Your project is currently running with:
- **Frontend**: `http://localhost:3000` (or `http://localhost:8080`)
- **Backend**: `http://localhost:5000`
- **Database**: Mock data (in-memory)

## 📋 Prerequisites

### For Development
- Node.js (v16 or higher)
- npm or yarn
- Web browser

### For Production
- Web server (Apache, Nginx, or similar)
- Database server (MySQL 8.0+)
- SSL certificate (recommended)
- Domain name (optional)

## 🔧 Development Setup

### 1. Start the Backend Server
```bash
cd backend
npm install
npm start
```
The API will be available at `http://localhost:5000`

### 2. Start the Frontend Server
```bash
cd frontend
npm install
npm start
```
The frontend will be available at `http://localhost:3000`

### 3. Test the Application
- Open `http://localhost:3000` in your browser
- Try registering a new user
- Login with test credentials:
  - User: `john.doe@email.com` / `password`
  - Admin: `admin@libraryms.com` / `password`

## 🌐 Production Deployment

### Option 1: Traditional Web Hosting

#### 1. Upload Files
Upload the `frontend` folder to your web server's public directory.

#### 2. Configure Web Server
**Apache (.htaccess)**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [QSA,L]

# Enable CORS
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
```

**Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 3. Set Up Backend
Deploy the backend to a server that supports Node.js:
- Heroku
- DigitalOcean App Platform
- AWS EC2
- Google Cloud Platform

### Option 2: Cloud Platforms

#### Heroku Deployment

**1. Prepare for Heroku**
```bash
# In backend directory
npm install express cors bcryptjs jsonwebtoken
```

**2. Create Procfile**
```bash
echo "web: node mock-server.js" > Procfile
```

**3. Deploy to Heroku**
```bash
heroku create your-library-app
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

**4. Update Frontend API URLs**
Update all API calls in JavaScript files to use your Heroku URL:
```javascript
// Change from:
const response = await fetch('http://localhost:5000/api/books');

// To:
const response = await fetch('https://your-library-app.herokuapp.com/api/books');
```

#### Vercel Deployment

**1. Install Vercel CLI**
```bash
npm i -g vercel
```

**2. Deploy Frontend**
```bash
cd frontend
vercel --prod
```

**3. Deploy Backend**
```bash
cd backend
vercel --prod
```

### Option 3: Docker Deployment

#### 1. Create Dockerfile for Frontend
```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 2. Create Dockerfile for Backend
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

#### 3. Create docker-compose.yml
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
  
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
```

#### 4. Deploy with Docker
```bash
docker-compose up -d
```

## 🗄️ Database Setup (Production)

### MySQL Setup

#### 1. Install MySQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# CentOS/RHEL
sudo yum install mysql-server
```

#### 2. Create Database
```sql
CREATE DATABASE library_management_system;
CREATE USER 'library_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON library_management_system.* TO 'library_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 3. Import Schema
```bash
mysql -u library_user -p library_management_system < backend/database/schema.sql
```

#### 4. Update Backend Configuration
Update `backend/mock-server.js` to use MySQL:
```javascript
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'library_user',
    password: 'secure_password',
    database: 'library_management_system'
};

// Replace mock data with MySQL queries
```

## 🔒 Security Considerations

### 1. Environment Variables
Create `.env` file:
```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key
DB_HOST=localhost
DB_USER=library_user
DB_PASSWORD=secure_password
DB_NAME=library_management_system
```

### 2. HTTPS Configuration
- Obtain SSL certificate (Let's Encrypt recommended)
- Configure web server to redirect HTTP to HTTPS
- Update API URLs to use HTTPS

### 3. CORS Configuration
Update CORS settings in backend:
```javascript
app.use(cors({
    origin: ['https://your-domain.com'],
    credentials: true
}));
```

### 4. Rate Limiting
Add rate limiting to prevent abuse:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## 📊 Monitoring and Maintenance

### 1. Logging
Set up application logging:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});
```

### 2. Health Checks
Add health check endpoint:
```javascript
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
```

### 3. Backup Strategy
- Set up automated database backups
- Store backups in secure location
- Test restore procedures regularly

## 🚀 Performance Optimization

### 1. Frontend Optimization
- Minify CSS and JavaScript
- Optimize images
- Enable gzip compression
- Use CDN for static assets

### 2. Backend Optimization
- Enable database connection pooling
- Add caching (Redis recommended)
- Optimize database queries
- Use PM2 for process management

### 3. Database Optimization
- Add appropriate indexes
- Regular maintenance and optimization
- Monitor query performance

## 🔧 Troubleshooting

### Common Issues

#### 1. CORS Errors
- Check CORS configuration in backend
- Ensure frontend URL is whitelisted
- Verify API endpoints are correct

#### 2. Database Connection Issues
- Check database credentials
- Ensure database server is running
- Verify network connectivity

#### 3. Authentication Issues
- Check JWT secret configuration
- Verify token expiration settings
- Ensure proper token handling

### Debug Mode
Enable debug mode for development:
```javascript
// In backend
process.env.NODE_ENV = 'development';

// In frontend
localStorage.setItem('debug', 'true');
```

## 📞 Support

For deployment issues:
1. Check the logs for error messages
2. Verify all dependencies are installed
3. Ensure all environment variables are set
4. Test API endpoints independently

## 🎯 Next Steps

After successful deployment:
1. Set up monitoring and alerting
2. Configure automated backups
3. Implement user analytics
4. Plan for scaling
5. Regular security updates

---

**Happy Deploying! 🚀**
