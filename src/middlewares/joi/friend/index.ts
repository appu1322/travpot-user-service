import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { FRIEND_STATUS } from '../../../constant';
import { makeResponse } from '../../../lib';

export const sendFriendRequestValidation = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    _recipient: Joi.string().hex().length(24).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    makeResponse(req, res, 400, false, error.details.map((d) => d.message).join(', ') as any);
    return;
  }
  next();
};

export const updateFriendRequestValidation = (req: Request, res: Response, next: NextFunction) => {
  const querySchema = Joi.object({ requestId: Joi.string().hex().length(24).required() });
  const bodySchema = Joi.object({
    status: Joi.string().valid(FRIEND_STATUS.accepted, FRIEND_STATUS.rejected).required(),
  });

  const queryError = querySchema.validate(req.query).error;
  const bodyError = bodySchema.validate(req.body).error;
  const error = queryError || bodyError;

  if (error) {
    makeResponse(req, res, 400, false, error.details.map((d) => d.message).join(', ') as any);
    return;
  }
  next();
};
