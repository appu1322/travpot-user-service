import { OTP } from '../../models';

const createOtp = (data: object) => OTP.create(data);

const updateOtp = (search = {}, payload = {}, options = {}) =>
  OTP.findOneAndUpdate(search, payload, options);

const getOtp = async (search = {}, projection: object = { __v: 0 }) =>
  OTP.aggregate([
    { $match: search },
    { $sort: { _id: -1 } },
    {
      $project: projection,
    },
  ]).then((result) => result[0] || null);

export { createOtp, getOtp, updateOtp  };
