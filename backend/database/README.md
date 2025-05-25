# Football Field Management System - Database Scripts

This directory contains all database-related scripts for the Football Field Management System.

## 📁 Files Overview

### SQL Files
- **`create-database.sql`** - Database schema creation script
- **`seed-data.sql`** - Sample data insertion script

### JavaScript Scripts
- **`setup-database.js`** - Comprehensive database management script (handles all operations)

### Configuration Files
- **`.db_initialized`** - Flag file indicating database has been initialized

## 🚀 Quick Start

### Option 1: Using NPM Scripts (Recommended)
```bash
# Initialize database (first time)
npm run db:init

# Reset database completely
npm run db:reset

# Check database status
npm run db:status

# Seed data only
npm run db:seed
```

### Option 2: Direct Script Execution
```bash
# Navigate to backend directory
cd backend

# Initialize database
node database/setup-database.js init

# Reset database
node database/setup-database.js reset

# Check status
node database/setup-database.js status

# Seed data only
node database/setup-database.js seed
```

## 📊 Database Schema

The system uses 6 optimized core tables:

### 1. Admin
- **Purpose**: Administrator accounts
- **Key Fields**: adminId, username, password, name, email
- **Default User**: admin/admin

### 2. Fields
- **Purpose**: Football field information
- **Key Fields**: fieldId, name, description, size, imageUrl
- **Fixed Count**: Exactly 4 fields

### 3. TimeSlots
- **Purpose**: Available time slots for each field
- **Key Fields**: timeSlotId, fieldId, startTime, endTime, weekdayPrice, weekendPrice
- **Features**: Supports locking/unlocking with isActive flag

### 4. Bookings
- **Purpose**: Customer booking records
- **Key Fields**: bookingId, fieldId, timeSlotId, bookingDate, customerName, totalPrice
- **Status Types**: 'Đã đặt', 'Đã hủy', 'Hoàn thành'
- **Payment Methods**: 'vietqr', 'cash', 'transfer'

### 5. Opponents
- **Purpose**: Posts for finding football opponents
- **Key Fields**: id, booking_id, team_name, skill_level, player_count
- **Skill Levels**: 'beginner', 'intermediate', 'advanced'
- **Auto-cleanup**: Expired posts are automatically removed

### 6. Feedback
- **Purpose**: Customer feedback and reviews
- **Key Fields**: id, name, email, content, status, priority
- **Status Types**: 'new', 'read', 'responded'
- **Priority Levels**: 'low', 'medium', 'high'

## 🛠️ Script Details

### setup-database.js
Comprehensive database management with multiple commands:

```bash
# Available commands
node setup-database.js init     # Initialize database
node setup-database.js reset    # Reset database completely
node setup-database.js seed     # Seed data only
node setup-database.js status   # Check database status
```

**Features:**
- ✅ Checks if database already exists
- ✅ Validates SQL file existence
- ✅ Colored console output
- ✅ Detailed error reporting
- ✅ Connection status monitoring



## 🔧 Configuration

### Environment Variables
Create a `.env` file in the project root:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Himlam04@
DB_NAME=FootballField
```

### Default Configuration
If no `.env` file is found, the scripts use these defaults:
- **Host**: localhost
- **Port**: 3306
- **User**: root
- **Password**: Himlam04@
- **Database**: FootballField

## 📈 Sample Data

After running the initialization or reset, your database will contain:

- **1 Admin User**: username: `admin`, password: `admin`
- **4 Football Fields**: Sân A (5v5), Sân B (7v7), Sân C (11v11), Sân D (5v5)
- **64 Time Slots**: 16 slots per field (8:00 AM - 12:00 AM)
- **25 Sample Bookings**: Mix of past, current, and future bookings
- **8 Opponent Posts**: Various skill levels and team sizes
- **10 Feedback Entries**: Different statuses and priorities

## 🚨 Troubleshooting

### Common Issues

1. **Connection Failed**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:3306
   ```
   - **Solution**: Ensure MySQL server is running
   - **Check**: `sudo systemctl status mysql` (Linux) or check MySQL service

2. **Access Denied**
   ```
   Error: Access denied for user 'root'@'localhost'
   ```
   - **Solution**: Check username/password in `.env` file
   - **Alternative**: Update database credentials

3. **Database Already Exists**
   ```
   Database has already been initialized
   ```
   - **Solution**: Use `reset` command or delete `.db_initialized` file

4. **SQL File Not Found**
   ```
   Error: Required SQL files not found!
   ```
   - **Solution**: Ensure you're running from correct directory
   - **Check**: Files exist in `backend/database/` directory

### Reset Everything
If you encounter persistent issues:

```bash
# Remove initialization flag
rm backend/database/.db_initialized

# Reset database completely
npm run db:reset

# Or manually drop database in MySQL
mysql -u root -p -e "DROP DATABASE IF EXISTS FootballField;"
```

## 🔍 Monitoring

### Check Database Status
```bash
npm run db:status
```

This will show:
- ✅ Connection status
- 📊 Database existence
- 📋 Table record counts
- 🏷️ Initialization flag status

### Manual Database Check
```sql
-- Connect to MySQL
mysql -u root -p

-- Check databases
SHOW DATABASES;

-- Use the database
USE FootballField;

-- Check tables
SHOW TABLES;

-- Check record counts
SELECT 'Admin' as table_name, COUNT(*) as count FROM Admin
UNION ALL
SELECT 'Fields', COUNT(*) FROM Fields
UNION ALL
SELECT 'TimeSlots', COUNT(*) FROM TimeSlots
UNION ALL
SELECT 'Bookings', COUNT(*) FROM Bookings
UNION ALL
SELECT 'Opponents', COUNT(*) FROM Opponents
UNION ALL
SELECT 'Feedback', COUNT(*) FROM Feedback;
```

## 📝 Notes

- The database uses **MySQL** with optimized indexes for performance
- All timestamps are in **DATETIME** format with automatic updates
- Foreign key constraints ensure data integrity
- The system supports both **Vietnamese** and **English** content
- Prices are stored in **VND** (Vietnamese Dong) as DECIMAL(10,2)

## 🔄 Maintenance

### Regular Tasks
1. **Backup Database**: Regular backups recommended
2. **Clean Expired Opponents**: Automatic cleanup via backend service
3. **Monitor Disk Space**: Database can grow with bookings
4. **Update Sample Data**: Refresh seed data as needed

### Performance Tips
- Indexes are optimized for common queries
- Use LIMIT clauses for large result sets
- Regular ANALYZE TABLE for query optimization
- Monitor slow query log
