-- Football Field Management System Sample Data
-- Comprehensive sample data for optimized 6-table schema: Admin, Fields, TimeSlots, Bookings, Opponents, Feedback
USE FootballField;

-- Insert admin user with plaintext password for simplified authentication
INSERT INTO Admin (username, password, name, email, phoneNumber)
VALUES ('admin', 'admin', 'Quản trị viên hệ thống', 'admin@footballfield.com', '0382802842');

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

-- Insert comprehensive sample bookings (past, current, and future dates)
INSERT INTO Bookings (fieldId, timeSlotId, bookingDate, totalPrice, status, paymentStatus, customerName, customerPhone, customerEmail, notes, paymentMethod)
VALUES
-- Past bookings (completed)
(1, 2, '2024-12-15', 180000, 'Hoàn thành', 'paid', 'Nguyễn Văn An', '0981112233', 'an.nguyen@example.com', 'Trận đấu buổi sáng', 'vietqr'),
(2, 11, '2024-12-16', 350000, 'Hoàn thành', 'paid', 'Lê Thị Bình', '0982223344', 'binh.le@example.com', 'Lần đầu đặt sân', 'cash'),
(3, 20, '2024-12-17', 500000, 'Hoàn thành', 'paid', 'Trần Văn Cường', '0983334455', 'cuong.tran@example.com', 'Sự kiện công ty', 'transfer'),
(4, 29, '2024-12-18', 180000, 'Hoàn thành', 'paid', 'Phạm Thị Dung', '0984445566', 'dung.pham@example.com', 'Trận đấu tối', 'vietqr'),
(1, 3, '2024-12-19', 180000, 'Hoàn thành', 'paid', 'Hoàng Văn Em', '0985556677', 'em.hoang@example.com', 'Đội bóng thường xuyên', 'cash'),
(2, 12, '2024-12-20', 350000, 'Hoàn thành', 'paid', 'Vũ Thị Phương', '0986667788', 'phuong.vu@example.com', 'Buổi tập luyện', 'vietqr'),
(3, 21, '2024-12-21', 500000, 'Hoàn thành', 'paid', 'Đỗ Văn Giang', '0987778899', 'giang.do@example.com', 'Khách mời đặt sân', 'transfer'),
(4, 30, '2024-12-22', 160000, 'Hoàn thành', 'paid', 'Bùi Thị Hoa', '0988889900', 'hoa.bui@example.com', 'Đội dự bị', 'cash'),

-- Current and upcoming bookings (January 2025)
(1, 1, '2025-01-15', 180000, 'Đã đặt', 'paid', 'Nguyễn Văn Khoa', '0901234567', 'khoa.nguyen@example.com', 'Khách hàng thường xuyên', 'vietqr'),
(2, 10, '2025-01-16', 300000, 'Đã đặt', 'paid', 'Lê Văn Long', '0912345678', 'long.le@example.com', 'Sinh nhật', 'cash'),
(3, 19, '2025-01-17', 450000, 'Đã đặt', 'pending', 'Trần Thị Mai', '0923456789', 'mai.tran@example.com', 'Sự kiện công ty', 'vietqr'),
(4, 28, '2025-01-18', 160000, 'Đã đặt', 'paid', 'Phạm Văn Nam', '0934567890', 'nam.pham@example.com', 'Trận đấu hàng tuần', 'transfer'),
(1, 5, '2025-01-19', 200000, 'Đã đặt', 'pending', 'Hoàng Thị Oanh', '0945678901', 'oanh.hoang@example.com', 'Giải đấu nhỏ', 'vietqr'),
(2, 14, '2025-01-20', 320000, 'Đã đặt', 'paid', 'Vũ Văn Phúc', '0956789012', 'phuc.vu@example.com', 'Tập luyện đội', 'cash'),
(3, 23, '2025-01-21', 480000, 'Đã đặt', 'pending', 'Đỗ Thị Quỳnh', '0967890123', 'quynh.do@example.com', 'Trận giao hữu', 'vietqr'),
(4, 32, '2025-01-22', 180000, 'Đã đặt', 'paid', 'Bùi Văn Sơn', '0978901234', 'son.bui@example.com', 'Trận đấu thân thiện', 'transfer'),
(2, 15, '2025-01-23', 340000, 'Đã đặt', 'pending', 'Nguyễn Thị Tâm', '0991112233', 'tam.nguyen@example.com', 'Họp mặt gia đình', 'vietqr'),
(3, 24, '2025-01-24', 490000, 'Đã đặt', 'paid', 'Lê Văn Tùng', '0992223344', 'tung.le@example.com', 'Giải đấu hàng tháng', 'cash'),

-- Additional bookings for better statistics
(1, 6, '2025-01-25', 200000, 'Đã đặt', 'pending', 'Trần Văn Uy', '0993334455', 'uy.tran@example.com', 'Tập luyện cá nhân', 'vietqr'),
(2, 16, '2025-01-26', 340000, 'Đã đặt', 'paid', 'Phạm Thị Vân', '0994445566', 'van.pham@example.com', 'Đội nữ', 'transfer'),
(3, 25, '2025-01-27', 490000, 'Đã đặt', 'pending', 'Hoàng Văn Xuân', '0995556677', 'xuan.hoang@example.com', 'Giải đấu lớn', 'vietqr'),
(4, 33, '2025-01-28', 180000, 'Đã đặt', 'paid', 'Vũ Thị Yến', '0996667788', 'yen.vu@example.com', 'Trận đấu cuối tuần', 'cash'),
(1, 7, '2025-01-29', 220000, 'Đã đặt', 'pending', 'Đỗ Văn Zung', '0997778899', 'zung.do@example.com', 'Giờ vàng', 'vietqr');

-- Insert sample opponents (updated schema with expireDate)
INSERT INTO Opponents (booking_id, team_name, contact_phone, contact_email, description, skill_level, player_count, status, expireDate)
VALUES
(5, 'The Champions', '0912345678', 'champions@example.com', 'Tìm đối giao hữu, chúng tôi là đội trình độ trung bình với 5 người. Chơi fair play.', 'intermediate', 5, 'searching', '2025-02-15 23:59:59'),
(6, 'Victory FC', '0923456789', 'victory@example.com', 'Đội bán chuyên, mong muốn tìm đối thủ mạnh để thi đấu. Có kinh nghiệm thi đấu.', 'advanced', 7, 'searching', '2025-02-20 23:59:59'),
(7, 'Beginners United', '0934567890', 'beginners@example.com', 'Đội mới thành lập, muốn giao lưu tập luyện, mọi trình độ đều được chào đón.', 'beginner', 11, 'searching', '2025-02-21 23:59:59'),
(8, 'Weekend Warriors', '0945678901', 'warriors@example.com', 'Đội bóng phong trào, thích các trận đấu vui vẻ vào cuối tuần. Không quá cạnh tranh.', 'intermediate', 5, 'matched', '2025-01-22 23:59:59'),
(9, 'Thunder Bolts', '0956789012', 'thunder@example.com', 'Đội trẻ năng động, muốn tìm đối thủ cùng lứa tuổi để giao lưu.', 'intermediate', 5, 'searching', '2025-02-25 23:59:59'),
(10, 'Golden Eagles', '0967890123', 'eagles@example.com', 'Đội có kinh nghiệm, tìm đối thủ mạnh cho giải đấu sắp tới.', 'advanced', 7, 'searching', '2025-02-27 23:59:59'),
(11, 'Rising Stars', '0978901234', 'stars@example.com', 'Đội mới lên hạng, muốn thử sức với các đội khác.', 'beginner', 11, 'cancelled', '2025-01-28 23:59:59'),
(12, 'Fire Dragons', '0989012345', 'dragons@example.com', 'Đội mạnh tìm thách thức, sẵn sàng cho mọi đối thủ.', 'advanced', 5, 'searching', '2025-03-01 23:59:59');

-- Insert sample feedback (updated schema with priority and adminId)
INSERT INTO Feedback (name, email, content, status, response, priority, adminId)
VALUES
('Nguyễn Văn Đức', 'duc.nguyen@example.com', 'Sân bóng rất tuyệt vời! Tôi thực sự thích chơi ở đây. Cỏ chất lượng cao và tiện nghi đầy đủ.', 'responded', 'Cảm ơn anh đã phản hồi! Chúng tôi rất vui khi anh hài lòng với cơ sở vật chất của chúng tôi.', 'medium', 1),
('Lê Thị Hương', 'huong.le@example.com', 'Nhân viên rất thân thiện và hỗ trợ tốt. Dịch vụ khách hàng xuất sắc.', 'read', NULL, 'low', NULL),
('Trần Minh Khoa', 'khoa.tran@example.com', 'Có thể thêm máy nước uống gần các sân không? Đặc biệt là vào mùa hè rất cần.', 'new', NULL, 'high', NULL),
('Phạm Thị Lan', 'lan.pham@example.com', 'Quy trình đặt sân rất dễ dàng và thuận tiện. Website hoạt động mượt mà.', 'new', NULL, 'low', NULL),
('Hoàng Văn Minh', 'minh.hoang@example.com', 'Tôi muốn đề xuất thêm một quán cà phê nhỏ hoặc khu ăn uống gần sân.', 'read', NULL, 'medium', NULL),
('Vũ Thị Nga', 'nga.vu@example.com', 'Hệ thống chiếu sáng sân D hơi yếu vào buổi tối. Cần cải thiện để chơi tốt hơn.', 'responded', 'Cảm ơn chị đã góp ý. Chúng tôi sẽ kiểm tra và nâng cấp hệ thống chiếu sáng sân D trong thời gian sớm nhất.', 'high', 1),
('Đỗ Văn Phúc', 'phuc.do@example.com', 'Giá cả hợp lý và chất lượng dịch vụ tốt. Sẽ giới thiệu cho bạn bè.', 'new', NULL, 'low', NULL),
('Bùi Thị Quỳnh', 'quynh.bui@example.com', 'Có thể mở thêm khung giờ sáng sớm không? Nhiều người muốn chơi từ 6h sáng.', 'read', NULL, 'medium', NULL),
('Nguyễn Văn Sơn', 'son.nguyen@example.com', 'Bãi đỗ xe hơi nhỏ, khó khăn vào cuối tuần. Nên mở rộng thêm.', 'new', NULL, 'high', NULL),
('Lê Thị Tâm', 'tam.le@example.com', 'Dịch vụ tuyệt vời! Sân sạch sẽ, nhân viên nhiệt tình. Rất hài lòng.', 'responded', 'Cảm ơn chị rất nhiều! Đây là động lực để chúng tôi tiếp tục cải thiện dịch vụ.', 'low', 1);