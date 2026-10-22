import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
    cancelRequest,
    createRequest,
    listReceived,
    listSent,
    updateRequest,
} from '../controllers/requestController';
import { protect } from '../middleware/auth';

const createLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

const router = Router();

router.post('/', protect, createLimiter, createRequest);
router.get('/received', protect, listReceived);
router.get('/sent', protect, listSent);
router.patch('/:id', protect, updateRequest);
router.delete('/:id', protect, cancelRequest);

export default router;