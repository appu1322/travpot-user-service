import dayjs from 'dayjs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_ACCESS_EXPIRY, JWT_ACCESS_SECRET, JWT_REFRESH_EXPIRY, JWT_REFRESH_SECRET } from '../constant';

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
  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRY } as jwt.SignOptions);
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRY } as jwt.SignOptions);
  return { accessToken, refreshToken };
};

const verifyRefreshToken = (token: string): jwt.JwtPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as jwt.JwtPayload;
};

export { generateOtp, getOtpExpiry, hashPassword, comparePassword, generateTokens, verifyRefreshToken };
