# 🔧 Environment Setup Guide

## Overview

This guide provides detailed instructions for setting up the development and production environments for the Football Field Management System.

## 📋 System Requirements

### **Minimum Requirements**
- **CPU**: 2 cores, 2.0 GHz
- **RAM**: 4 GB
- **Storage**: 10 GB free space
- **Network**: Broadband internet connection

### **Recommended Requirements**
- **CPU**: 4 cores, 2.5 GHz or higher
- **RAM**: 8 GB or higher
- **Storage**: 20 GB SSD
- **Network**: High-speed internet connection

### **Software Requirements**
- **Node.js**: v18.0.0 or higher
- **MySQL**: v8.0 or higher
- **npm**: v8.0.0 or higher
- **Git**: Latest version

## 🛠️ Development Environment Setup

### **1. Install Node.js**

**Windows**:
```bash
# Download from https://nodejs.org/
# Or use Chocolatey
choco install nodejs

# Verify installation
node --version
npm --version
```

**macOS**:
```bash
# Using Homebrew
brew install node

# Or download from https://nodejs.org/
# Verify installation
node --version
npm --version
```

**Linux (Ubuntu/Debian)**:
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### **2. Install MySQL**

**Windows**:
```bash
# Download MySQL Installer from https://dev.mysql.com/downloads/installer/
# Or use Chocolatey
choco install mysql

# Start MySQL service
net start mysql80
```

**macOS**:
```bash
# Using Homebrew
brew install mysql

# Start MySQL service
brew services start mysql

# Secure installation
mysql_secure_installation
```

**Linux (Ubuntu/Debian)**:
```bash
# Install MySQL Server
sudo apt update
sudo apt install mysql-server

# Start and enable MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure installation
sudo mysql_secure_installation
```

### **3. Configure MySQL**

**Create Database and User**:
```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database
CREATE DATABASE FootballField;

-- Create user (optional, can use root)
CREATE USER 'footballuser'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON FootballField.* TO 'footballuser'@'localhost';
FLUSH PRIVILEGES;

-- Verify database creation
SHOW DATABASES;
USE FootballField;
```

**MySQL Configuration** (`/etc/mysql/mysql.conf.d/mysqld.cnf`):
```ini
[mysqld]
# Basic settings
port = 3306
bind-address = 127.0.0.1

# Performance settings
max_connections = 200
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M

# Character set
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# SQL mode
sql_mode = STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO
```

### **4. Install Git**

**Windows**:
```bash
# Download from https://git-scm.com/
# Or use Chocolatey
choco install git
```

**macOS**:
```bash
# Using Homebrew
brew install git

# Or install Xcode Command Line Tools
xcode-select --install
```

**Linux**:
```bash
# Ubuntu/Debian
sudo apt install git

# CentOS/RHEL
sudo yum install git
```

## 🔐 Environment Configuration

### **1. Environment Variables**

Create `.env` file in the project root:

```env
# ===========================================
# FOOTBALL FIELD MANAGEMENT SYSTEM CONFIG
# ===========================================

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=FootballField
DB_USER=root
DB_PASSWORD=Himlam04@

# Server Configuration
PORT=9002
FRONTEND_PORT=9001
NODE_ENV=development

# JWT Authentication
JWT_SECRET=football_field_management_super_secure_jwt_secret_key_2024
JWT_EXPIRES_IN=7d

# Email Service Configuration (Gmail SMTP)
EMAIL_SERVICE=gmail
EMAIL_USER=himlam.cursor1@gmail.com
EMAIL_PASS=tbuq mqvt abgr mfxu
EMAIL_FROM=himlam.cursor1@gmail.com

# Alternative Email Service (SendGrid)
USE_SENDGRID=false
SENDGRID_API_KEY=your_sendgrid_api_key_here

# CORS Configuration
CORS_ORIGIN=http://localhost:9001

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Session Configuration
SESSION_SECRET=football_field_session_secret_key_2024
SESSION_TIMEOUT=3600000

# Feature Flags
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_OPPONENT_CLEANUP=true
ENABLE_ANALYTICS=true
```

### **2. Environment-Specific Configurations**

**Development (.env.development)**:
```env
NODE_ENV=development
DEBUG=app:*
LOG_LEVEL=debug

# Development database
DB_NAME=FootballField_dev

# Relaxed CORS for development
CORS_ORIGIN=*

# Email testing
EMAIL_TESTING=true
```

**Production (.env.production)**:
```env
NODE_ENV=production
LOG_LEVEL=warn

# Production database
DB_HOST=your_production_db_host
DB_NAME=FootballField_prod
DB_USER=your_production_db_user
DB_PASSWORD=your_secure_production_password

# Secure CORS
CORS_ORIGIN=https://yourdomain.com

# Production email
EMAIL_USER=your_production_email@yourdomain.com
EMAIL_PASS=your_production_email_password

# Security settings
JWT_SECRET=your_super_secure_production_jwt_secret
SESSION_SECRET=your_super_secure_production_session_secret
```

**Testing (.env.test)**:
```env
NODE_ENV=test
LOG_LEVEL=error

# Test database
DB_NAME=FootballField_test

# Disable external services
ENABLE_EMAIL_NOTIFICATIONS=false
EMAIL_TESTING=true
```

## 🚀 Application Setup

### **1. Clone Repository**
```bash
git clone https://github.com/Himlamtech/FootballFiled.git
cd FootballField
```

### **2. Install Dependencies**
```bash
# Install all dependencies (root, backend, frontend)
npm run install:all

# Or install individually
npm install                    # Root dependencies
cd backend && npm install      # Backend dependencies
cd ../frontend && npm install  # Frontend dependencies
```

### **3. Database Initialization**
```bash
# Initialize database with schema and sample data
cd backend
node database/init-database.js

# Verify database setup
mysql -u root -p FootballField -e "SHOW TABLES;"
```

### **4. Start Application**
```bash
# Start both frontend and backend
npm start

# Or start individually
npm run start:backend   # Backend on port 9002
npm run start:frontend  # Frontend on port 9001
```

## 🔧 IDE Configuration

### **Visual Studio Code**

**Recommended Extensions**:
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

**Settings** (`.vscode/settings.json`):
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### **WebStorm/IntelliJ**

**Configuration**:
1. Enable Node.js support
2. Configure TypeScript service
3. Set up ESLint integration
4. Configure Prettier formatting
5. Enable Tailwind CSS support

## 🐳 Docker Setup (Optional)

### **Dockerfile**
```dockerfile
# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 9002

CMD ["npm", "start"]
```

### **Docker Compose**
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: Himlam04@
      MYSQL_DATABASE: FootballField
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: ./backend
    ports:
      - "9002:9002"
    depends_on:
      - mysql
    environment:
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_NAME=FootballField
      - DB_USER=root
      - DB_PASSWORD=Himlam04@

  frontend:
    build: ./frontend
    ports:
      - "9001:9001"
    depends_on:
      - backend

volumes:
  mysql_data:
```

## 🔍 Verification Steps

### **1. System Check**
```bash
# Check Node.js and npm versions
node --version  # Should be v18.0.0+
npm --version   # Should be v8.0.0+

# Check MySQL
mysql --version  # Should be 8.0+
mysql -u root -p -e "SELECT VERSION();"
```

### **2. Database Verification**
```bash
# Check database and tables
mysql -u root -p FootballField -e "
SHOW TABLES;
SELECT COUNT(*) as admin_count FROM Admin;
SELECT COUNT(*) as field_count FROM Fields;
SELECT COUNT(*) as timeslot_count FROM TimeSlots;
"
```

### **3. Application Health Check**
```bash
# Test backend API
curl http://localhost:9002/api/ping

# Test frontend
curl http://localhost:9001

# Test admin login
curl -X POST http://localhost:9002/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin","password":"admin"}'
```

## 🚨 Common Setup Issues

### **Port Conflicts**
```bash
# Check if ports are in use
lsof -i :9001
lsof -i :9002
lsof -i :3306

# Kill conflicting processes
kill -9 <PID>
```

### **Permission Issues**
```bash
# Fix npm permissions (Linux/Mac)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Fix MySQL permissions
sudo chown -R mysql:mysql /var/lib/mysql
```

### **MySQL Connection Issues**
```bash
# Reset MySQL root password
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Himlam04@';
FLUSH PRIVILEGES;
```

## 📚 Additional Resources

### **Documentation Links**
- [Node.js Documentation](https://nodejs.org/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### **Useful Commands**
```bash
# Check system resources
top
htop
df -h

# Monitor logs
tail -f backend/logs/app.log
tail -f /var/log/mysql/error.log

# Network diagnostics
netstat -tulpn
ping localhost
```

---

## ✅ Setup Completion Checklist

- [ ] Node.js v18+ installed and verified
- [ ] MySQL 8.0+ installed and running
- [ ] Git installed and configured
- [ ] Repository cloned successfully
- [ ] Dependencies installed (root, backend, frontend)
- [ ] Environment variables configured
- [ ] Database initialized with sample data
- [ ] Backend API responding (http://localhost:9002/api/ping)
- [ ] Frontend accessible (http://localhost:9001)
- [ ] Admin login working (admin/admin)
- [ ] Email service configured and tested

**🎉 Environment setup complete! Your Football Field Management System is ready for development.**
