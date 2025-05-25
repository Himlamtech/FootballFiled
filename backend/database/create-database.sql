-- Football Field Management System Database Schema (MySQL version)
-- Optimized schema with 6 core tables only: Admin, Fields, TimeSlots, Bookings, Opponents, Feedback
-- Removed excess tables: Reviews, Notifications, FieldManagement for better maintainability

-- Drop database if exists and create a new one
DROP DATABASE IF EXISTS FootballField;
CREATE DATABASE FootballField;
USE FootballField;

-- Admin Table (Simplified from Users table - only for admin accounts)
CREATE TABLE Admin (
    adminId INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phoneNumber VARCHAR(15),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_admin_username (username),
    INDEX idx_admin_email (email)
);

-- Fields Table (Exactly 4 fixed football fields)
CREATE TABLE Fields (
    fieldId INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    size ENUM('5v5', '7v7', '11v11') NOT NULL,
    imageUrl VARCHAR(255),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_field_size (size),
    INDEX idx_field_active (isActive)
);

-- TimeSlots Table (Pricing by time periods)
CREATE TABLE TimeSlots (
    timeSlotId INT AUTO_INCREMENT PRIMARY KEY,
    fieldId INT NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    weekdayPrice DECIMAL(10, 2) NOT NULL,
    weekendPrice DECIMAL(10, 2) NOT NULL,
    isActive BOOLEAN DEFAULT TRUE COMMENT 'For locking/unlocking time slots',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fieldId) REFERENCES Fields(fieldId) ON DELETE CASCADE,
    UNIQUE KEY UQ_FieldTimeSlot (fieldId, startTime, endTime),
    INDEX idx_timeslot_field (fieldId),
    INDEX idx_timeslot_active (isActive),
    INDEX idx_timeslot_time (startTime, endTime)
);

-- Bookings Table (User booking history and records)
CREATE TABLE Bookings (
    bookingId INT AUTO_INCREMENT PRIMARY KEY,
    fieldId INT NOT NULL,
    timeSlotId INT NOT NULL,
    bookingDate DATE NOT NULL,
    totalPrice DECIMAL(10, 2) NOT NULL,
    status ENUM('Đã đặt', 'Đã hủy', 'Hoàn thành') DEFAULT 'Đã đặt',
    paymentStatus ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    customerName VARCHAR(100) NOT NULL,
    customerPhone VARCHAR(20) NOT NULL,
    customerEmail VARCHAR(100),
    notes TEXT,
    paymentMethod ENUM('vietqr', 'cash', 'transfer') DEFAULT 'vietqr',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fieldId) REFERENCES Fields(fieldId) ON DELETE CASCADE,
    FOREIGN KEY (timeSlotId) REFERENCES TimeSlots(timeSlotId) ON DELETE CASCADE,
    UNIQUE KEY UQ_Booking (fieldId, timeSlotId, bookingDate),
    INDEX idx_booking_date (bookingDate),
    INDEX idx_booking_status (status),
    INDEX idx_booking_payment (paymentStatus),
    INDEX idx_booking_customer (customerName, customerPhone)
);

-- Opponents Table (Posts for finding football opponents)
CREATE TABLE Opponents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(100),
    description TEXT,
    skill_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'intermediate',
    player_count INT DEFAULT 5 CHECK (player_count BETWEEN 1 AND 22),
    status ENUM('searching', 'matched', 'cancelled') DEFAULT 'searching',
    expireDate DATETIME NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES Bookings(bookingId) ON DELETE CASCADE,
    INDEX idx_opponent_status (status),
    INDEX idx_opponent_skill (skill_level),
    INDEX idx_opponent_expire (expireDate),
    INDEX idx_opponent_booking (booking_id)
);

-- Feedback Table (Customer feedback and reviews)
CREATE TABLE Feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    status ENUM('new', 'read', 'responded') DEFAULT 'new',
    response TEXT,
    adminId INT,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (adminId) REFERENCES Admin(adminId) ON DELETE SET NULL,
    INDEX idx_feedback_status (status),
    INDEX idx_feedback_priority (priority),
    INDEX idx_feedback_admin (adminId)
);