import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import iconv from 'iconv-lite'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Seed Cities
  const citiesPath = 'C:\\Users\\muammer\\Desktop\\smmmProjeDosyalar\\iller.csv'
  if (fs.existsSync(citiesPath)) {
    console.log(`Reading cities from ${citiesPath}...`)
    const buffer = fs.readFileSync(citiesPath)
    const content = iconv.decode(buffer, 'win1254')
    
    const lines = content.split('\n')
    let successCount = 0
    let errorCount = 0

    // Skip header (index 0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const parts = line.split(';')
      if (parts.length >= 2) {
        const id = parseInt(parts[0])
        const name = parts[1].trim()

        if (!isNaN(id) && name) {
          try {
            await prisma.city.upsert({
              where: { id },
              update: { name },
              create: { id, name },
            })
            successCount++
          } catch (e) {
            console.error(`Error upserting city ${id}:`, e)
            errorCount++
          }
        }
      }
    }
    console.log(`Cities seeded: ${successCount} success, ${errorCount} errors`)
  } else {
    console.error(`File not found: ${citiesPath}`)
  }

  // Seed Districts
  const districtsPath = 'C:\\Users\\muammer\\Desktop\\smmmProjeDosyalar\\ilceler.csv'
  if (fs.existsSync(districtsPath)) {
    console.log(`Reading districts from ${districtsPath}...`)
    const buffer = fs.readFileSync(districtsPath)
    const content = iconv.decode(buffer, 'win1254')
    
    const lines = content.split('\n')
    let successCount = 0
    let errorCount = 0

    // Skip header (index 0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const parts = line.split(';')
      if (parts.length >= 3) {
        // districtCode;cityCode;name
        const id = parseInt(parts[0])
        const cityId = parseInt(parts[1])
        const name = parts[2].trim()

        if (!isNaN(id) && !isNaN(cityId) && name) {
          try {
            await prisma.district.upsert({
              where: { id },
              update: { name, cityId },
              create: { id, name, cityId },
            })
            successCount++
          } catch (e) {
            console.error(`Error upserting district ${id}:`, e)
            errorCount++
          }
        }
      }
    }
    console.log(`Districts seeded: ${successCount} success, ${errorCount} errors`)
  } else {
    console.error(`File not found: ${districtsPath}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
