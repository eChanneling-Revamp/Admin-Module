import nodemailer from 'nodemailer';
import { env } from './env';
import { logger } from './logger';

// Check if email configuration is available
const isEmailConfigured = env.EMAIL_HOST && env.EMAIL_USER && env.EMAIL_PASS;

// Create transporter only if email is configured
let transporter: nodemailer.Transporter | null = null;

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_PORT === 465, // true for 465, false for other ports
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });

  // Verify connection configuration
  transporter.verify((error, success) => {
    if (error) {
      logger.error('Email configuration error:', error);
    } else {
      logger.info('Email server is ready to take our messages');
    }
  });
} else {
  logger.info('Email service is not configured - skipping email functionality');
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  if (!transporter) {
    logger.warn('Email service not configured - skipping email send');
    return false;
  }

  try {
    const mailOptions = {
      from: env.EMAIL_FROM,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    logger.error('Failed to send email:', error);
    return false;
  }
};

// Email templates
export const emailTemplates = {
  welcome: (name: string, loginUrl: string) => ({
    subject: 'Welcome to eChannelling',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to eChannelling, ${name}!</h2>
        <p>Your account has been created successfully. You can now access the platform using the link below:</p>
        <a href="${loginUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Platform</a>
        <p>If you have any questions, please contact our support team.</p>
      </div>
    `,
  }),
  
  passwordReset: (name: string, resetUrl: string) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  }),
  
  invoiceNotification: (invoiceNo: string, amount: number, dueDate: string) => ({
    subject: `Invoice ${invoiceNo} - Payment Due`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Invoice Payment Due</h2>
        <p>Invoice Number: <strong>${invoiceNo}</strong></p>
        <p>Amount: <strong>$${amount.toFixed(2)}</strong></p>
        <p>Due Date: <strong>${dueDate}</strong></p>
        <p>Please ensure payment is made before the due date to avoid any late fees.</p>
      </div>
    `,
  }),
};

export default transporter;
