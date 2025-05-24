# 🗄️ Database Schema Documentation

## Overview

The Football Field Management System uses a MySQL database with 6 optimized core tables designed for high performance and data integrity. The schema supports real-time booking management, opponent finding, customer feedback, and comprehensive business analytics.

## Database Configuration

- **Database Name**: `FootballField`
- **Engine**: MySQL 8.0+
- **Character Set**: utf8mb4
- **Collation**: utf8mb4_unicode_ci
- **Port**: 3306

## Core Tables

### 1. Admin Table
**Purpose**: System administrators and authentication management

```sql
CREATE TABLE Admin (
    adminId INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phoneNumber VARCHAR(20),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Indexes**:
- `PRIMARY KEY (adminId)`
- `UNIQUE INDEX idx_admin_username (username)`
- `UNIQUE INDEX idx_admin_email (email)`

**Sample Data**:
- Default admin: username='admin', password='admin'

### 2. Fields Table
**Purpose**: Football field information and specifications

```sql
CREATE TABLE Fields (
    fieldId INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    size ENUM('5v5', '7v7', '11v11') NOT NULL,
    imageUrl VARCHAR(255),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Indexes**:
- `PRIMARY KEY (fieldId)`
- `INDEX idx_fields_size (size)`
- `INDEX idx_fields_active (isActive)`

**Fixed Fields** (4 fields total):
1. Sân A (5v5) - Main field with high-quality grass
2. Sân B (7v7) - Medium field for 7-a-side games
3. Sân C (11v11) - Full-size field for 11-a-side games
4. Sân D (5v5) - Secondary small field

### 3. TimeSlots Table
**Purpose**: Available time slots with dynamic pricing

```sql
CREATE TABLE TimeSlots (
    timeSlotId INT PRIMARY KEY AUTO_INCREMENT,
    fieldId INT NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    weekdayPrice DECIMAL(10,2) NOT NULL,
    weekendPrice DECIMAL(10,2) NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fieldId) REFERENCES Fields(fieldId) ON DELETE CASCADE,
    UNIQUE KEY unique_field_time (fieldId, startTime, endTime)
);
```

**Indexes**:
- `PRIMARY KEY (timeSlotId)`
- `FOREIGN KEY idx_timeslots_field (fieldId)`
- `UNIQUE INDEX unique_field_time (fieldId, startTime, endTime)`
- `INDEX idx_timeslots_active (isActive)`
- `INDEX idx_timeslots_time (startTime, endTime)`

**Time Slots** (16 slots per field):
- 08:00-09:00, 09:00-10:00, ..., 23:00-24:00
- Weekday prices: 180,000 - 220,000 VND
- Weekend prices: 220,000 - 280,000 VND

### 4. Bookings Table
**Purpose**: Field reservations and payment tracking

```sql
CREATE TABLE Bookings (
    bookingId INT PRIMARY KEY AUTO_INCREMENT,
    fieldId INT NOT NULL,
    timeSlotId INT NOT NULL,
    bookingDate DATE NOT NULL,
    totalPrice DECIMAL(10,2) NOT NULL,
    status ENUM('Đã đặt', 'Đã hủy', 'Hoàn thành') DEFAULT 'Đã đặt',
    paymentStatus ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    customerName VARCHAR(100) NOT NULL,
    customerPhone VARCHAR(20) NOT NULL,
    customerEmail VARCHAR(100),
    notes TEXT,
    paymentMethod ENUM('vietqr', 'cash', 'transfer') DEFAULT 'vietqr',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fieldId) REFERENCES Fields(fieldId),
    FOREIGN KEY (timeSlotId) REFERENCES TimeSlots(timeSlotId),
    UNIQUE KEY unique_booking (fieldId, timeSlotId, bookingDate)
);
```

**Indexes**:
- `PRIMARY KEY (bookingId)`
- `FOREIGN KEY idx_bookings_field (fieldId)`
- `FOREIGN KEY idx_bookings_timeslot (timeSlotId)`
- `UNIQUE INDEX unique_booking (fieldId, timeSlotId, bookingDate)`
- `INDEX idx_bookings_date (bookingDate)`
- `INDEX idx_bookings_status (status)`
- `INDEX idx_bookings_payment (paymentStatus)`
- `INDEX idx_bookings_customer (customerPhone, customerEmail)`

### 5. Opponents Table
**Purpose**: Team opponent finding and matchmaking

```sql
CREATE TABLE Opponents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(100),
    description TEXT,
    skill_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'intermediate',
    player_count INT DEFAULT 5,
    status ENUM('searching', 'matched', 'cancelled') DEFAULT 'searching',
    expireDate DATETIME NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES Bookings(bookingId) ON DELETE CASCADE
);
```

**Indexes**:
- `PRIMARY KEY (id)`
- `FOREIGN KEY idx_opponents_booking (booking_id)`
- `INDEX idx_opponents_status (status)`
- `INDEX idx_opponents_skill (skill_level)`
- `INDEX idx_opponents_expire (expireDate)`
- `INDEX idx_opponents_created (createdAt)`

**Auto-Cleanup**: Expired posts are automatically removed hourly

### 6. Feedback Table
**Purpose**: Customer feedback and support system

```sql
CREATE TABLE Feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    status ENUM('new', 'read', 'responded') DEFAULT 'new',
    response TEXT,
    adminId INT,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (adminId) REFERENCES Admin(adminId) ON SET NULL
);
```

**Indexes**:
- `PRIMARY KEY (id)`
- `FOREIGN KEY idx_feedback_admin (adminId)`
- `INDEX idx_feedback_status (status)`
- `INDEX idx_feedback_priority (priority)`
- `INDEX idx_feedback_created (createdAt)`

## Relationships

### Entity Relationship Diagram
```
Admin (1) -----> (0..n) Feedback
Fields (1) -----> (0..n) TimeSlots
Fields (1) -----> (0..n) Bookings
TimeSlots (1) -----> (0..n) Bookings
Bookings (1) -----> (0..1) Opponents
```

### Key Relationships
1. **Admin → Feedback**: One admin can handle multiple feedback items
2. **Fields → TimeSlots**: Each field has multiple time slots
3. **Fields → Bookings**: Each field can have multiple bookings
4. **TimeSlots → Bookings**: Each time slot can have multiple bookings (different dates)
5. **Bookings → Opponents**: Each booking can have one opponent post

## Data Constraints

### Business Rules
1. **Unique Bookings**: No double booking (same field, time slot, date)
2. **Active Fields**: Only active fields can be booked
3. **Active Time Slots**: Only active time slots are available
4. **Price Validation**: Prices must be positive values
5. **Date Validation**: Booking dates must be in the future
6. **Opponent Expiry**: Opponent posts expire after 7 days

### Data Validation
- **Email Format**: Valid email addresses required
- **Phone Format**: Valid phone number format
- **Price Range**: Reasonable price ranges enforced
- **Text Limits**: Appropriate text field lengths
- **Enum Values**: Strict enum value enforcement

## Performance Optimizations

### Strategic Indexing
1. **Primary Keys**: Auto-indexed for fast lookups
2. **Foreign Keys**: Indexed for join performance
3. **Search Fields**: Indexed for common queries
4. **Composite Indexes**: For complex query patterns
5. **Unique Constraints**: Prevent duplicate data

### Query Optimization
- **Booking Availability**: Optimized for real-time checking
- **Dashboard Analytics**: Efficient aggregation queries
- **Search Operations**: Fast text and date searches
- **Reporting**: Optimized for business intelligence

## Maintenance Tasks

### Automated Cleanup
```sql
-- Remove expired opponent posts (runs hourly)
DELETE FROM Opponents 
WHERE expireDate < NOW() AND status = 'searching';

-- Archive old bookings (runs monthly)
-- Move bookings older than 1 year to archive table
```

### Database Optimization
```sql
-- Regular maintenance (run weekly)
OPTIMIZE TABLE Admin, Fields, TimeSlots, Bookings, Opponents, Feedback;

-- Update table statistics
ANALYZE TABLE Admin, Fields, TimeSlots, Bookings, Opponents, Feedback;

-- Check table integrity
CHECK TABLE Admin, Fields, TimeSlots, Bookings, Opponents, Feedback;
```

## Backup Strategy

### Daily Backups
```bash
# Full database backup
mysqldump -u root -p FootballField > backup_$(date +%Y%m%d).sql

# Compressed backup
mysqldump -u root -p FootballField | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Recovery Procedures
```bash
# Restore from backup
mysql -u root -p FootballField < backup_20241201.sql

# Restore compressed backup
gunzip < backup_20241201.sql.gz | mysql -u root -p FootballField
```

## Security Considerations

### Access Control
- **Admin Access**: Restricted to authenticated administrators
- **User Data**: Customer information protected
- **Payment Data**: Secure payment status tracking
- **Audit Trail**: All changes logged with timestamps

### Data Protection
- **Encryption**: Sensitive data encrypted at rest
- **Validation**: Input validation prevents SQL injection
- **Sanitization**: Data sanitized before storage
- **Backup Security**: Encrypted backup storage

## Migration Scripts

### Schema Updates
```sql
-- Add new column example
ALTER TABLE Bookings ADD COLUMN referenceNumber VARCHAR(50) UNIQUE;

-- Add new index example
CREATE INDEX idx_bookings_reference ON Bookings(referenceNumber);

-- Update enum values example
ALTER TABLE Feedback MODIFY COLUMN priority ENUM('low', 'medium', 'high', 'urgent');
```

### Data Migration
```sql
-- Update existing data example
UPDATE Bookings SET paymentMethod = 'vietqr' WHERE paymentMethod IS NULL;

-- Migrate data between tables example
INSERT INTO NewTable SELECT * FROM OldTable WHERE condition;
```

This database schema provides a robust foundation for the Football Field Management System with optimized performance, data integrity, and scalability for future growth.
