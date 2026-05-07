import express from 'express';
import { register, login, updatePassword } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

//Public routes
router.post('/register', register);
router.post('/login', login);


//Protected routes
router.post('/password', authenticateToken, updatePassword);

export default router;