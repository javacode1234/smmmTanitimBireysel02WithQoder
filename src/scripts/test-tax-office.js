const { PrismaClient } = require('@prisma/client');

async function test() {
  const prisma = new PrismaClient();
  try {
    const result = await prisma.taxOffice.findMany({ 
      take: 5, 
      select: { 
        id: true, 
        name: true 
      } 
    });
    console.log('Test result:', result);
  } catch (e) {
    console.error('Test error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();