/**
 * Direct email test script
 *
 * This script directly tests sending an email without verification
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const nodemailer = require('nodemailer');

// Create a transporter with Gmail configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'himlam.cursor1@gmail.com',
    pass: 'Himlam04@'
  }
});

// Email content
const mailOptions = {
  from: 'Football Field Management <himlam.cursor1@gmail.com>',
  to: 'hailam04.work@gmail.com',
  subject: 'Test Email from Football Field Management System',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
      <h2 style="color: #4CAF50; text-align: center;">Test Email</h2>
      <p>Hello,</p>
      <p>This is a test email from the Football Field Management System.</p>
      <p>If you're receiving this email, it means the email notification system is working correctly.</p>
      <p>Time sent: ${new Date().toLocaleString()}</p>
      <p style="text-align: center; margin-top: 30px; color: #777; font-size: 14px;">
        © ${new Date().getFullYear()} Football Field Management System. All rights reserved.
      </p>
    </div>
  `
};

// Send email
console.log('Attempting to send test email...');
console.log(`From: ${mailOptions.from}`);
console.log(`To: ${mailOptions.to}`);

transporter.sendMail(mailOptions)
  .then(info => {
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Email sent to:', mailOptions.to);
  })
  .catch(error => {
    console.error('Error sending email:', error);
  });
