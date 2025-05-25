# Football Field Management System - API Documentation

## Overview

This document provides comprehensive documentation for the Football Field Management System API. The system is built with Node.js, Express.js, and MySQL, providing a complete solution for managing football field bookings, opponent finding, and administrative functions.

## Base URL
```
http://localhost:9002/api
```

## Authentication

The system uses JWT (JSON Web Token) for authentication. Admin endpoints require authentication.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Core Entities

### 1. Admin
- **adminId**: Integer (Primary Key)
- **username**: String (Unique)
- **password**: String (Plaintext for simplicity)
- **name**: String
- **email**: String (Unique)
- **phoneNumber**: String
- **isActive**: Boolean

### 2. Fields
- **fieldId**: Integer (Primary Key)
- **name**: String
- **description**: Text
- **size**: Enum ('5v5', '7v7', '11v11')
- **imageUrl**: String
- **isActive**: Boolean

### 3. TimeSlots
- **timeSlotId**: Integer (Primary Key)
- **fieldId**: Integer (Foreign Key)
- **startTime**: Time
- **endTime**: Time
- **weekdayPrice**: Decimal
- **weekendPrice**: Decimal
- **isActive**: Boolean (for locking/unlocking)

### 4. Bookings
- **bookingId**: Integer (Primary Key)
- **fieldId**: Integer (Foreign Key)
- **timeSlotId**: Integer (Foreign Key)
- **bookingDate**: Date
- **totalPrice**: Decimal
- **status**: Enum ('Đã đặt', 'Đã hủy', 'Hoàn thành')
- **paymentStatus**: Enum ('pending', 'paid', 'failed', 'refunded')
- **customerName**: String
- **customerPhone**: String
- **customerEmail**: String
- **notes**: Text
- **paymentMethod**: Enum ('vietqr', 'cash', 'transfer')

### 5. Opponents
- **id**: Integer (Primary Key)
- **booking_id**: Integer (Foreign Key)
- **team_name**: String
- **contact_phone**: String
- **contact_email**: String
- **description**: Text
- **skill_level**: Enum ('beginner', 'intermediate', 'advanced')
- **player_count**: Integer
- **status**: Enum ('searching', 'matched', 'cancelled')
- **expireDate**: DateTime

### 6. Feedback
- **id**: Integer (Primary Key)
- **name**: String
- **email**: String
- **content**: Text
- **status**: Enum ('new', 'read', 'responded')
- **response**: Text
- **adminId**: Integer (Foreign Key)
- **priority**: Enum ('low', 'medium', 'high')

## API Endpoints

### Authentication Endpoints

#### POST /auth/admin/login
Admin login endpoint.

**Request Body:**
```json
{
  "email": "admin",
  "password": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "adminId": 1,
    "username": "admin",
    "name": "Quản trị viên hệ thống",
    "email": "admin@footballfield.com",
    "role": "admin"
  }
}
```

#### GET /auth/admin/me
Get current admin information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": {
    "adminId": 1,
    "username": "admin",
    "name": "Quản trị viên hệ thống",
    "email": "admin@footballfield.com"
  }
}
```

### Field Management Endpoints

#### GET /fields
Get all football fields.

**Response:**
```json
{
  "success": true,
  "fields": [
    {
      "fieldId": 1,
      "name": "Sân A",
      "description": "Sân chính với cỏ chất lượng cao",
      "size": "5v5",
      "imageUrl": "/images/field-a.jpg",
      "isActive": true
    }
  ]
}
```

#### GET /fields/:id
Get field by ID.

**Response:**
```json
{
  "success": true,
  "field": {
    "fieldId": 1,
    "name": "Sân A",
    "description": "Sân chính với cỏ chất lượng cao",
    "size": "5v5",
    "imageUrl": "/images/field-a.jpg",
    "isActive": true
  }
}
```

### Time Slot Management Endpoints

#### GET /timeslots
Get available time slots for a field on a specific date.

**Query Parameters:**
- `field_id`: Integer (required)
- `date`: String (YYYY-MM-DD format, required)

**Response:**
```json
[
  {
    "id": 1,
    "start_time": "08:00:00",
    "end_time": "09:00:00",
    "price": 180000,
    "available": true
  }
]
```

#### GET /timeslots/all
Get all time slots for all fields.

**Response:**
```json
{
  "success": true,
  "timeSlots": [
    {
      "timeSlotId": 1,
      "fieldId": 1,
      "startTime": "08:00:00",
      "endTime": "09:00:00",
      "weekdayPrice": "180000.00",
      "weekendPrice": "220000.00",
      "isActive": true
    }
  ]
}
```

### Booking Management Endpoints

#### GET /bookings
Get all bookings (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "bookingId": 1,
      "fieldId": 1,
      "timeSlotId": 1,
      "bookingDate": "2025-05-25",
      "totalPrice": "180000.00",
      "status": "Đã đặt",
      "paymentStatus": "paid",
      "customerName": "Nguyễn Văn A",
      "customerPhone": "0123456789",
      "customerEmail": "test@example.com",
      "paymentMethod": "vietqr"
    }
  ]
}
```

#### POST /bookings
Create a new booking.

**Request Body:**
```json
{
  "fieldId": 1,
  "timeSlotId": 1,
  "bookingDate": "2025-05-25",
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0123456789",
  "customerEmail": "test@example.com",
  "notes": "Ghi chú đặt sân",
  "paymentMethod": "vietqr"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "booking": {
    "bookingId": 1,
    "fieldId": 1,
    "timeSlotId": 1,
    "bookingDate": "2025-05-25",
    "totalPrice": "180000.00",
    "status": "Đã đặt",
    "paymentStatus": "pending",
    "customerName": "Nguyễn Văn A",
    "customerPhone": "0123456789",
    "customerEmail": "test@example.com"
  }
}
```

#### GET /bookings/:id
Get booking by ID.

**Response:**
```json
{
  "success": true,
  "booking": {
    "bookingId": 1,
    "fieldId": 1,
    "timeSlotId": 1,
    "bookingDate": "2025-05-25",
    "totalPrice": "180000.00",
    "status": "Đã đặt",
    "customerName": "Nguyễn Văn A"
  }
}
```

#### PUT /bookings/:id
Update a booking (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "Hoàn thành",
  "paymentStatus": "paid"
}
```

### Opponent Finding Endpoints

#### GET /opponents
Get all opponent posts.

**Response:**
```json
{
  "success": true,
  "opponents": [
    {
      "id": 1,
      "booking_id": 5,
      "team_name": "The Champions",
      "contact_phone": "0912345678",
      "contact_email": "champions@example.com",
      "description": "Tìm đối giao hữu",
      "skill_level": "intermediate",
      "status": "searching",
      "expireDate": "2025-05-31T10:45:04.000Z",
      "Booking": {
        "Field": {
          "name": "Sân A",
          "size": "5v5"
        },
        "TimeSlot": {
          "startTime": "10:00:00",
          "endTime": "11:00:00"
        }
      }
    }
  ]
}
```

#### POST /opponents
Create a new opponent post.

**Request Body:**
```json
{
  "booking_id": 5,
  "team_name": "The Champions",
  "contact_phone": "0912345678",
  "contact_email": "champions@example.com",
  "description": "Tìm đối giao hữu",
  "skill_level": "intermediate",
  "player_count": 5
}
```

#### DELETE /opponents/:id
Delete an opponent post.

**Response:**
```json
{
  "success": true,
  "message": "Opponent deleted successfully"
}
```

### Feedback Management Endpoints

#### GET /feedback
Get all feedback (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Nguyễn Văn A",
      "email": "test@example.com",
      "content": "Sân bóng rất tốt",
      "status": "new",
      "response": null,
      "priority": "medium",
      "createdAt": "2025-05-24T09:23:37.000Z"
    }
  ]
}
```

#### POST /feedback
Create new feedback.

**Request Body:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "test@example.com",
  "content": "Sân bóng rất tốt",
  "priority": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback created successfully",
  "feedback": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "test@example.com",
    "content": "Sân bóng rất tốt",
    "status": "new",
    "priority": "medium"
  }
}
```

#### POST /feedback/:id/reply
Reply to feedback (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reply": "Cảm ơn bạn đã phản hồi"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reply sent successfully"
}
```

### Field Management Admin Endpoints

#### GET /field-management/status
Get field status with bookings and lock information (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `fieldId`: Integer (required)
- `date`: String (YYYY-MM-DD format, required)

**Response:**
```json
{
  "success": true,
  "field": {
    "fieldId": 1,
    "name": "Sân A",
    "size": "5v5"
  },
  "timeSlots": [
    {
      "timeSlotId": 1,
      "startTime": "08:00:00",
      "endTime": "09:00:00",
      "isActive": true,
      "isBooked": false,
      "booking": null
    }
  ]
}
```

#### POST /field-management/timeslots/:id/lock
Lock a time slot (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Time slot locked successfully"
}
```

#### POST /field-management/timeslots/:id/unlock
Unlock a time slot (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Time slot unlocked successfully"
}
```

### Dashboard Analytics Endpoints

#### GET /dashboard/stats
Get comprehensive dashboard statistics (Admin only).

**Response:**
```json
{
  "totalBookings": 22,
  "totalIncome": 6650000,
  "additionalStats": {
    "feedbackCount": 13,
    "pendingFeedback": 6,
    "fieldCount": 4,
    "opponentCount": 7,
    "averageBookingValue": 302272.73
  },
  "financialSummary": {
    "revenueByFieldSize": [
      {
        "size": "5v5",
        "revenue": 1800000,
        "percentage": 27.07
      },
      {
        "size": "7v7",
        "revenue": 2990000,
        "percentage": 44.96
      },
      {
        "size": "11v11",
        "revenue": 1860000,
        "percentage": 27.97
      }
    ],
    "revenueByDayOfWeek": [
      {
        "dayOfWeek": "Monday",
        "revenue": 950000,
        "bookingCount": 3
      }
    ]
  }
}
```

#### GET /dashboard/chart
Get booking chart data.

**Query Parameters:**
- `period`: String ('year', 'month', 'week')
- `date`: String (optional, YYYY-MM-DD format)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "period": "2025-01",
      "bookings": 5,
      "revenue": 1500000
    }
  ]
}
```

#### GET /dashboard/bookings
Get detailed booking history with pagination.

**Query Parameters:**
- `page`: Integer (default: 1)
- `limit`: Integer (default: 10)
- `status`: String (optional)
- `fieldId`: Integer (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "bookingId": 1,
      "customerName": "Nguyễn Văn A",
      "fieldName": "Sân A",
      "bookingDate": "2025-05-25",
      "timeSlot": "08:00 - 09:00",
      "totalPrice": "180000.00",
      "status": "Đã đặt",
      "paymentStatus": "paid"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 22,
    "itemsPerPage": 10
  }
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (development only)"
}
```

### Common HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

## Email Notifications

The system automatically sends email notifications for:
- New bookings (to customer)
- Booking confirmations
- Booking cancellations

**Email Configuration:**
- Service: Gmail SMTP
- Email: himlam.cursor1@gmail.com
- App Password: tbuq mqvt abgr mfxu

## Scheduled Tasks

### Automatic Opponent Cleanup
- **Frequency**: Every hour
- **Function**: Removes expired opponent posts
- **Implementation**: `utils/cleanupExpiredOpponents.js`

## Database Schema Optimization

### Indexes
- **Admin**: username, email
- **Fields**: size, isActive
- **TimeSlots**: fieldId, isActive, time range
- **Bookings**: date, status, payment status, customer info
- **Opponents**: status, skill level, expire date
- **Feedback**: status, priority, admin

### Constraints
- **Unique Constraints**: Field-TimeSlot combinations, Booking uniqueness
- **Foreign Keys**: Proper cascading relationships
- **Check Constraints**: Player count validation, price validation

## Security Features

1. **JWT Authentication**: Secure admin access
2. **Input Validation**: Express-validator middleware
3. **CORS Configuration**: Restricted origins
4. **Error Handling**: Sanitized error responses
5. **SQL Injection Prevention**: Sequelize ORM protection

## Performance Optimizations

1. **Database Indexing**: Strategic indexes on frequently queried columns
2. **Connection Pooling**: Efficient database connections
3. **Caching**: Time slot availability caching
4. **Pagination**: Large dataset handling
5. **Optimized Queries**: Minimal database calls

## Testing

Use the provided test endpoints:

#### GET /ping
Health check endpoint.

**Response:**
```json
{
  "message": "API is working!"
}
```

## Setup Instructions

1. **Environment Variables**: Configure `.env` file
2. **Database**: Run `database/init-database.js`
3. **Dependencies**: `npm install`
4. **Start Server**: `npm start`
5. **Port**: 9002 (configurable via PORT env var)

## Support

For technical support or questions about the API, contact the development team.
