import { Request, Response } from 'express';
import { ISession, IUser } from '../../../models';

export interface IRequest extends Request {
  user?: IUser;
  session?: ISession;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IResponse extends Response {}
