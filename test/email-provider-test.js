/**
 * Email provider test script
 *
 * This script tests sending an email using the configured email provider
 * It will use either Nodemailer/Gmail or SendGrid based on the .env configuration
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { sendBookingConfirmation } = require('../backend/utils/emailServiceFactory');

// Mock booking data for testing
const mockBooking = {
  bookingId: 12345,
  customerName: 'Test User',
  customerPhone: '0987654321',
  customerEmail: 'hailam04.work@gmail.com', // Test email address
  totalPrice: 500000,
  bookingDate: new Date(),
  notes: 'This is a test booking from the email provider test script'
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
  console.log('Testing email sending functionality with configured provider...');
  console.log('Email configuration:');
  console.log(`- USE_SENDGRID: ${process.env.USE_SENDGRID || 'false'}`);
  console.log(`- SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`- EMAIL_USER: ${process.env.EMAIL_USER || 'Not configured'}`);
  console.log(`- EMAIL_APP_PASSWORD: ${process.env.EMAIL_APP_PASSWORD ? 'Configured' : 'Not configured'}`);
  console.log(`- EMAIL_FROM: ${process.env.EMAIL_FROM || 'Not configured'}`);
  console.log(`Sending test email to: ${mockBooking.customerEmail}`);

  try {
    const result = await sendBookingConfirmation(mockBooking, mockField, mockTimeSlot);
    console.log('Email sent successfully!');
    console.log('Result:', result);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Run the test
testSendEmail().then(() => {
  console.log('Email provider test completed.');
});
