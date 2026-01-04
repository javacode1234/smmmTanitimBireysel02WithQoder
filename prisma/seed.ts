import { PrismaClient, Prisma } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import * as iconv from 'iconv-lite'
import { turkishTaxOffices } from '../src/lib/tax-offices'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  const isSqlite = (process.env.DATABASE_URL || '').startsWith('file:')

  // Minimal seed for SQLite dev
  if (isSqlite) {
    console.log('🔧 Detected SQLite (development). Running minimal seed...')
    const settings = await prisma.sitesettings.upsert({
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
    console.log('✅ Site settings created:', settings.siteName)
    
    try {
      console.log('🗺️ Seeding cities/districts (dev)...')
      const cityNames = Array.from(new Set((turkishTaxOffices || []).map(o => o.city).filter(Boolean)))
      // Use id-based upsert for dev as well if possible, but for now just skip or use name if id not available
      // The production seed uses IDs from CSV. For dev without CSV, we might skip or use dummy IDs.
      // Since we rely on CSVs now, let's just skip the dev-only city seed if we don't have IDs.
      // Or we can just let the main seed logic handle it if files exist.
      console.log('ℹ️ Skipping dev-only city seed, relying on main seed logic.')
    } catch (e) {
      console.warn('⚠️ Skipping dev cities/districts seed:', e instanceof Error ? e.message : e)
    }
    console.log('✅ Minimal database seeding completed successfully!')
    return
  }

  // Seed Users
  console.log('👥 Seeding users...')
  
  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@smmm.com' },
    update: {},
    create: {
      id: 'admin-user-id',
      email: 'admin@smmm.com',
      name: 'Admin Kullanıcı',
      password: hashedPassword,
      role: 'ADMIN',
      image: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  console.log('✅ Admin user created:', adminUser.email)

  // Create Client User with Client data
  const clientUser = await prisma.user.upsert({
    where: { email: 'mukellef@example.com' },
    update: {},
    create: {
      id: 'client-user-1-id',
      email: 'mukellef@example.com',
      name: 'Mükellef Kullanıcı',
      password: hashedPassword,
      role: 'CLIENT',
      image: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  console.log('✅ Client user created:', clientUser.email)

  // Create another Client User
  const clientUser2 = await prisma.user.upsert({
    where: { email: 'firma@example.com' },
    update: {},
    create: {
      id: 'client-user-2-id',
      email: 'firma@example.com',
      name: 'Ahmet Yılmaz',
      password: hashedPassword,
      role: 'CLIENT',
      image: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  console.log('✅ Client user 2 created:', clientUser2.email)

  // Seed Tax Offices
  try {
    console.log('🏛️ Seeding tax offices...')
    // Ensure specific tax offices exist for seeded customers
    await prisma.taxOffice.upsert({
      where: { id: 'tax-ist-avrupa' },
      create: { id: 'tax-ist-avrupa', name: 'Mecidiyeköy V.D.', city: 'İstanbul', district: 'Şişli' },
      update: {}
    })
    await prisma.taxOffice.upsert({
      where: { id: 'tax-ist-anadolu' },
      create: { id: 'tax-ist-anadolu', name: 'Kadıköy V.D.', city: 'İstanbul', district: 'Kadıköy' },
      update: {}
    })
    
    const officeData = (turkishTaxOffices || []).map(o => ({ name: o.name, city: o.city, district: o.district }))
    if (officeData.length > 0) {
      await prisma.taxOffice.createMany({ data: officeData, skipDuplicates: true })
    }
    console.log('✅ Tax offices seeded')
  } catch (e) {
    console.warn('⚠️ Skipping tax offices seed:', e instanceof Error ? e.message : e)
  }

  // Seed Customers
  try {
    console.log('👤 Seeding customers...')
    await prisma.customer.upsert({
      where: { id: 'seed-cust-1' },
      update: {},
      create: {
        id: 'seed-cust-1',
        companyName: 'Acme Yazılım Ltd. Şti.',
        taxNumber: '1111111111',
        email: 'contact@acmeyazilim.com',
        phone: '+90 212 000 0011',
        status: 'ACTIVE',
        onboardingStage: 'CUSTOMER',
        taxOffice: { connect: { id: 'tax-ist-avrupa' } },
      }
    })
    await prisma.customer.upsert({
      where: { id: 'seed-cust-2' },
      update: {},
      create: {
        id: 'seed-cust-2',
        companyName: 'Beta Danışmanlık A.Ş.',
        taxNumber: '2222222222',
        email: 'info@betadns.com',
        phone: '+90 216 000 0022',
        status: 'ACTIVE',
        onboardingStage: 'PROSPECT',
        taxOffice: { connect: { id: 'tax-ist-anadolu' } },
      }
    })
    console.log('✅ Customers seeded')
  } catch (e) {
    console.warn('⚠️ Skipping customers seed:', e instanceof Error ? e.message : e)
  }

  // Seed Job Applications
  console.log('📝 Seeding job applications...')
  await prisma.jobapplication.createMany({
    data: [
      {
        id: 'job-app-1',
        name: "Selin Akar",
        email: "selin@example.com",
        phone: "0555 111 2233",
        position: "Mali Müşavir Yardımcısı",
        experience: "3 yıl",
        education: "İktisat Fakültesi",
        coverLetter: "Muhasebe alanında 3 yıllık tecrübem ve SMMM sınavına hazırlanıyor olmam nedeniyle ekibinizde yer almak istiyorum.",
        cvFileName: "selin_akar_cv.pdf",
        status: "NEW",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'job-app-2',
        name: "Murat Çelik",
        email: "murat@example.com",
        phone: "0532 444 5566",
        position: "Muhasebe Elemanı",
        experience: "5 yıl",
        education: "İşletme Fakültesi",
        coverLetter: "Şirketinizde muhasebe departmanında çalışmak ve kendimi geliştirmek istiyorum.",
        cvFileName: "murat_celik_cv.pdf",
        status: "REVIEWING",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'job-app-3',
        name: "Deniz Yılmaz",
        email: "deniz@example.com",
        phone: "0543 777 8899",
        position: "Stajyer",
        experience: "Yeni Mezun",
        education: "Muhasebe ve Finans Yönetimi",
        coverLetter: "Yeni mezun olarak pratik tecrübe kazanmak ve SMMM olma yolunda ilerlemek istiyorum.",
        cvFileName: "deniz_yilmaz_cv.pdf",
        status: "INTERVIEWED",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'job-app-4',
        name: "Ayşe Demir",
        email: "ayse.demir@example.com",
        phone: "0533 222 3344",
        position: "Mali Müşavir",
        experience: "8 yıl",
        education: "İktisat Fakültesi - Yüksek Lisans",
        coverLetter: "SMMM ruhsatına sahip, 8 yıllık tecrübeli bir mali müşavir olarak ekibinize katılmak istiyorum.",
        cvFileName: "ayse_demir_cv.pdf",
        status: "REJECTED",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Job applications seeded')

  // Seed Cities and Districts from CSV
  console.log('🗺️ Seeding cities, districts and tax offices from CSV files...')
  
  // Cache for city names to use in Tax Office seeding
  const cityNames = new Map<number, string>()
  
  try {
    // Seed Cities
    const citiesPath = 'C:\\Users\\muammer\\Desktop\\smmmProjeDosyalar\\iller.csv'
    if (fs.existsSync(citiesPath)) {
      console.log(`Reading cities from ${citiesPath}...`)
      const buffer = fs.readFileSync(citiesPath)
      const content = iconv.decode(buffer, 'win1254')
      
      const lines = content.split('\n')
      let successCount = 0

      // Skip header (index 0)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const parts = line.split(';')
        if (parts.length >= 2) {
          const id = parseInt(parts[0])
          const name = parts[1].trim()

          if (!isNaN(id) && name) {
            cityNames.set(id, name) // Cache for tax offices
            
            await prisma.city.upsert({
              where: { id },
              update: { name },
              create: { id, name },
            })
            successCount++
          }
        }
      }
      console.log(`Cities seeded: ${successCount}`)
    } else {
      console.warn(`File not found: ${citiesPath}`)
    }

    // Seed Districts
    const districtsPath = 'C:\\Users\\muammer\\Desktop\\smmmProjeDosyalar\\ilceler.csv'
    if (fs.existsSync(districtsPath)) {
      console.log(`Reading districts from ${districtsPath}...`)
      const buffer = fs.readFileSync(districtsPath)
      const content = iconv.decode(buffer, 'win1254')
      
      const lines = content.split('\n')
      let successCount = 0

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
            await prisma.district.upsert({
              where: { id },
              update: { name, cityId },
              create: { id, name, cityId },
            })
            successCount++
          }
        }
      }
      console.log(`Districts seeded: ${successCount}`)
    } else {
      console.warn(`File not found: ${districtsPath}`)
    }

    // Seed Tax Offices
    const taxOfficesPath = 'C:\\Users\\muammer\\Desktop\\smmmProjeDosyalar\\vergi_daireleri.csv'
    if (fs.existsSync(taxOfficesPath)) {
      console.log(`Reading tax offices from ${taxOfficesPath}...`)
      // Note: CSV is UTF-8 based on check.
      const buffer = fs.readFileSync(taxOfficesPath)
      const content = buffer.toString('utf-8')
      
      const lines = content.split('\n')
      let successCount = 0
      
      // Skip header (index 0)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const parts = line.split(';')
        // Format: id;cityId;districtName;code;name
        if (parts.length >= 5) {
          const cityId = parseInt(parts[1])
          const districtName = parts[2].trim()
          const code = parts[3].trim()
          const name = parts[4].trim()

          const cityName = cityNames.get(cityId) || ''

          if (name) {
            // Upsert by name
            await prisma.taxOffice.upsert({
              where: { name },
              update: {
                city: cityName,
                district: districtName
              },
              create: {
                name,
                city: cityName,
                district: districtName
              }
            })
            successCount++
          }
        }
      }
      console.log(`Tax offices seeded: ${successCount}`)
    } else {
      console.warn(`File not found: ${taxOfficesPath}`)
    }

  } catch (e) {
    console.error('Error seeding locations from CSV:', e)
  }


  // Seed Quote Requests
  console.log('💼 Seeding quote requests...')
  await prisma.quoterequest.createMany({
    data: [
      {
        id: 'quote-1',
        name: "Ahmet Yılmaz",
        email: "ahmet@example.com",
        phone: "0555 123 4567",
        company: "ABC Teknoloji A.Ş.",
        serviceType: "Tam Tasdik",
        message: "Yıllık mali tablolarımız için tam tasdik hizmeti almak istiyoruz.",
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'quote-2',
        name: "Zeynep Kaya",
        email: "zeynep@example.com",
        phone: "0532 987 6543",
        company: "XYZ Danışmanlık Ltd.",
        serviceType: "Sınırlı Bağımsız Denetim",
        message: "Şirketimiz için sınırlı bağımsız denetim hizmeti talep ediyoruz.",
        status: "REVIEWED",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'quote-3',
        name: "Mehmet Öz",
        email: "mehmet@example.com",
        phone: "0543 456 7890",
        company: "Öz Gıda San. Tic.",
        serviceType: "Muhasebe Danışmanlığı",
        message: "Aylık muhasebe takibi ve beyanname hizmetleri için teklif almak istiyorum.",
        status: "CONTACTED",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'quote-4',
        name: "Fatma Arslan",
        email: "fatma@example.com",
        phone: "0533 789 0123",
        company: "Arslan İnşaat",
        serviceType: "Vergi Danışmanlığı",
        message: "KDV ve kurumlar vergisi konusunda danışmanlık ihtiyacımız var.",
        status: "COMPLETED",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    skipDuplicates: true,
  })

  // Seed Contact Messages
  console.log('📧 Seeding contact messages...')
  await prisma.contactmessage.createMany({
    data: [
      {
        id: 'contact-1',
        name: "Ali Demir",
        email: "ali@example.com",
        phone: "0555 111 2222",
        subject: "Hizmetler Hakkında Bilgi",
        message: "SMMM hizmetleriniz hakkında detaylı bilgi almak istiyorum.",
        status: "NEW",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'contact-2',
        name: "Ayşe Şahin",
        email: "ayse@example.com",
        phone: "0532 333 4444",
        subject: "Randevu Talebi",
        message: "Yeni kurduğumuz şirket için randevu almak istiyoruz.",
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'contact-3',
        name: "Mustafa Çelik",
        email: "mustafa@example.com",
        phone: "0543 555 6666",
        subject: "Fiyat Bilgisi",
        message: "Aylık muhasebe hizmetiniz için ücret bilgisi alabilir miyim?",
        status: "REPLIED",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'contact-4',
        name: "Elif Yıldız",
        email: "elif@example.com",
        phone: "0533 777 8888",
        subject: "E-Fatura Sistemi",
        message: "E-fatura sistemine geçiş konusunda yardım alabilir miyiz?",
        status: "RESOLVED",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    skipDuplicates: true,
  })

  // Seed Declaration Configs
  console.log('🧾 Seeding declaration configs...')
  const defaults = [
    { 
      id: 'decl-config-1',
      type: 'KDV', 
      frequency: 'MONTHLY', 
      enabled: true, 
      dueDay: 26,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { 
      id: 'decl-config-2',
      type: 'Muhtasar SGK (Aylık)', 
      frequency: 'MONTHLY', 
      enabled: true, 
      dueDay: 26,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { 
      id: 'decl-config-3',
      type: 'Muhtasar SGK (3 Aylık)', 
      frequency: 'QUARTERLY', 
      enabled: true, 
      quarterOffset: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { 
      id: 'decl-config-4',
      type: 'Gelir Geçici Vergi', 
      frequency: 'QUARTERLY', 
      enabled: true, 
      dueDay: 17, 
      quarterOffset: 2, 
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { 
      id: 'decl-config-5',
      type: 'Kurumlar Geçici Vergi', 
      frequency: 'QUARTERLY', 
      enabled: true, 
      dueDay: 17, 
      quarterOffset: 2, 
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { 
      id: 'decl-config-6',
      type: 'Yıllık Gelir Vergisi', 
      frequency: 'YEARLY', 
      enabled: true, 
      dueMonth: 3, 
      dueDay: 25,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { 
      id: 'decl-config-7',
      type: 'Yıllık Kurumlar Vergisi', 
      frequency: 'YEARLY', 
      enabled: true, 
      dueMonth: 4, 
      dueDay: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { 
      id: 'decl-config-8',
      type: 'Damga Vergisi', 
      frequency: 'MONTHLY', 
      enabled: true, 
      dueDay: 26,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ] as Prisma.declarationconfigCreateInput[]
  for (const d of defaults) {
    await prisma.declarationconfig.upsert({
      where: { type: d.type },
      update: {},
      create: d,
    })
  }

  try {
    console.log('🏷️ Seeding activity codes from nace6_temiz.csv...')
    // Delete all existing to ensure clean slate from the new file
    // Note: Model name is ActivityCode, so prisma.activityCode
    // If using older client, might be different, but we will generate client.
    // However, to be safe with existing code style which uses lowercase models, 
    // I should check if I should name the model `activitycode` or `ActivityCode`.
    // The user's other models are lowercase (`model customer`, `model user`).
    // Consistency: I should probably rename my model to `activitycode` in schema to match others?
    // But `ActivityCode` is standard Prisma naming.
    // The existing code at line 43 uses `prisma.activitycode.deleteMany`.
    // This implies the previous model was `activitycode`.
    // If I used `model ActivityCode`, the client will likely use `prisma.activityCode`.
    // To avoid breaking the `prisma.activitycode` usages in lines 43 and 525 (which I am replacing),
    // I should probably stick to `prisma.activityCode` in my new code, but I need to make sure
    // I replace ALL occurrences or update the model name.
    
    // Let's check the schema again. `model customer` is lowercase.
    // I'll update my schema addition to be `model activitycode` to match the project convention!
    // This will make `prisma.activitycode` valid (lowercase).
    
    // WAIT. If I change the model to `activitycode`, then `prisma.activitycode` works.
    // Let's revert the schema change and make it `model activitycode`.
    
    // Actually, I can just use `ActivityCode` and update the usages in seed.ts.
    // But `model customer` is lowercase. It's better to follow the project convention.
    // So I will update schema first.
    
    const nacePath = 'C:\\Users\\muammer\\Desktop\\smmmProjeDosyalar\\nace6_temiz.csv'
    if (fs.existsSync(nacePath)) {
      console.log(`Reading NACE codes from ${nacePath}...`)
      await prisma.activitycode.deleteMany({})
      
      const content = fs.readFileSync(nacePath, 'utf-8')
      const lines = content.split('\n')
      let successCount = 0

      // Skip header (index 0)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        
        // Regex for CSV parsing (handles quoted strings)
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        
        if (parts.length >= 2) {
          const code = parts[0].trim()
          let name = parts[1].trim()
          
          if (name.startsWith('"') && name.endsWith('"')) {
            name = name.slice(1, -1)
          }

          if (code && name) {
            await prisma.activitycode.create({
              data: {
                code,
                name,
                isActive: true
              }
            })
            successCount++
          }
        }
      }
      console.log(`Activity codes seeded: ${successCount}`)
    } else {
      console.warn(`File not found: ${nacePath}`)
    }
  } catch (e) {
    console.warn('⚠️ Skipping activity codes seed:', e instanceof Error ? e.message : e)
  }

  // Skipped legacy city/district seed to avoid conflicts/errors


  // Supplement cities/districts with a public TR dataset (if available)
  // Skipped to avoid conflicts with CSV data
  /*
  try {
    console.log('🗺️ Supplementing cities/districts from public TR dataset...')
    const url = 'https://gist.githubusercontent.com/sercanov/c63063e4b40c756d4040a0be694895e9/raw/turkiye.json'
    const res = await fetch(url)
    if (res.ok) {
      const map = await res.json() as Record<string, string[]>
      for (const [cityName, dists] of Object.entries(map)) {
        // ... code removed/commented
      }
      console.log('✅ Cities/districts supplemented from TR dataset')
    } else {
      console.warn('⚠️ Could not download TR cities/districts dataset:', res.status)
    }
  } catch (e) {
    console.warn('⚠️ Skipping TR cities/districts supplement:', e instanceof Error ? e.message : e)
  }
  */

  console.log('✅ Database seeding completed successfully!')
  console.log('')
  console.log('🔑 Login Credentials:')
  console.log('Admin: admin@smmm.com / password123')
  console.log('Client 1: mukellef@example.com / password123')
  console.log('Client 2: firma@example.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
  

