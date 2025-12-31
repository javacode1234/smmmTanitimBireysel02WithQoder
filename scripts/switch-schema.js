/**
 * Script to switch between Prisma schemas based on environment
 * This allows using SQLite for development and MySQL/PostgreSQL for production
 */

;(async () => {
  const fs = await import('node:fs')
  const path = await import('node:path')

// Get the environment
  const env = process.env.NODE_ENV || 'development'
  console.log(`Switching Prisma schema for ${env} environment...`)

try {
  // Do not override current schema; ensure backup exists and stays in sync
  const currentSchema = path.join(__dirname, '..', 'prisma', 'schema.prisma')
  const backupSchema = path.join(__dirname, '..', 'prisma', 'schema.prisma.original')
  try {
    fs.copyFileSync(currentSchema, backupSchema)
    console.log('Synced prisma/schema.prisma to prisma/schema.prisma.original')
  } catch (e) {
    console.warn('Could not sync schema backup:', e?.message || e)
  }
  console.log(`Schema switch noop for ${env} environment (keeping current schema)`) 
} catch (error) {
  console.error('Error switching schema:', error.message)
  process.exit(1)
}
})()
