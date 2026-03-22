import { Router } from 'express';
import { friendController } from '../../../controller';
import { sendFriendRequestValidation, updateFriendRequestValidation } from '../../../middlewares';

const router = Router();

router.post('/send-request', sendFriendRequestValidation, friendController.sendFriendRequestHandler);
router.put('/', updateFriendRequestValidation, friendController.updateFriendRequestHandler);
router.get('/list', friendController.friendListHandler);

export const friendRouter = router;
