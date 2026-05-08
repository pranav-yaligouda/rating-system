import express from 'express';
import { getAllStores, submitRating, updateRating} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken); //all user routes require login

router.get('/stores', getAllStores);
router.post('/ratings', submitRating);
router.put('/ratings/:storeId', updateRating);

export default router;