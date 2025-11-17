const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('=== Detailed Institutions Check ===');
    
    // Check institutions section
    const section = await prisma.institutionsSection.findFirst();
    console.log('Section exists:', !!section);
    if (section) {
      console.log('Section ID:', section.id);
      console.log('Section title:', section.title);
    }
    
    // Check institutions items with full details
    const items = await prisma.institutionItem.findMany({
      orderBy: { order: 'asc' }
    });
    
    console.log(`\nFound ${items.length} institution items:`);
    items.forEach((item, index) => {
      console.log(`\n--- Item ${index + 1} ---`);
      console.log('ID:', item.id);
      console.log('Name:', item.name);
      console.log('Description:', item.description);
      console.log('URL:', item.url);
      console.log('Logo length:', item.logo ? item.logo.length : 0);
      console.log('Is Active:', item.isActive);
      console.log('Order:', item.order);
      console.log('Section ID:', item.sectionId);
      console.log('Created At:', item.createdAt);
      console.log('Updated At:', item.updatedAt);
    });
    
    // Check if any items have empty logos
    const itemsWithEmptyLogos = items.filter(item => !item.logo || item.logo.length === 0);
    console.log(`\nItems with empty logos: ${itemsWithEmptyLogos.length}`);
    
    // Check if any items are inactive
    const inactiveItems = items.filter(item => !item.isActive);
    console.log(`Inactive items: ${inactiveItems.length}`);
    
  } catch (error) {
    console.error('Error checking institutions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();