-- Football Field Management System Database Schema
-- This script creates the database and tables for the Football Field Management System

-- Drop tables if they exist to avoid foreign key constraint errors
SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS opponents;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS booking_products;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS fields;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS=1;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
  status ENUM('active', 'inactive', 'banned') DEFAULT 'active' NOT NULL,
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_user_email (email),
  INDEX idx_user_status (status),
  INDEX idx_user_role (role)
);

-- Fields table
CREATE TABLE IF NOT EXISTS fields (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL COMMENT 'Field size, e.g. "5-a-side", "11-a-side"',
  price_per_hour DECIMAL(10, 2) NOT NULL,
  status ENUM('available', 'maintenance', 'booked') DEFAULT 'available' NOT NULL,
  image_url VARCHAR(255),
  facilities TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_field_status (status),
  INDEX idx_field_type (field_type)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category ENUM('equipment', 'drinks', 'food', 'service') NOT NULL,
  image_url VARCHAR(255),
  stock_quantity INT NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_product_category (category),
  INDEX idx_product_availability (is_available)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  field_id INT NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending' NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending' NOT NULL,
  payment_method ENUM('cash', 'credit_card', 'bank_transfer', 'e_wallet'),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (field_id) REFERENCES fields(id),
  INDEX idx_booking_user (user_id),
  INDEX idx_booking_field (field_id),
  INDEX idx_booking_date (booking_date),
  INDEX idx_booking_status (status)
);

-- Booking Products (junction table for many-to-many relationship)
CREATE TABLE IF NOT EXISTS booking_products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL COMMENT 'Price at the time of booking',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_booking_product_booking (booking_id),
  INDEX idx_booking_product_product (product_id)
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  booking_id INT NOT NULL,
  field_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (field_id) REFERENCES fields(id),
  INDEX idx_feedback_user (user_id),
  INDEX idx_feedback_booking (booking_id),
  INDEX idx_feedback_field (field_id)
);

-- Opponents table (for finding match opponents)
CREATE TABLE IF NOT EXISTS opponents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  booking_id INT,
  team_name VARCHAR(255) NOT NULL,
  player_count INT NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TIME NOT NULL,
  status ENUM('open', 'matched', 'completed', 'cancelled') DEFAULT 'open' NOT NULL,
  matched_opponent_id INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (matched_opponent_id) REFERENCES opponents(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_opponent_user (user_id),
  INDEX idx_opponent_status (status),
  INDEX idx_opponent_date (preferred_date)
);

-- Insert sample data

-- Insert admin user (password: admin123)
INSERT INTO users (name, email, password, phone, role, status, avatar_url) VALUES
('Admin User', 'admin@example.com', '$2a$10$rrCvDmUyF0WtqDwsAyD6UOJOy4/AxA2nxBsEn2XBTpzJeJQAyMS4K', '0909123456', 'admin', 'active', 'https://randomuser.me/api/portraits/men/1.jpg');

-- Insert regular users (password: password123)
INSERT INTO users (name, email, password, phone, role, status, avatar_url) VALUES
('User 1', 'user1@example.com', '$2a$10$rrCvDmUyF0WtqDwsAyD6UOJOy4/AxA2nxBsEn2XBTpzJeJQAyMS4K', '0909123457', 'user', 'active', 'https://randomuser.me/api/portraits/men/2.jpg'),
('User 2', 'user2@example.com', '$2a$10$rrCvDmUyF0WtqDwsAyD6UOJOy4/AxA2nxBsEn2XBTpzJeJQAyMS4K', '0909123458', 'user', 'active', 'https://randomuser.me/api/portraits/women/2.jpg'),
('User 3', 'user3@example.com', '$2a$10$rrCvDmUyF0WtqDwsAyD6UOJOy4/AxA2nxBsEn2XBTpzJeJQAyMS4K', '0909123459', 'user', 'active', 'https://randomuser.me/api/portraits/men/3.jpg'),
('User 4', 'user4@example.com', '$2a$10$rrCvDmUyF0WtqDwsAyD6UOJOy4/AxA2nxBsEn2XBTpzJeJQAyMS4K', '0909123460', 'user', 'active', 'https://randomuser.me/api/portraits/women/3.jpg'),
('User 5', 'user5@example.com', '$2a$10$rrCvDmUyF0WtqDwsAyD6UOJOy4/AxA2nxBsEn2XBTpzJeJQAyMS4K', '0909123461', 'user', 'active', 'https://randomuser.me/api/portraits/men/4.jpg');

-- Insert fields
INSERT INTO fields (name, description, location, field_type, price_per_hour, status, image_url, facilities) VALUES
('Football Field 1', 'A quality 5-a-side football field with excellent facilities.', 'Hanoi', '5-a-side', 250000, 'available', 'https://source.unsplash.com/random/800x600?football,field,1', 'Parking, Lighting, Changing Rooms, Shower'),
('Football Field 2', 'A quality 7-a-side football field with excellent facilities.', 'Ho Chi Minh City', '7-a-side', 350000, 'available', 'https://source.unsplash.com/random/800x600?football,field,2', 'Parking, Lighting, Shower, Cafeteria'),
('Football Field 3', 'A quality 11-a-side football field with excellent facilities.', 'Da Nang', '11-a-side', 500000, 'available', 'https://source.unsplash.com/random/800x600?football,field,3', 'Lighting, Changing Rooms, Restaurant'),
('Football Field 4', 'A quality 5-a-side football field with excellent facilities.', 'Hue', '5-a-side', 200000, 'available', 'https://source.unsplash.com/random/800x600?football,field,4', 'Parking, Shower, Restaurant, Free Wifi'),
('Football Field 5', 'A quality 7-a-side football field with excellent facilities.', 'Can Tho', '7-a-side', 300000, 'available', 'https://source.unsplash.com/random/800x600?football,field,5', 'Changing Rooms, Shower, Cafeteria, Free Wifi');

-- Insert products
-- Equipment
INSERT INTO products (name, description, price, category, image_url, stock_quantity, is_available) VALUES
('Football', 'Quality football for players.', 250000, 'equipment', 'https://source.unsplash.com/random/200x200?football', 50, TRUE),
('Goalkeeper Gloves', 'Quality goalkeeper gloves for players.', 150000, 'equipment', 'https://source.unsplash.com/random/200x200?goalkeeper,gloves', 30, TRUE),
('Shin Guards', 'Quality shin guards for players.', 100000, 'equipment', 'https://source.unsplash.com/random/200x200?shin,guards', 40, TRUE),
('Football Socks', 'Quality football socks for players.', 50000, 'equipment', 'https://source.unsplash.com/random/200x200?football,socks', 100, TRUE),
('Jersey (Set)', 'Quality jersey set for teams.', 300000, 'equipment', 'https://source.unsplash.com/random/200x200?football,jersey', 25, TRUE);

-- Drinks
INSERT INTO products (name, description, price, category, image_url, stock_quantity, is_available) VALUES
('Water Bottle', 'Refreshing water for players.', 15000, 'drinks', 'https://source.unsplash.com/random/200x200?water,bottle', 200, TRUE),
('Sports Drink', 'Energizing sports drink for players.', 25000, 'drinks', 'https://source.unsplash.com/random/200x200?sports,drink', 150, TRUE),
('Energy Drink', 'High-energy drink for players.', 30000, 'drinks', 'https://source.unsplash.com/random/200x200?energy,drink', 100, TRUE),
('Coconut Water', 'Natural coconut water for hydration.', 20000, 'drinks', 'https://source.unsplash.com/random/200x200?coconut,water', 80, TRUE),
('Iced Tea', 'Refreshing iced tea for players.', 18000, 'drinks', 'https://source.unsplash.com/random/200x200?iced,tea', 120, TRUE);

-- Food
INSERT INTO products (name, description, price, category, image_url, stock_quantity, is_available) VALUES
('Energy Bar', 'Nutritious energy bar for players.', 30000, 'food', 'https://source.unsplash.com/random/200x200?energy,bar', 100, TRUE),
('Sandwich', 'Fresh sandwich for players.', 35000, 'food', 'https://source.unsplash.com/random/200x200?sandwich', 40, TRUE),
('Fruit Pack', 'Assorted fresh fruits for players.', 25000, 'food', 'https://source.unsplash.com/random/200x200?fruit,pack', 60, TRUE),
('Protein Snack', 'High-protein snack for players.', 40000, 'food', 'https://source.unsplash.com/random/200x200?protein,snack', 50, TRUE),
('Chips', 'Tasty chips for players.', 20000, 'food', 'https://source.unsplash.com/random/200x200?chips', 150, TRUE);

-- Services
INSERT INTO products (name, description, price, category, image_url, stock_quantity, is_available) VALUES
('Referee Service', 'Professional referee for your match.', 200000, 'service', 'https://source.unsplash.com/random/200x200?referee', 10, TRUE),
('Photography Service', 'Professional photography for your match.', 300000, 'service', 'https://source.unsplash.com/random/200x200?sports,photography', 5, TRUE),
('Equipment Rental', 'Full equipment set rental for teams.', 500000, 'service', 'https://source.unsplash.com/random/200x200?football,equipment', 8, TRUE),
('Coaching Session', 'Professional coaching session for teams.', 400000, 'service', 'https://source.unsplash.com/random/200x200?football,coach', 3, TRUE),
('Field Decoration', 'Special decoration for events and tournaments.', 350000, 'service', 'https://source.unsplash.com/random/200x200?field,decoration', 2, TRUE);

-- Insert bookings (sample data for past and future bookings)
-- Current date bookings
INSERT INTO bookings (user_id, field_id, booking_date, start_time, end_time, status, total_price, payment_status, payment_method, notes)
VALUES
(2, 1, CURDATE(), '08:00:00', '10:00:00', 'confirmed', 500000, 'paid', 'cash', 'Please prepare the field 15 minutes before the scheduled time.'),
(3, 2, CURDATE(), '10:00:00', '12:00:00', 'confirmed', 700000, 'paid', 'bank_transfer', NULL),
(4, 3, CURDATE(), '14:00:00', '16:00:00', 'confirmed', 1000000, 'paid', 'e_wallet', NULL),
(5, 4, CURDATE(), '16:00:00', '18:00:00', 'confirmed', 400000, 'paid', 'credit_card', 'We need extra balls.');

-- Past bookings (completed)
INSERT INTO bookings (user_id, field_id, booking_date, start_time, end_time, status, total_price, payment_status, payment_method, notes)
VALUES
(2, 1, DATE_SUB(CURDATE(), INTERVAL 7 DAY), '08:00:00', '10:00:00', 'completed', 500000, 'paid', 'cash', NULL),
(3, 2, DATE_SUB(CURDATE(), INTERVAL 6 DAY), '10:00:00', '12:00:00', 'completed', 700000, 'paid', 'bank_transfer', NULL),
(4, 3, DATE_SUB(CURDATE(), INTERVAL 5 DAY), '14:00:00', '16:00:00', 'completed', 1000000, 'paid', 'e_wallet', NULL),
(5, 4, DATE_SUB(CURDATE(), INTERVAL 4 DAY), '16:00:00', '18:00:00', 'completed', 400000, 'paid', 'credit_card', NULL);

-- Past bookings (cancelled)
INSERT INTO bookings (user_id, field_id, booking_date, start_time, end_time, status, total_price, payment_status, payment_method, notes)
VALUES
(2, 5, DATE_SUB(CURDATE(), INTERVAL 10 DAY), '18:00:00', '20:00:00', 'cancelled', 600000, 'refunded', 'credit_card', 'Cancelled due to bad weather.');

-- Future bookings
INSERT INTO bookings (user_id, field_id, booking_date, start_time, end_time, status, total_price, payment_status, payment_method, notes)
VALUES
(2, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '08:00:00', '10:00:00', 'confirmed', 500000, 'paid', 'cash', NULL),
(3, 2, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '10:00:00', '12:00:00', 'confirmed', 700000, 'paid', 'bank_transfer', NULL),
(4, 3, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '14:00:00', '16:00:00', 'pending', 1000000, 'pending', NULL, NULL),
(5, 4, DATE_ADD(CURDATE(), INTERVAL 4 DAY), '16:00:00', '18:00:00', 'pending', 400000, 'pending', NULL, 'First time booking.');

-- Insert booking products
INSERT INTO booking_products (booking_id, product_id, quantity, price)
VALUES
(1, 1, 1, 250000),  -- Football for booking 1
(1, 6, 5, 75000),   -- Water bottles for booking 1
(2, 2, 2, 300000),  -- Goalkeeper gloves for booking 2
(2, 7, 10, 250000), -- Sports drinks for booking 2
(3, 16, 1, 200000), -- Referee service for booking 3
(4, 11, 5, 150000), -- Energy bars for booking 4
(5, 1, 1, 250000),  -- Football for booking 5
(6, 3, 2, 200000),  -- Shin guards for booking 6
(7, 17, 1, 300000), -- Photography service for booking 7
(8, 8, 5, 150000);  -- Energy drinks for booking 8

-- Insert feedback for completed bookings
INSERT INTO feedback (user_id, booking_id, field_id, rating, comment)
VALUES
(2, 5, 1, 5, 'Great field, highly recommend!'),
(3, 6, 2, 4, 'The facilities were clean and well-maintained.'),
(4, 7, 3, 5, 'Excellent service and facilities!'),
(5, 8, 4, 4, 'The field was in perfect condition.');

-- Insert opponent requests
INSERT INTO opponents (user_id, booking_id, team_name, player_count, contact_phone, preferred_date, preferred_time, status, matched_opponent_id, notes)
VALUES
(2, NULL, 'Red Dragons', 5, '0909123457', DATE_ADD(CURDATE(), INTERVAL 7 DAY), '18:00:00', 'open', NULL, 'Looking for a friendly match.'),
(3, NULL, 'Blue Lions', 5, '0909123458', DATE_ADD(CURDATE(), INTERVAL 7 DAY), '18:00:00', 'open', NULL, 'Competitive team looking for a challenge.'),
(4, NULL, 'Green Eagles', 7, '0909123459', DATE_ADD(CURDATE(), INTERVAL 10 DAY), '19:00:00', 'open', NULL, 'Casual team looking for fun match.'),
(5, NULL, 'Yellow Tigers', 7, '0909123460', DATE_ADD(CURDATE(), INTERVAL 10 DAY), '19:00:00', 'open', NULL, 'Intermediate level team.');

-- Match some opponents
UPDATE opponents SET status = 'matched', matched_opponent_id = 2 WHERE id = 1;
UPDATE opponents SET status = 'matched', matched_opponent_id = 1 WHERE id = 2;
