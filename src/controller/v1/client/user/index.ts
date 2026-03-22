import mongoose from 'mongoose';
import { IRequest, IResponse, makeResponse } from '../../../../lib';
import { SESSION_STATUS } from '../../../../constant';
import { deleteSessions, updateSession } from '../../../../services/session';
import { wrapController } from '../../../../utils/helper';

const logoutHandler = async (req: IRequest, res: IResponse) => {
  const { refreshToken } = req.body;
  const userId = new mongoose.Types.ObjectId((req.user as any)._id);

  if (refreshToken) {
    await updateSession(
      { userId, refreshToken, status: SESSION_STATUS.active },
      { status: SESSION_STATUS.revoked }
    );
  } else {
    await deleteSessions({ userId });
  }

  makeResponse(req, res, 200, true, 'logout');
};

export const userController = wrapController({
  logoutHandler,
});
