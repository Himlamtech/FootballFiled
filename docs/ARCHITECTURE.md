# Football Field Management System - Architecture

This document provides a detailed overview of the Football Field Management System architecture, including component interactions, database schema, and API design principles.

## System Overview

The Football Field Management System is a web application that allows users to book football fields, find opponents, and provides administrators with tools to manage fields, bookings, and customer feedback.

### High-Level Architecture

The system follows a client-server architecture with a clear separation between the frontend and backend:

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│    Frontend     │◄────►│     Backend     │◄────►│    Database     │
│    (React)      │      │   (Node.js)     │      │    (MySQL)      │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

- **Frontend**: React application with TypeScript, Tailwind CSS, and shadcn/ui
- **Backend**: Node.js application with Express.js and Sequelize ORM
- **Database**: MySQL database

### Project Structure

The project follows a standard structure with clear separation of concerns:

```
FootballField/
├── backend/                 # Backend source code
│   ├── config/              # Configuration files
│   │   └── database.js      # Database configuration
│   ├── controllers/         # Request handlers
│   ├── database/            # Database scripts
│   │   ├── create-database.sql  # Database schema
│   │   ├── seed-data.sql        # Sample data
│   │   ├── init-database.js     # Database initialization
│   │   ├── update-database.js   # Database update script
│   │   └── database.sh          # Database setup script
│   ├── middleware/          # Express middleware
│   ├── models/              # Sequelize models
│   ├── public/              # Static files
│   │   └── images/          # Field images
│   ├── routes/              # API routes
│   ├── test/                # Test files
│   │   └── api/             # API tests
│   ├── utils/               # Utility functions
│   └── server.js            # Main server entry point
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md      # Architecture documentation
│   ├── Features.md          # Feature documentation
│   └── FootballField-API-Documentation.json # API documentation
├── frontend/                # Frontend source code
│   ├── public/              # Static files
│   └── src/                 # React source code
│       ├── components/      # React components
│       ├── hooks/           # Custom hooks
│       ├── layouts/         # Layout components
│       ├── pages/           # Page components
│       ├── services/        # API services
│       └── utils/           # Utilities
├── .env                     # Environment variables
├── app.sh                   # Application startup script (Linux/Mac)
└── app.bat                  # Application startup script (Windows)
```

## Frontend Architecture

The frontend follows a component-based architecture with a focus on reusability and maintainability.

### Component Hierarchy

```
App
├── AuthProvider
│   ├── UserLayout
│   │   ├── Home
│   │   ├── BookingField
│   │   └── FindOpponents
│   └── AdminLayout
│       ├── Dashboard
│       ├── FieldManagement
│       └── Feedback
└── NotFound
```

### State Management

The frontend uses a combination of:

- **React Query**: For server state management (API data)
- **React Context**: For global state (authentication)
- **Local state**: For component-specific state

### Data Flow

1. User interacts with a component
2. Component calls an API service
3. API service makes a request to the backend
4. Backend responds with data
5. Component updates its state with the data
6. Component re-renders with the new data

## Backend Architecture

The backend follows a layered architecture with clear separation of concerns:

```
┌─────────────────┐
│     Routes      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Middleware    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Controllers   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Models      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Database     │
└─────────────────┘
```

### Layers

1. **Routes**: Define API endpoints and route requests to controllers
2. **Middleware**: Handle cross-cutting concerns like authentication and validation
3. **Controllers**: Implement business logic and handle requests/responses
4. **Models**: Define data structures and interact with the database
5. **Database**: Store and retrieve data

### Request Flow

1. Client makes a request to an API endpoint
2. Route handler receives the request
3. Middleware processes the request (authentication, validation)
4. Controller handles the request and performs business logic
5. Model interacts with the database
6. Controller sends a response back to the client

## Database Schema

The database schema is designed to support the core features of the application:

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    Users    │       │   Fields    │       │  TimeSlots  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ id          │       │ id          │
│ username    │       │ name        │       │ fieldId     │
│ password    │       │ type        │       │ startTime   │
│ email       │       │ description │       │ endTime     │
│ role        │       │ image       │       │ price       │
└─────────────┘       │ status      │       │ isAvailable │
                      └──────┬──────┘       └──────┬──────┘
                             │                     │
                             │                     │
                      ┌──────▼──────┐       ┌──────▼──────┐
                      │   Bookings  │       │ Opponents   │
                      ├─────────────┤       ├─────────────┤
                      │ id          │       │ id          │
                      │ fieldId     │◄──────┤ bookingId   │
                      │ timeSlotId  │       │ teamName    │
                      │ bookingDate │       │ playerCount │
                      │ status      │       │ contactInfo │
                      │ totalPrice  │       │ expireDate  │
                      └──────┬──────┘       └─────────────┘
                             │
                             │
              ┌──────────────┴──────────────┐
              │                             │
      ┌───────▼───────┐           ┌────────▼────────┐
      │    Reviews    │           │    Feedback     │
      ├───────────────┤           ├─────────────────┤
      │ id            │           │ id              │
      │ bookingId     │           │ name            │
      │ userId        │           │ email           │
      │ fieldId       │           │ content         │
      │ rating        │           │ status          │
      │ comment       │           │ response        │
      └───────────────┘           └─────────────────┘
```

### Key Entities

- **Users**: Admin users for the system
- **Fields**: Football fields available for booking (fixed at 4 fields)
- **TimeSlots**: Available time slots for each field
- **Bookings**: Reservations made by users
- **Opponents**: Teams looking for opponents
- **Feedback**: User feedback and inquiries
- **Reviews**: Field reviews from users

## API Design

The API follows RESTful principles with consistent endpoint naming and response formats.

### API Endpoints

The API is organized around resources:

- `/api/auth`: Authentication endpoints
- `/api/fields`: Football field management
- `/api/timeslots`: Time slot management
- `/api/bookings`: Booking management
- `/api/opponents`: Opponent finding
- `/api/feedback`: User feedback
- `/api/dashboard`: Admin dashboard data

### Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

Or for errors:

```json
{
  "success": false,
  "error": "Error message",
  "stack": "Error stack trace (development only)"
}
```

## Authentication and Authorization

The system uses JWT (JSON Web Token) for authentication:

1. Admin logs in with username and password
2. Backend validates credentials and issues a JWT
3. Frontend stores the JWT in localStorage
4. Frontend includes the JWT in the Authorization header for subsequent requests
5. Backend validates the JWT for protected routes

## Error Handling

The system implements a centralized error handling mechanism:

1. Backend uses custom error classes for different types of errors
2. Global error handler middleware catches and formats errors
3. Frontend displays appropriate error messages to users

## Performance Considerations

The system is designed with performance in mind:

1. Database indexing on frequently queried fields
2. Pagination for large result sets
3. Caching of frequently accessed data
4. Optimized database queries
5. Frontend code splitting and lazy loading

## Security Considerations

The system implements several security measures:

1. JWT-based authentication
2. Password hashing
3. Input validation and sanitization
4. CORS configuration
5. Rate limiting
6. Error handling that doesn't expose sensitive information

## Deployment Architecture

The system can be deployed in various environments:

### Development Environment

- Frontend: Vite development server (port 9001)
- Backend: Nodemon for auto-reloading (port 9002)
- Database: Local MySQL instance

### Production Environment

- Frontend: Static files served by a web server (Nginx, Apache)
- Backend: Node.js process managed by PM2
- Database: MySQL server with proper backup and monitoring

## Conclusion

The Football Field Management System architecture is designed to be modular, maintainable, and scalable. The clear separation of concerns and well-defined interfaces between components make it easy to understand and extend the system as needed.
