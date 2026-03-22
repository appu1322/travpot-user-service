import { IRequest, IResponse, makeResponse } from '../../../../lib';
import { OTP_CHANNEL, OTP_FOR, OTP_STATUS } from '../../../../constant';
import { getOtp, updateOtp } from '../../../../services/otp';
import { generateOtp, getOtpExpiry } from '../../../../utils/helper';

const sendOtpHandler = async (req: IRequest, res: IResponse) => {
  try {
    const { otpType, channel, contact } = req.body;

    const contactData =
      channel === OTP_CHANNEL.email ? { email: contact } : { mobile: contact };

    const otp = generateOtp();
    const otpExpiryAt = getOtpExpiry();

    const contactFilter =
      channel === OTP_CHANNEL.email
        ? { 'contact.email': contact }
        : { 'contact.mobile.number': contact.number, 'contact.mobile.dialCode': contact.dialCode };

    await updateOtp(
      { ...contactFilter, otpType, otpChannel: channel, otpFor: OTP_FOR.user },
      { $set: { contact: contactData, otp, otpExpiryAt, status: OTP_STATUS.pending } },
      { upsert: true },
    );

    // TODO: deliver OTP via email/SMS based on channel

    makeResponse(req, res, 200, true, 'otp_sent');
  } catch (_err) {
    makeResponse(req, res, 500, false, 'unknown_error');
  }
};

const verifyOtpHandler = async (req: IRequest, res: IResponse) => {
  try {
    const { channel, contact, otpType, otp } = req.body;

    const contactMatch =
      channel === OTP_CHANNEL.email
        ? { 'contact.email': contact }
        : {
            'contact.mobile.number': contact.number,
            'contact.mobile.dialCode': contact.dialCode,
          };

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
  } catch (_err) {
    makeResponse(req, res, 500, false, 'unknown_error');
  }
};

export const authController = {
  sendOtpHandler,
  verifyOtpHandler,
};
