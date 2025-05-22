# Hệ Thống Quản Lý Sân Bóng Đá

Ứng dụng web toàn diện để quản lý đặt sân bóng đá, tìm đối thủ và quản lý phản hồi. Hệ thống cho phép người dùng đặt sân bóng đá, tìm đối thủ để thi đấu, đồng thời cung cấp cho quản trị viên các công cụ để quản lý sân, lịch đặt và phản hồi từ khách hàng.

## Tính Năng

- **Quản Lý Người Dùng**
  - Xác thực và phân quyền
  - Quản lý vai trò (Người dùng, Quản trị viên)
  - Quản lý thông tin cá nhân

- **Quản Lý Sân Bóng**
  - Nhiều loại sân (5v5, 7v7, 11v11)
  - Theo dõi tình trạng sân
  - Thông tin chi tiết và hình ảnh sân

- **Hệ Thống Đặt Sân**
  - Kiểm tra tình trạng sân theo thời gian thực
  - Tạo và quản lý lịch đặt sân
  - Theo dõi lịch sử và trạng thái đặt sân

- **Tìm Đối Thủ**
  - Đăng ký tìm đối thủ
  - Ghép cặp đối thủ phù hợp
  - Quản lý trạng thái tìm đối

- **Hệ Thống Đánh Giá**
  - Đánh giá và nhận xét về sân
  - Quản lý đánh giá

- **Phản Hồi Khách Hàng**
  - Gửi phản hồi
  - Quản lý và phản hồi từ quản trị viên

## Công Nghệ Sử Dụng

### Backend
- Node.js
- Express.js
- MySQL
- Sequelize ORM
- JWT Authentication

### Frontend
- React
- TypeScript
- Material-UI
- Redux quản lý state
- Axios gọi API

## Cấu Trúc Dự Án

```
FootballField/
├── backend/                 # Mã nguồn backend
│   ├── config/              # Cấu hình
│   ├── controllers/         # Bộ điều khiển
│   ├── database/            # Cơ sở dữ liệu
│   │   ├── create-database.sql  # Tạo cấu trúc cơ sở dữ liệu
│   │   ├── seed-data.sql        # Dữ liệu mẫu
│   │   ├── database.sh          # Script khởi tạo cơ sở dữ liệu (Linux/Mac)
│   │   └── init-database.js     # Script khởi tạo cơ sở dữ liệu (Windows)
│   ├── middleware/          # Middleware Express
│   ├── models/              # Mô hình Sequelize
│   ├── routes/              # Định tuyến API
│   └── utils/               # Tiện ích
├── frontend/                # Mã nguồn frontend
│   ├── public/              # Tệp tĩnh
│   └── src/                 # Mã nguồn React
│       ├── components/      # Các component
│       ├── hooks/           # Custom hooks
│       ├── pages/           # Các trang
│       ├── services/        # Dịch vụ API
│       ├── utils/           # Tiện ích
│       └── App.tsx          # Component App chính
├── .env                     # Biến môi trường
├── package.json             # Tệp cấu hình NPM
└── README.md                # Tài liệu dự án
```

## Bắt Đầu

### Yêu Cầu Hệ Thống

- Node.js (v14 trở lên)
- MySQL Server
- npm hoặc yarn

### Cài Đặt

1. Clone repository
   ```
   git clone https://github.com/your-username/football-field-management.git
   cd football-field-management
   ```

2. Cài đặt các gói phụ thuộc
   ```
   npm install
   ```

3. Thiết lập biến môi trường
   Tạo tệp `.env` trong thư mục gốc với các biến sau:
   ```
   PORT=9002
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=FootballField
   DB_USER=root
   DB_PASSWORD=2123
   JWT_SECRET=football_field_management_jwt_secret_key
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=http://localhost:9001
   ```

4. Khởi tạo cơ sở dữ liệu

   **Đối với Linux/Mac:**
   ```
   cd backend/database
   chmod +x database.sh
   ./database.sh
   ```

   **Đối với Windows:**
   ```
   cd backend/database
   node init-database.js
   ```

5. Khởi động backend server
   ```
   cd backend
   npm run dev
   ```

6. Cài đặt và khởi động frontend
   ```
   cd frontend
   npm install
   npm start
   ```

7. Truy cập ứng dụng tại `http://localhost:9001`

## API Endpoints

### Xác thực

- `POST /api/auth/register` - Đăng ký người dùng mới
- `POST /api/auth/login` - Đăng nhập và nhận token
- `POST /api/auth/admin/login` - Đăng nhập quản trị viên
- `GET /api/auth/me` - Lấy thông tin người dùng hiện tại

### Sân bóng

- `GET /api/fields` - Lấy tất cả sân bóng
- `GET /api/fields/:id` - Lấy sân bóng theo ID
- `POST /api/fields` - Tạo sân bóng mới (Chỉ Admin)
- `PUT /api/fields/:id` - Cập nhật sân bóng (Chỉ Admin)
- `DELETE /api/fields/:id` - Xóa sân bóng (Chỉ Admin)

### Khung giờ

- `GET /api/timeslots` - Lấy khung giờ có sẵn
- `GET /api/timeslots/all` - Lấy tất cả khung giờ
- `POST /api/timeslots` - Tạo khung giờ mới (Chỉ Admin)
- `PUT /api/timeslots/:id` - Cập nhật khung giờ (Chỉ Admin)
- `DELETE /api/timeslots/:id` - Xóa khung giờ (Chỉ Admin)

### Đặt sân

- `GET /api/bookings` - Lấy tất cả lịch đặt sân
- `GET /api/bookings/:id` - Lấy lịch đặt sân theo ID
- `GET /api/bookings/timeslots` - Lấy khung giờ còn trống
- `GET /api/bookings/field/:id` - Lấy lịch đặt sân theo sân
- `POST /api/bookings` - Tạo lịch đặt sân mới
- `PATCH /api/bookings/:id/status` - Cập nhật trạng thái đặt sân

### Tìm đối thủ

- `GET /api/opponents` - Lấy tất cả đối thủ
- `GET /api/opponents/available` - Lấy đối thủ đang tìm
- `GET /api/opponents/:id` - Lấy đối thủ theo ID
- `POST /api/opponents` - Đăng ký tìm đối thủ
- `PUT /api/opponents/:id` - Cập nhật thông tin đối thủ
- `DELETE /api/opponents/:id` - Hủy tìm đối thủ

### Phản hồi

- `GET /api/feedback` - Lấy tất cả phản hồi (Chỉ Admin)
- `GET /api/feedback/:id` - Lấy phản hồi theo ID (Chỉ Admin)
- `POST /api/feedback` - Gửi phản hồi mới
- `PATCH /api/feedback/:id/status` - Cập nhật trạng thái phản hồi (Chỉ Admin)
- `DELETE /api/feedback/:id` - Xóa phản hồi (Chỉ Admin)

### Bảng điều khiển

- `GET /api/dashboard/stats` - Lấy thống kê tổng quan
- `GET /api/dashboard/chart` - Lấy dữ liệu biểu đồ đặt sân
- `GET /api/dashboard/popular-fields` - Lấy sân phổ biến nhất