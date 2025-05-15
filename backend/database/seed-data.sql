-- Football Field Management System Sample Data
USE FootballField;

-- Insert admin user with plaintext password for simplified authentication
INSERT INTO Users (name, email, password, role, phoneNumber)
VALUES ('Admin', 'admin', 'admin', 'admin', '0123456789');

-- Insert exactly 4 fixed football fields
INSERT INTO Fields (name, description, size, pricePerHour, imageUrl)
VALUES
('Field A', 'Main field with high-quality grass and excellent lighting for night games', '5v5', 200000, '/images/fields/field-a.jpg'),
('Field B', 'Indoor field with air conditioning and premium artificial turf', '7v7', 350000, '/images/fields/field-b.jpg'),
('Field C', 'Premium field with stadium seating and professional equipment', '11v11', 500000, '/images/fields/field-c.jpg'),
('Field D', 'Training field with artificial turf and basic amenities', '5v5', 180000, '/images/fields/field-d.jpg');

-- Insert time slots for each field
-- Field 1 time slots
INSERT INTO TimeSlots (fieldId, startTime, endTime, weekdayPrice, weekendPrice)
VALUES
(1, '08:00:00', '09:00:00', 180000, 220000),
(1, '09:00:00', '10:00:00', 180000, 220000),
(1, '10:00:00', '11:00:00', 180000, 220000),
(1, '15:00:00', '16:00:00', 200000, 240000),
(1, '16:00:00', '17:00:00', 200000, 240000),
(1, '17:00:00', '18:00:00', 220000, 260000),
(1, '18:00:00', '19:00:00', 220000, 260000),
(1, '19:00:00', '20:00:00', 220000, 260000),
(1, '20:00:00', '21:00:00', 200000, 240000);

-- Field 2 time slots
INSERT INTO TimeSlots (fieldId, startTime, endTime, weekdayPrice, weekendPrice)
VALUES
(2, '08:00:00', '09:00:00', 300000, 380000),
(2, '09:00:00', '10:00:00', 300000, 380000),
(2, '10:00:00', '11:00:00', 300000, 380000),
(2, '15:00:00', '16:00:00', 320000, 400000),
(2, '16:00:00', '17:00:00', 320000, 400000),
(2, '17:00:00', '18:00:00', 350000, 420000),
(2, '18:00:00', '19:00:00', 350000, 420000),
(2, '19:00:00', '20:00:00', 350000, 420000),
(2, '20:00:00', '21:00:00', 320000, 400000);

-- Field 3 time slots
INSERT INTO TimeSlots (fieldId, startTime, endTime, weekdayPrice, weekendPrice)
VALUES
(3, '08:00:00', '09:00:00', 450000, 550000),
(3, '09:00:00', '10:00:00', 450000, 550000),
(3, '10:00:00', '11:00:00', 450000, 550000),
(3, '15:00:00', '16:00:00', 480000, 580000),
(3, '16:00:00', '17:00:00', 480000, 580000),
(3, '17:00:00', '18:00:00', 500000, 600000),
(3, '18:00:00', '19:00:00', 500000, 600000),
(3, '19:00:00', '20:00:00', 500000, 600000),
(3, '20:00:00', '21:00:00', 480000, 580000);

-- Field 4 time slots
INSERT INTO TimeSlots (fieldId, startTime, endTime, weekdayPrice, weekendPrice)
VALUES
(4, '08:00:00', '09:00:00', 160000, 200000),
(4, '09:00:00', '10:00:00', 160000, 200000),
(4, '10:00:00', '11:00:00', 160000, 200000),
(4, '15:00:00', '16:00:00', 180000, 220000),
(4, '16:00:00', '17:00:00', 180000, 220000),
(4, '17:00:00', '18:00:00', 180000, 220000),
(4, '18:00:00', '19:00:00', 180000, 220000),
(4, '19:00:00', '20:00:00', 180000, 220000),
(4, '20:00:00', '21:00:00', 160000, 200000);

-- Insert sample bookings (using current date and future dates)
INSERT INTO Bookings (userId, fieldId, timeSlotId, bookingDate, totalPrice, status, paymentStatus, customerName, customerPhone, customerEmail, notes)
VALUES
(1, 1, 1, CURDATE(), 180000, 'completed', 'paid', 'John Smith', '0901234567', 'john@example.com', 'Regular customer'),
(1, 2, 10, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 300000, 'confirmed', 'paid', 'David Jones', '0912345678', 'david@example.com', 'Birthday celebration'),
(1, 3, 19, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 450000, 'pending', 'unpaid', 'Michael Brown', '0923456789', 'michael@example.com', 'Company event'),
(1, 4, 28, DATE_ADD(CURDATE(), INTERVAL 3 DAY), 160000, 'confirmed', 'paid', 'Robert Wilson', '0934567890', 'robert@example.com', 'Weekly game'),
(1, 1, 5, DATE_ADD(CURDATE(), INTERVAL 4 DAY), 200000, 'pending', 'unpaid', 'William Taylor', '0945678901', 'william@example.com', ''),
(1, 2, 14, DATE_ADD(CURDATE(), INTERVAL 5 DAY), 320000, 'confirmed', 'paid', 'James Anderson', '0956789012', 'james@example.com', 'Team practice'),
(1, 3, 23, DATE_ADD(CURDATE(), INTERVAL 6 DAY), 480000, 'pending', 'unpaid', 'Richard Thomas', '0967890123', 'richard@example.com', ''),
(1, 4, 32, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 180000, 'confirmed', 'paid', 'Joseph Jackson', '0978901234', 'joseph@example.com', 'Friendly match');

-- Insert sample reviews
INSERT INTO Reviews (userId, fieldId, bookingId, rating, comment)
VALUES
(1, 1, 1, 5, 'Excellent field! Very well maintained and the staff was friendly.'),
(1, 2, 2, 4, 'Great indoor facility, but a bit expensive.'),
(1, 3, 3, 5, 'Professional quality field, perfect for our company event.'),
(1, 4, 4, 3, 'Decent training field, but could use better lighting.');

-- Insert sample opponents
INSERT INTO Opponents (booking_id, team_name, contact_phone, contact_email, description, skill_level, player_count, status)
VALUES
(5, 'The Champions', '0912345678', 'champions@example.com', 'Looking for a friendly match, we are an intermediate team with 5 players.', 'intermediate', 5, 'searching'),
(6, 'Victory FC', '0923456789', 'victory@example.com', 'Semi-professional team looking for a challenging match.', 'advanced', 7, 'searching'),
(7, 'Beginners United', '0934567890', 'beginners@example.com', 'New team looking for practice matches, all skill levels welcome.', 'beginner', 11, 'searching'),
(8, 'Weekend Warriors', '0945678901', 'warriors@example.com', 'Casual team looking for fun matches on weekends.', 'intermediate', 5, 'matched');

-- Insert sample feedback
INSERT INTO Feedback (name, email, content, status, response)
VALUES
('John Doe', 'john@example.com', 'Great football fields! I really enjoyed playing here.', 'responded', 'Thank you for your feedback! We are glad you enjoyed our facilities.'),
('Jane Smith', 'jane@example.com', 'The staff was very friendly and helpful.', 'read', NULL),
('Mike Johnson', 'mike@example.com', 'Could you add more water dispensers near the fields?', 'new', NULL),
('Sarah Williams', 'sarah@example.com', 'The booking process was very smooth and easy to use.', 'new', NULL),
('Robert Brown', 'robert@example.com', 'I would like to suggest adding a small cafe or snack bar.', 'read', NULL);

-- Insert sample notifications
INSERT INTO Notifications (userId, title, message, type, relatedId, relatedType, isRead)
VALUES
(1, 'Booking Confirmed', CONCAT('Your booking for Field A on ', DATE_FORMAT(CURDATE(), '%d/%m/%Y'), ' has been confirmed.'), 'success', 1, 'booking', TRUE),
(1, 'Payment Received', 'We have received your payment for booking #2.', 'success', 2, 'booking', TRUE),
(1, 'Booking Reminder', 'Reminder: You have a booking tomorrow at Field C.', 'info', 3, 'booking', FALSE),
(1, 'Opponent Found', 'A team has matched with your booking on Field D.', 'success', 8, 'opponent', FALSE),
(1, 'Review Request', 'Please leave a review for your recent booking at Field B.', 'info', 2, 'booking', FALSE),
(1, 'Maintenance Notice', CONCAT('Field A will be under maintenance on ', DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 10 DAY), '%d/%m/%Y'), '.'), 'warning', 1, 'field', FALSE);
