/**
 * Test script to verify SQLite database connection
 */

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing SQLite database connection...');
    
    // Try to connect to the database
    await prisma.$connect();
    console.log('✅ Successfully connected to SQLite database');
    
    // Try a simple query
    const count = await prisma.aboutsection.count();
    console.log(`✅ Found ${count} about section records`);
    
    console.log('✅ SQLite database setup is working correctly');
  } catch (error) {
    console.error('❌ Error connecting to SQLite database:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();