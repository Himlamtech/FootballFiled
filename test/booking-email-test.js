/**
 * Booking email test script
 *
 * This script tests the booking flow with email notification
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const axios = require('axios');

// API base URL
const API_URL = process.env.API_URL || 'http://localhost:9002/api';

// Test booking data
const bookingData = {
  fieldId: 4, // Using field ID 4
  timeSlotId: 10, // Using a different time slot
  bookingDate: '2025-08-01', // Using a different future date
  customerName: 'Test User',
  customerPhone: '0987654321',
  customerEmail: 'hailam04.work@gmail.com', // Test email address
  totalPrice: 500000,
  notes: 'This is a test booking with Gmail App Password email notification - Production Test'
};

// Create a booking
async function createBooking() {
  try {
    console.log('Creating a test booking with the following data:');
    console.log(JSON.stringify(bookingData, null, 2));

    const response = await axios.post(`${API_URL}/bookings`, bookingData);

    console.log('Booking created successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('Check your email inbox for the booking confirmation email.');

    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Run the test
createBooking()
  .then(() => {
    console.log('Booking test completed.');
  })
  .catch(error => {
    console.error('Test failed:', error);
  });
