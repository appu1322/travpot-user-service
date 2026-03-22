import { Router } from 'express';
import { userController } from '../../../controller';
import { authenticate, changePasswordValidation } from '../../../middlewares';

const router = Router();

router.get('/my-profile', userController.myProfileHandler);
router.post('/change-password', changePasswordValidation, userController.changePasswordHandler);
router.post('/logout', authenticate, userController.logoutHandler);

export const userRouter = router;
