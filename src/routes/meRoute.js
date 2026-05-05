import { verifyUserToken } from "../controllers/authController";
import { authenticateUser } from "../middleware/authMiddleware";
const router = express.Router();

router.get('/me',authenticateUser, verifyUserToken)
