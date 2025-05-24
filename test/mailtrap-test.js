/**
 * Mailtrap email test script
 *
 * This script tests sending an email using Mailtrap (a test email service)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const nodemailer = require('nodemailer');

async function main() {
  console.log('Starting Mailtrap email test...');

  // Create a test account on Mailtrap
  console.log('Creating test account on Ethereal...');
  const testAccount = await nodemailer.createTestAccount();
  console.log('Test account created:', testAccount.user);

  // Create a transporter using the test account
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });

  // Email content
  const mailOptions = {
    from: '"Football Field System" <test@example.com>',
    to: 'hailam04.work@gmail.com',
    subject: 'Test Email from Football Field System (Ethereal)',
    text: 'This is a plain text test email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #4CAF50; text-align: center;">Test Email (Ethereal)</h2>
        <p>Hello,</p>
        <p>This is a test email from the Football Field Management System using Ethereal.</p>
        <p>If you're receiving this email, it means the email notification system is working correctly.</p>
        <p>Time sent: ${new Date().toLocaleString()}</p>
        <p style="text-align: center; margin-top: 30px; color: #777; font-size: 14px;">
          © ${new Date().getFullYear()} Football Field Management System. All rights reserved.
        </p>
      </div>
    `
  };

  try {
    console.log('Attempting to send test email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);

    // Preview URL (only works with Ethereal)
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

main().catch(console.error);
