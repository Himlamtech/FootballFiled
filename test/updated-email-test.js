/**
 * Updated email test script
 *
 * This script tests the updated email service with Ethereal fallback
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { sendBookingConfirmation, verifyEmailConfig } = require('../backend/utils/emailService');

// Mock booking data for testing
const mockBooking = {
  bookingId: 12345,
  customerName: 'Test User',
  customerPhone: '0987654321',
  customerEmail: 'hailam04.work@gmail.com', // Specific test email address
  totalPrice: 500000,
  bookingDate: new Date(),
  notes: 'This is a test booking'
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
  console.log('Testing updated email sending functionality...');
  console.log(`Sending test email to: ${mockBooking.customerEmail}`);

  try {
    const result = await sendBookingConfirmation(mockBooking, mockField, mockTimeSlot);
    console.log('Email sent successfully!');
    console.log('Message ID:', result.messageId);

    // If using Ethereal, the preview URL will be logged by the email service
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Run the test
testSendEmail().then(() => {
  console.log('Email test completed.');
});
