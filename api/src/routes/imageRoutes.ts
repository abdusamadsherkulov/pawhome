import {Router} from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import {getImage, uploadImage} from '../controllers/imageController';
import {protect} from '../middleware/auth';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {fileSize: 10 * 1024 * 1024, files: 1},
});

const uploadLimiter = rateLimit({windowMs: 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false});

const router = Router();

router.post('/', protect, uploadLimiter, upload.single('file'), uploadImage);
router.get('/:id', getImage);

export default router;