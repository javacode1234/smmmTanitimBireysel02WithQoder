const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Try to connect to the database
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Try to query the sitesettings table
    const settings = await prisma.sitesettings.findFirst();
    console.log('✅ Sitesettings query successful');
    console.log('Settings:', settings);
    
    // Try to create a test record if none exists
    if (!settings) {
      console.log('No existing settings found, creating test record...');
      const newSettings = await prisma.sitesettings.create({
        data: {
          id: 'test-id-' + Date.now(),
          siteName: 'Test Site',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });
      console.log('✅ Test record created:', newSettings);
      
      // Clean up the test record
      await prisma.sitesettings.delete({
        where: { id: newSettings.id }
      });
      console.log('✅ Test record cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();