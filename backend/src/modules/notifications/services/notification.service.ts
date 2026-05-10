import nodemailer from 'nodemailer';
import pool from '../../../database/db';

export class NotificationService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  static async sendEmail(userId: string | null, recipient: string, type: string, subject: string, html: string, metadata: any = {}) {
    try {
      // 1. Log notification as QUEUED
      const logRes = await pool.query(
        'INSERT INTO notification_logs (user_id, channel, type, recipient, status, metadata) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [userId, 'EMAIL', type, recipient, 'QUEUED', JSON.stringify(metadata)]
      );
      const logId = logRes.rows[0].id;

      // 2. Attempt delivery
      const info = await this.transporter.sendMail({
        from: `"Time Track" <${process.env.SMTP_FROM}>`,
        to: recipient,
        subject: subject,
        html: html,
      });

      // 3. Update log to SENT
      await pool.query(
        'UPDATE notification_logs SET status = $1, metadata = $2 WHERE id = $3',
        ['SENT', JSON.stringify({ ...metadata, messageId: info.messageId }), logId]
      );

      return true;
    } catch (err: any) {
      console.error('Email delivery failed:', err);
      // Update log to FAILED
      await pool.query(
        'UPDATE notification_logs SET status = $1, error_message = $2 WHERE recipient = $3 AND type = $4 AND status = $5',
        ['FAILED', err.message, recipient, type, 'QUEUED']
      );
      return false;
    }
  }

  static async sendWhatsApp(userId: string | null, recipient: string, type: string, message: string, metadata: any = {}) {
     // Placeholder for WhatsApp Cloud API integration
     console.log(`[WA MOCK] To: ${recipient}, Msg: ${message}`);
     await pool.query(
        'INSERT INTO notification_logs (user_id, channel, type, recipient, status, metadata) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, 'WHATSAPP', type, recipient, 'SENT', JSON.stringify({ message, ...metadata })]
      );
  }
}
