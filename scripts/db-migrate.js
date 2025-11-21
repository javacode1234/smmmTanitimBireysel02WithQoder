/**
 * Database migration script for different environments
 * Uses MySQL for both development and production
 */

;(async () => {
  const childProcess = await import('node:child_process')
  const { execSync } = childProcess
  const fs = await import('node:fs')
  const dotenv = await import('dotenv')

// Get the environment
  const env = process.env.NODE_ENV || 'development'
  console.log(`Running database migration for ${env} environment...`)

try {
  // Switch schema based on environment
  console.log(`Switching to ${env} schema...`)
  execSync('node scripts/switch-schema.js', { stdio: 'inherit' })
  
  // Read the DATABASE_URL from the appropriate .env file
  const envFile = `.env.${env}`
  if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile })
  } else {
    dotenv.config()
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables')
  }

  console.log(`Using database: ${databaseUrl.split(':')[0]}`)

  // Run migrations
  if (env === 'development') {
    console.log('Running Prisma migrate dev...')
    execSync('npx prisma migrate dev', { stdio: 'inherit' })
  } else {
    console.log('Running Prisma migrate deploy...')
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })
  }

  console.log('Database migration completed successfully!')
} catch (error) {
  console.error('Error during database migration:', error.message)
  process.exit(1)
}
})()
