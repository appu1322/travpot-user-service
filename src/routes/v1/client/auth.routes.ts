import { Router } from 'express';
import { authController } from '../../../controller';
import { sendOtpValidation } from '../../../middlewares';

const router = Router();

router.get('/send-otp', sendOtpValidation, authController.snedOtpHandler);

export const authRouter = router;
