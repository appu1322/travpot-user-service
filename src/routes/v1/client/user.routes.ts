import { Router } from 'express';
import { userController } from '../../../controller';
import { authenticate } from '../../../middlewares';

const router = Router();

router.post('/logout', authenticate, userController.logoutHandler);

export const userRouter = router;
