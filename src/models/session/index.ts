import mongoose, { model, Schema } from 'mongoose';
import { SESSION_STATUS } from '../../constant';

const schema = new Schema(
  {
    _user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    userAgent: {
      type: String,
    },
    ip: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(SESSION_STATUS),
      default: SESSION_STATUS.active,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

type ISession = mongoose.InferSchemaType<typeof schema> & { _id: mongoose.Types.ObjectId };

const SESSION = model('session', schema);

export { ISession, SESSION };
