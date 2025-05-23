# Tài Liệu API Hệ Thống Quản Lý Sân Bóng Đá

Tài liệu này mô tả chi tiết các API endpoints của Hệ Thống Quản Lý Sân Bóng Đá.

## Thông Tin Chung

- **Base URL**: `http://localhost:9002/api`
- **Định dạng dữ liệu**: JSON
- **Xác thực**: JWT (JSON Web Token)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` (cho các endpoints yêu cầu xác thực)

## Xác Thực (Authentication)

### Đăng Nhập

- **URL**: `/auth/login`
- **Method**: `POST`
- **Mô tả**: Đăng nhập vào hệ thống và nhận token xác thực
- **Body**:
  ```json
  {
    "email": "admin",
    "password": "admin"
  }
  ```
- **Phản hồi thành công**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Admin",
      "email": "admin",
      "role": "admin"
    }
  }
  ```
- **Phản hồi lỗi**:
  ```json
  {
    "success": false,
    "message": "Email hoặc mật khẩu không đúng"
  }
  ```

### Lấy Thông Tin Người Dùng Hiện Tại

- **URL**: `/auth/me`
- **Method**: `GET`
- **Mô tả**: Lấy thông tin người dùng đã đăng nhập
- **Headers**: `Authorization: Bearer <token>`
- **Phản hồi thành công**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "Admin",
      "email": "admin",
      "role": "admin"
    }
  }
  ```
- **Phản hồi lỗi**:
  ```json
  {
    "success": false,
    "message": "Không tìm thấy token xác thực"
  }
  ```

## Quản Lý Sân Bóng (Fields)

### Lấy Tất Cả Sân Bóng

- **URL**: `/fields`
- **Method**: `GET`
- **Mô tả**: Lấy danh sách tất cả sân bóng
- **Phản hồi thành công**:
  ```json
  [
    {
      "fieldId": 1,
      "name": "Sân A",
      "type": "5v5",
      "description": "Sân cỏ nhân tạo 5v5",
      "image": "/images/field-a.jpg",
      "status": "active"
    },
    {
      "fieldId": 2,
      "name": "Sân B",
      "type": "7v7",
      "description": "Sân cỏ nhân tạo 7v7",
      "image": "/images/field-b.jpg",
      "status": "active"
    }
  ]
  ```

### Lấy Sân Bóng Theo ID

- **URL**: `/fields/:id`
- **Method**: `GET`
- **Mô tả**: Lấy thông tin chi tiết của một sân bóng
- **Phản hồi thành công**:
  ```json
  {
    "fieldId": 1,
    "name": "Sân A",
    "type": "5v5",
    "description": "Sân cỏ nhân tạo 5v5",
    "image": "/images/field-a.jpg",
    "status": "active"
  }
  ```
- **Phản hồi lỗi**:
  ```json
  {
    "success": false,
    "message": "Không tìm thấy sân bóng"
  }
  ```

### Tạo Sân Bóng Mới (Chỉ Admin)

- **URL**: `/fields`
- **Method**: `POST`
- **Mô tả**: Tạo sân bóng mới
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "Sân E",
    "type": "11v11",
    "description": "Sân cỏ nhân tạo 11v11",
    "image": "/images/field-e.jpg",
    "status": "active"
  }
  ```
- **Phản hồi thành công**:
  ```json
  {
    "success": true,
    "data": {
      "fieldId": 5,
      "name": "Sân E",
      "type": "11v11",
      "description": "Sân cỏ nhân tạo 11v11",
      "image": "/images/field-e.jpg",
      "status": "active"
    }
  }
  ```

### Cập Nhật Sân Bóng (Chỉ Admin)

- **URL**: `/fields/:id`
- **Method**: `PUT`
- **Mô tả**: Cập nhật thông tin sân bóng
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "Sân E Updated",
    "description": "Sân cỏ nhân tạo 11v11 đã cập nhật",
    "status": "maintenance"
  }
  ```
- **Phản hồi thành công**:
  ```json
  {
    "success": true,
    "data": {
      "fieldId": 5,
      "name": "Sân E Updated",
      "type": "11v11",
      "description": "Sân cỏ nhân tạo 11v11 đã cập nhật",
      "image": "/images/field-e.jpg",
      "status": "maintenance"
    }
  }
  ```

### Xóa Sân Bóng (Chỉ Admin)

- **URL**: `/fields/:id`
- **Method**: `DELETE`
- **Mô tả**: Xóa sân bóng
- **Headers**: `Authorization: Bearer <token>`
- **Phản hồi thành công**:
  ```json
  {
    "success": true,
    "message": "Xóa sân bóng thành công"
  }
  ```

## Quản Lý Khung Giờ (Time Slots)

### Lấy Khung Giờ Có Sẵn

- **URL**: `/timeslots?field_id=1&date=2023-05-23`
- **Method**: `GET`
- **Mô tả**: Lấy danh sách khung giờ có sẵn cho sân bóng và ngày cụ thể
- **Phản hồi thành công**:
  ```json
  [
    {
      "id": 1,
      "fieldId": 1,
      "startTime": "08:00:00",
      "endTime": "09:30:00",
      "price": 300000,
      "isAvailable": true
    },
    {
      "id": 2,
      "fieldId": 1,
      "startTime": "10:00:00",
      "endTime": "11:30:00",
      "price": 300000,
      "isAvailable": false
    }
  ]
  ```

### Lấy Tất Cả Khung Giờ

- **URL**: `/timeslots/all`
- **Method**: `GET`
- **Mô tả**: Lấy tất cả khung giờ
- **Headers**: `Authorization: Bearer <token>`
- **Phản hồi thành công**:
  ```json
  [
    {
      "id": 1,
      "fieldId": 1,
      "startTime": "08:00:00",
      "endTime": "09:30:00",
      "price": 300000,
      "isAvailable": true
    },
    {
      "id": 2,
      "fieldId": 1,
      "startTime": "10:00:00",
      "endTime": "11:30:00",
      "price": 300000,
      "isAvailable": true
    }
  ]
  ```

## Quản Lý Đặt Sân (Bookings)

### Tạo Đặt Sân Mới

- **URL**: `/bookings`
- **Method**: `POST`
- **Mô tả**: Tạo đặt sân mới
- **Body**:
  ```json
  {
    "fieldId": 1,
    "timeSlotId": 1,
    "bookingDate": "2023-05-23",
    "customerName": "Nguyễn Văn A",
    "customerPhone": "0987654321",
    "customerEmail": "nguyenvana@example.com",
    "totalPrice": 300000
  }
  ```
- **Phản hồi thành công**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "fieldId": 1,
      "timeSlotId": 1,
      "bookingDate": "2023-05-23",
      "customerName": "Nguyễn Văn A",
      "customerPhone": "0987654321",
      "customerEmail": "nguyenvana@example.com",
      "status": "pending",
      "totalPrice": 300000
    }
  }
  ```

### Lấy Tất Cả Đặt Sân

- **URL**: `/bookings`
- **Method**: `GET`
- **Mô tả**: Lấy danh sách tất cả đặt sân
- **Headers**: `Authorization: Bearer <token>`
- **Phản hồi thành công**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "fieldId": 1,
        "timeSlotId": 1,
        "bookingDate": "2023-05-23",
        "customerName": "Nguyễn Văn A",
        "customerPhone": "0987654321",
        "customerEmail": "nguyenvana@example.com",
        "status": "pending",
        "totalPrice": 300000,
        "field": {
          "name": "Sân A"
        },
        "timeSlot": {
          "startTime": "08:00:00",
          "endTime": "09:30:00"
        }
      }
    ]
  }
  ```

### Cập Nhật Trạng Thái Đặt Sân

- **URL**: `/bookings/:id/status`
- **Method**: `PATCH`
- **Mô tả**: Cập nhật trạng thái đặt sân
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "status": "confirmed"
  }
  ```
- **Phản hồi thành công**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "status": "confirmed"
    }
  }
  ```

## Tìm Đối Thủ (Opponents)

### Đăng Ký Tìm Đối Thủ

- **URL**: `/opponents`
- **Method**: `POST`
- **Mô tả**: Đăng ký tìm đối thủ
- **Body**:
  ```json
  {
    "teamName": "FC Hà Nội",
    "playerCount": 5,
    "level": "intermediate",
    "preferredDate": "2023-05-25",
    "preferredTime": "19:00:00",
    "contactName": "Nguyễn Văn B",
    "contactPhone": "0987654322",
    "description": "Đội bóng phong trào, tìm đối thủ giao lưu"
  }
  ```
- **Phản hồi thành công**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "teamName": "FC Hà Nội",
      "playerCount": 5,
      "level": "intermediate",
      "preferredDate": "2023-05-25",
      "preferredTime": "19:00:00",
      "contactName": "Nguyễn Văn B",
      "contactPhone": "0987654322",
      "description": "Đội bóng phong trào, tìm đối thủ giao lưu",
      "status": "active",
      "expireDate": "2023-06-25T00:00:00.000Z"
    }
  }
  ```

### Lấy Tất Cả Đối Thủ

- **URL**: `/opponents`
- **Method**: `GET`
- **Mô tả**: Lấy danh sách tất cả đối thủ đang tìm
- **Phản hồi thành công**:
  ```json
  [
    {
      "id": 1,
      "teamName": "FC Hà Nội",
      "playerCount": 5,
      "level": "intermediate",
      "preferredDate": "2023-05-25",
      "preferredTime": "19:00:00",
      "contactName": "Nguyễn Văn B",
      "contactPhone": "0987654322",
      "description": "Đội bóng phong trào, tìm đối thủ giao lưu",
      "status": "active",
      "expireDate": "2023-06-25T00:00:00.000Z"
    }
  ]
  ```

## Phản Hồi (Feedback)

### Gửi Phản Hồi Mới

- **URL**: `/feedback`
- **Method**: `POST`
- **Mô tả**: Gửi phản hồi mới
- **Body**:
  ```json
  {
    "name": "Nguyễn Văn C",
    "email": "nguyenvanc@example.com",
    "content": "Sân bóng rất tốt, dịch vụ chu đáo"
  }
  ```
- **Phản hồi thành công**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "Nguyễn Văn C",
      "email": "nguyenvanc@example.com",
      "content": "Sân bóng rất tốt, dịch vụ chu đáo",
      "status": "unread",
      "createdAt": "2023-05-23T10:30:00.000Z"
    }
  }
  ```

### Lấy Tất Cả Phản Hồi (Chỉ Admin)

- **URL**: `/feedback`
- **Method**: `GET`
- **Mô tả**: Lấy danh sách tất cả phản hồi
- **Headers**: `Authorization: Bearer <token>`
- **Phản hồi thành công**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "Nguyễn Văn C",
        "email": "nguyenvanc@example.com",
        "content": "Sân bóng rất tốt, dịch vụ chu đáo",
        "status": "unread",
        "response": null,
        "createdAt": "2023-05-23T10:30:00.000Z"
      }
    ]
  }
  ```

### Cập Nhật Trạng Thái Phản Hồi (Chỉ Admin)

- **URL**: `/feedback/:id/status`
- **Method**: `PATCH`
- **Mô tả**: Cập nhật trạng thái và phản hồi
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "status": "read",
    "response": "Cảm ơn bạn đã gửi phản hồi. Chúng tôi rất vui khi bạn hài lòng với dịch vụ."
  }
  ```
- **Phản hồi thành công**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "status": "read",
      "response": "Cảm ơn bạn đã gửi phản hồi. Chúng tôi rất vui khi bạn hài lòng với dịch vụ."
    }
  }
  ```

## Bảng Điều Khiển (Dashboard)

### Lấy Thống Kê Tổng Quan

- **URL**: `/dashboard/stats`
- **Method**: `GET`
- **Mô tả**: Lấy thống kê tổng quan cho bảng điều khiển
- **Headers**: `Authorization: Bearer <token>`
- **Phản hồi thành công**:
  ```json
  {
    "success": true,
    "data": {
      "totalBookings": 150,
      "pendingBookings": 10,
      "confirmedBookings": 140,
      "totalFields": 4,
      "totalFeedback": 25,
      "unreadFeedback": 5
    }
  }
  ```

### Lấy Dữ Liệu Biểu Đồ

- **URL**: `/dashboard/chart`
- **Method**: `GET`
- **Mô tả**: Lấy dữ liệu biểu đồ đặt sân theo thời gian
- **Headers**: `Authorization: Bearer <token>`
- **Phản hồi thành công**:
  ```json
  {
    "success": true,
    "data": [
      {
        "date": "2023-05-01",
        "bookings": 5
      },
      {
        "date": "2023-05-02",
        "bookings": 7
      },
      {
        "date": "2023-05-03",
        "bookings": 4
      }
    ]
  }
  ```

### Lấy Sân Phổ Biến Nhất

- **URL**: `/dashboard/popular-fields`
- **Method**: `GET`
- **Mô tả**: Lấy danh sách sân bóng phổ biến nhất
- **Headers**: `Authorization: Bearer <token>`
- **Phản hồi thành công**:
  ```json
  {
    "success": true,
    "data": [
      {
        "fieldId": 1,
        "name": "Sân A",
        "bookingCount": 50
      },
      {
        "fieldId": 2,
        "name": "Sân B",
        "bookingCount": 40
      },
      {
        "fieldId": 3,
        "name": "Sân C",
        "bookingCount": 30
      },
      {
        "fieldId": 4,
        "name": "Sân D",
        "bookingCount": 20
      }
    ]
  }
  ```
