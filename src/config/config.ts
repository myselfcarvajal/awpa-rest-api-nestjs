export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,

  jwt: {
    SECRET: process.env.JWT_SECRET,
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

    ACCESS_EXPIRES_IN: process.env.ACCESS_EXPIRES_IN || '15m',
    REFRESH_EXPIRES_IN: process.env.REFRESH_EXPIRES_IN || '1d',
  },

  upload: {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_S3_REGION: process.env.AWS_S3_REGION,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
    AWS_ENDPOINT: process.env.AWS_ENDPOINT,
    AWS_USE_PATH_STYLE_ENDPOINT: process.env.AWS_USE_PATH_STYLE_ENDPOINT,
  },

  nodemailer: {
    USER_ETHEREAL_EMAIL: process.env.USER_ETHEREAL_EMAIL,
    PASS_ETHEREAL_EMAIL: process.env.PASS_ETHEREAL_EMAIL,
    HOST_ETHEREAL_EMAIL:
      process.env.HOST_ETHEREAL_EMAIL || 'smtp.ethereal.email',
    PORT_ETHEREAL_EMAIL: parseInt(process.env.PORT_ETHEREAL_EMAIL, 10) || 587,
  },

  redis: {
    HOST: process.env.REDIS_HOST,
    PORT: parseInt(process.env.REDIS_PORT, 10) || 6379,
    TTL: parseInt(process.env.REDIS_TTL, 10) || 10,
  },

  throttler: {
    RATE_LIMIT: parseInt(process.env.THROTTLER_RATE_LIMIT, 10) || 3,
    RATE_TTL: parseInt(process.env.THROTTLER_RATE_TTL, 10) || 1000,
  },
});
