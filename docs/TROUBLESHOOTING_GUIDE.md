# 🔧 Troubleshooting Guide

## Overview

This comprehensive troubleshooting guide helps resolve common issues in the Football Field Management System. Follow the step-by-step solutions to quickly identify and fix problems.

## 🚨 Common Issues & Solutions

### 1. Database Connection Issues

#### **Problem**: Cannot connect to MySQL database
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solutions**:

**Check MySQL Service**:
```bash
# Linux/Mac
sudo systemctl status mysql
sudo systemctl start mysql

# Windows
net start mysql80

# Check if MySQL is running on port 3306
netstat -an | grep 3306
lsof -i :3306
```

**Verify Database Credentials**:
```bash
# Test connection manually
mysql -h localhost -P 3306 -u root -p

# Check if database exists
mysql -u root -p -e "SHOW DATABASES;"
```

**Fix Environment Configuration**:
```env
# Check .env file
DB_HOST=localhost
DB_PORT=3306
DB_NAME=FootballField
DB_USER=root
DB_PASSWORD=Himlam04@
```

**Recreate Database**:
```bash
cd backend
node database/init-database.js
```

### 2. Port Conflicts

#### **Problem**: Port already in use
```
Error: listen EADDRINUSE :::9001
Error: listen EADDRINUSE :::9002
```

**Solutions**:

**Check Port Usage**:
```bash
# Check what's using the ports
lsof -i :9001  # Frontend
lsof -i :9002  # Backend
lsof -i :3306  # MySQL

# Windows
netstat -ano | findstr :9001
netstat -ano | findstr :9002
```

**Kill Conflicting Processes**:
```bash
# Linux/Mac
kill -9 <PID>

# Windows
taskkill /PID <PID> /F
```

**Change Ports** (if needed):
```env
# In .env file
PORT=9003          # Backend port
FRONTEND_PORT=9004 # Frontend port
```

### 3. Email Service Issues

#### **Problem**: Email notifications not working
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Solutions**:

**Verify Gmail App Password**:
```env
# Check .env configuration
EMAIL_USER=himlam.cursor1@gmail.com
EMAIL_PASS=tbuq mqvt abgr mfxu  # App password, not regular password
EMAIL_SERVICE=gmail
```

**Test Email Configuration**:
```bash
# Test email sending
cd backend
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'himlam.cursor1@gmail.com',
    pass: 'tbuq mqvt abgr mfxu'
  }
});
transporter.sendMail({
  from: 'himlam.cursor1@gmail.com',
  to: 'test@example.com',
  subject: 'Test',
  text: 'Test email'
}, console.log);
"
```

**Alternative Email Service**:
```env
# Use SendGrid instead
USE_SENDGRID=true
SENDGRID_API_KEY=your_sendgrid_api_key
```

### 4. Frontend Build Issues

#### **Problem**: Frontend build fails
```
Error: Failed to resolve import
Error: Module not found
```

**Solutions**:

**Clear Node Modules**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Check Dependencies**:
```bash
# Verify all dependencies are installed
npm ls
npm audit fix
```

**TypeScript Issues**:
```bash
# Check TypeScript configuration
npx tsc --noEmit
```

**Vite Configuration**:
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9001,
    host: true
  }
})
```

### 5. Authentication Issues

#### **Problem**: Admin login not working
```
Error: Invalid credentials
Error: JWT token expired
```

**Solutions**:

**Verify Admin Credentials**:
```sql
-- Check admin user exists
SELECT * FROM Admin WHERE username = 'admin';

-- Reset admin password if needed
UPDATE Admin SET password = 'admin' WHERE username = 'admin';
```

**JWT Configuration**:
```env
# Check JWT settings
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

**Clear Browser Storage**:
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
```

### 6. API Endpoint Issues

#### **Problem**: API endpoints returning 404 or 500 errors

**Solutions**:

**Check API Health**:
```bash
# Test API health endpoint
curl http://localhost:9002/api/ping
```

**Verify Route Configuration**:
```javascript
// Check server.js routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/fields', require('./routes/field.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
```

**Check CORS Configuration**:
```javascript
// In server.js
app.use(cors({
  origin: 'http://localhost:9001',
  credentials: true
}));
```

### 7. Performance Issues

#### **Problem**: Slow application response

**Solutions**:

**Database Optimization**:
```sql
-- Optimize tables
OPTIMIZE TABLE Admin, Fields, TimeSlots, Bookings, Opponents, Feedback;

-- Check slow queries
SHOW PROCESSLIST;

-- Add missing indexes
CREATE INDEX idx_bookings_date_status ON Bookings(bookingDate, status);
```

**Frontend Optimization**:
```bash
# Build optimized version
npm run build

# Analyze bundle size
npm run build -- --analyze
```

**Memory Usage**:
```bash
# Check Node.js memory usage
node --max-old-space-size=4096 server.js

# Monitor system resources
top
htop
```

## 🔍 Debugging Tools

### Backend Debugging

**Enable Debug Logging**:
```env
NODE_ENV=development
DEBUG=app:*
```

**Database Query Logging**:
```javascript
// In database config
const sequelize = new Sequelize(database, username, password, {
  host,
  dialect: 'mysql',
  logging: console.log, // Enable SQL logging
});
```

**API Request Logging**:
```javascript
// Add morgan middleware
app.use(morgan('combined'));
```

### Frontend Debugging

**React Developer Tools**:
- Install React DevTools browser extension
- Use React Profiler for performance analysis

**Network Debugging**:
```javascript
// Add request/response interceptors
axios.interceptors.request.use(request => {
  console.log('Starting Request:', request);
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('Response:', response);
    return response;
  },
  error => {
    console.error('Response Error:', error);
    return Promise.reject(error);
  }
);
```

## 📊 Monitoring & Logs

### Application Logs

**Backend Logs**:
```bash
# View real-time logs
tail -f backend/logs/app.log

# Search for errors
grep -i error backend/logs/app.log
```

**Database Logs**:
```bash
# MySQL error log
tail -f /var/log/mysql/error.log

# Query log
tail -f /var/log/mysql/mysql.log
```

### System Monitoring

**Resource Usage**:
```bash
# CPU and memory usage
top
htop

# Disk usage
df -h
du -sh *

# Network connections
netstat -tulpn
```

**Process Monitoring**:
```bash
# Find Node.js processes
ps aux | grep node

# Monitor specific process
watch -n 1 'ps aux | grep node'
```

## 🚀 Performance Optimization

### Database Optimization

**Query Optimization**:
```sql
-- Analyze query performance
EXPLAIN SELECT * FROM Bookings WHERE bookingDate = '2024-12-01';

-- Add composite indexes for common queries
CREATE INDEX idx_bookings_field_date ON Bookings(fieldId, bookingDate);
```

**Connection Pooling**:
```javascript
// Optimize Sequelize connection pool
const sequelize = new Sequelize(database, username, password, {
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});
```

### Frontend Optimization

**Code Splitting**:
```typescript
// Lazy load components
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
```

**Bundle Optimization**:
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  }
});
```

## 🔒 Security Issues

### Common Security Problems

**SQL Injection Prevention**:
```javascript
// Use parameterized queries
const bookings = await Booking.findAll({
  where: {
    customerEmail: email // Sequelize automatically escapes
  }
});
```

**XSS Prevention**:
```typescript
// Sanitize user input
import DOMPurify from 'dompurify';
const cleanContent = DOMPurify.sanitize(userInput);
```

**CORS Configuration**:
```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://yourdomain.com' 
    : 'http://localhost:9001',
  credentials: true
}));
```

## 📞 Getting Help

### Support Channels

1. **Documentation**: Check `docs/` directory
2. **GitHub Issues**: Create detailed bug reports
3. **Community**: Join discussions
4. **Email Support**: Contact development team

### Bug Report Template

```markdown
**Environment**:
- OS: [Windows/Mac/Linux]
- Node.js version: [version]
- MySQL version: [version]
- Browser: [if frontend issue]

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Error Messages**:
[Copy exact error messages]

**Additional Context**:
[Any other relevant information]
```

### Emergency Contacts

- **Critical Issues**: Immediate response required
- **Business Hours**: 9 AM - 6 PM (UTC+7)
- **Response Time**: Within 24 hours for non-critical issues

---

## 🎯 Quick Diagnostic Checklist

```bash
# 1. Check all services are running
systemctl status mysql
lsof -i :9001
lsof -i :9002

# 2. Test database connection
mysql -u root -p -e "USE FootballField; SHOW TABLES;"

# 3. Test API endpoints
curl http://localhost:9002/api/ping

# 4. Check application logs
tail -f backend/logs/app.log

# 5. Verify environment configuration
cat .env | grep -v PASSWORD
```

**If all checks pass but issues persist, contact support with detailed error logs and system information.**
