import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'parkwise-development-secret',
  totalSpots: Number(process.env.TOTAL_SPOTS || 20),
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 12),
};