# Football Field Management System - Backend

This is the backend for the Football Field Management System, built with Node.js, Express, and MySQL.

## Folder Structure

The backend follows a standard MVC (Model-View-Controller) architecture:

```
backend/
├── config/             # Configuration files
│   └── database.js     # Database connection configuration
├── controllers/        # Request handlers
├── database/           # Database setup scripts
│   ├── create-database.sql  # Database schema
│   ├── seed-data.sql        # Sample data
│   ├── init-database.js     # Database initialization script
│   └── database.sh          # Shell script for database setup
├── middleware/         # Express middleware
├── models/             # Database models (Sequelize)
├── routes/             # API routes
├── utils/              # Utility functions
└── server.js           # Main application entry point
```

## Key Components

### Models

The application uses Sequelize ORM with the following models:

- `User`: User accounts (admin, staff, customers)
- `Field`: Football fields available for booking
- `TimeSlot`: Available time slots for each field
- `Booking`: Reservations made by users
- `Opponent`: Teams looking for opponents
- `Feedback`: User feedback and inquiries
- `Review`: Field reviews from users
- `Notification`: System notifications for users

### Controllers

Controllers handle the business logic for each resource:

- `auth.controller.js`: Authentication (login, register)
- `user.controller.js`: User management
- `field.controller.js`: Football field management
- `booking.controller.js`: Booking management
- `feedback.controller.js`: User feedback handling
- `timeSlot.controller.js`: Time slot management
- `dashboard.controller.js`: Admin dashboard data

### Routes

API routes are organized by resource:

- `/api/auth`: Authentication endpoints
- `/api/users`: User management
- `/api/fields`: Football field management
- `/api/timeslots`: Time slot management
- `/api/bookings`: Booking management
- `/api/opponents`: Opponent finding
- `/api/feedback`: User feedback
- `/api/dashboard`: Admin dashboard data

## API Endpoints

### Authentication

- `POST /api/auth/login`: User login
- `POST /api/auth/register`: User registration

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
- `POST /api/bookings`: Create a new booking
- `PATCH /api/bookings/:id/status`: Update booking status

### Opponents

- `GET /api/opponents`: Get all opponents
- `GET /api/opponents/:id`: Get opponent by ID
- `POST /api/opponents`: Create a new opponent
- `PUT /api/opponents/:id`: Update opponent
- `DELETE /api/opponents/:id`: Delete opponent

### Feedback

- `GET /api/feedback`: Get all feedback
- `GET /api/feedback/:id`: Get feedback by ID
- `POST /api/feedback`: Submit feedback
- `PATCH /api/feedback/:id/status`: Update feedback status
- `DELETE /api/feedback/:id`: Delete feedback

## Setup and Running

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables in `.env` file:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=FootballField
   JWT_SECRET=your_jwt_secret
   PORT=9002
   ```

3. Initialize the database:
   ```
   cd database
   node init-database.js
   ```

4. Start the server:
   ```
   npm start
   ```

The server will run on port 9002 by default.
