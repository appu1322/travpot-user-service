const HOST = String(process.env.MONGO_HOST);
const PORT = String(process.env.MONGO_PORT);
const DB = String(process.env.MONGO_DATABASE);
const USER = String(process.env.MONGO_USER);
const PASSWORD = String(process.env.MONGO_PASSWORD);

const STATUS = {
  active: "ACTIVE",
  inactive: "INACTIVE",
  deleted: "DELETED",
};
const AUTH_PROVIDER = {
  email: "EMAIL",
  google: "GOOGLE",
  facebook: "FACEBOOK",
  apple: "APPLE",
};
const LANGUAGE = {
  en: "en",
  hi: "hi",
  gu: "gu",
};
const GENDER = {
  male: "MALE",
  female: "FEMALE",
  other: "OTHER",
};

export {
  HOST,
  PORT,
  DB,
  USER,
  PASSWORD,
  STATUS,
  AUTH_PROVIDER,
  LANGUAGE,
  GENDER,
};
