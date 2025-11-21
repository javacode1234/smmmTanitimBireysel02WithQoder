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
  let sourceSchema
  
  if (env === 'development') {
    // For development, use the MySQL schema
    sourceSchema = path.join(__dirname, '..', 'prisma', 'schema.prisma.original')
    console.log('Using MySQL schema for development')
  } else {
    // For production/vercel, use the default schema (MySQL)
    sourceSchema = path.join(__dirname, '..', 'prisma', 'schema.prisma.original')
    
    // If the original schema doesn't exist, create it from the current schema
    if (!fs.existsSync(sourceSchema)) {
      const currentSchema = path.join(__dirname, '..', 'prisma', 'schema.prisma')
      fs.copyFileSync(currentSchema, sourceSchema)
      console.log('Created backup of original schema')
    }
    
    console.log('Using MySQL/PostgreSQL schema for production')
  }

  // Copy the appropriate schema to the main schema file
  const targetSchema = path.join(__dirname, '..', 'prisma', 'schema.prisma')
  fs.copyFileSync(sourceSchema, targetSchema)
  
  console.log(`Successfully switched to ${env} schema!`)
} catch (error) {
  console.error('Error switching schema:', error.message)
  process.exit(1)
}
})()
