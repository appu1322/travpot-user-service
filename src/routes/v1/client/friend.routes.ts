import { Router } from 'express';
import { friendController } from '../../../controller';
import {
  sendFriendRequestValidation,
  updateFriendRequestValidation,
  sendByEmailValidation,
} from '../../../middlewares';

const router = Router();

router.post('/send-request', sendFriendRequestValidation, friendController.sendFriendRequestHandler);
router.put('/', updateFriendRequestValidation, friendController.updateFriendRequestHandler);
router.get('/list', friendController.friendListHandler);

// Invitation routes
router.post('/invite/by-email', sendByEmailValidation, friendController.sendByEmailHandler);
router.post('/invite/generate-link', friendController.generateInviteLinkHandler);
router.post('/invite/join/:token', friendController.joinByInviteLinkHandler);

export const friendRouter = router;
