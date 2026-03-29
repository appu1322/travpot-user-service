const HOST = process.env.HOST ? String(process.env.HOST) : '0.0.0.0';
const PORT = Number(process.env.PORT) || 3000;

// Mongo Config
const MONGO_CONNECTION_TYPE = String(process.env.MONGO_CONNECTION_TYPE);
const MONGO_HOST = String(process.env.MONGO_HOST);
const MONGO_PORT = String(process.env.MONGO_PORT);
const MONGO_DATABASE = String(process.env.MONGO_DATABASE);
const MONGO_USER = String(process.env.MONGO_USER);
const MONGO_PASSWORD = String(process.env.MONGO_PASSWORD);

// JWT Config
const JWT_ACCESS_SECRET = String(process.env.JWT_ACCESS_SECRET || 'access_secret');
const JWT_REFRESH_SECRET = String(process.env.JWT_REFRESH_SECRET || 'refresh_secret');
const JWT_ACCESS_EXPIRY = '15m';
const JWT_REFRESH_EXPIRY = '7d';

const STATUS = {
  active: 'ACTIVE',
  inactive: 'INACTIVE',
  deleted: 'DELETED',
};
const AUTH_PROVIDER = {
  email: 'EMAIL',
  google: 'GOOGLE',
  facebook: 'FACEBOOK',
  apple: 'APPLE',
};
const LANGUAGE = {
  en: 'en',
  hi: 'hi',
  gu: 'gu',
};
const GENDER = {
  male: 'MALE',
  female: 'FEMALE',
  other: 'OTHER',
};
const OTP_CHANNEL = {
  email: 'EMAIL',
  mobile: 'MOBILE',
};
const OTP_TYPE = {
  forgotPassword: 'FORGOT-PASSWORD',
  signup: 'SIGNUP',
  updateContact: 'UPDATE-CONTACT',
};
const OTP_STATUS = {
  pending: 'PENDING',
  verified: 'VERIFIED',
};
const OTP_FOR = {
  user: 'USER',
  admin: 'ADMIN',
};
const SESSION_STATUS = {
  active: 'ACTIVE',
  revoked: 'REVOKED',
};
const FRIEND_STATUS = {
  pending: 'PENDING',
  accepted: 'ACCEPTED',
  rejected: 'REJECTED',
};
const INVITATION_METHOD = {
  direct: 'DIRECT',
  email: 'EMAIL',
  link: 'LINK',
};

export {
  HOST,
  PORT,

  // Mongo Config
  MONGO_CONNECTION_TYPE,
  MONGO_DATABASE,
  MONGO_HOST,
  MONGO_PASSWORD,
  MONGO_PORT,
  MONGO_USER,
  STATUS,
  AUTH_PROVIDER,
  LANGUAGE,
  GENDER,
  OTP_TYPE,
  OTP_CHANNEL,
  OTP_STATUS,
  OTP_FOR,
  SESSION_STATUS,
  FRIEND_STATUS,
  INVITATION_METHOD,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY,
};
