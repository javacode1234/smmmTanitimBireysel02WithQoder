import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting minimal database seed...')

  // Create initial site settings
  const siteSettings = await prisma.sitesettings.upsert({
    where: { id: 'default-settings' },
    update: {},
    create: {
      id: 'default-settings',
      siteName: 'SMMM Ofisi',
      siteDescription: 'Profesyonel muhasebe ve mali müşavirlik hizmetleri',
      phone: '+90 (212) 123 45 67',
      email: 'info@smmmofisi.com',
      address: 'İstanbul, Türkiye',
      facebookUrl: '',
      xUrl: '',
      linkedinUrl: '',
      instagramUrl: '',
      youtubeUrl: '',
      threadsUrl: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  console.log('✅ Site settings created:', siteSettings.siteName)
  console.log('✅ Minimal database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })