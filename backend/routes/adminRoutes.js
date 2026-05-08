import express from 'express';
import { getDashboardStats, getAllUsers, creatUser, getAllStores, addStore } from '../controllers/adminController.js';
import { authenticateToken, isAdmin} from '../middleware/auth.js';

const router = express.Router();

//All admin routes require authentication and admin role
router.use(authenticateToken, isAdmin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.post('/users', creatUser);
router.get('/stores', getAllStores);
router.post('/stores', addStore);

export default router;