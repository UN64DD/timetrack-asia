import { Router } from 'express';
import { authenticateJWT, requireRole, RoleLevel } from '../../../middleware/auth.middleware';
import { checkout } from '../controllers/registration.controller';

const router = Router();

// ATHLETE level access required for checkout
router.post('/checkout', authenticateJWT, requireRole(RoleLevel.ATHLETE), checkout);

export default router;
