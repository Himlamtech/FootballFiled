# Football Field Management System - Backend

This repository contains the backend code for the Football Field Management System. The system is designed to manage football field bookings, products, users, and more.

## Requirements

- Node.js 14+
- npm
- Either SQLite or MySQL database

## Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory of the backend folder with the following content:

```
NODE_ENV=development
PORT=5000
JWT_SECRET=your_jwt_secret_key
JWT_ACCESS_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d
```

## Database Configuration

The application supports both SQLite (for development) and MySQL (for production or more robust development).

### Using the Database Switcher

We've provided a utility to easily switch between database types:

```bash
# Interactive mode - will prompt for database type and settings
npm run switch-db

# Directly switch to SQLite
npm run switch-db:sqlite

# Directly switch to MySQL
npm run switch-db:mysql
```

### Manual Configuration

If you prefer to configure manually, add these to your `.env` file:

#### For SQLite:
```
NODE_ENV=development
DB_DIALECT=sqlite
DB_STORAGE=data/football_field_db.sqlite
DB_SYNC=true
DB_SYNC_ALTER=true
```

#### For MySQL:
```
NODE_ENV=development
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=football_field_db
DB_SYNC=true
DB_SYNC_ALTER=true
```

## Database Setup and Sample Data

After configuring your database, you can set up the tables and generate sample data:

### For SQLite:
```bash
# Generate SQLite database and sample data
npm run setup-sqlite
```

### For MySQL:
```bash
# Create MySQL database, tables, and generate sample data
npm run setup-mysql-db

# If you already have the database and just want to generate sample data:
npm run setup-mysql
```

## Running the Application

```bash
# Development mode with nodemon (auto-restart on file changes)
npm run dev

# Production mode
npm start
```

## API Documentation

The API endpoints are organized into the following categories:

- Authentication (`/api/auth`)
- Fields (`/api/fields`)
- Bookings (`/api/bookings`)
- Products (`/api/products`)
- Feedback (`/api/feedback`)
- Opponents (`/api/opponents`)

For detailed API documentation, refer to the Postman collection or Swagger documentation (if available).

## Directory Structure

```
backend/
├── data/               # SQLite database and other data files
├── logs/               # Application logs
├── src/                # Source code
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   ├── app.js          # Express application setup
│   └── server.js       # Server entry point
├── .env                # Environment variables
├── .eslintrc.js        # ESLint configuration
├── .gitignore          # Git ignore file
├── jest.config.js      # Jest configuration
├── package.json        # Node.js dependencies
└── README.md           # This file
```

## Testing

```bash
# Run tests in watch mode
npm test

# Run tests for CI environment
npm run test:ci
```

## Linting

```bash
# Check code style
npm run lint

# Fix code style issues
npm run lint:fix
```

## License

This project is licensed under the ISC License. 