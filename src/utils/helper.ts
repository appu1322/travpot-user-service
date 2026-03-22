import dayjs from 'dayjs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  JWT_ACCESS_EXPIRY,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_EXPIRY,
  JWT_REFRESH_SECRET,
} from '../constant';
import { IRequest, IResponse, makeResponse } from '../lib';

type IHandler = (req: IRequest, res: IResponse) => Promise<void>;

const generateOtp = (digits = 6): number => {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(min + Math.random() * (max - min + 1));
};

const getOtpExpiry = (minutes = 10): Date => {
  return dayjs().add(minutes, 'minute').toDate();
};

const hashPassword = (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

const comparePassword = (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

const generateTokens = (payload: object): { accessToken: string; refreshToken: string } => {
  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRY,
  } as jwt.SignOptions);
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY,
  } as jwt.SignOptions);
  return { accessToken, refreshToken };
};

const verifyRefreshToken = (token: string): jwt.JwtPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as jwt.JwtPayload;
};

const getSessionExpiry = (): Date => {
  return dayjs().add(7, 'day').toDate();
};

const asyncHandler =
  (fn: IHandler): IHandler =>
  async (req: IRequest, res: IResponse): Promise<void> => {
    try {
      await fn(req, res);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'unknown_error';
      makeResponse(
        req,
        res,
        400,
        false,
        (message || 'unknown_error') as Parameters<typeof makeResponse>[4]
      );
    }
  };

const wrapController = <T extends Record<string, IHandler>>(controller: T): T =>
  Object.fromEntries(Object.entries(controller).map(([key, fn]) => [key, asyncHandler(fn)])) as T;

export {
  generateOtp,
  getOtpExpiry,
  hashPassword,
  comparePassword,
  generateTokens,
  verifyRefreshToken,
  getSessionExpiry,
  wrapController,
};
