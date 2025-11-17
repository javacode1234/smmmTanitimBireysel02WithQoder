import { prisma } from './src/lib/db';

async function checkExistingCustomer() {
  try {
    console.log('Checking existing customer data...');
    
    // Get the first customer
    const customer = await prisma.customer.findFirst();
    
    if (customer) {
      console.log('Found customer:', {
        id: customer.id,
        companyName: customer.companyName,
        createdAt: customer.createdAt
      });
    } else {
      console.log('No customers found in database');
    }
    
  } catch (error) {
    console.error('❌ Failed to check customer:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExistingCustomer();