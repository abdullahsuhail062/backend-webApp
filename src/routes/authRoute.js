// routes/auth.routes.js
import { getMe } from '../controllers/authController.js'; 
import { authenticateUser } from '../middleware/authMiddleware.js';
import router from './authRoutes.js';

// This is the endpoint the frontend calls on App.js/App.tsx mount
router.get('/me', getMe);

export default router