import mongoose from 'mongoose';
import { IRequest, IResponse, makeResponse } from '../../../../lib';
import {
  OTP_CHANNEL,
  OTP_FOR,
  OTP_STATUS,
  OTP_TYPE,
  SESSION_STATUS,
  STATUS,
} from '../../../../constant';
import { getOtp, updateOtp } from '../../../../services/otp';
import { createUser, getUser, updateUser } from '../../../../services/user';
import { createSession, getSession, updateSession } from '../../../../services/session';
import {
  getOtpExpiry,
  hashPassword,
  comparePassword,
  generateTokens,
  verifyRefreshToken,
  getSessionExpiry,
  wrapController,
} from '../../../../utils/helper';

const sendOtpHandler = async (req: IRequest, res: IResponse) => {
  const { otpType, channel, contact } = req.body;

  const contactData = channel === OTP_CHANNEL.email ? { email: contact } : { mobile: contact };

  // const otp = generateOtp();
  const otp = '123456';
  const otpExpiryAt = getOtpExpiry();

  const contactFilter =
    channel === OTP_CHANNEL.email
      ? { 'contact.email': contact }
      : { 'contact.mobile.number': contact.number, 'contact.mobile.dialCode': contact.dialCode };

  await updateOtp(
    { ...contactFilter, otpType, otpChannel: channel, otpFor: OTP_FOR.user },
    { $set: { contact: contactData, otp, otpExpiryAt, status: OTP_STATUS.pending } },
    { upsert: true }
  );

  // TODO: deliver OTP via email/SMS based on channel

  makeResponse(req, res, 200, true, 'otp_sent');
};

const verifyOtpHandler = async (req: IRequest, res: IResponse) => {
  const { channel, contact, otpType, otp } = req.body;

  const contactMatch =
    channel === OTP_CHANNEL.email
      ? { 'contact.email': contact }
      : { 'contact.mobile.number': contact.number, 'contact.mobile.dialCode': contact.dialCode };

  const otpRecord = await getOtp({
    ...contactMatch,
    otpType,
    otpChannel: channel,
    status: OTP_STATUS.pending,
    otpExpiryAt: { $gt: new Date() },
  });

  if (!otpRecord || String(otpRecord.otp) !== String(otp)) {
    makeResponse(req, res, 400, false, 'otp_incorrect');
    return;
  }

  await updateOtp({ _id: otpRecord._id }, { status: OTP_STATUS.verified });

  makeResponse(req, res, 200, true, 'otp_verify');
};

const signupHandler = async (req: IRequest, res: IResponse) => {
  const { firstName, lastName, contact, password, authProvider, gender } = req.body;

  const isEmailSignup = !!contact.email;
  const otpMatch = isEmailSignup
    ? { 'contact.email': contact.email }
    : {
        'contact.mobile.number': contact.mobile.number,
        'contact.mobile.dialCode': contact.mobile.dialCode,
      };

  const otpRecord = await getOtp({
    ...otpMatch,
    otpType: OTP_TYPE.signup,
    otpFor: OTP_FOR.user,
    status: OTP_STATUS.verified,
  });

  if (!otpRecord) {
    makeResponse(req, res, 400, false, 'otp_incorrect');
    return;
  }

  const userSearch = isEmailSignup
    ? { 'contact.email': contact.email }
    : { 'contact.mobile.number': contact.mobile.number };

  const existingUser = await getUser(userSearch);
  if (existingUser) {
    makeResponse(req, res, 409, false, isEmailSignup ? 'email_exit' : 'mobile_exit');
    return;
  }

  const hashedPassword = await hashPassword(password);

  const user = await createUser({
    firstName,
    lastName,
    contact: { ...contact, isEmailVerified: isEmailSignup, isMobileVerified: !isEmailSignup },
    password: hashedPassword,
    authProvider,
    gender,
  });

  const tokens = generateTokens({ _id: user._id });

  await createSession({
    userId: user._id,
    refreshToken: tokens.refreshToken,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
    expiresAt: getSessionExpiry(),
  });

  makeResponse(req, res, 201, true, 'create', {
    _id: user._id,
    firstName,
    lastName,
    contact,
    ...tokens,
  });
};

const loginHandler = async (req: IRequest, res: IResponse) => {
  const { email, mobile, password } = req.body;

  const userSearch = email
    ? { 'contact.email': email }
    : { 'contact.mobile.number': mobile.number };

  const user = await getUser(userSearch);

  if (!user) {
    makeResponse(req, res, 404, false, 'not_exit');
    return;
  }

  if (user.status !== STATUS.active) {
    makeResponse(req, res, 403, false, 'blocked_or_removed');
    return;
  }

  const isMatch = await comparePassword(password, user.password as string);
  if (!isMatch) {
    makeResponse(req, res, 400, false, 'password_not_match');
    return;
  }

  const tokens = generateTokens({ _id: user._id });

  await createSession({
    userId: user._id,
    refreshToken: tokens.refreshToken,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
    expiresAt: getSessionExpiry(),
  });

  makeResponse(req, res, 200, true, 'login', { ...user, ...tokens, password: undefined });
};

const resetPasswordHandler = async (req: IRequest, res: IResponse) => {
  const { channel, contact, newPassword } = req.body;

  const contactMatch =
    channel === OTP_CHANNEL.email
      ? { 'contact.email': contact }
      : { 'contact.mobile.number': contact.number, 'contact.mobile.dialCode': contact.dialCode };

  const otpRecord = await getOtp({
    ...contactMatch,
    otpType: OTP_TYPE.forgotPassword,
    otpFor: OTP_FOR.user,
    status: OTP_STATUS.verified,
  });

  if (!otpRecord) {
    makeResponse(req, res, 400, false, 'otp_incorrect');
    return;
  }

  const userSearch =
    channel === OTP_CHANNEL.email
      ? { 'contact.email': contact }
      : { 'contact.mobile.number': contact.number };

  const user = await getUser(userSearch);
  if (!user) {
    makeResponse(req, res, 404, false, 'not_exit');
    return;
  }

  const hashedPassword = await hashPassword(newPassword);
  await updateUser({ _id: new mongoose.Types.ObjectId(user._id) }, { password: hashedPassword });

  makeResponse(req, res, 200, true, 'update');
};

const refreshTokenHandler = async (req: IRequest, res: IResponse) => {
  const { refreshToken } = req.body;

  const decoded = verifyRefreshToken(refreshToken);

  const session = await getSession({
    refreshToken,
    userId: new mongoose.Types.ObjectId(decoded._id),
    status: SESSION_STATUS.active,
  });

  if (!session) {
    makeResponse(req, res, 401, false, 'unauthorized');
    return;
  }

  const user = await getUser({ _id: new mongoose.Types.ObjectId(decoded._id) });
  if (!user) {
    makeResponse(req, res, 404, false, 'not_exit');
    return;
  }

  if (user.status !== STATUS.active) {
    makeResponse(req, res, 403, false, 'blocked_or_removed');
    return;
  }

  const tokens = generateTokens({ _id: user._id });

  await updateSession(
    { _id: session._id },
    { refreshToken: tokens.refreshToken, expiresAt: getSessionExpiry() }
  );

  makeResponse(req, res, 200, true, 'fetch', tokens);
};

export const authController = wrapController({
  sendOtpHandler,
  verifyOtpHandler,
  signupHandler,
  loginHandler,
  resetPasswordHandler,
  refreshTokenHandler,
});
