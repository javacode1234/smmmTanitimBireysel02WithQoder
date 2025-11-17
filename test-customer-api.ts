import { prisma } from './src/lib/db';

async function testCustomerAPI() {
  try {
    console.log('Testing Customer API functionality...');
    
    // Test creating a customer with minimal data
    const testData = {
      companyName: 'Test Company',
      taxNumber: '1234567890',
      phone: '5551234567',
      email: 'test@company.com'
    };
    
    console.log('Creating test customer with data:', testData);
    
    const customer = await prisma.customer.create({
      data: {
        id: `test-${Date.now()}`,
        companyName: testData.companyName,
        taxNumber: testData.taxNumber,
        phone: testData.phone,
        email: testData.email,
        status: 'ACTIVE',
        onboardingStage: 'LEAD',
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Customer created successfully:', customer.id);
    
    // Test fetching customers
    const customers = await prisma.customer.findMany({
      take: 5,
      select: {
        id: true,
        companyName: true,
        taxNumber: true,
        email: true,
        status: true,
        onboardingStage: true,
        createdAt: true
      }
    });
    
    console.log('✅ Fetched customers successfully:', customers.length);
    
    // Clean up - delete the test customer
    await prisma.customer.delete({
      where: { id: customer.id }
    });
    
    console.log('✅ Test customer cleaned up');
    
  } catch (error) {
    console.error('❌ Customer API test failed:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any).code,
      meta: (error as any).meta
    });
  } finally {
    await prisma.$disconnect();
  }
}

testCustomerAPI();