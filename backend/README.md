# Football Field Management System - Backend

This is the backend for the Football Field Management System, built with Node.js, Express, and MySQL with Sequelize ORM.

## Architecture

The backend follows a standard MVC (Model-View-Controller) architecture with additional layers for middleware, utilities, and database management:

```
backend/
├── config/             # Configuration files
│   └── database.js     # Database connection configuration
├── controllers/        # Request handlers (Controller layer)
├── database/           # Database setup scripts
│   ├── create-database.sql  # Database schema
│   ├── seed-data.sql        # Sample data
│   ├── init-database.js     # Database initialization script
│   └── database.sh          # Shell script for database setup
├── middleware/         # Express middleware
│   ├── auth.middleware.js   # Authentication middleware
│   └── validation.middleware.js # Request validation middleware
├── models/             # Database models (Model layer)
├── routes/             # API routes (Router layer)
├── test/               # Test files
│   ├── api/            # API tests
│   └── run-tests.js    # Test runner
├── utils/              # Utility functions
│   ├── appError.js     # Error handling
│   ├── catchAsync.js   # Async error wrapper
│   ├── jwt.js          # JWT utilities
│   └── cleanupExpiredOpponents.js # Scheduled task
├── public/             # Static files
│   └── images/         # Field images
└── server.js           # Main application entry point
```

## Database Schema

The application uses a relational database with the following main entities:

### Core Entities

- **Users**: Admin users for the system
- **Fields**: Football fields available for booking (fixed at 4 fields)
- **TimeSlots**: Available time slots for each field
- **Bookings**: Reservations made by users
- **Opponents**: Teams looking for opponents
- **Feedback**: User feedback and inquiries
- **Reviews**: Field reviews from users
- **Notifications**: System notifications for users

### Entity Relationships

- Field <-> TimeSlot (one-to-many)
- Field <-> Booking (one-to-many)
- TimeSlot <-> Booking (one-to-many)
- User <-> Review (one-to-many)
- Field <-> Review (one-to-many)
- Booking <-> Review (one-to-one)
- User <-> Notification (one-to-many)
- User <-> Feedback (one-to-many)
- Booking <-> Opponent (one-to-one)

## Key Components

### Models

The application uses Sequelize ORM with the following models:

- `User`: Admin user accounts
- `Field`: Football fields available for booking
- `TimeSlot`: Available time slots for each field
- `Booking`: Reservations made by users
- `Opponent`: Teams looking for opponents
- `Feedback`: User feedback and inquiries
- `Review`: Field reviews from users
- `Notification`: System notifications for users
- `FieldManagement`: Field management records

### Controllers

Controllers handle the business logic for each resource:

- `auth.controller.js`: Authentication (login)
- `field.controller.js`: Football field management
- `booking.controller.js`: Booking management
- `feedback.controller.js`: User feedback handling
- `timeSlot.controller.js`: Time slot management
- `fieldManagement.controller.js`: Field management
- `dashboard.controller.js`: Admin dashboard data

### Routes

API routes are organized by resource:

- `/api/auth`: Authentication endpoints
- `/api/fields`: Football field management
- `/api/timeslots`: Time slot management
- `/api/bookings`: Booking management
- `/api/opponents`: Opponent finding
- `/api/feedback`: User feedback
- `/api/dashboard`: Admin dashboard data
- `/api/field-management`: Field management

## API Endpoints

### Authentication

- `POST /api/auth/login`: Admin login
- `GET /api/auth/me`: Get current admin information

### Fields

- `GET /api/fields`: Get all fields
- `GET /api/fields/:id`: Get field by ID
- `POST /api/fields`: Create a new field (admin only)
- `PUT /api/fields/:id`: Update field (admin only)
- `DELETE /api/fields/:id`: Delete field (admin only)

### Time Slots

- `GET /api/timeslots`: Get available time slots
- `GET /api/timeslots/all`: Get all time slots
- `POST /api/timeslots`: Create a new time slot (admin only)
- `PUT /api/timeslots/:id`: Update time slot (admin only)
- `DELETE /api/timeslots/:id`: Delete time slot (admin only)

### Bookings

- `GET /api/bookings`: Get all bookings
- `GET /api/bookings/:id`: Get booking by ID
- `GET /api/bookings/timeslots`: Get available time slots for booking
- `GET /api/bookings/field/:id`: Get bookings by field
- `POST /api/bookings`: Create a new booking
- `PATCH /api/bookings/:id/status`: Update booking status

### Opponents

- `GET /api/opponents`: Get all opponents
- `GET /api/opponents/available`: Get available opponents
- `GET /api/opponents/:id`: Get opponent by ID
- `POST /api/opponents`: Register to find an opponent
- `PUT /api/opponents/:id`: Update opponent information
- `DELETE /api/opponents/:id`: Cancel opponent finding

### Feedback

- `GET /api/feedback`: Get all feedback (admin only)
- `GET /api/feedback/:id`: Get feedback by ID (admin only)
- `POST /api/feedback`: Submit new feedback
- `PATCH /api/feedback/:id/status`: Update feedback status (admin only)
- `DELETE /api/feedback/:id`: Delete feedback (admin only)

### Dashboard

- `GET /api/dashboard/stats`: Get overview statistics
- `GET /api/dashboard/chart`: Get booking chart data
- `GET /api/dashboard/popular-fields`: Get most popular fields

## Setup and Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env` file:
   ```
   PORT=9002
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=FootballField
   DB_USER=root
   DB_PASSWORD=Himlam04@
   JWT_SECRET=football_field_management_jwt_secret_key
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=http://localhost:9001
   ```

3. Initialize the database:
   ```bash
   cd database
   node init-database.js
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

The server will run on port 9002 by default.

## Testing

Run the automated tests:

```bash
npm test
```

This will execute all tests in the `test` directory.

## Error Handling

The application uses a centralized error handling mechanism:

- `appError.js`: Custom error class for application errors
- `catchAsync.js`: Wrapper for async functions to catch errors
- Global error handler in `server.js`

## Authentication

The application uses JWT (JSON Web Token) for authentication:

- Tokens are issued upon successful login
- Tokens expire after 24 hours by default
- Protected routes require a valid token in the Authorization header

## Data Validation

Request validation is performed using middleware:

- `validation.middleware.js`: Validates request data before processing

## Scheduled Tasks

The application includes scheduled tasks:

- `cleanupExpiredOpponents.js`: Removes expired opponent finding requests
