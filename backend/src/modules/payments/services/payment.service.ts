import pool from '../../../database/db';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { DocumentService } from './document.service';
import { NotificationService } from './notification.service';

export class PaymentService {
  /**
   * Processes a successful payment and converts registration/participants to PAID/CONFIRMED
   */
  static async processSuccessfulPayment(client: any, paymentId: string) {
    // 1. Fetch payment and registration details
    const paymentRes = await client.query(
      `SELECT p.*, r.registration_number, r.total_amount, e.title as event_name, u.email as user_email, u.first_name, b.first_name as billing_name, b.email as billing_email
       FROM payments p 
       JOIN registrations r ON p.registration_id = r.id 
       JOIN events e ON r.event_id = e.id
       JOIN users u ON r.athlete_id = u.id
       JOIN billing_details b ON b.registration_id = r.id
       WHERE p.id = $1`,
      [paymentId]
    );
    const details = paymentRes.rows[0];

    if (!details || details.status === 'SUCCESS') return;

    const registrationId = details.registration_id;

    // 2. Update payment status
    await client.query(
      "UPDATE payments SET status = 'SUCCESS', updated_at = NOW() WHERE id = $1",
      [paymentId]
    );

    // 3. Update registration status
    await client.query(
      "UPDATE registrations SET status = 'PAID', updated_at = NOW() WHERE id = $1",
      [registrationId]
    );

    // 4. Process each participant (Bibs and QRs)
    const participantsRes = await client.query(
      'SELECT p.*, e.bib_format, e.id as event_id FROM participants p JOIN registrations r ON p.registration_id = r.id JOIN events e ON r.event_id = e.id WHERE r.id = $1',
      [registrationId]
    );

    for (const participant of participantsRes.rows) {
      const bibNumber = await this.generateBibNumber(client, participant.event_id, participant.bib_format);
      const qrToken = this.generateSecureQRToken(participant.id, participant.event_id);

      await client.query(
        'UPDATE participants SET bib_number = $1, qr_token = $2, updated_at = NOW() WHERE id = $3',
        [bibNumber, qrToken, participant.id]
      );
    }

    // 5. Generate Invoice Record
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const invoiceRes = await client.query(
      'INSERT INTO invoices (registration_id, invoice_number, total_amount) VALUES ($1, $2, $3) RETURNING id',
      [registrationId, invoiceNumber, details.amount]
    );

    // 6. Generate PDF Invoice
    const pdfPath = await DocumentService.generateInvoicePDF({
      invoice_number: invoiceNumber,
      billing_name: details.billing_name,
      billing_email: details.billing_email,
      event_name: details.event_name,
      total_amount: details.amount,
      currency: details.currency || 'MYR'
    });

    // Update invoice with PDF URL
    await client.query(
      'UPDATE invoices SET pdf_url = $1 WHERE id = $2',
      [pdfPath, invoiceRes.rows[0].id]
    );

    // 7. Send Success Email
    await NotificationService.sendPaymentSuccessEmail(details.billing_email, {
      name: details.billing_name,
      event_name: details.event_name,
      registration_number: details.registration_number
    }, [{
      filename: `Invoice_${invoiceNumber}.pdf`,
      path: pdfPath
    }]);

    // 8. Log audit
    await client.query(
      'INSERT INTO audit_logs (action, module, metadata) VALUES ($1, $2, $3)',
      ['payment_success', 'payments', JSON.stringify({ payment_id: paymentId, registration_id: registrationId, invoice_number: invoiceNumber })]
    );
  }

  private static async generateBibNumber(client: any, eventId: string, format: string): Promise<string> {
    // Basic bib generator: replaces # with sequential numbers
    // In a real system, we might track the last used number per event
    const countRes = await client.query(
      'SELECT COUNT(*) FROM participants p JOIN registrations r ON p.registration_id = r.id WHERE r.event_id = $1 AND p.bib_number IS NOT NULL',
      [eventId]
    );
    const nextNum = (parseInt(countRes.rows[0].count) + 1).toString().padStart(4, '0');
    
    // Replace #### with the number
    return format.replace(/#+/g, (match) => {
      return nextNum.slice(-match.length).padStart(match.length, '0');
    });
  }

  private static generateSecureQRToken(participantId: string, eventId: string): string {
    const secret = process.env.QR_SECRET || 'fallback-secret';
    const data = `${participantId}:${eventId}`;
    const hash = crypto.createHmac('sha256', secret).update(data).digest('hex');
    return `${data}:${hash.substring(0, 16)}`;
  }
}
