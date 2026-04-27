import { PrismaClient } from '../generated/prisma/index.js';
import { withAccelerate } from '@prisma/extension-accelerate';
import dotenv from 'dotenv';

dotenv.config();

export const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate());

export default prisma