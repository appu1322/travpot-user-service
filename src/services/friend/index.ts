import { FRIEND } from '../../models';

const createFriendRequest = (data: object) => FRIEND.create(data);

const getFriend = (search = {}) => FRIEND.findOne(search);

const getFriendByToken = (inviteToken: string) => FRIEND.findOne({ inviteToken });

const updateFriend = (search = {}, payload = {}) => FRIEND.findOneAndUpdate(search, payload, { new: true });

const getFriends = (search = {}) => FRIEND.find(search);

export { createFriendRequest, getFriend, getFriendByToken, updateFriend, getFriends };
