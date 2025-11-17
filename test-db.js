const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Try to connect to the database
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');
    
    // Try a simple query
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users`);
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('Error code:', error.code);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();