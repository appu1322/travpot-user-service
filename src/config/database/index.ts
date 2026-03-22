import mongoose from 'mongoose';
import {
  MONGO_CONNECTION_TYPE,
  MONGO_DATABASE,
  MONGO_HOST,
  MONGO_PASSWORD,
  MONGO_PORT,
  MONGO_USER,
} from '../../constant';

const initializeDatabase = () =>
  new Promise(async (resolve, reject) => {
    try {
      const connectionOptions =
        MONGO_USER && MONGO_PASSWORD
          ? { auth: { username: MONGO_USER, password: MONGO_PASSWORD } }
          : {};

      const db = await mongoose.connect(
        MONGO_CONNECTION_TYPE === 'ATLAS'
          ? `mongodb+srv://${MONGO_HOST}/${MONGO_DATABASE}`
          : `mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}`,
        connectionOptions
      );

      console.log('Database connection established');
      resolve(db);
    } catch (err) {
      reject(err);
    }
  });

export {initializeDatabase};
