import {verifyUserToken } from '../controllers/authController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me',authenticateUser, verifyUserToken)
