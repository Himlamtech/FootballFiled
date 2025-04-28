# Football Field Management System - Backend

This repository contains the backend code for the Football Field Management System. The system is designed to manage football field bookings, products, users, and more.

## Requirements

- Node.js 14+
- npm
- Either SQLite (for development) or MySQL (for production)

## Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

## Database Configuration and Setup

The application supports both SQLite (for development) and MySQL (for production or more robust development).

### Using the Database Setup Utility

The easiest way to set up the database is to use our interactive utility:

```bash
# Interactive mode
npm run switch-db
```

This will prompt you to:
1. Choose between SQLite and MySQL
2. Configure database connection details (for MySQL)
3. Generate sample data

### Quick Setup Commands

For faster setup, you can use these one-command shortcuts:

```bash
# Switch to SQLite and generate sample data
npm run db:sqlite

# Switch to MySQL and set up database
npm run db:mysql
```

### Manual Database Configuration

If you prefer to configure manually:

#### Step 1: Switch Database Type

```bash
# Switch to SQLite
npm run switch-db:sqlite

# Switch to MySQL
npm run switch-db:mysql
```

#### Step 2: Generate Sample Data

```bash
# For SQLite
npm run setup-sqlite

# For MySQL
npm run setup-mysql-db
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

## Available Scripts

```
# Application
npm start               # Start the server in production mode
npm run dev             # Start the server in development mode with hot-reloading

# Database Management
npm run switch-db       # Interactive database configuration utility
npm run db:sqlite       # Switch to SQLite and generate sample data
npm run db:mysql        # Switch to MySQL and set up database
npm run switch-db:sqlite # Switch to SQLite without generating data
npm run switch-db:mysql  # Switch to MySQL without generating data
npm run setup-sqlite    # Generate sample data for SQLite
npm run setup-mysql     # Generate sample data for MySQL
npm run setup-mysql-db  # Create MySQL database and generate sample data

# Development Tools
npm test                # Run tests in watch mode
npm run test:ci         # Run tests in CI mode
npm run lint            # Check code style
npm run lint:fix        # Fix code style issues
```

## License

This project is licensed under the ISC License. 