import { SESSION } from '../../models';

const createSession = (data: object) => SESSION.create(data);

const getSession = (search = {}) => SESSION.findOne(search);

const updateSession = (search = {}, payload = {}, options = {}) =>
  SESSION.findOneAndUpdate(search, payload, options);

const deleteSessions = (search = {}) => SESSION.deleteMany(search);

export { createSession, getSession, updateSession, deleteSessions };
