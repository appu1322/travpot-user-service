import { Router } from 'express';
import { friendController } from '../../../controller';
import {
  sendFriendRequestValidation,
  updateFriendRequestValidation,
  sendByEmailValidation,
} from '../../../middlewares';

const router = Router();

router.post('/send-request', sendFriendRequestValidation, friendController.sendFriendRequestHandler);
router.post('/invite/by-email', sendByEmailValidation, friendController.sendByEmailHandler);
router.post('/invite/generate-link', friendController.generateInviteLinkHandler);
router.post('/invite/join', friendController.joinByInviteLinkHandler);
router.put('/', updateFriendRequestValidation, friendController.updateFriendRequestHandler);
router.get('/list', friendController.friendListHandler);

export const friendRouter = router;
