import { Router } from 'express';
import { authenticateJWT, requireRole, RoleLevel } from '../../../middleware/auth.middleware';
import * as AdminController from '../controllers/admin.controller';
import * as ExportController from '../controllers/export.controller';
import * as PaymentAdminController from '../controllers/payment_admin.controller';

const router = Router();

// Middleware: All routes below require ADMIN or SUPER_ADMIN
router.use(authenticateJWT, requireRole(RoleLevel.ADMIN));

// Dashboard
router.get('/stats', AdminController.getDashboardStats);

// Event Management
router.post('/events/:eventId/status', AdminController.updateEventStatus);

// Organizer Monitoring
router.get('/organizers', AdminController.listAllOrganizers);
router.post('/organizers/:organizerId/status', AdminController.updateOrganizerStatus);

// Payment & Refund Management
router.get('/payments/pending', PaymentAdminController.listPendingPayments);
router.post('/payments/:paymentId/review', PaymentAdminController.reviewManualPayment);
router.get('/refunds', PaymentAdminController.listRefundRequests);
router.post('/refunds/:refundId/review', PaymentAdminController.reviewRefund);

// CSV Export (Accessible by Admin for ALL, or shared route if needed)
router.get('/export/registrations', ExportController.exportRegistrations);

export default router;
