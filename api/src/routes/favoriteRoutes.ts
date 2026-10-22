import {Router} from 'express';
import {myFavorites, toggleFavorite} from '../controllers/favoriteController';
import {protect} from '../middleware/auth';

const router = Router();

router.get('/', protect, myFavorites);
router.post('/:petId', protect, toggleFavorite);

export default router;