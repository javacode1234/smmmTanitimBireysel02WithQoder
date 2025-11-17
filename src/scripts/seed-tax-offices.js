const { PrismaClient } = require('@prisma/client');
const taxOfficesData = require('../lib/tax-offices.ts');

const prisma = new PrismaClient();

async function seedTaxOffices() {
  try {
    console.log('Seeding tax offices...');
    
    // Check if tax offices already exist
    const existingCount = await prisma.taxOffice.count();
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing tax offices. Skipping seeding.`);
      return;
    }
    
    // Create tax offices
    for (const taxOffice of taxOfficesData.turkishTaxOffices) {
      await prisma.taxOffice.create({
        data: {
          name: taxOffice.name,
          city: taxOffice.city,
          district: taxOffice.district,
        },
      });
    }
    
    console.log(`Successfully seeded ${taxOfficesData.turkishTaxOffices.length} tax offices.`);
  } catch (error) {
    console.error('Error seeding tax offices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTaxOffices();