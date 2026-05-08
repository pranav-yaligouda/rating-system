import express from 'express';
import { getAverageRating, getStoreRatings } from '../controllers/ownerController.js';
import { authenticateToken, isOwner } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken, isOwner);

router.get('/my-store/average', getAverageRating);
router.get('/my-store/ratings', getStoreRatings);

export default router;