const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.update({
      where: { email: 'test3@example.com' },
      data: { role: 'admin' }
    });
    console.log('User is now admin:', user.username);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
