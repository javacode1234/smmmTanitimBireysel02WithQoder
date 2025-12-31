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

  // Optional backup before migrate
  const backupFlag = String(process.env.DB_BACKUP_ON_MIGRATE || '').toLowerCase() === 'true'
  if (backupFlag) {
    try {
      const url = new URL(databaseUrl)
      const host = url.hostname
      const port = url.port || '3306'
      const user = decodeURIComponent(url.username)
      const pass = decodeURIComponent(url.password || '')
      const db = url.pathname.replace('/', '')
      const path = await import('node:path')
      const backupsDir = path.join(process.cwd(), 'backups')
      if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true })
      const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      const outfile = path.join(backupsDir, `${db}_${stamp}.sql`)
      console.log(`Creating DB backup to ${outfile} ...`)
      const passPart = pass ? `-p\"${pass}\"` : ''
      // Use shell for output redirection
      execSync(`mysqldump -h ${host} -P ${port} -u \"${user}\" ${passPart} ${db} > \"${outfile}\"`, { stdio: 'inherit', shell: true })
      console.log('Backup completed')
    } catch (e) {
      console.warn('Backup step failed or mysqldump missing, continuing migration:', e?.message || e)
    }
  }

  // Run migrations
  if (env === 'development') {
    console.log('Running Prisma migrate dev...')
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const resetFlag = String(process.env.DB_RESET_ON_MIGRATE || '').toLowerCase() === 'true'
    if (resetFlag) {
      console.log('Resetting development database (non-production)...')
      execSync('npx prisma migrate reset --force --skip-seed', { stdio: 'inherit' })
      const path = await import('node:path')
      const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations')
      if (fs.existsSync(migrationsDir)) {
        fs.rmSync(migrationsDir, { recursive: true, force: true })
        console.log('Deleted prisma/migrations (reset)')
      }
    }
    execSync(`npx prisma migrate dev --name auto-${stamp}`, { stdio: 'inherit' })
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
