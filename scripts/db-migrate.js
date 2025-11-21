/**
 * Database migration script for different environments
 * Handles SQLite for development and MySQL/PostgreSQL for production
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Get the environment
const env = process.env.NODE_ENV || 'development';
console.log(`Running database migration for ${env} environment...`);

try {
  // Switch schema based on environment
  console.log(`Switching to ${env} schema...`);
  execSync('node scripts/switch-schema.js', { stdio: 'inherit' });
  
  // Read the DATABASE_URL from the appropriate .env file
  const envFile = `.env.${env}`;
  if (fs.existsSync(envFile)) {
    require('dotenv').config({ path: envFile });
  } else {
    require('dotenv').config();
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  console.log(`Using database: ${databaseUrl.split(':')[0]}`);

  // Run different commands based on environment
  if (env === 'development') {
    // For development, we use SQLite and run dev migrations
    console.log('Running Prisma migrate dev...');
    execSync('npx prisma migrate dev', { stdio: 'inherit' });
  } else {
    // For production, we use deploy migrations
    console.log('Running Prisma migrate deploy...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  }

  console.log('Database migration completed successfully!');
} catch (error) {
  console.error('Error during database migration:', error.message);
  process.exit(1);
}