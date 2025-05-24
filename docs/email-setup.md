# Email Notification Setup Guide

This guide explains how to set up email notifications for the Football Field Management System.

## Available Email Providers

The system supports two email providers:

1. **Gmail (via Nodemailer)** - Default option
2. **SendGrid** - Alternative option (recommended for production)

## Gmail Setup

To use Gmail for sending emails:

1. Set the following environment variables in your `.env` file:

```
EMAIL_USER=your-gmail-account@gmail.com
EMAIL_PASSWORD=your-gmail-password
EMAIL_FROM=Football Field Management <your-gmail-account@gmail.com>
USE_SENDGRID=false
```

2. **Important**: Gmail has strict security policies that may block emails sent from applications:

   - **If you have 2-Factor Authentication (2FA) enabled**:
     - Go to your Google Account settings
     - Navigate to Security > App passwords
     - Create a new app password for "Mail" and "Other (Custom name)"
     - Use this app password instead of your regular password in the `.env` file:
     ```
     EMAIL_APP_PASSWORD=your-app-password
     ```

   - **If you don't have 2FA enabled**:
     - Go to your Google Account settings
     - Navigate to Security > Less secure app access
     - Turn on "Allow less secure apps"
     - Note: Google is phasing out this option, so using an App Password with 2FA is recommended

## SendGrid Setup (Recommended for Production)

SendGrid is a reliable email service provider that offers a free tier with 100 emails per day.

1. Sign up for a free SendGrid account at [https://sendgrid.com/](https://sendgrid.com/)

2. Create an API key:
   - Go to Settings > API Keys
   - Click "Create API Key"
   - Choose "Restricted Access" and enable "Mail Send" permissions
   - Copy the generated API key

3. Set the following environment variables in your `.env` file:

```
SENDGRID_API_KEY=your-sendgrid-api-key
USE_SENDGRID=true
EMAIL_FROM=Football Field Management <your-verified-sender-email@example.com>
```

4. **Important**: SendGrid requires sender verification:
   - Go to Settings > Sender Authentication
   - Verify a Single Sender or set up Domain Authentication
   - Use the verified email address in the `EMAIL_FROM` environment variable

## Testing Email Configuration

To test your email configuration:

1. Run the email provider test script:

```bash
node test/email-provider-test.js
```

2. Check the console output for any errors or success messages.

3. If using SendGrid, you can also check the SendGrid Activity dashboard to see if the email was sent successfully.

## Troubleshooting

### Gmail Issues

- **Authentication Failed**: Make sure you're using the correct App Password if 2FA is enabled.
- **Security Alert**: Check your Gmail account for security alerts and approve the login attempt.
- **Less Secure App Access**: Make sure "Less secure app access" is enabled if you're not using 2FA.

### SendGrid Issues

- **API Key Invalid**: Make sure you've copied the API key correctly and it has "Mail Send" permissions.
- **Sender Not Verified**: Make sure the sender email address is verified in SendGrid.
- **Rate Limit Exceeded**: Check if you've exceeded the free tier limit (100 emails per day).

## Production Recommendations

For production environments, we recommend:

1. Use SendGrid instead of Gmail for better reliability and deliverability.
2. Set up proper domain authentication in SendGrid to improve email deliverability.
3. Monitor email sending activity in the SendGrid dashboard.
4. Implement email templates in SendGrid for consistent branding and easier management.
