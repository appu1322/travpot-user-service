import { Router } from 'express';
import { authRouter } from './auth.routes';
import { userRouter } from './user.routes';
import { friendRouter } from './friend.routes';
import { authenticate } from '../../../middlewares';

const router = Router();

router.use('/auth', authRouter);
router.use('/user', authenticate, userRouter);
router.use('/friend', authenticate, friendRouter);

export const clientRouter = router;
