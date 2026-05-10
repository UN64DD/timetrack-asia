import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

export class CertificateService {
  static async generateCertificate(data: any): Promise<string> {
    const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
    const filename = `cert_${data.participant_id}.pdf`;
    const filepath = path.join(__dirname, '../../../../uploads/certificates', filename);

    if (!fs.existsSync(path.dirname(filepath))) {
      fs.mkdirSync(path.dirname(filepath), { recursive: true });
    }

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Design
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff');
    
    // Border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(5).stroke('#b91c1c');

    doc.fillColor('#000000');
    doc.fontSize(40).text('CERTIFICATE OF ACHIEVEMENT', { align: 'center', y: 100 });
    doc.moveDown();
    
    doc.fontSize(20).text('This is to certify that', { align: 'center' });
    doc.moveDown(0.5);
    
    doc.fontSize(35).fillColor('#b91c1c').text(data.full_name, { align: 'center' });
    doc.moveDown(0.5);
    
    doc.fillColor('#000000').fontSize(18).text(`Successfully completed the`, { align: 'center' });
    doc.fontSize(22).text(data.event_title, { align: 'center' });
    doc.moveDown();

    doc.fontSize(16).text(`Category: ${data.category}`, { align: 'center' });
    doc.text(`Finish Time: ${data.finish_time}`, { align: 'center' });
    doc.text(`Overall Rank: ${data.overall_rank}`, { align: 'center' });
    
    // QR Verification
    const qrData = `https://timetrack.com/verify/${data.participant_id}`;
    const qrImage = await QRCode.toDataURL(qrData);
    doc.image(qrImage, doc.page.width - 120, doc.page.height - 120, { width: 80 });
    
    doc.fontSize(8).text('Scan to verify result', doc.page.width - 120, doc.page.height - 35);

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(filepath));
      stream.on('error', reject);
    });
  }
}
