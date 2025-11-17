const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking institutions in database...');
    
    // Check if institutions section exists
    const section = await prisma.institutionsSection.findFirst();
    if (section) {
      console.log('Institutions Section:', section);
      
      // Check institutions items
      const items = await prisma.institutionItem.findMany({
        orderBy: { order: 'asc' }
      });
      
      console.log(`Found ${items.length} institution items:`);
      items.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name} - ${item.isActive ? 'Active' : 'Inactive'}`);
        console.log(`   Logo length: ${item.logo ? item.logo.length : 0} characters`);
        console.log(`   URL: ${item.url || 'None'}`);
        console.log(`   Description: ${item.description || 'None'}`);
        console.log('---');
      });
    } else {
      console.log('No institutions section found');
    }
  } catch (error) {
    console.error('Error checking institutions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();