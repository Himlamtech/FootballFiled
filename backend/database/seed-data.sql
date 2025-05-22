-- Football Field Management System Sample Data
USE FootballField;

-- Insert admin user with plaintext password for simplified authentication
INSERT INTO Users (name, email, password, role, phoneNumber)
VALUES ('Admin', 'admin', 'admin', 'admin', '0382802842');

-- Insert exactly 4 fixed football fields
INSERT INTO Fields (name, description, size, imageUrl)
VALUES
('Sân A', 'Sân chính với cỏ chất lượng cao và hệ thống chiếu sáng tuyệt vời cho các trận đấu ban đêm', '5v5', '/images/field-a.jpg'),
('Sân B', 'Sân trong nhà có điều hòa và cỏ nhân tạo cao cấp', '7v7', '/images/field-b.jpg'),
('Sân C', 'Sân cao cấp với khán đài và trang thiết bị chuyên nghiệp', '11v11', '/images/field-c.jpg'),
('Sân D', 'Sân tập với cỏ nhân tạo và tiện nghi cơ bản', '5v5', '/images/field-d.jpg');

-- Insert time slots for each field
-- Field 1 time slots
INSERT INTO TimeSlots (fieldId, startTime, endTime, weekdayPrice, weekendPrice)
VALUES
(1, '08:00:00', '09:00:00', 180000, 220000),
(1, '09:00:00', '10:00:00', 180000, 220000),
(1, '10:00:00', '11:00:00', 180000, 220000),
(1, '11:00:00', '12:00:00', 180000, 220000),
(1, '12:00:00', '13:00:00', 180000, 220000),
(1, '13:00:00', '14:00:00', 180000, 220000),
(1, '14:00:00', '15:00:00', 180000, 220000),
(1, '15:00:00', '16:00:00', 200000, 240000),
(1, '16:00:00', '17:00:00', 200000, 240000),
(1, '17:00:00', '18:00:00', 220000, 260000),
(1, '18:00:00', '19:00:00', 220000, 260000),
(1, '19:00:00', '20:00:00', 220000, 260000),
(1, '20:00:00', '21:00:00', 200000, 240000),
(1, '21:00:00', '22:00:00', 200000, 240000),
(1, '22:00:00', '23:00:00', 200000, 240000),
(1, '23:00:00', '00:00:00', 200000, 240000);

-- Field 2 time slots
INSERT INTO TimeSlots (fieldId, startTime, endTime, weekdayPrice, weekendPrice)
VALUES
(2, '08:00:00', '09:00:00', 300000, 380000),
(2, '09:00:00', '10:00:00', 300000, 380000),
(2, '10:00:00', '11:00:00', 300000, 380000),
(2, '11:00:00', '12:00:00', 300000, 380000),
(2, '12:00:00', '13:00:00', 300000, 380000),
(2, '13:00:00', '14:00:00', 300000, 380000),
(2, '14:00:00', '15:00:00', 300000, 380000),
(2, '15:00:00', '16:00:00', 320000, 400000),
(2, '16:00:00', '17:00:00', 320000, 400000),
(2, '17:00:00', '18:00:00', 350000, 420000),
(2, '18:00:00', '19:00:00', 350000, 420000),
(2, '19:00:00', '20:00:00', 350000, 420000),
(2, '20:00:00', '21:00:00', 320000, 400000),
(2, '21:00:00', '22:00:00', 320000, 400000),
(2, '22:00:00', '23:00:00', 320000, 400000),
(2, '23:00:00', '00:00:00', 320000, 400000);

-- Field 3 time slots
INSERT INTO TimeSlots (fieldId, startTime, endTime, weekdayPrice, weekendPrice)
VALUES
(3, '08:00:00', '09:00:00', 450000, 550000),
(3, '09:00:00', '10:00:00', 450000, 550000),
(3, '10:00:00', '11:00:00', 450000, 550000),
(3, '11:00:00', '12:00:00', 450000, 550000),
(3, '12:00:00', '13:00:00', 450000, 550000),
(3, '13:00:00', '14:00:00', 450000, 550000),
(3, '14:00:00', '15:00:00', 450000, 550000),
(3, '15:00:00', '16:00:00', 480000, 580000),
(3, '16:00:00', '17:00:00', 480000, 580000),
(3, '17:00:00', '18:00:00', 500000, 600000),
(3, '18:00:00', '19:00:00', 500000, 600000),
(3, '19:00:00', '20:00:00', 500000, 600000),
(3, '20:00:00', '21:00:00', 480000, 580000),
(3, '21:00:00', '22:00:00', 480000, 580000),
(3, '22:00:00', '23:00:00', 480000, 580000),
(3, '23:00:00', '00:00:00', 480000, 580000);

-- Field 4 time slots
INSERT INTO TimeSlots (fieldId, startTime, endTime, weekdayPrice, weekendPrice)
VALUES
(4, '08:00:00', '09:00:00', 160000, 200000),
(4, '09:00:00', '10:00:00', 160000, 200000),
(4, '10:00:00', '11:00:00', 160000, 200000),
(4, '11:00:00', '12:00:00', 160000, 200000),
(4, '12:00:00', '13:00:00', 160000, 200000),
(4, '13:00:00', '14:00:00', 160000, 200000),
(4, '14:00:00', '15:00:00', 160000, 200000),
(4, '15:00:00', '16:00:00', 180000, 220000),
(4, '16:00:00', '17:00:00', 180000, 220000),
(4, '17:00:00', '18:00:00', 180000, 220000),
(4, '18:00:00', '19:00:00', 180000, 220000),
(4, '19:00:00', '20:00:00', 180000, 220000),
(4, '20:00:00', '21:00:00', 160000, 200000),
(4, '21:00:00', '22:00:00', 160000, 200000),
(4, '22:00:00', '23:00:00', 160000, 200000),
(4, '23:00:00', '00:00:00', 160000, 200000);

-- Insert sample bookings (using current date and future dates)
INSERT INTO Bookings (fieldId, timeSlotId, bookingDate, totalPrice, status, customerName, customerPhone, customerEmail, notes)
VALUES
(1, 2, '2025-05-20', 150000, 'Đã đặt', 'Alice Nguyen', '0981112233', 'alice@example.com', 'Morning match'),
(2, 11, '2025-05-20', 310000, 'Đã đặt', 'Brian Lee', '0982223344', 'brian@example.com', 'First time booking'),
(3, 20, '2025-05-20', 460000, 'Đã đặt', 'Catherine Tran', '0983334455', 'catherine@example.com', 'Corporate event'),
(4, 29, '2025-05-22', 170000, 'Đã đặt', 'Daniel Kim', '0984445566', 'daniel@example.com', 'Evening match'),
(1, 3, '2025-05-22', 190000, 'Đã đặt', 'Emily Pham', '0985556677', 'emily@example.com', ''),
(2, 12, '2025-05-22', 330000, 'Đã đặt', 'Frank Hoang', '0986667788', 'frank@example.com', 'Training session'),
(3, 21, '2025-05-22', 470000, 'Đã đặt', 'Grace Do', '0987778899', 'grace@example.com', 'Guest booking'),
(4, 30, '2025-05-22', 160000, 'Đã đặt', 'Henry Bui', '0988889900', 'henry@example.com', 'Backup team'),
(1, 1, '2025-05-22', 180000, 'Đã đặt', 'John Smith', '0901234567', 'john@example.com', 'Regular customer'),
(2, 10, '2025-05-23', 300000, 'Đã đặt', 'David Jones', '0912345678', 'david@example.com', 'Birthday celebration'),
(3, 19, '2025-05-24', 450000, 'Đã đặt', 'Michael Brown', '0923456789', 'michael@example.com', 'Company event'),
(4, 28, '2025-05-25', 160000, 'Đã đặt', 'Robert Wilson', '0934567890', 'robert@example.com', 'Weekly game'),
(1, 5, '2025-05-26', 200000, 'Đã đặt', 'William Taylor', '0945678901', 'william@example.com', ''),
(2, 14, '2025-05-27', 320000, 'Đã đặt', 'James Anderson', '0956789012', 'james@example.com', 'Team practice'),
(3, 23, '2025-05-28', 480000, 'Đã đặt', 'Richard Thomas', '0967890123', 'richard@example.com', ''),
(4, 32, '2025-05-29', 180000, 'Đã đặt', 'Joseph Jackson', '0978901234', 'joseph@example.com', 'Friendly match'),
(2, 15, '2025-05-25', 340000, 'Đã đặt', 'Ivy Le', '0991112233', 'ivy@example.com', 'Family gathering'),
(3, 24, '2025-05-25', 490000, 'Đã đặt', 'Jack Nguyen', '0992223344', 'jack@example.com', 'Monthly tournament');

-- Insert sample reviews
INSERT INTO Reviews (userId, fieldId, bookingId, rating, comment)
VALUES
(1, 1, 1, 5, 'Sân rất tuyệt vời! Được bảo trì tốt và nhân viên rất thân thiện.'),
(1, 2, 2, 4, 'Sân trong nhà rất tốt, nhưng giá hơi cao.'),
(1, 3, 3, 5, 'Sân chất lượng chuyên nghiệp, rất phù hợp cho sự kiện công ty.'),
(1, 4, 4, 3, 'Sân tập ổn, nhưng nên cải thiện hệ thống chiếu sáng.');

-- Insert sample opponents
INSERT INTO Opponents (booking_id, team_name, contact_phone, contact_email, description, skill_level, player_count, status)
VALUES
(5, 'The Champions', '0912345678', 'champions@example.com', 'Tìm đối giao hữu, chúng tôi là đội trình độ trung bình với 5 người.', 'intermediate', 5, 'searching'),
(6, 'Victory FC', '0923456789', 'victory@example.com', 'Đội bán chuyên, mong muốn tìm đối thủ mạnh để thi đấu.', 'advanced', 7, 'searching'),
(7, 'Beginners United', '0934567890', 'beginners@example.com', 'Đội mới thành lập, muốn giao lưu tập luyện, mọi trình độ đều được chào đón.', 'beginner', 11, 'searching'),
(8, 'Weekend Warriors', '0945678901', 'warriors@example.com', 'Đội bóng phong trào, thích các trận đấu vui vẻ vào cuối tuần.', 'intermediate', 5, 'matched');

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
(1, 'Đặt sân thành công', CONCAT('Bạn đã đặt sân Field A vào ngày ', DATE_FORMAT(CURDATE(), '%d/%m/%Y'), ' thành công.'), 'success', 1, 'booking', TRUE),
(1, 'Đã nhận thanh toán', 'Chúng tôi đã nhận được thanh toán cho đơn đặt sân #2.', 'success', 2, 'booking', TRUE),
(1, 'Nhắc nhở đặt sân', 'Bạn có một lịch đặt sân vào ngày mai tại Field C.', 'info', 3, 'booking', FALSE),
(1, 'Đã tìm được đối thủ', 'Đã có đội đối thủ ghép trận với bạn tại sân Field D.', 'success', 8, 'opponent', FALSE),
(1, 'Yêu cầu đánh giá', 'Vui lòng để lại đánh giá cho đơn đặt sân gần đây tại Field B.', 'info', 2, 'booking', FALSE),
(1, 'Thông báo bảo trì', 'Sân Field A sẽ được bảo trì vào ngày 01/06/2025.', 'warning', 1, 'field', FALSE);
