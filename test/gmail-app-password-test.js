/**
 * Gmail App Password Test Script
 *
 * This script directly tests sending an email using Gmail with App Password
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const nodemailer = require('nodemailer');

// Create a transporter with Gmail configuration using App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'himlam.cursor1@gmail.com',
    pass: process.env.EMAIL_APP_PASSWORD // Using App Password
  },
  debug: true, // Enable debug output
  logger: true // Log SMTP traffic
});

// Email content
const mailOptions = {
  from: process.env.EMAIL_FROM || 'Football Field Management <himlam.cursor1@gmail.com>',
  to: 'hailam04.work@gmail.com',
  subject: 'Test Email with Gmail App Password',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
      <h2 style="color: #4CAF50; text-align: center;">Test Email with Gmail App Password</h2>
      <p>Hello,</p>
      <p>This is a test email sent using Gmail with an App Password.</p>
      <p>If you're receiving this email, it means the App Password is working correctly!</p>
      <p>Time sent: ${new Date().toLocaleString()}</p>
      <p style="text-align: center; margin-top: 30px; color: #777; font-size: 14px;">
        © ${new Date().getFullYear()} Football Field Management System. All rights reserved.
      </p>
    </div>
  `
};

// Test sending email
async function testSendEmail() {
  console.log('Testing Gmail with App Password...');
  console.log('Email configuration:');
  console.log(`- EMAIL_USER: ${process.env.EMAIL_USER || 'himlam.cursor1@gmail.com'}`);
  console.log(`- EMAIL_APP_PASSWORD: ${process.env.EMAIL_APP_PASSWORD ? 'Configured' : 'Not configured'}`);
  console.log(`- EMAIL_FROM: ${process.env.EMAIL_FROM || 'Football Field Management <himlam.cursor1@gmail.com>'}`);
  console.log(`Sending test email to: ${mailOptions.to}`);

  try {
    // Verify connection configuration
    console.log('Verifying connection configuration...');
    const verification = await transporter.verify();
    console.log('Connection configuration is valid:', verification);

    // Send email
    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Run the test
testSendEmail()
  .then(() => {
    console.log('Gmail App Password test completed.');
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
