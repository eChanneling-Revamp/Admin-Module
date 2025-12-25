import { Router } from 'express';
import { AuthController, 
  loginSchema, 
  registerSchema, 
  refreshTokenSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema, 
  changePasswordSchema,
  verifyOTPSchema
} from '../controllers/AuthController';
import { validate } from '../middlewares/validate.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/login', validate(loginSchema), authController.login);
router.post('/register', validate(registerSchema), authController.register);
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.post('/verify-otp', validate(verifyOTPSchema), authController.verifyOTP);

// Protected routes
router.post('/logout', validate(refreshTokenSchema), authController.logout);
router.post('/logout-all', authenticateToken, authController.logoutAll);
router.post('/change-password', authenticateToken, validate(changePasswordSchema), authController.changePassword);
router.get('/profile', authenticateToken, authController.getProfile);

export default router;
