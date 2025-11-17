import { prisma } from './src/lib/db';

async function testCustomerPost() {
  try {
    console.log('Testing POST /api/customers with sample data...');
    
    // Test data similar to what might be sent from the frontend
    const testData = {
      companyName: "Test Şirket",
      taxNumber: "1234567890",
      phone: "5551234567",
      email: "test@sirket.com",
      status: "ACTIVE",
      onboardingStage: "LEAD"
    };
    
    console.log('Creating customer with data:', testData);
    
    // Test the exact logic from the API route
    const createData: any = {
      companyName: String(testData.companyName),
      taxNumber: testData.taxNumber || null,
      taxOffice: undefined, // This might be the issue
      phone: testData.phone || null,
      email: testData.email || null,
      address: null,
      city: null,
      facebookUrl: null,
      xUrl: null,
      linkedinUrl: null,
      instagramUrl: null,
      threadsUrl: null,
      ledgerType: null,
      subscriptionFee: null,
      establishmentDate: null,
      taxPeriodType: null,
      authorizedName: null,
      authorizedTCKN: null,
      authorizedEmail: null,
      authorizedPhone: null,
      authorizedAddress: null,
      authorizedFacebookUrl: null,
      authorizedXUrl: null,
      authorizedLinkedinUrl: null,
      authorizedInstagramUrl: null,
      authorizedThreadsUrl: null,
      authorizationDate: null,
      authorizationPeriod: null,
      declarations: null,
      documents: null,
      passwords: null,
      notes: null,
      status: testData.status || 'ACTIVE',
      onboardingStage: testData.onboardingStage || 'LEAD',
      employeeCount: null,
      hasEmployees: false
    };
    
    console.log('Creating customer with processed data...');
    
    const customer = await prisma.customer.create({
      data: createData,
    });
    
    console.log('✅ Customer created successfully:', customer.id);
    
    // Clean up
    await prisma.customer.delete({
      where: { id: customer.id }
    });
    
    console.log('✅ Test customer cleaned up');
    
  } catch (error) {
    console.error('❌ Customer POST test failed:', error);
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

testCustomerPost();