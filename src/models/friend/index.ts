import mongoose, { model, Schema } from 'mongoose';
import { FRIEND_STATUS, INVITATION_METHOD } from '../../constant';

const schema = new Schema(
  {
    _requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    _recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    status: {
      type: String,
      enum: Object.values(FRIEND_STATUS),
      default: FRIEND_STATUS.pending,
    },
    method: {
      type: String,
      enum: Object.values(INVITATION_METHOD),
      default: INVITATION_METHOD.direct,
    },
    inviteToken: {
      type: String,
    },
  },
  { timestamps: true }
);

schema.index({ _requester: 1, _recipient: 1 }, { unique: true, sparse: true });
schema.index({ inviteToken: 1 }, { unique: true, sparse: true });

type IFriend = mongoose.InferSchemaType<typeof schema> & { _id: mongoose.Types.ObjectId };

const FRIEND = model('friend', schema);

export { IFriend, FRIEND };
