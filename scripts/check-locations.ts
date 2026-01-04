import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking cities in database...')
  const count = await prisma.city.count()
  console.log(`Total cities: ${count}`)

  const cities = await prisma.city.findMany({
    take: 5,
    orderBy: { name: 'asc' }
  })
  console.log('First 5 cities:', cities)

  console.log('Checking districts in database...')
  const districtCount = await prisma.district.count()
  console.log(`Total districts: ${districtCount}`)
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
