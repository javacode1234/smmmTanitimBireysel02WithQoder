// Minimal DB schema check for city/district tables
;(async () => {
  const mysql = await import('mysql2/promise')
  const dotenv = await import('dotenv')
  const processEnv = process.env
  dotenv.config()
  const url = processEnv.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL env missing')
    process.exit(1)
  }
  let conn
  try {
    conn = await mysql.createConnection(url)
    const [colsCity] = await conn.query('SHOW COLUMNS FROM city')
    const [colsDist] = await conn.query('SHOW COLUMNS FROM district')
    const [fkDist] = await conn.query(
      'SELECT CONSTRAINT_NAME,COLUMN_NAME,REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME="district" AND REFERENCED_TABLE_NAME IS NOT NULL'
    )
    const fmtCols = (rows) => rows.map((c) => `${c.Field}:${c.Type}:${c.Key}:${c.Extra}`).join('|')
    const fmtFks = (rows) => rows.map((r) => `${r.COLUMN_NAME}->${r.REFERENCED_TABLE_NAME}.${r.REFERENCED_COLUMN_NAME}`).join('|')
    console.log('CITY COLUMNS:', fmtCols(colsCity))
    console.log('DISTRICT COLUMNS:', fmtCols(colsDist))
    console.log('DISTRICT FKs:', fmtFks(fkDist))
  } catch (e) {
    console.error('DB check failed:', e instanceof Error ? e.message : String(e))
    process.exit(1)
  } finally {
    if (conn) await conn.end()
  }
})()

