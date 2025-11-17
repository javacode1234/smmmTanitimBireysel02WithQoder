import { prisma } from './src/lib/db';

async function testAllAPIs() {
  try {
    console.log('Testing all API database connections...');
    
    // Test 1: Customer table
    console.log('\n1. Testing Customer table...');
    const customerCount = await prisma.customer.count();
    console.log(`✅ Customer table: ${customerCount} records found`);
    
    // Test 2: Quote Request table
    console.log('\n2. Testing Quote Request table...');
    const quoteCount = await prisma.quoterequest.count();
    console.log(`✅ Quote Request table: ${quoteCount} records found`);
    
    // Test 3: Contact Message table
    console.log('\n3. Testing Contact Message table...');
    const contactCount = await prisma.contactmessage.count();
    console.log(`✅ Contact Message table: ${contactCount} records found`);
    
    // Test 4: Job Application table
    console.log('\n4. Testing Job Application table...');
    const jobCount = await prisma.jobapplication.count();
    console.log(`✅ Job Application table: ${jobCount} records found`);
    
    // Test 5: Tax Office table
    console.log('\n5. Testing Tax Office table...');
    const taxOfficeCount = await prisma.taxoffice.count();
    console.log(`✅ Tax Office table: ${taxOfficeCount} records found`);
    
    console.log('\n✅ All database tables are accessible!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
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

testAllAPIs();