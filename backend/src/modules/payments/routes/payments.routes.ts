import { Router } from 'express';
import { authenticateJWT, requireRole, RoleLevel } from '../../../middleware/auth.middleware';
import { createCheckoutSession, uploadReceipt, handleWebhook, getEnabledGateways } from '../controllers/payment.controller';

const router = Router();

// List enabled gateways
router.get('/gateways', getEnabledGateways);

// Create a payment session (Athlete)
router.post('/checkout-session', authenticateJWT, requireRole(RoleLevel.ATHLETE), createCheckoutSession);

// Upload manual receipt (Athlete)
router.post('/upload-receipt', authenticateJWT, requireRole(RoleLevel.ATHLETE), uploadReceipt);

// Gateway Webhook (Public, but with signature check in real life)
router.post('/webhook', handleWebhook);

export default router;
