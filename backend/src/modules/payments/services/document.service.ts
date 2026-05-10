import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

export class DocumentService {
  /**
   * Generates an invoice PDF
   */
  static async generateInvoicePDF(invoiceData: any): Promise<string> {
    const doc = new PDFDocument();
    const filename = `invoice_${invoiceData.invoice_number}.pdf`;
    const filepath = path.join(__dirname, '../../../../uploads/invoices', filename);

    // Ensure directory exists
    if (!fs.existsSync(path.dirname(filepath))) {
      fs.mkdirSync(path.dirname(filepath), { recursive: true });
    }

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    doc.fontSize(25).text('INVOICE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice Number: ${invoiceData.invoice_number}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    doc.text(`Bill To: ${invoiceData.billing_name}`);
    doc.text(`Email: ${invoiceData.billing_email}`);
    doc.moveDown();
    doc.text('Registration Details:', { underline: true });
    doc.text(`Event: ${invoiceData.event_name}`);
    doc.text(`Total Amount: ${invoiceData.currency} ${invoiceData.total_amount}`);
    
    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(filepath));
      stream.on('error', reject);
    });
  }

  /**
   * Generates a QR Code as DataURL or File
   */
  static async generateQRCode(token: string): Promise<string> {
    return await QRCode.toDataURL(token);
  }
}
