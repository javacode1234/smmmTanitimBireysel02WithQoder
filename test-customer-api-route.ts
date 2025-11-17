import { prisma } from './src/lib/db';

async function testCustomerAPIRoute() {
  try {
    console.log('Testing Customer API route logic...');
    
    // Simulate the data that would come from the frontend
    const requestData: any = {
      companyName: "Test Şirket API",
      taxNumber: "1234567890",
      phone: "5551234567",
      email: "testapi@sirket.com",
      status: "ACTIVE",
      onboardingStage: "LEAD"
    };
    
    console.log('Received customer data:', requestData);
    
    // Simulate the exact logic from the API route
    if (!requestData.companyName) {
      throw new Error('Şirket adı zorunludur');
    }
    
    console.log('Creating customer with companyName:', requestData.companyName);
    
    // Process the data exactly like the API route does
    const createData: any = {
      logo: null,
      companyName: String(requestData.companyName),
      taxNumber: requestData.taxNumber || null,
      taxOffice: undefined, // This was causing issues before
      phone: requestData.phone || null,
      email: requestData.email || null,
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
      status: requestData.status || 'ACTIVE',
      onboardingStage: requestData.onboardingStage || 'LEAD',
      employeeCount: null,
      hasEmployees: false
    };
    
    // Add hasEmployees if it exists in the request
    if (requestData.hasOwnProperty('hasEmployees')) {
      createData.hasEmployees = Boolean(requestData.hasEmployees);
    }
    
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
    console.error('❌ Customer API route test failed:', error);
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

testCustomerAPIRoute();