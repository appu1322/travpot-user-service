import { Router } from 'express';
import { authController } from '../../../controller';

const router = Router();

router.get('/send-otp', authController.snedOtpHandler);

export const authRouter = router;
