# Football Field Management System

A comprehensive web application for managing football field bookings, finding opponents, and handling customer feedback. The system allows users to book football fields, find opponents for matches, and provides administrators with tools to manage fields, bookings, and customer feedback.

![Football Field Management System](backend/public/images/field-a.jpg)

## Features

- **User Management**
  - Authentication and authorization
  - Role management (User, Administrator)
  - User profile management

- **Football Field Management**
  - Multiple field types (5v5, 7v7, 11v11)
  - Field status tracking
  - Detailed field information and images

- **Booking System**
  - Real-time field availability checking
  - Booking creation and management
  - Booking history and status tracking

- **Opponent Finding**
  - Register to find opponents
  - Opponent matching
  - Opponent finding status management

- **Review System**
  - Field ratings and reviews
  - Review management

- **Customer Feedback**
  - Submit feedback
  - Admin feedback management and response

## Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Database
- **Sequelize ORM** - Object-Relational Mapping
- **JWT Authentication** - Secure authentication

### Frontend
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Component library
- **React Query** - Data fetching and state management
- **Axios** - HTTP client

## Project Structure

```
FootballField/
├── backend/                 # Backend source code
│   ├── config/              # Configuration
│   ├── controllers/         # Request handlers
│   ├── database/            # Database
│   │   ├── create-database.sql  # Database schema
│   │   ├── seed-data.sql        # Sample data
│   │   ├── database.sh          # Database initialization script (Linux/Mac)
│   │   └── init-database.js     # Database initialization script (Node.js)
│   ├── middleware/          # Express middleware
│   ├── models/              # Sequelize models
│   ├── routes/              # API routes
│   ├── test/                # Test files
│   └── utils/               # Utilities
├── frontend/                # Frontend source code
│   ├── public/              # Static files
│   └── src/                 # React source code
│       ├── components/      # React components
│       ├── hooks/           # Custom hooks
│       ├── layouts/         # Layout components
│       ├── pages/           # Page components
│       ├── services/        # API services
│       ├── utils/           # Utilities
│       └── App.tsx          # Main App component
├── docs/                    # Documentation
├── .env                     # Environment variables
├── app.sh                   # Application startup script (Linux/Mac)
├── app.bat                  # Application startup script (Windows)
└── README.md                # Project documentation
```

## Getting Started

### System Requirements

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/football-field-management.git
   cd football-field-management
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
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

4. Initialize the database

   **For Linux/Mac:**
   ```bash
   cd backend/database
   chmod +x database.sh
   ./database.sh
   ```

   **For Windows:**
   ```bash
   cd backend/database
   node init-database.js
   ```

5. Start the application using the provided script
   ```bash
   # For Linux/Mac
   chmod +x app.sh
   ./app.sh

   # For Windows
   app.bat
   ```

6. Access the application at `http://localhost:9001`

### Admin Access

- Username: `admin`
- Password: `admin`

## API Documentation

### Authentication

- `POST /api/auth/login` - Login and receive token
- `GET /api/auth/me` - Get current user information

### Football Fields

- `GET /api/fields` - Get all fields
- `GET /api/fields/:id` - Get field by ID
- `POST /api/fields` - Create a new field (Admin only)
- `PUT /api/fields/:id` - Update field (Admin only)
- `DELETE /api/fields/:id` - Delete field (Admin only)

### Time Slots

- `GET /api/timeslots` - Get available time slots
- `GET /api/timeslots/all` - Get all time slots
- `POST /api/timeslots` - Create a new time slot (Admin only)
- `PUT /api/timeslots/:id` - Update time slot (Admin only)
- `DELETE /api/timeslots/:id` - Delete time slot (Admin only)

### Bookings

- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get booking by ID
- `GET /api/bookings/timeslots` - Get available time slots for booking
- `GET /api/bookings/field/:id` - Get bookings by field
- `POST /api/bookings` - Create a new booking
- `PATCH /api/bookings/:id/status` - Update booking status

### Opponents

- `GET /api/opponents` - Get all opponents
- `GET /api/opponents/available` - Get available opponents
- `GET /api/opponents/:id` - Get opponent by ID
- `POST /api/opponents` - Register to find an opponent
- `PUT /api/opponents/:id` - Update opponent information
- `DELETE /api/opponents/:id` - Cancel opponent finding

### Feedback

- `GET /api/feedback` - Get all feedback (Admin only)
- `GET /api/feedback/:id` - Get feedback by ID (Admin only)
- `POST /api/feedback` - Submit new feedback
- `PATCH /api/feedback/:id/status` - Update feedback status (Admin only)
- `DELETE /api/feedback/:id` - Delete feedback (Admin only)

### Dashboard

- `GET /api/dashboard/stats` - Get overview statistics
- `GET /api/dashboard/chart` - Get booking chart data
- `GET /api/dashboard/popular-fields` - Get most popular fields

## Testing

Run the automated tests:

```bash
cd backend
npm test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Special thanks to all contributors
- Inspired by the need for efficient football field management