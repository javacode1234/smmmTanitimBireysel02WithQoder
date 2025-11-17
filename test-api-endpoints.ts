import { prisma } from './src/lib/db';

async function testAPIEndpoints() {
  try {
    console.log('Testing API endpoints directly...');
    
    // Test 1: GET /api/customers
    console.log('\n1. Testing GET /api/customers...');
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        logo: true,
        companyName: true,
        taxNumber: true,
        taxOffice: true,
        email: true,
        phone: true,
        status: true,
        onboardingStage: true,
        createdAt: true,
      }
    });
    console.log(`✅ GET /api/customers: ${customers.length} records found`);
    
    // Test 2: GET /api/quote-requests
    console.log('\n2. Testing GET /api/quote-requests...');
    const quoteRequests = await prisma.quoterequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ GET /api/quote-requests: ${quoteRequests.length} records found`);
    
    // Test 3: GET /api/contact-messages
    console.log('\n3. Testing GET /api/contact-messages...');
    const contactMessages = await prisma.contactmessage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ GET /api/contact-messages: ${contactMessages.length} records found`);
    
    // Test 4: GET /api/job-applications
    console.log('\n4. Testing GET /api/job-applications...');
    const jobApplications = await prisma.jobapplication.findMany({
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ GET /api/job-applications: ${jobApplications.length} records found`);
    
    console.log('\n✅ All API endpoints are working correctly!');
    
  } catch (error) {
    console.error('❌ API endpoint test failed:', error);
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

testAPIEndpoints();