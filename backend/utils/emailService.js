/**
 * Email Service Utility
 *
 * This utility provides functions for sending emails using Nodemailer
 */

const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Create a transporter based on environment
// Use Gmail with App Password (since we have it configured now)
let transporter;

const createTransporter = async () => {
  // Log email configuration for debugging
  console.log('Email configuration:');
  console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`- EMAIL_USER: ${process.env.EMAIL_USER ? 'Set' : 'Not set'}`);
  console.log(`- EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? 'Set' : 'Not set'}`);
  console.log(`- EMAIL_APP_PASSWORD: ${process.env.EMAIL_APP_PASSWORD ? 'Set' : 'Not set'}`);

  // Check if we have an App Password configured
  const hasAppPassword = !!process.env.EMAIL_APP_PASSWORD;

  // If we have an App Password, use Gmail directly
  if (hasAppPassword) {
    console.log('Setting up Gmail transporter with App Password');
    console.log(`- Using email: ${process.env.EMAIL_USER || 'himlam.cursor1@gmail.com'}`);

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'himlam.cursor1@gmail.com',
        // Use the App Password for Gmail with 2FA enabled
        pass: process.env.EMAIL_APP_PASSWORD
      },
      // Debug options
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development'
    });
  }

  // If no App Password is available and we're in development, use Ethereal for testing
  if (process.env.NODE_ENV !== 'production') {
    try {
      // Create a test account on Ethereal
      const testAccount = await nodemailer.createTestAccount();
      console.log('Created Ethereal test account:', testAccount.user);

      // Create a transporter using the test account
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        },
        debug: true,
        logger: true
      });
    } catch (error) {
      console.error('Failed to create Ethereal test account:', error);
      // Fall back to Gmail with regular password if Ethereal fails
    }
  }

  // Fallback to Gmail with regular password (not recommended)
  console.warn('WARNING: Using Gmail with regular password. This may not work if 2FA is enabled.');
  console.log(`- Using email: ${process.env.EMAIL_USER || 'himlam.cursor1@gmail.com'}`);

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'himlam.cursor1@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'Himlam04@'
    },
    // Debug options
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development'
  });
};

// Initialize transporter (will be set asynchronously)
let transporterPromise = createTransporter();

/**
 * Send a booking confirmation email to the customer
 * @param {Object} booking - Booking object with customer details and booking information
 * @param {Object} field - Field object with field details
 * @param {Object} timeSlot - TimeSlot object with time slot details
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendBookingConfirmation = async (booking, field, timeSlot) => {
  try {
    // Format date for display
    const bookingDate = new Date(booking.bookingDate);
    const formattedDate = bookingDate.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Football Field Management <himlam.cursor1@gmail.com>',
      to: booking.customerEmail,
      subject: 'Xác nhận đặt sân bóng đá thành công',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #4CAF50; text-align: center;">Xác Nhận Đặt Sân Thành Công</h2>
          <p>Xin chào <strong>${booking.customerName}</strong>,</p>
          <p>Cảm ơn bạn đã đặt sân bóng đá tại hệ thống của chúng tôi. Dưới đây là thông tin chi tiết về đơn đặt sân của bạn:</p>

          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="margin-top: 0; color: #333;">Thông Tin Đặt Sân</h3>
            <p><strong>Mã đặt sân:</strong> #${booking.bookingId}</p>
            <p><strong>Tên sân:</strong> ${field.name}</p>
            <p><strong>Kích thước sân:</strong> ${field.size}</p>
            <p><strong>Ngày đặt:</strong> ${formattedDate}</p>
            <p><strong>Thời gian:</strong> ${timeSlot.startTime} - ${timeSlot.endTime}</p>
            <p><strong>Tổng tiền:</strong> ${booking.totalPrice.toLocaleString('vi-VN')} VNĐ</p>
          </div>

          <div style="margin: 20px 0;">
            <p><strong>Thông tin liên hệ của bạn:</strong></p>
            <p>Tên: ${booking.customerName}</p>
            <p>Số điện thoại: ${booking.customerPhone}</p>
            <p>Email: ${booking.customerEmail}</p>
          </div>

          <div style="margin: 20px 0;">
            <p><strong>Ghi chú:</strong> ${booking.notes || 'Không có'}</p>
          </div>

          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0;">Nếu bạn có bất kỳ câu hỏi nào hoặc cần thay đổi lịch đặt sân, vui lòng liên hệ với chúng tôi qua số điện thoại: <strong>0123 456 789</strong> hoặc email: <strong>support@footballfield.com</strong></p>
          </div>

          <p style="text-align: center; margin-top: 30px; color: #777; font-size: 14px;">
            © ${new Date().getFullYear()} Football Field Management System. All rights reserved.
          </p>
        </div>
      `
    };

    // Get the transporter (wait for it to be initialized if needed)
    const emailTransporter = await transporterPromise;

    // Send email
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent:', info.messageId);

    // If using Ethereal, log the preview URL
    if (info.messageId && info.messageId.includes('ethereal')) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    throw error;
  }
};

/**
 * Verify email configuration by testing the connection
 * @returns {Promise<boolean>} - True if connection is successful, false otherwise
 */
const verifyEmailConfig = async () => {
  try {
    // Get the transporter (wait for it to be initialized if needed)
    const emailTransporter = await transporterPromise;

    const verification = await emailTransporter.verify();
    console.log('Email configuration is valid:', verification);
    return verification;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};

/**
 * Send a feedback notification email to the admin
 * @param {Object} feedback - Feedback object with user details and feedback content
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendFeedbackNotification = async (feedback) => {
  try {
    // Format date for display
    const createdAt = new Date(feedback.createdAt);
    const formattedDate = createdAt.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Football Field Management <himlam.cursor1@gmail.com>',
      to: process.env.ADMIN_EMAIL || 'hailam04.work@gmail.com',
      subject: 'Thông báo: Phản hồi mới từ khách hàng',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #4CAF50; text-align: center;">Phản Hồi Mới Từ Khách Hàng</h2>
          <p>Bạn vừa nhận được một phản hồi mới từ khách hàng. Dưới đây là thông tin chi tiết:</p>

          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>ID Phản hồi:</strong> #${feedback.id}</p>
            <p><strong>Thời gian:</strong> ${formattedDate}</p>
            <p><strong>Tên khách hàng:</strong> ${feedback.name}</p>
            <p><strong>Email:</strong> ${feedback.email || 'Không cung cấp'}</p>
            <p><strong>Nội dung phản hồi:</strong></p>
            <div style="background-color: #fff; padding: 10px; border-left: 4px solid #4CAF50; margin: 10px 0;">
              ${feedback.content}
            </div>
          </div>

          <p>Vui lòng đăng nhập vào hệ thống quản lý để xem và phản hồi.</p>

          <div style="text-align: center; margin-top: 20px;">
            <a href="${process.env.ADMIN_URL || 'http://localhost:9001/admin'}/feedback" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Xem Phản Hồi</a>
          </div>

          <p style="text-align: center; margin-top: 30px; color: #777; font-size: 14px;">
            © ${new Date().getFullYear()} Football Field Management System. All rights reserved.
          </p>
        </div>
      `
    };

    // Get the transporter (wait for it to be initialized if needed)
    const emailTransporter = await transporterPromise;

    // Send email
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('Feedback notification email sent:', info.messageId);

    // If using Ethereal, log the preview URL
    if (info.messageId && info.messageId.includes('ethereal')) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Error sending feedback notification email:', error);
    throw error;
  }
};

/**
 * Send a feedback response email to the user
 * @param {Object} feedback - Feedback object with user details, feedback content, and admin response
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendFeedbackResponse = async (feedback) => {
  try {
    if (!feedback.email) {
      throw new Error('No email address provided for feedback response');
    }

    // Format dates for display
    const createdAt = new Date(feedback.createdAt);
    const formattedCreatedDate = createdAt.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const updatedAt = new Date(feedback.updatedAt);
    const formattedResponseDate = updatedAt.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Football Field Management <himlam.cursor1@gmail.com>',
      to: feedback.email,
      subject: 'Phản hồi cho ý kiến của bạn',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #4CAF50; text-align: center;">Phản Hồi Cho Ý Kiến Của Bạn</h2>
          <p>Xin chào <strong>${feedback.name}</strong>,</p>
          <p>Cảm ơn bạn đã gửi ý kiến đến hệ thống quản lý sân bóng đá của chúng tôi. Chúng tôi đã nhận được phản hồi của bạn và xin gửi lại câu trả lời như sau:</p>

          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Ý kiến của bạn (${formattedCreatedDate}):</strong></p>
            <div style="background-color: #fff; padding: 10px; border-left: 4px solid #4CAF50; margin: 10px 0;">
              ${feedback.content}
            </div>

            <p><strong>Phản hồi của chúng tôi (${formattedResponseDate}):</strong></p>
            <div style="background-color: #fff; padding: 10px; border-left: 4px solid #2196F3; margin: 10px 0;">
              ${feedback.response}
            </div>
          </div>

          <p>Nếu bạn có bất kỳ câu hỏi nào khác, vui lòng liên hệ với chúng tôi qua số điện thoại: <strong>0123 456 789</strong> hoặc email: <strong>support@footballfield.com</strong></p>

          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0;">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
          </div>

          <p style="text-align: center; margin-top: 30px; color: #777; font-size: 14px;">
            © ${new Date().getFullYear()} Football Field Management System. All rights reserved.
          </p>
        </div>
      `
    };

    // Get the transporter (wait for it to be initialized if needed)
    const emailTransporter = await transporterPromise;

    // Send email
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('Feedback response email sent:', info.messageId);

    // If using Ethereal, log the preview URL
    if (info.messageId && info.messageId.includes('ethereal')) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Error sending feedback response email:', error);
    throw error;
  }
};

module.exports = {
  sendBookingConfirmation,
  sendFeedbackNotification,
  sendFeedbackResponse,
  verifyEmailConfig
};
