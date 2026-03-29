import crypto from 'crypto';
import mongoose from 'mongoose';
import { IRequest, IResponse, makeResponse } from '../../../../lib';
import { FRIEND_STATUS, INVITATION_METHOD } from '../../../../constant';
import { createFriendRequest, getFriend, getFriendByToken, getFriends, updateFriend } from '../../../../services/friend';
import { getUser } from '../../../../services/user';
import { wrapController } from '../../../../utils/helper';

const sendFriendRequestHandler = async (req: IRequest, res: IResponse) => {
  const _requester = req.user!._id;
  const _recipient = new mongoose.Types.ObjectId(req.body._recipient);

  if (_requester.equals(_recipient)) {
    makeResponse(req, res, 400, false, 'cannot_add_self');
    return;
  }

  const recipientExists = await getUser({ _id: _recipient });
  if (!recipientExists) {
    makeResponse(req, res, 404, false, 'not_exit');
    return;
  }

  const existing = await getFriend({
    $or: [
      { _requester, _recipient },
      { _requester: _recipient, _recipient: _requester },
    ],
    status: { $in: [FRIEND_STATUS.pending, FRIEND_STATUS.accepted] },
  });

  if (existing) {
    makeResponse(req, res, 409, false, 'friend_request_exit');
    return;
  }

  await createFriendRequest({ _requester, _recipient, method: INVITATION_METHOD.direct });

  makeResponse(req, res, 201, true, 'friend_request_sent');
};

const sendByEmailHandler = async (req: IRequest, res: IResponse) => {
  const _requester = req.user!._id;
  const { email } = req.body;

  const recipient = await getUser({ 'contact.email': email.toLowerCase() });
  if (!recipient) {
    makeResponse(req, res, 404, false, 'not_exit');
    return;
  }

  const _recipient = new mongoose.Types.ObjectId(recipient._id);

  if (_requester.equals(_recipient)) {
    makeResponse(req, res, 400, false, 'cannot_add_self');
    return;
  }

  const existing = await getFriend({
    $or: [
      { _requester, _recipient },
      { _requester: _recipient, _recipient: _requester },
    ],
    status: { $in: [FRIEND_STATUS.pending, FRIEND_STATUS.accepted] },
  });

  if (existing) {
    makeResponse(req, res, 409, false, 'friend_request_exit');
    return;
  }

  await createFriendRequest({ _requester, _recipient, method: INVITATION_METHOD.email });

  makeResponse(req, res, 201, true, 'friend_request_sent');
};

const generateInviteLinkHandler = async (req: IRequest, res: IResponse) => {
  const _requester = req.user!._id;
  const inviteToken = crypto.randomBytes(16).toString('hex');
  const appUrl = process.env.APP_URL || '';
  const link = `${appUrl}/invite/${inviteToken}`;

  await createFriendRequest({ _requester, method: INVITATION_METHOD.link, inviteToken });

  makeResponse(req, res, 201, true, 'invite_link_generated', { link, inviteToken });
};


const joinByInviteLinkHandler = async (req: IRequest, res: IResponse) => {
  const _recipient = req.user!._id;
  const token = req.query['token'] as string;

  const invite = await getFriendByToken(token);
  if (!invite || invite.status !== FRIEND_STATUS.pending) {
    makeResponse(req, res, 404, false, 'not_exit');
    return;
  }

  const _requester = invite._requester as mongoose.Types.ObjectId;

  if (_requester.equals(_recipient)) {
    makeResponse(req, res, 400, false, 'cannot_add_self');
    return;
  }

  const existing = await getFriend({
    $or: [
      { _requester, _recipient },
      { _requester: _recipient, _recipient: _requester },
    ],
    status: { $in: [FRIEND_STATUS.pending, FRIEND_STATUS.accepted] },
    inviteToken: { $ne: token },
  });

  if (existing) {
    makeResponse(req, res, 409, false, 'friend_request_exit');
    return;
  }

  await updateFriend(
    { inviteToken: token, status: FRIEND_STATUS.pending },
    { _recipient, status: FRIEND_STATUS.accepted }
  );

  makeResponse(req, res, 200, true, 'friend_request_accepted');
};

const updateFriendRequestHandler = async (req: IRequest, res: IResponse) => {
  const _recipient = req.user!._id;
  const { requestId, status } = req.body;
  const _id = new mongoose.Types.ObjectId(requestId);

  const request = await updateFriend(
    { _id, _recipient, status: FRIEND_STATUS.pending },
    { status }
  );

  if (!request) {
    makeResponse(req, res, 404, false, 'not_exit');
    return;
  }

  makeResponse(
    req,
    res,
    200,
    true,
    status === FRIEND_STATUS.accepted ? 'friend_request_accepted' : 'friend_request_rejected'
  );
};

const friendListHandler = async (req: IRequest, res: IResponse) => {
  const _user = req.user!._id;
  const status = (req.query.status as string) || FRIEND_STATUS.accepted;

  const query =
    status === FRIEND_STATUS.pending
      ? { _recipient: _user, status: FRIEND_STATUS.pending }
      : { $or: [{ _requester: _user }, { _recipient: _user }], status: FRIEND_STATUS.accepted };

  const list = await getFriends(query);

  makeResponse(req, res, 200, true, 'fetch', list);
};

export const friendController = wrapController({
  sendFriendRequestHandler,
  sendByEmailHandler,
  generateInviteLinkHandler,
  joinByInviteLinkHandler,
  updateFriendRequestHandler,
  friendListHandler,
});
