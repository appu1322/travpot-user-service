import { Router } from 'express';
import { authRouter } from './auth.routes';
import { userRouter } from './user.routes';
import { authenticate } from '../../../middlewares';

const router = Router();

router.use('/auth', authRouter);
router.use('/user', authenticate, userRouter);

export const clientRouter = router;
