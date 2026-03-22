import { Router } from 'express';
import { userController } from '../../../controller';
import { changePasswordValidation } from '../../../middlewares';

const router = Router();

router.get('/my-profile', userController.myProfileHandler);
router.post('/change-password', changePasswordValidation, userController.changePasswordHandler);
router.get('/logout', userController.logoutHandler);

export const userRouter = router;
