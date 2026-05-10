import nodemailer from 'nodemailer';

export class NotificationService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  static async sendPaymentSuccessEmail(to: string, data: any, attachments: any[] = []) {
    const mailOptions = {
      from: '"Time Track" <noreply@timetrack.com>',
      to,
      subject: `Registration Confirmed - ${data.event_name}`,
      html: `
        <h1>Registration Successful!</h1>
        <p>Hi ${data.name},</p>
        <p>Your registration for <strong>${data.event_name}</strong> has been confirmed.</p>
        <p><strong>Registration Number:</strong> ${data.registration_number}</p>
        <p>See attached for your invoice.</p>
      `,
      attachments,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }
}
