/**
 * SendGrid email test script
 *
 * This script tests sending an email using SendGrid
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { sendBookingConfirmation } = require('../backend/utils/sendgridEmailService');

// Mock booking data for testing
const mockBooking = {
  bookingId: 12345,
  customerName: 'Test User',
  customerPhone: '0987654321',
  customerEmail: 'hailam04.work@gmail.com', // Test email address
  totalPrice: 500000,
  bookingDate: new Date(),
  notes: 'This is a test booking from SendGrid'
};

// Mock field data
const mockField = {
  name: 'Sân bóng đá Test',
  size: '5v5'
};

// Mock time slot data
const mockTimeSlot = {
  startTime: '18:00:00',
  endTime: '19:30:00'
};

// Test sending email
async function testSendEmail() {
  console.log('Testing SendGrid email sending functionality...');
  console.log(`Sending test email to: ${mockBooking.customerEmail}`);

  // Check if SendGrid API key is configured
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SendGrid API key not configured. Please set SENDGRID_API_KEY in .env file.');
    console.log('You can get a free API key by signing up at https://sendgrid.com/');
    return;
  }

  try {
    const result = await sendBookingConfirmation(mockBooking, mockField, mockTimeSlot);
    console.log('Email sent successfully via SendGrid!');
    console.log('Status code:', result[0].statusCode);
    console.log('Headers:', result[0].headers);
  } catch (error) {
    console.error('Error sending email via SendGrid:', error);
  }
}

// Run the test
testSendEmail().then(() => {
  console.log('SendGrid email test completed.');
});
