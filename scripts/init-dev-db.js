/**
 * Initialize development SQLite database
 * This script creates the database file and runs initial migrations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure the prisma directory exists
const prismaDir = path.join(__dirname, '..', 'prisma');
if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir, { recursive: true });
}

// Set environment to development
process.env.NODE_ENV = 'development';

console.log('Initializing development SQLite database...');

try {
  // Switch to SQLite schema
  console.log('Switching to SQLite schema...');
  execSync('node scripts/switch-schema.js', { stdio: 'inherit' });
  
  // Run Prisma migrations
  console.log('Running Prisma migrations...');
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  
  // Seed the database
  console.log('Seeding database...');
  execSync('npm run db:seed', { stdio: 'inherit' });
  
  console.log('Development database initialized successfully!');
  console.log('Database file created at: prisma/dev.db');
} catch (error) {
  console.error('Error initializing development database:', error.message);
  process.exit(1);
}