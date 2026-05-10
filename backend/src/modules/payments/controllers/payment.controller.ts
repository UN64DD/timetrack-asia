import { Request, Response } from 'express';
import pool from '../../../database/db';
import { v4 as uuidv4 } from 'uuid';
import { PaymentService } from '../services/payment.service';

export const getEnabledGateways = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      'SELECT name FROM payment_gateways WHERE is_enabled = TRUE'
    );
    if (rows.length === 0) {
      return res.json([
        { name: 'Stripe' },
        { name: 'Billplz' },
        { name: 'ToyyibPay' },
        { name: 'Manual' }
      ]);
    }
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  const { registration_id, gateway } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Validate registration
    const regRes = await client.query(
      'SELECT * FROM registrations WHERE id = $1 AND status = $2',
      [registration_id, 'PENDING']
    );
    const registration = regRes.rows[0];

    if (!registration) {
      return res.status(404).json({ error: 'Valid pending registration not found' });
    }

    // 2. Create payment record
    const paymentId = uuidv4();
    const gatewayRef = `GATEWAY-${uuidv4().substring(0, 8)}`; // Mock reference

    await client.query(
      'INSERT INTO payments (id, registration_id, payment_gateway, gateway_reference, amount, status) VALUES ($1, $2, $3, $4, $5, $6)',
      [paymentId, registration_id, gateway, gatewayRef, registration.total_amount, 'PENDING']
    );

    // 3. Logic based on gateway
    let checkoutUrl = '';
    if (gateway === 'Manual') {
      checkoutUrl = `/payment/manual/${registration_id}`;
    } else {
      // Mock external gateway redirection
      checkoutUrl = `https://mock-gateway.com/pay/${gatewayRef}`;
    }

    await client.query('COMMIT');
    res.json({ checkoutUrl, payment_id: paymentId, gateway_reference: gatewayRef });
  } catch (err: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const uploadReceipt = async (req: Request, res: Response) => {
  const { payment_id, receipt_url } = req.body;
  
  try {
    await pool.query(
      "UPDATE payments SET status = 'PENDING_REVIEW', receipt_url = $1, updated_at = NOW() WHERE id = $2",
      [receipt_url, payment_id]
    );

    await pool.query(
      'INSERT INTO audit_logs (action, module, metadata) VALUES ($1, $2, $3)',
      ['receipt_uploaded', 'payments', JSON.stringify({ payment_id })]
    );

    res.json({ message: 'Receipt uploaded for review' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * MOCK WEBHOOK: In a real app, this would be a POST from the gateway
 */
export const handleWebhook = async (req: Request, res: Response) => {
  const { gateway_reference, status } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const payRes = await client.query(
      'SELECT id FROM payments WHERE gateway_reference = $1',
      [gateway_reference]
    );
    const payment = payRes.rows[0];

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (status === 'SUCCESS') {
      await PaymentService.processSuccessfulPayment(client, payment.id);
    } else {
      await client.query(
        "UPDATE payments SET status = 'FAILED', updated_at = NOW() WHERE id = $1",
        [payment.id]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Webhook processed' });
  } catch (err: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
