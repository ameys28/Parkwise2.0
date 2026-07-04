import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { toSafeUser } from '../utils/normalize.js';

const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role, username: user.username }, env.jwtSecret, {
    expiresIn: '7d',
  });

export const registerUser = async ({ username, password, fullName }) => {
  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    throw new ApiError(409, 'Username already exists');
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptRounds);
  const user = await prisma.user.create({
    data: {
      username,
      passwordHash,
      fullName,
      role: 'USER',
    },
  });

  const token = signToken(user);
  return { token, user: toSafeUser(user) };
};

export const loginUser = async ({ username, password }) => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw new ApiError(401, 'Invalid username or password');
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid username or password');
  }

  const token = signToken(user);
  return { token, user: toSafeUser(user) };
};