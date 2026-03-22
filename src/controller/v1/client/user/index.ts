import mongoose from 'mongoose';
import { IRequest, IResponse, makeResponse } from '../../../../lib';
import { SESSION_STATUS } from '../../../../constant';
import { deleteSessions, updateSession } from '../../../../services/session';
import { getUser, updateUser } from '../../../../services/user';
import { comparePassword, hashPassword, wrapController } from '../../../../utils/helper';

const logoutHandler = async (req: IRequest, res: IResponse) => {
  const { all } = req.body;
  const _user = req.user!._id;

  if (all) {
    await deleteSessions({ _user });
  } else {
    await updateSession(
      { _id: req.session!._id, status: SESSION_STATUS.active },
      { status: SESSION_STATUS.revoked }
    );
  }

  makeResponse(req, res, 200, true, 'logout');
};

const myProfileHandler = async (req: IRequest, res: IResponse) => {
  const userId = req.user!._id;

  const user = await getUser({ _id: new mongoose.Types.ObjectId(userId) }, { password: 0, __v: 0 });

  makeResponse(req, res, 200, true, 'fetch', user);
};

const changePasswordHandler = async (req: IRequest, res: IResponse) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user!._id;

  const user = await getUser({ _id: new mongoose.Types.ObjectId(userId) });
  if (!user) {
    makeResponse(req, res, 404, false, 'not_exit');
    return;
  }

  const isMatch = await comparePassword(oldPassword, user.password as string);
  if (!isMatch) {
    makeResponse(req, res, 400, false, 'password_not_match');
    return;
  }

  if (oldPassword === newPassword) {
    makeResponse(req, res, 400, false, 'old_and_new_password_same');
    return;
  }

  const hashedPassword = await hashPassword(newPassword);
  await updateUser({ _id: new mongoose.Types.ObjectId(userId) }, { password: hashedPassword });

  makeResponse(req, res, 200, true, 'update');
};

export const userController = wrapController({
  logoutHandler,
  myProfileHandler,
  changePasswordHandler,
});
