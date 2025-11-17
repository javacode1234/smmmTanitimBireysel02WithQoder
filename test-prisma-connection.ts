import { prisma } from './src/lib/db';

async function testConnection() {
  try {
    console.log('Testing Prisma connection...');
    
    // Test connection by fetching a simple count
    const count = await prisma.customer.count();
    console.log(`✅ Prisma connected successfully. Found ${count} customers in the database.`);
    
    // Try to fetch a few records
    const customers = await prisma.customer.findMany({
      take: 1
    });
    console.log('✅ Customer query successful:', customers.length > 0 ? 'Found customer data' : 'No customers found');
    
  } catch (error) {
    console.error('❌ Prisma connection failed:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();