import { Router } from 'express';
import { createPet, deletePet, getPet, listPets, myPets, updatePet } from '../controllers/petController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', listPets);
router.post('/', protect, createPet);
router.get('/mine', protect, myPets);
router.get('/:id', getPet);
router.patch('/:id', protect, updatePet);
router.delete('/:id', protect, deletePet);

export default router;