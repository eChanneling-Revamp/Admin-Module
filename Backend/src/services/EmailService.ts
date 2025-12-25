import { sendEmail, emailTemplates } from '../config/mailer';
import { logger } from '../config/logger';
import { InvoiceResponse } from '../types/invoice';

export class EmailService {
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    try {
      const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;
      const template = emailTemplates.welcome(name, loginUrl);
      
      return await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
      });
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<boolean> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      const template = emailTemplates.passwordReset(name, resetUrl);
      
      return await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
      });
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      return false;
    }
  }

  async sendInvoiceNotification(invoice: InvoiceResponse): Promise<boolean> {
    try {
      const dueDate = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Not specified';
      const template = emailTemplates.invoiceNotification(
        invoice.invoiceNo,
        invoice.amount,
        dueDate
      );
      
      return await sendEmail({
        to: 'admin@echannelling.com', // Use admin email as fallback since branch doesn't have email
        subject: template.subject,
        html: template.html,
      });
    } catch (error) {
      logger.error('Failed to send invoice notification:', error);
      return false;
    }
  }

  async sendCustomEmail(
    to: string | string[],
    subject: string,
    content: string,
    isHtml: boolean = true
  ): Promise<boolean> {
    try {
      return await sendEmail({
        to,
        subject,
        [isHtml ? 'html' : 'text']: content,
      });
    } catch (error) {
      logger.error('Failed to send custom email:', error);
      return false;
    }
  }

  async sendBulkEmail(
    recipients: Array<{ email: string; name?: string }>,
    subject: string,
    content: string,
    isHtml: boolean = true
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const recipient of recipients) {
      try {
        const personalizedContent = recipient.name 
          ? content.replace(/{{name}}/g, recipient.name)
          : content;

        const result = await sendEmail({
          to: recipient.email,
          subject,
          [isHtml ? 'html' : 'text']: personalizedContent,
        });

        if (result) {
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        logger.error(`Failed to send email to ${recipient.email}:`, error);
        failed++;
      }
    }

    return { success, failed };
  }

  async sendNotificationEmail(
    email: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ): Promise<boolean> {
    try {
      const colorMap = {
        info: '#007bff',
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545',
      };

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: ${colorMap[type]}; color: white; padding: 15px; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">${title}</h2>
          </div>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 0 0 5px 5px;">
            <p style="margin: 0; font-size: 16px; line-height: 1.5;">${message}</p>
            <p style="margin: 20px 0 0 0; font-size: 14px; color: #6c757d;">
              This is an automated notification from eChannelling.
            </p>
          </div>
        </div>
      `;

      return await sendEmail({
        to: email,
        subject: title,
        html,
      });
    } catch (error) {
      logger.error('Failed to send notification email:', error);
      return false;
    }
  }
}

export default new EmailService();
