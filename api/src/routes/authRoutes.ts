import {Router} from 'express';
import {googleLogin, login, logout, me, refresh, register} from '../controllers/authController';
import {protect} from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = Router();
const authLimiter = rateLimit({windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleLogin);
router.get('/me', protect, me);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;