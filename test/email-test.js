/**
 * Test script for email functionality
 *
 * This script tests the email sending functionality by sending a test email
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const nodemailer = require('nodemailer');
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
  console.log('Testing email sending functionality...');
  console.log('Using email configuration:');
  console.log(`- Email user: ${process.env.EMAIL_USER || 'himlam.cursor1@gmail.com'}`);
  console.log(`- Email from: ${process.env.EMAIL_FROM || 'Football Field Management <himlam.cursor1@gmail.com>'}`);

  // First verify email configuration
  console.log('Verifying email configuration...');
  const isConfigValid = await verifyEmailConfig();

  if (!isConfigValid) {
    console.error('Email configuration is invalid. Please check your credentials.');
    return;
  }

  console.log('Email configuration verified successfully!');

  try {
    const result = await sendBookingConfirmation(mockBooking, mockField, mockTimeSlot);
    console.log('Email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Email sent to:', mockBooking.customerEmail);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Run the test
testSendEmail().then(() => {
  console.log('Email test completed.');
});
