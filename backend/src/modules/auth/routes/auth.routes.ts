import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { protect } from '../../../middleware/auth.middleware';

const router = Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.get('/me', protect, AuthController.getMe);

export default router;
