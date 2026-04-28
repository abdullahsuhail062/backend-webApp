// test.ts
import { prisma } from './src/config/db.js';

async function main() {
  try {
    // step 1 — create user with unique email
    const user = await prisma.user.create({data: {name: 'suhail', email: 'testUser@gmail.com', password: 'suhail123'}});
    console.log('User created', user);
  } catch (error) {
    console.error('❌ Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();