import { PrismaClient } from '@prisma/client';

// Create a new Prisma client to check the schema
const prisma = new PrismaClient();

async function checkCustomerSchema() {
  try {
    console.log('Checking customer schema...');
    
    // Try to create a customer with minimal data and let Prisma handle the ID
    const customer = await prisma.customer.create({
      data: {
        companyName: 'Test Company Schema',
        status: 'ACTIVE',
        onboardingStage: 'LEAD',
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Customer created successfully with auto-generated ID:', customer.id);
    
    // Clean up
    await prisma.customer.delete({
      where: { id: customer.id }
    });
    
    console.log('✅ Test customer cleaned up');
    
  } catch (error) {
    console.error('❌ Customer schema test failed:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any).code,
      meta: (error as any).meta
    });
  } finally {
    await prisma.$disconnect();
  }
}

checkCustomerSchema();