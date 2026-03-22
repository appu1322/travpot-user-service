import mongoose from 'mongoose';
import { IRequest, IResponse, makeResponse } from '../../../../lib';
import { FRIEND_STATUS } from '../../../../constant';
import { createFriendRequest, getFriend, getFriends, updateFriend } from '../../../../services/friend';
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

  await createFriendRequest({ _requester, _recipient });

  makeResponse(req, res, 201, true, 'friend_request_sent');
};

// PATCH /friend/:requestId  body: { status: 'ACCEPTED' | 'REJECTED' }
const updateFriendRequestHandler = async (req: IRequest, res: IResponse) => {
  const _recipient = req.user!._id;
  const _id = new mongoose.Types.ObjectId(req.query.requestId as string);
  const { status } = req.body;

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

// GET /friend/list?status=ACCEPTED|PENDING
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
  updateFriendRequestHandler,
  friendListHandler,
});
