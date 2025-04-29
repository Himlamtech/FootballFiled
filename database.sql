-- Create database if not exists
CREATE DATABASE IF NOT EXISTS FootballField;
USE FootballField;

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS finances;
DROP TABLE IF EXISTS booking_products;
DROP TABLE IF EXISTS opponents;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS feedbacks;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS time_slots;
DROP TABLE IF EXISTS fields;
DROP TABLE IF EXISTS admin;

-- Create admin table
CREATE TABLE admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- Create fields table
CREATE TABLE fields (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  capacity INT NOT NULL DEFAULT 10,
  size VARCHAR(50) NOT NULL,
  price_per_hour DECIMAL(10, 2) NOT NULL,
  price_per_hour_weekend DECIMAL(10, 2) NOT NULL,
  status ENUM('available', 'maintenance') DEFAULT 'available',
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- Create time_slots table
CREATE TABLE time_slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- Create products table
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(255),
  category ENUM('equipment', 'food', 'drinks', 'service') DEFAULT 'equipment',
  type ENUM('buy', 'rent') DEFAULT 'buy',
  stock_quantity INT DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- Create feedbacks table
CREATE TABLE feedbacks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  field_id INT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE SET NULL
);

-- Create bookings table
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  field_id INT NOT NULL,
  time_slot_id INT NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(100),
  booking_date DATE NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
  total_price DECIMAL(10, 2) NOT NULL,
  payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
  payment_method ENUM('cash', 'bank_transfer', 'momo', 'zalopay', 'vietqr') DEFAULT 'cash',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE,
  FOREIGN KEY (time_slot_id) REFERENCES time_slots(id) ON DELETE CASCADE
);

-- Create booking_products table (junction table for bookings and products)
CREATE TABLE booking_products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create opponents table for team matching
CREATE TABLE opponents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  team_name VARCHAR(100) NOT NULL,
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20) NOT NULL,
  description TEXT,
  status ENUM('searching', 'matched', 'cancelled') DEFAULT 'searching',
  matched_with_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (matched_with_id) REFERENCES opponents(id) ON DELETE SET NULL
);

-- Insert admin account
INSERT INTO admin (username, password, name, email, phone) VALUES
('admin', '$2a$10$x9xD8jHouOzfyCKpU9YtrOQv/1V0y//4Z6p0gJ.dG65OA8wX0uCqe', 'Admin', 'admin@footballfield.com', '0123456789');

-- Insert fields
INSERT INTO fields (name, description, location, capacity, size, price_per_hour, price_per_hour_weekend, status, image_url) VALUES
('Sân A', 'Sân bóng đá 5 người với cỏ nhân tạo chất lượng cao', 'Khu vực A, Quận 1, TP.HCM', 10, '5-a-side', 200000, 250000, 'available', 'https://placehold.co/600x400?text=Football+Field+A'),
('Sân B', 'Sân bóng đá 7 người với cỏ nhân tạo và hệ thống chiếu sáng hiện đại', 'Khu vực B, Quận 2, TP.HCM', 14, '7-a-side', 300000, 350000, 'available', 'https://placehold.co/600x400?text=Football+Field+B'),
('Sân C', 'Sân bóng đá 11 người tiêu chuẩn FIFA', 'Khu vực C, Quận 3, TP.HCM', 22, '11-a-side', 500000, 600000, 'available', 'https://placehold.co/600x400?text=Football+Field+C'),
('Sân D', 'Sân bóng đá 5 người trong nhà với điều hòa', 'Khu vực D, Quận 4, TP.HCM', 10, '5-a-side', 250000, 300000, 'available', 'https://placehold.co/600x400?text=Football+Field+D');

-- Insert time slots
INSERT INTO time_slots (start_time, end_time, is_active) VALUES
('06:00:00', '07:30:00', TRUE),
('07:30:00', '09:00:00', TRUE),
('09:00:00', '10:30:00', TRUE),
('10:30:00', '12:00:00', TRUE),
('14:00:00', '15:30:00', TRUE),
('15:30:00', '17:00:00', TRUE),
('17:00:00', '18:30:00', TRUE),
('18:30:00', '20:00:00', TRUE),
('20:00:00', '21:30:00', TRUE);

-- Insert products
INSERT INTO products (name, description, price, category, type, stock_quantity, image_url) VALUES
('Nước suối', 'Chai nước suối 500ml', 10000, 'drinks', 'buy', 100, 'https://placehold.co/300x300?text=Water'),
('Nước ngọt', 'Lon nước ngọt 330ml', 15000, 'drinks', 'buy', 100, 'https://placehold.co/300x300?text=Soda'),
('Bánh mì', 'Bánh mì thịt nguội', 20000, 'food', 'buy', 50, 'https://placehold.co/300x300?text=Sandwich'),
('Thuê áo', 'Thuê áo đá bóng', 30000, 'equipment', 'rent', 20, 'https://placehold.co/300x300?text=Jersey'),
('Thuê giày', 'Thuê giày đá bóng', 40000, 'equipment', 'rent', 20, 'https://placehold.co/300x300?text=Shoes'),
('Thuê bóng', 'Thuê bóng đá', 50000, 'equipment', 'rent', 10, 'https://placehold.co/300x300?text=Ball'),
('Dịch vụ quay phim', 'Dịch vụ quay phim trận đấu', 200000, 'service', 'buy', 5, 'https://placehold.co/300x300?text=Video'),
('Dịch vụ chụp ảnh', 'Dịch vụ chụp ảnh trận đấu', 150000, 'service', 'buy', 5, 'https://placehold.co/300x300?text=Photo');

-- Insert sample bookings
INSERT INTO bookings (field_id, time_slot_id, customer_name, customer_phone, customer_email, booking_date, status, total_price, payment_status, payment_method, notes) VALUES
(1, 7, 'Nguyễn Văn A', '0901234567', 'nguyenvana@example.com', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'confirmed', 200000, 'paid', 'bank_transfer', 'Đặt sân cho đội FC Thủ Đức'),
(2, 6, 'Trần Văn B', '0907654321', 'tranvanb@example.com', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'confirmed', 300000, 'paid', 'momo', 'Đặt sân cho đội Bình Thạnh FC'),
(3, 8, 'Lê Văn C', '0903456789', 'levanc@example.com', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'confirmed', 500000, 'paid', 'cash', 'Đặt sân cho đội FC Quận 1'),
(4, 5, 'Phạm Văn D', '0904567890', 'phamvand@example.com', DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'pending', 250000, 'pending', 'zalopay', 'Đặt sân cho đội FC Quận 4'),
(1, 8, 'Hoàng Văn E', '0905678901', 'hoangvane@example.com', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'confirmed', 200000, 'paid', 'vietqr', 'Đặt sân cho đội FC Quận 5'),
(2, 5, 'Võ Văn F', '0906789012', 'vovanf@example.com', DATE_ADD(CURDATE(), INTERVAL 6 DAY), 'confirmed', 300000, 'paid', 'bank_transfer', 'Đặt sân cho đội FC Quận 6'),
(3, 6, 'Đặng Văn G', '0907890123', 'dangvang@example.com', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'pending', 500000, 'pending', 'momo', 'Đặt sân cho đội FC Quận 7'),
(4, 7, 'Bùi Văn H', '0908901234', 'buivanh@example.com', DATE_ADD(CURDATE(), INTERVAL 8 DAY), 'confirmed', 250000, 'paid', 'cash', 'Đặt sân cho đội FC Quận 8'),
(1, 5, 'Đỗ Văn I', '0909012345', 'dovani@example.com', DATE_ADD(CURDATE(), INTERVAL 9 DAY), 'cancelled', 200000, 'refunded', 'bank_transfer', 'Đặt sân cho đội FC Quận 9'),
(2, 7, 'Hồ Văn K', '0900123456', 'hovank@example.com', DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'confirmed', 300000, 'paid', 'zalopay', 'Đặt sân cho đội FC Quận 10');

-- Create finances table
CREATE TABLE finances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT,
  transaction_type ENUM('income', 'expense') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('cash', 'bank_transfer', 'momo', 'zalopay', 'vietqr') NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'completed', 'cancelled', 'refunded') DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

-- Add indexes for better performance
ALTER TABLE finances ADD INDEX idx_finances_booking_id (booking_id);
ALTER TABLE finances ADD INDEX idx_finances_transaction_type (transaction_type);
ALTER TABLE finances ADD INDEX idx_finances_transaction_date (transaction_date);
ALTER TABLE finances ADD INDEX idx_finances_status (status);

ALTER TABLE bookings ADD INDEX idx_bookings_field_id (field_id);
ALTER TABLE bookings ADD INDEX idx_bookings_time_slot_id (time_slot_id);
ALTER TABLE bookings ADD INDEX idx_bookings_booking_date (booking_date);
ALTER TABLE bookings ADD INDEX idx_bookings_status (status);
ALTER TABLE bookings ADD INDEX idx_bookings_payment_status (payment_status);

ALTER TABLE booking_products ADD INDEX idx_booking_products_booking_id (booking_id);
ALTER TABLE booking_products ADD INDEX idx_booking_products_product_id (product_id);

ALTER TABLE opponents ADD INDEX idx_opponents_booking_id (booking_id);
ALTER TABLE opponents ADD INDEX idx_opponents_status (status);

ALTER TABLE feedbacks ADD INDEX idx_feedbacks_field_id (field_id);
ALTER TABLE feedbacks ADD INDEX idx_feedbacks_status (status);

-- Insert sample booking products
INSERT INTO booking_products (booking_id, product_id, quantity, price) VALUES
(1, 1, 5, 10000),
(1, 2, 3, 15000),
(1, 3, 2, 20000),
(2, 3, 2, 20000),
(2, 4, 1, 30000),
(2, 1, 4, 10000),
(3, 5, 2, 40000),
(3, 7, 4, 18000),
(3, 1, 10, 10000),
(4, 1, 5, 10000),
(4, 6, 1, 50000),
(5, 2, 6, 15000),
(5, 3, 3, 20000),
(6, 4, 2, 30000),
(6, 5, 1, 40000),
(7, 7, 1, 18000),
(7, 8, 2, 5000),
(8, 1, 8, 10000),
(8, 2, 8, 15000),
(9, 3, 4, 20000),
(10, 6, 1, 50000),
(10, 4, 3, 30000);

-- Insert sample feedbacks
INSERT INTO feedbacks (field_id, name, email, phone, rating, comment, status) VALUES
(1, 'Nguyễn Văn A', 'nguyenvana@example.com', '0901234567', 5, 'Great field with excellent facilities', 'approved'),
(2, 'Trần Văn B', 'tranvanb@example.com', '0907654321', 4, 'Good field but changing rooms are a bit small', 'approved'),
(3, 'Lê Văn C', 'levanc@example.com', '0903456789', 3, 'Field is spacious but grass needs maintenance', 'pending'),
(4, 'Phạm Văn D', 'phamvand@example.com', '0904567890', 5, 'Indoor field is very comfortable with good air conditioning', 'approved'),
(1, 'Hoàng Văn E', 'hoangvane@example.com', '0905678901', 4, 'Good location and friendly staff', 'approved'),
(2, 'Võ Văn F', 'vovanf@example.com', '0906789012', 5, 'Excellent lighting for evening games', 'approved'),
(3, 'Đặng Văn G', 'dangvang@example.com', '0907890123', 2, 'Field is too far from the city center', 'rejected'),
(4, 'Bùi Văn H', 'buivanh@example.com', '0908901234', 4, 'Good value for money', 'pending'),
(1, 'Đỗ Văn I', 'dovani@example.com', '0909012345', 5, 'Perfect for small team practice', 'approved'),
(2, 'Hồ Văn K', 'hovank@example.com', '0900123456', 3, 'Field quality is average but price is reasonable', 'pending');

-- Insert sample opponents
INSERT INTO opponents (booking_id, team_name, contact_email, contact_phone, description, status) VALUES
(1, 'FC Thủ Đức', 'fcthuduc@example.com', '0901234567', 'Looking for medium level opponents for friendly match', 'searching'),
(2, 'Bình Thạnh FC', 'binhthanh@example.com', '0907654321', 'High level team looking for similar level opponents', 'searching'),
(3, 'FC Quận 1', 'fcquan1@example.com', '0903456789', 'New team looking for friendly matches to learn and improve', 'searching'),
(4, 'FC Quận 4', 'fcquan4@example.com', '0904567890', 'Intermediate team looking for weekend matches', 'searching'),
(5, 'FC Quận 5', 'fcquan5@example.com', '0905678901', 'Experienced team looking for competitive matches', 'searching'),
(6, 'FC Quận 6', 'fcquan6@example.com', '0906789012', 'Amateur team looking for friendly matches', 'matched'),
(7, 'FC Quận 7', 'fcquan7@example.com', '0907890123', 'Semi-professional team looking for challenging opponents', 'searching'),
(8, 'FC Quận 8', 'fcquan8@example.com', '0908901234', 'Corporate team looking for weekend matches', 'matched');

-- Insert sample finances
INSERT INTO finances (booking_id, transaction_type, amount, payment_method, category, description, transaction_date, status) VALUES
(1, 'income', 200000, 'bank_transfer', 'booking', 'Payment for booking #1 - Nguyễn Văn A', NOW(), 'completed'),
(2, 'income', 300000, 'momo', 'booking', 'Payment for booking #2 - Trần Văn B', NOW(), 'completed'),
(3, 'income', 500000, 'cash', 'booking', 'Payment for booking #3 - Lê Văn C', NOW(), 'completed'),
(5, 'income', 200000, 'vietqr', 'booking', 'Payment for booking #5 - Hoàng Văn E', NOW(), 'completed'),
(6, 'income', 300000, 'bank_transfer', 'booking', 'Payment for booking #6 - Võ Văn F', NOW(), 'completed'),
(8, 'income', 250000, 'cash', 'booking', 'Payment for booking #8 - Bùi Văn H', NOW(), 'completed'),
(10, 'income', 300000, 'zalopay', 'booking', 'Payment for booking #10 - Hồ Văn K', NOW(), 'completed'),
(NULL, 'expense', 100000, 'cash', 'maintenance', 'Weekly field maintenance', NOW(), 'completed'),
(NULL, 'expense', 50000, 'cash', 'utilities', 'Electricity and water bills', NOW(), 'completed'),
(NULL, 'expense', 200000, 'bank_transfer', 'salary', 'Staff salary payment', NOW(), 'completed'),
(NULL, 'expense', 150000, 'cash', 'supplies', 'Office supplies purchase', NOW(), 'completed'),
(NULL, 'expense', 80000, 'cash', 'maintenance', 'Equipment repair', NOW(), 'completed'),
(NULL, 'income', 45000, 'cash', 'product', 'Food and drinks sales', NOW(), 'completed'),
(NULL, 'income', 30000, 'momo', 'product', 'Equipment rental', NOW(), 'completed'),
(NULL, 'income', 60000, 'cash', 'product', 'Jersey sales', NOW(), 'completed'),
(NULL, 'income', 25000, 'zalopay', 'product', 'Water bottle sales', NOW(), 'completed'),
(NULL, 'income', 350000, 'bank_transfer', 'service', 'Video recording service', NOW(), 'completed'),
(NULL, 'income', 200000, 'momo', 'service', 'Photography service', NOW(), 'completed');
