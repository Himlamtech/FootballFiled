# Football Field Management System

A full-stack web application for managing football field bookings, finding opponents, purchasing football-related products, and handling field operations. The system supports both user and admin roles with a modern UI and robust backend.

## Features

### User
- View football field information and facilities
- Book fields by date and time slot
- Find and post opponent requests for matches
- Browse, purchase, or rent football-related products and services
- Submit feedback on field experience

### Admin
- Manage football fields (add, edit, delete)
- Manage products and services (add, edit, delete, view stats)
- View revenue and booking statistics (dashboard)
- Manage bookings and payments
- View and respond to user feedback
- Manage finances and orders

## Technology Stack

### Frontend
- React.js (TypeScript)
- React Router for navigation
- Tailwind CSS & Shadcn UI for styling
- Axios for API calls
- React Query for state management

### Backend
- Node.js with Express.js
- Sequelize ORM (MySQL)
- JWT for authentication
- MySQL database

## Project Structure

See [Project Structure Guide](.cursor/rules/project-structure.mdc) for a detailed breakdown.

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MySQL (v5.7+)

### Database Setup
1. Create the database:
   ```sql
   CREATE DATABASE FootballField;
   ```
2. Configure database connection in `.env` (see `backend/.env.example`):
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=FootballField
   ```
3. (Optional) Run the SQL script for initial schema:
   ```bash
   mysql -u root -p FootballField < database.sql
   ```

### Backend Setup
1. Navigate to backend:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm start
   ```
   The backend runs on [http://localhost:9002](http://localhost:9002)

### Frontend Setup
1. Navigate to frontend:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend app:
   ```bash
   npm run dev
   ```
   The frontend runs on [http://localhost:9001](http://localhost:9001)

### Start Both (Dev)
Use the provided script to start both servers:
```bash
./app.sh
```

## Default Admin Account
- Username: `admin`
- Password: `admin123`

## API Overview

See [Backend API Endpoints](.cursor/rules/backend-api.mdc) for a full list of endpoints and their usage.

## Main Frontend Pages

See [Frontend Pages Guide](.cursor/rules/frontend-pages.mdc) for a summary of user and admin pages.

## Author
- Nguyễn Thu Trang - PTIT

## License
MIT License
