import { NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { JWT_ACCESS_SECRET, SESSION_STATUS, STATUS } from '../../constant';
import { IRequest, IResponse, makeResponse } from '../../lib';
import { getSession } from '../../services/session';
import { getUser } from '../../services/user';

export const authenticate = async (req: IRequest, res: IResponse, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      makeResponse(req, res, 401, false, 'unauthorized');
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as jwt.JwtPayload;

    const session = await getSession({
      _id: new mongoose.Types.ObjectId(decoded._session),
      status: SESSION_STATUS.active,
    });

    if (!session) {
      makeResponse(req, res, 401, false, 'unauthorized');
      return;
    }

    const user = await getUser({ _id: new mongoose.Types.ObjectId(decoded._id) });
    if (!user) {
      makeResponse(req, res, 401, false, 'unauthorized');
      return;
    }

    if (user.status !== STATUS.active) {
      makeResponse(req, res, 403, false, 'blocked_or_removed');
      return;
    }

    req.user = user;
    req.session = session;
    next();
  } catch {
    makeResponse(req, res, 401, false, 'unauthorized');
  }
};
