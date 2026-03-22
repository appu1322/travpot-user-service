import dayjs from 'dayjs';

const generateOtp = (digits = 6): number => {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(min + Math.random() * (max - min + 1));
};

const getOtpExpiry = (minutes = 10): Date => {
  return dayjs().add(minutes, 'minute').toDate();
};

export { generateOtp, getOtpExpiry };
