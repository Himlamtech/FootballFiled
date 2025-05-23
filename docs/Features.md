# Football Field Management System - Features

This document provides a comprehensive overview of the features available in the Football Field Management System.

## Core Features

### 1. Football Field Management

The system maintains information about 4 fixed football fields:

- **Field Details**: Each field has a name, type (5v5, 7v7, 11v11), description, image, and status.
- **Field Status**: Fields can be marked as active or under maintenance.
- **Field Viewing**: Users can view detailed information about each field, including available time slots.
- **Field Management**: Administrators can update field information and status.

### 2. Booking System

The booking system allows users to reserve football fields:

- **Time Slot Selection**: Users can view and select available time slots for a specific field and date.
- **Booking Creation**: Users can create bookings by providing contact information and selecting a field, date, and time slot.
- **Booking Management**: Administrators can view, confirm, or cancel bookings.
- **Booking Status**: Bookings can have different statuses (pending, confirmed, cancelled, completed).
- **Customer Information**: The system stores customer name, phone, and email for each booking.

### 3. Opponent Finding

The system includes a feature for finding football opponents:

- **Opponent Registration**: Teams can register to find opponents by providing team information and preferred playing time.
- **Opponent Listing**: Users can view a list of teams looking for opponents.
- **Opponent Matching**: Teams can contact each other to arrange matches.
- **Expiration**: Opponent finding requests expire after a set period to keep the listings current.

### 4. Feedback System

Users can provide feedback about the service:

- **Feedback Submission**: Users can submit feedback with their name, email, and message.
- **Feedback Management**: Administrators can view, respond to, and manage feedback.
- **Feedback Status**: Feedback can be marked as unread, read, or responded.

### 5. Admin Dashboard

The admin dashboard provides an overview of the system:

- **Statistics**: Displays key statistics like total bookings, pending bookings, and unread feedback.
- **Booking Chart**: Shows booking trends over time.
- **Popular Fields**: Lists the most popular fields based on booking count.

### 6. Authentication System

The system includes authentication for administrators:

- **Admin Login**: Administrators can log in with username and password.
- **JWT Authentication**: Uses JSON Web Tokens for secure authentication.
- **Protected Routes**: Certain API endpoints and pages are protected and require authentication.

## User Interfaces

### Public User Interface

- **Home Page**: Displays information about the football fields.
- **Booking Page**: Allows users to book football fields.
- **Opponent Finding Page**: Allows users to find opponents for matches.
- **Feedback Form**: Allows users to submit feedback.

### Admin Interface

- **Login Page**: Allows administrators to log in.
- **Dashboard**: Provides an overview of the system.
- **Field Management**: Allows administrators to manage football fields.
- **Booking Management**: Allows administrators to manage bookings.
- **Feedback Management**: Allows administrators to manage feedback.

## Technical Features

### API Endpoints

The system provides a comprehensive set of RESTful API endpoints:

- **Authentication**: Login and user information retrieval.
- **Fields**: CRUD operations for football fields.
- **Time Slots**: Management of available time slots.
- **Bookings**: Creation and management of bookings.
- **Opponents**: Registration and management of opponent finding requests.
- **Feedback**: Submission and management of feedback.
- **Dashboard**: Retrieval of dashboard statistics and data.

### Database

The system uses a MySQL database with the following main tables:

- **Users**: Stores administrator accounts.
- **Fields**: Stores information about football fields.
- **TimeSlots**: Stores available time slots for each field.
- **Bookings**: Stores booking information.
- **Opponents**: Stores opponent finding requests.
- **Feedback**: Stores user feedback.
- **Reviews**: Stores field reviews.
- **Notifications**: Stores system notifications.

### Security

- **JWT Authentication**: Secure authentication using JSON Web Tokens.
- **Protected Routes**: API endpoints and admin pages are protected.
- **Input Validation**: All user inputs are validated to prevent security issues.
- **Error Handling**: Comprehensive error handling to prevent information leakage.

## Automation

- **Database Initialization**: Automated script for initializing the database.
- **Application Startup**: Automated scripts for starting the application.
- **Database Updates**: Script for updating the database schema.

## Limitations

- The system is designed to manage exactly 4 fixed football fields.
- The system uses plaintext password authentication (no hashing) for simplicity.
- The system does not include user registration or user accounts.
- The system does not include payment processing.

## Future Enhancements

Potential future enhancements for the system:

- **User Accounts**: Allow users to create accounts and manage their bookings.
- **Online Payment**: Integrate payment processing for bookings.
- **Mobile App**: Develop a mobile application for the system.
- **Notifications**: Add email or SMS notifications for booking confirmations and reminders.
- **Reviews**: Allow users to leave reviews for fields after their bookings.
- **Dynamic Field Management**: Allow administrators to add or remove fields as needed.
