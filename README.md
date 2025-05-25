# ⚽ Football Field Management System San Bong Xanh

A comprehensive, production-ready web application for managing football field bookings, community opponent finding, and administrative operations with real-time analytics.

## 🌟 Features

### 🏟️ **Core Functionality**
- **Smart Field Booking System**: Real-time availability checking with dynamic pricing
- **Community Opponent Finding**: Advanced matchmaking for teams seeking opponents
- **Comprehensive Admin Dashboard**: Business analytics, revenue tracking, and operational insights
- **Automated Email Notifications**: Booking confirmations and customer communications
- **Multi-Payment Integration**: VietQR, cash, and bank transfer support
- **Customer Feedback System**: Integrated support and feedback management

### 📊 **Business Intelligence**
- **Revenue Analytics**: Real-time financial tracking and reporting
- **Field Utilization Metrics**: Optimize field usage and pricing strategies
- **Customer Insights**: Booking patterns and customer behavior analysis
- **Automated Reporting**: Daily, weekly, monthly, and yearly business reports

### 🔧 **Administrative Tools**
- **Time Slot Management**: Dynamic locking/unlocking with auto-expiry
- **Customer Management**: Comprehensive booking and customer history
- **Feedback Management**: Priority-based customer support system
- **Automated Maintenance**: Scheduled cleanup and data optimization

## 🚀 Tech Stack

### **Backend Architecture**
- **Runtime**: Node.js (v18+) with Express.js framework
- **Database**: MySQL (v8.0+) with Sequelize ORM for data modeling
- **Authentication**: JWT-based secure authentication system
- **Email Service**: Nodemailer with Gmail SMTP integration
- **Task Scheduling**: Node-schedule for automated background processes
- **Security**: CORS, input validation, and error handling middleware

### **Frontend Architecture**
- **Framework**: React 18 with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom component library
- **Routing**: React Router v6 for SPA navigation
- **HTTP Client**: Axios with interceptors for API communication
- **Form Management**: React Hook Form with validation
- **UI Components**: Custom component library with accessibility support

### **Development & Deployment**
- **Package Management**: npm with workspace support
- **Code Quality**: ESLint, TypeScript strict mode
- **Testing**: Playwright for end-to-end testing
- **Documentation**: Comprehensive API and setup documentation

## 📋 Prerequisites

### **System Requirements**
- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **MySQL**: v8.0 or higher ([Download](https://dev.mysql.com/downloads/))
- **npm**: v8.0.0 or higher (included with Node.js)
- **Git**: For version control ([Download](https://git-scm.com/))

### **Development Environment**
- **Operating System**: Windows, macOS, or Linux
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: At least 2GB free space
- **Network**: Internet connection for package installation

## 🛠️ Installation & Setup

### **1. Repository Setup**
```bash
# Clone the repository
git clone https://github.com/Himlamtech/FootballFiled.git
cd FootballField

# Install all dependencies (root, backend, frontend)
npm run install:all
```

### **2. Database Configuration**
```bash
# Ensure MySQL is running on port 3306
# Create database and user (if needed)
mysql -u root -p
CREATE DATABASE FootballField;
```

### **3. Environment Configuration**
```bash
# Copy environment template
cp .env.example .env
```

**Configure your `.env` file:**
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=FootballField
DB_USER=root
DB_PASSWORD=Himlam04@

# JWT Security
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Email Service (Gmail SMTP)
EMAIL_USER=himlam.cursor1@gmail.com
EMAIL_PASS=tbuq mqvt abgr mfxu
EMAIL_FROM=himlam.cursor1@gmail.com
EMAIL_SERVICE=gmail

# Server Configuration
PORT=9002
FRONTEND_PORT=9001
NODE_ENV=development

# Optional: SendGrid Alternative
USE_SENDGRID=false
SENDGRID_API_KEY=your_sendgrid_api_key
```

### **4. Database Initialization**
```bash
# Initialize database with schema and sample data
cd backend
node database/init-database.js
cd ..
```

### **5. Application Startup**
```bash
# Start both frontend and backend concurrently
npm start

# Or start services individually:
npm run start:backend   # Backend API (port 9002)
npm run start:frontend  # Frontend UI (port 9001)
```

## 🌐 Application Access

### **User Interface**
- **Homepage**: http://localhost:9001
- **Field Booking**: Browse available fields and make reservations
- **Opponent Finding**: Post team information and find opponents
- **Customer Feedback**: Submit feedback and view responses

### **Administrative Interface**
- **Admin Dashboard**: http://localhost:9001/admin
- **Default Credentials**:
  - **Username**: `admin`
  - **Password**: `admin`
- **Features**:
  - Real-time business analytics and revenue tracking
  - Field and time slot management
  - Customer booking management
  - Feedback and support system
  - Financial reporting and insights

### **API Access**
- **Base URL**: http://localhost:9002/api
- **Health Check**: http://localhost:9002/api/ping
- **Documentation**: See `docs/API_DOCUMENTATION.md`

## 📚 Documentation

### **Available Documentation**
1. **`docs/API_DOCUMENTATION.md`** - Complete API reference with 25+ endpoints
2. **`docs/FINAL_TESTING_REPORT.md`** - Comprehensive testing results and system analysis
3. **`README.md`** - This setup and overview guide

### **Key API Endpoints**
```bash
# Authentication
POST /api/auth/admin/login     # Admin login
GET  /api/auth/admin/me        # Get current admin

# Field Management
GET  /api/fields               # Get all fields
GET  /api/fields/:id           # Get field by ID
GET  /api/timeslots           # Get available time slots

# Booking System
GET  /api/bookings            # Get all bookings (admin)
POST /api/bookings            # Create new booking
GET  /api/bookings/:id        # Get booking details
PUT  /api/bookings/:id        # Update booking (admin)

# Opponent Finding
GET  /api/opponents           # Get opponent posts
POST /api/opponents           # Create opponent post
DELETE /api/opponents/:id     # Delete opponent post

# Feedback System
GET  /api/feedback            # Get all feedback (admin)
POST /api/feedback            # Submit feedback
POST /api/feedback/:id/reply  # Reply to feedback (admin)

# Analytics & Dashboard
GET  /api/dashboard/stats     # Get dashboard statistics
GET  /api/dashboard/chart     # Get chart data
GET  /api/dashboard/bookings  # Get booking history
```

## 🗄️ Database Schema

### **Core Tables (6 Tables)**
1. **Admin** - System administrators and authentication
2. **Fields** - Football field information (4 fixed fields)
3. **TimeSlots** - Available time slots with dynamic pricing
4. **Bookings** - Field reservations and payment tracking
5. **Opponents** - Team opponent finding and matchmaking
6. **Feedback** - Customer feedback and support system

### **Key Features**
- **Optimized Indexing**: Strategic indexes for performance
- **Data Integrity**: Foreign key constraints and validation
- **Automated Cleanup**: Scheduled removal of expired data
- **Audit Trail**: Creation and modification timestamps

## 🏗️ Project Structure

```
FootballField/
├── 📁 backend/                    # Node.js Backend API
│   ├── 📁 controllers/           # Business logic controllers
│   ├── 📁 models/               # Database models (Sequelize)
│   ├── 📁 routes/               # API route definitions
│   ├── 📁 utils/                # Utility functions and helpers
│   ├── 📁 config/               # Configuration files
│   ├── 📁 database/             # Database setup and migrations
│   ├── 📄 server.js             # Application entry point
│   ├── 📄 package.json          # Backend dependencies
│   └── 📄 .env                  # Environment configuration
├── 📁 frontend/                   # React Frontend Application
│   ├── 📁 src/
│   │   ├── 📁 components/       # Reusable React components
│   │   ├── 📁 pages/            # Page-level components
│   │   ├── 📁 services/         # API service layer
│   │   ├── 📁 utils/            # Frontend utilities
│   │   ├── 📁 hooks/            # Custom React hooks
│   │   └── 📁 layouts/          # Layout components
│   ├── 📁 public/               # Static assets
│   ├── 📄 package.json          # Frontend dependencies
│   └── 📄 vite.config.ts        # Vite configuration
├── 📁 docs/                      # Documentation
│   ├── 📄 API_DOCUMENTATION.md  # Complete API reference
│   └── 📄 FINAL_TESTING_REPORT.md # Testing and analysis
├── 📁 tests/                     # Test files (Playwright)
├── 📄 package.json              # Root package configuration
├── 📄 .env.example              # Environment template
├── 📄 cleanup.sh                # Project cleanup script
└── 📄 README.md                 # This file
```

## 💻 Development

### **Available Scripts**

#### **Root Level Commands**
```bash
npm start                    # Start both frontend and backend
npm run install:all         # Install all dependencies
npm run build               # Build frontend for production
npm test                    # Run comprehensive tests
npm run dev                 # Start development mode
```

#### **Backend Commands**
```bash
cd backend
npm start                   # Start production server
npm run dev                 # Start development server with nodemon
npm run db:init            # Initialize database
npm run cleanup            # Clean expired opponent data
```

#### **Frontend Commands**
```bash
cd frontend
npm run dev                # Start development server (Vite)
npm run build              # Build for production
npm run preview            # Preview production build
npm run lint               # Run ESLint
```

### **Development Workflow**
1. **Setup**: Follow installation instructions
2. **Development**: Use `npm run dev` for hot reloading
3. **Testing**: Run `npm test` before committing
4. **Building**: Use `npm run build` for production builds
5. **Deployment**: Follow deployment guide below

## 🚀 Production Deployment

### **Environment Setup**
```bash
# Set production environment
export NODE_ENV=production

# Build frontend
npm run build

# Start production server
npm start
```

### **Database Optimization**
```sql
-- Optimize database for production
OPTIMIZE TABLE Admin, Fields, TimeSlots, Bookings, Opponents, Feedback;

-- Create additional indexes for performance
CREATE INDEX idx_bookings_date_status ON Bookings(bookingDate, status);
CREATE INDEX idx_opponents_expire ON Opponents(expireDate);
```

### **Security Checklist**
- [ ] Change default admin credentials
- [ ] Use strong JWT secret
- [ ] Enable HTTPS in production
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Monitor application logs

## 🧪 Testing

### **Test Coverage**
- **End-to-End Testing**: Playwright for user workflows
- **API Testing**: Comprehensive endpoint testing
- **Database Testing**: Data integrity and performance
- **Security Testing**: Authentication and authorization

### **Running Tests**
```bash
# Run all tests
npm test

# Run specific test suites
npx playwright test tests/focused-system.test.js

# Generate test reports
npx playwright test --reporter=html
```

## 🔧 Troubleshooting

### **Common Issues**

#### **Database Connection Issues**
```bash
# Check MySQL service
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql

# Check database exists
mysql -u root -p -e "SHOW DATABASES;"
```

#### **Port Conflicts**
```bash
# Check port usage
lsof -i :9001  # Frontend
lsof -i :9002  # Backend
lsof -i :3306  # MySQL

# Kill processes if needed
kill -9 <PID>
```

#### **Email Configuration Issues**
- Verify Gmail app password is correct
- Check firewall settings for SMTP
- Test email configuration with simple send

### **Performance Optimization**
- **Database**: Regular optimization and indexing
- **Frontend**: Code splitting and lazy loading
- **Backend**: Connection pooling and caching
- **Monitoring**: Set up application monitoring

## 📈 Business Metrics

### **Key Performance Indicators**
- **Revenue Tracking**: Real-time financial analytics
- **Field Utilization**: Booking efficiency metrics
- **Customer Satisfaction**: Feedback analysis
- **System Performance**: Response time monitoring

### **Analytics Features**
- **Dashboard**: Real-time business insights
- **Reports**: Automated daily/weekly/monthly reports
- **Trends**: Booking patterns and seasonal analysis
- **Forecasting**: Revenue and demand predictions

## 🤝 Contributing

### **Development Guidelines**
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **Code Standards**
- **TypeScript**: Use strict type checking
- **ESLint**: Follow configured linting rules
- **Comments**: Document complex business logic
- **Testing**: Include tests for new features

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Getting Help**
- **Documentation**: Check `docs/` directory
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions
- **Email**: Contact development team

### **Maintenance**
- **Regular Updates**: Keep dependencies updated
- **Security Patches**: Apply security updates promptly
- **Backup Strategy**: Implement regular database backups
- **Monitoring**: Set up application and server monitoring

---

## 🎯 Quick Start Summary

```bash
# 1. Clone and setup
git clone https://github.com/Himlamtech/FootballFiled.git
cd FootballField
npm run install:all

# 2. Configure environment
cp .env.example .env
# Edit .env with your settings

# 3. Initialize database
cd backend && node database/init-database.js

# 4. Start application
npm start

# 5. Access application
# Frontend: http://localhost:9001
# Admin: http://localhost:9001/admin (admin/admin)
# API: http://localhost:9002/api
```

**🎉 Your Football Field Management System is now ready for production use!**
