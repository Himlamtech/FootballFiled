# Football Field Management System - Backend

This is the backend API for the Football Field Management System, a platform that allows users to book football fields, order products, find opponents, and provide feedback.

## Technologies

- Node.js
- Express.js
- MySQL
- Sequelize ORM
- JWT Authentication
- Winston Logger

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd football-field/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root of the backend directory with the following variables:
   ```
   # Server
   NODE_ENV=development
   PORT=5000

   # Database
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=football_field_db

   # JWT
   JWT_SECRET=your_jwt_secret
   JWT_ACCESS_EXPIRATION=1h
   JWT_REFRESH_EXPIRATION=7d

   # Logging
   LOG_LEVEL=info
   ```

4. Create the database:
   ```
   mysql -u root -p
   CREATE DATABASE football_field_db;
   exit
   ```

5. Run database migrations and seeders:
   ```
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```

## Available Scripts

- `npm start`: Starts the server in production mode
- `npm run dev`: Starts the server with nodemon for development
- `npm test`: Runs all tests in watch mode
- `npm run test:ci`: Runs tests in CI mode
- `npm run lint`: Runs ESLint to check code quality
- `npm run lint:fix`: Fixes linting issues
- `npm run seed`: Runs the database seeders

## API Endpoints

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login user
- `POST /api/auth/refresh-token`: Refresh access token
- `GET /api/auth/profile`: Get current user profile
- `POST /api/auth/admin/login`: Admin login

### Fields

- `GET /api/fields`: Get all fields
- `GET /api/fields/:id`: Get a field by ID
- `GET /api/fields/availability`: Check field availability
- `POST /api/fields`: Create a new field (Admin only)
- `PUT /api/fields/:id`: Update a field (Admin only)
- `DELETE /api/fields/:id`: Delete a field (Admin only)

### Bookings

- `GET /api/bookings`: Get all bookings
- `GET /api/bookings/:id`: Get a booking by ID
- `POST /api/bookings`: Create a new booking
- `PUT /api/bookings/:id`: Update a booking
- `DELETE /api/bookings/:id`: Delete a booking
- `GET /api/bookings/user/:userId`: Get bookings by user ID
- `GET /api/bookings/field/:fieldId`: Get bookings by field ID
- `PATCH /api/bookings/:id/payment`: Update payment status

### Products

- `GET /api/products`: Get all products
- `GET /api/products/:id`: Get a product by ID
- `GET /api/products/category/:category`: Get products by category
- `POST /api/products`: Create a new product (Admin only)
- `PUT /api/products/:id`: Update a product (Admin only)
- `DELETE /api/products/:id`: Delete a product (Admin only)

### Feedback

- `GET /api/feedback`: Get all feedback
- `GET /api/feedback/:id`: Get feedback by ID
- `POST /api/feedback`: Create new feedback
- `PUT /api/feedback/:id`: Update feedback
- `DELETE /api/feedback/:id`: Delete feedback
- `GET /api/feedback/booking/:bookingId`: Get feedback by booking ID
- `GET /api/feedback/field/:fieldId/rating`: Get field rating

### Opponents

- `GET /api/opponents`: Get all opponent requests
- `GET /api/opponents/:id`: Get an opponent request by ID
- `POST /api/opponents`: Create a new opponent request
- `PUT /api/opponents/:id`: Update an opponent request
- `DELETE /api/opponents/:id`: Delete an opponent request
- `POST /api/opponents/match`: Match two teams
- `GET /api/opponents/available`: Find available opponents
- `GET /api/opponents/booking/:bookingId`: Get opponent by booking ID

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── database/         # Migrations and seeders
│   ├── middleware/       # Custom middleware
│   ├── models/           # Sequelize models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── tests/            # Test files
│   ├── app.js            # Express app setup
│   └── server.js         # Server entry point
├── .env                  # Environment variables
├── .sequelizerc          # Sequelize CLI config
├── package.json          # Dependencies and scripts
└── README.md             # Documentation
```

## Error Handling

The API uses standardized error responses:

```json
{
  "status": "error",
  "message": "Error message",
  "code": 400,
  "stack": "Error stack trace (development only)"
}
```

## Authentication and Authorization

The API uses JWT for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## License

ISC 