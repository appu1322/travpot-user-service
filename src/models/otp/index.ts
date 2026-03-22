import { model, Schema } from "mongoose";
import { OTP_CHANNEL, OTP_FOR, OTP_STATUS, OTP_TYPE } from "../../constant";
import { phoneSchema } from "../shared";

const schema = new Schema({
    contact: {
        email: {
            type: String,
            lowercase: true,
            trim: true,
        },
        mobile: phoneSchema,
    },
    otp: {
        type: Number
    },
    otpChannel: {
        type: String,
        enums: Object.values(OTP_CHANNEL),
        default: OTP_CHANNEL.email,
    },
    otpType: {
        type: String,
        enums: Object.values(OTP_TYPE),
        default: OTP_TYPE.signup,
    },
    otpExpiryAt: {
        type: Date,
    },
    status: {
        type: String,
        enum: Object.values(OTP_STATUS),
        default: OTP_STATUS.pending,
    },
    otpFor: {
        type: String,
        enum: Object.values(OTP_FOR),
        default: OTP_FOR.user
    },
}, {
    timestamps: true,
});


export const OTP = model("otp", schema);
