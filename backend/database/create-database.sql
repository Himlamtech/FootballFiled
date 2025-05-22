-- Football Field Management System Database Schema (MySQL version)

-- Drop database if exists and create a new one
DROP DATABASE IF EXISTS FootballField;
CREATE DATABASE FootballField;
USE FootballField;

-- Users Table
CREATE TABLE Users (
    userId INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(15),
    role VARCHAR(20) NOT NULL DEFAULT 'admin', -- chỉ có 'admin'
    isActive BOOLEAN DEFAULT TRUE
);

-- Fields Table (Football Fields)
CREATE TABLE Fields (
    fieldId INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    size VARCHAR(50) NOT NULL, -- '5v5', '7v7', '11v11'
    imageUrl VARCHAR(255),
    isActive BOOLEAN DEFAULT TRUE
);

-- TimeSlots Table
CREATE TABLE TimeSlots (
    timeSlotId INT AUTO_INCREMENT PRIMARY KEY,
    fieldId INT NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    weekdayPrice DECIMAL(10, 2) NOT NULL,
    weekendPrice DECIMAL(10, 2) NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (fieldId) REFERENCES Fields(fieldId) ON DELETE CASCADE,
    UNIQUE KEY UQ_FieldTimeSlot (fieldId, startTime, endTime),
    INDEX idx_timeslot_active (isActive)
);

-- Bookings Table
CREATE TABLE Bookings (
    bookingId INT AUTO_INCREMENT PRIMARY KEY,
    fieldId INT NOT NULL,
    timeSlotId INT NOT NULL,
    bookingDate DATE NOT NULL,
    totalPrice DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Đã đặt', -- chỉ có 'Đã đặt'
    paymentStatus VARCHAR(50) DEFAULT 'pending',
    customerName VARCHAR(100),
    customerPhone VARCHAR(20),
    customerEmail VARCHAR(100),
    notes TEXT,
    paymentMethod VARCHAR(50) DEFAULT 'vietqr',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fieldId) REFERENCES Fields(fieldId) ON DELETE CASCADE,
    FOREIGN KEY (timeSlotId) REFERENCES TimeSlots(timeSlotId) ON DELETE CASCADE,
    UNIQUE KEY UQ_Booking (fieldId, timeSlotId, bookingDate),
    INDEX idx_booking_date (bookingDate),
    INDEX idx_booking_status (status)
);

-- Reviews Table
CREATE TABLE Reviews (
    reviewId INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    fieldId INT NOT NULL,
    bookingId INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment VARCHAR(500),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE,
    FOREIGN KEY (fieldId) REFERENCES Fields(fieldId) ON DELETE CASCADE,
    FOREIGN KEY (bookingId) REFERENCES Bookings(bookingId) ON DELETE CASCADE,
    UNIQUE KEY UQ_UserBookingReview (userId, bookingId),
    INDEX idx_review_rating (rating)
);

-- Notifications Table
CREATE TABLE Notifications (
    notificationId INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    message VARCHAR(500) NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
    relatedId INT, -- ID of related entity (booking, review, etc.)
    relatedType VARCHAR(50), -- Type of related entity ('booking', 'review', etc.)
    isRead BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE,
    INDEX idx_notification_user (userId),
    INDEX idx_notification_read (isRead),
    INDEX idx_notification_type (type)
);

-- Opponents Table
CREATE TABLE Opponents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(15) NOT NULL,
    contact_email VARCHAR(100),
    description TEXT,
    skill_level VARCHAR(20) DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced'
    player_count INT DEFAULT 5,
    status ENUM('searching', 'matched', 'cancelled') DEFAULT 'searching',
    expireDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES Bookings(bookingId) ON DELETE CASCADE,
    INDEX idx_opponent_status (status),
    INDEX idx_opponent_skill (skill_level)
);

-- Feedback Table
CREATE TABLE Feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    status ENUM('new', 'read', 'responded') DEFAULT 'new',
    response TEXT,
    user_id INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(userId) ON DELETE SET NULL,
    INDEX idx_feedback_status (status)
);
