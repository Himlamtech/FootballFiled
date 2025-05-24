/**
 * Secure email test script
 *
 * This script tests sending an email with a more secure configuration
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const nodemailer = require('nodemailer');

async function main() {
  console.log('Starting secure email test...');
  console.log('Email credentials:');
  console.log(`- Username: himlam.cursor1@gmail.com`);
  console.log(`- Password: [HIDDEN]`);

  // Create a more secure transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: 'himlam.cursor1@gmail.com',
      pass: 'Himlam04@'
    },
    tls: {
      rejectUnauthorized: false // Accept self-signed certificates
    }
  });

  // Email content
  const mailOptions = {
    from: '"Football Field System" <himlam.cursor1@gmail.com>',
    to: 'hailam04.work@gmail.com',
    subject: 'Secure Test Email from Football Field System',
    text: 'This is a plain text test email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #4CAF50; text-align: center;">Secure Test Email</h2>
        <p>Hello,</p>
        <p>This is a secure test email from the Football Field Management System.</p>
        <p>If you're receiving this email, it means the email notification system is working correctly.</p>
        <p>Time sent: ${new Date().toLocaleString()}</p>
        <p style="text-align: center; margin-top: 30px; color: #777; font-size: 14px;">
          © ${new Date().getFullYear()} Football Field Management System. All rights reserved.
        </p>
      </div>
    `
  };

  try {
    console.log('Attempting to send secure test email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Email sent to:', mailOptions.to);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

main().catch(console.error);
