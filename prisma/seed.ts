import { PrismaClient, Prisma } from '@prisma/client'
import fetch from 'node-fetch'
import * as fs from 'fs'
import * as path from 'path'
let XLSX: typeof import('xlsx') | null = null
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
      console.log('🏷️ Seeding activity codes (dev) ...')
      await prisma.activitycode.deleteMany({})
      await seedActivityCodesFromLocalXLS()
      await seedActivityCodesFromCSV()
      console.log('✅ Activity codes seeded (dev)')
    } catch (e) {
      console.warn('⚠️ Skipping dev activity codes seed:', e instanceof Error ? e.message : e)
    }
    try {
      console.log('🗺️ Seeding cities/districts (dev)...')
      const cityNames = Array.from(new Set((turkishTaxOffices || []).map(o => o.city).filter(Boolean)))
      for (const name of cityNames) {
        await prisma.city.upsert({ where: { name }, update: {}, create: { name } })
      }
      console.log('✅ Cities seeded (dev)')
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
      client: {
        create: {
          id: 'client-1-id',
          companyName: 'ABC Ticaret Ltd. Şti.',
          taxNumber: '1234567890',
          phone: '0533 987 6543',
          address: 'Atatürk Cad. No: 123 Merkez/İstanbul',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
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
      client: {
        create: {
          id: 'client-2-id',
          companyName: 'XYZ Danışmanlık A.Ş.',
          taxNumber: '9876543210',
          phone: '0532 123 4567',
          address: 'İnönü Mah. Cumhuriyet Cad. No: 45 Kadıköy/İstanbul',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    },
  })
  console.log('✅ Client user 2 created:', clientUser2.email)

  // Seed Tax Offices
  try {
    console.log('🏛️ Seeding tax offices...')
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
      skipQuarter: true,
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
      skipQuarter: true,
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
    console.log('🏷️ Seeding activity codes...')
    await prisma.activitycode.deleteMany({})
    await seedActivityCodesFromLocalXLS()
    await seedActivityCodesFromCSV()
    console.log('✅ Activity codes seeded')
  } catch (e) {
    console.warn('⚠️ Skipping activity codes seed:', e instanceof Error ? e.message : e)
  }

  // Seed Cities and Districts
  try {
    console.log('🗺️ Seeding cities and districts...')
    const cityNames = Array.from(new Set((turkishTaxOffices || []).map(o => o.city).filter(Boolean)))
    const cityMap: Record<string, string> = {}
    for (const name of cityNames) {
      const city = await prisma.city.upsert({
        where: { name },
        update: {},
        create: { name },
      })
      cityMap[name] = city.id
    }

    const byCity: Record<string, Set<string>> = {}
    for (const o of turkishTaxOffices || []) {
      if (!o.city || !o.district) continue
      byCity[o.city] = byCity[o.city] || new Set<string>()
      byCity[o.city].add(o.district)
    }

    for (const [cityName, districts] of Object.entries(byCity)) {
      const cityId = cityMap[cityName]
      if (!cityId) continue
      for (const dist of districts) {
        const key = `${cityId}:${dist}`
        try {
          await prisma.district.upsert({
            where: { cityId_name: { cityId, name: dist } },
            update: {},
            create: { cityId, name: dist },
          })
        } catch {}
      }
    }
    console.log('✅ Cities and districts seeded')
  } catch (e) {
    console.warn('⚠️ Skipping cities/districts seed:', e instanceof Error ? e.message : e)
  }

  // Supplement cities/districts with a public TR dataset (if available)
  try {
    console.log('🗺️ Supplementing cities/districts from public TR dataset...')
    const url = 'https://gist.githubusercontent.com/sercanov/c63063e4b40c756d4040a0be694895e9/raw/turkiye.json'
    const res = await fetch(url)
    if (res.ok) {
      const map = await res.json() as Record<string, string[]>
      for (const [cityName, dists] of Object.entries(map)) {
        const city = await prisma.city.upsert({ where: { name: cityName }, update: {}, create: { name: cityName } })
        for (const distName of dists) {
          await prisma.district.upsert({
            where: { cityId_name: { cityId: city.id, name: distName } },
            update: {},
            create: { cityId: city.id, name: distName },
          })
        }
      }
      console.log('✅ Cities/districts supplemented from TR dataset')
    } else {
      console.warn('⚠️ Could not download TR cities/districts dataset:', res.status)
    }
  } catch (e) {
    console.warn('⚠️ Skipping TR cities/districts supplement:', e instanceof Error ? e.message : e)
  }

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
  
// Helper: Seed activity codes from public CSV (NACE Rev.2)
async function seedActivityCodesFromCSV() {
  try {
    console.log('📥 Fetching NACE Rev.2 CSV (classes) ...')
    const url = 'https://gist.githubusercontent.com/b-rodrigues/4218d6daa8275acce80ebef6377953fe/raw/nace_rev2.csv'
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to download CSV: ${res.status}`)
    const csv = await res.text()
    const rows = parseCSV(csv)
    // Expect headers: Order,Level,Code,Parent,Description,...
    const header = rows[0]
    const idxLevel = header.indexOf('Level')
    const idxCode = header.indexOf('Code')
    const idxDesc = header.indexOf('Description')
    if (idxLevel < 0 || idxCode < 0 || idxDesc < 0) throw new Error('CSV headers not found')
    const items = rows.slice(1)
      .filter(r => String(r[idxLevel]).trim() === '4')
      .map(r => ({ code: String(r[idxCode]).trim(), name: String(r[idxDesc]).trim() }))
      .filter(i => /\d{2}\.\d{2}/.test(i.code) && i.name)
    let count = 0
    for (const it of items) {
      await prisma.activitycode.upsert({
        where: { code: it.code },
        update: { name: it.name, isActive: true },
        create: { code: it.code, name: it.name, isActive: true },
      })
      count++
      if (count % 200 === 0) console.log(`  ↳ Seeded ${count} activity codes...`)
    }
    console.log(`✅ Seeded ${count} activity codes from CSV`)
  } catch (e) {
    console.warn('⚠️ Could not seed activity codes from CSV:', e instanceof Error ? e.message : e)
  }
}

// Minimal CSV parser supporting quotes
function parseCSV(input: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false
  for (let i = 0; i < input.length; i++) {
    const ch = input[i]
    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') { cell += '"'; i++; } else { inQuotes = false }
      } else {
        cell += ch
      }
    } else {
      if (ch === '"') { inQuotes = true }
      else if (ch === ',') { row.push(cell); cell = '' }
      else if (ch === '\n' || ch === '\r') {
        if (cell.length || row.length) { row.push(cell); rows.push(row); row = []; cell = '' }
        // handle \r\n pairs
        if (ch === '\r' && input[i + 1] === '\n') i++
      } else { cell += ch }
    }
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row) }
  return rows
}

// Seed from local Turkish XLS (Altılı) if available
async function seedActivityCodesFromLocalXLS() {
  try {
    console.log('📄 Looking for local Turkish NACE Excel...')
    const envPath = process.env.NACE_TR_XLS_PATH
    const candidates = [
      envPath,
      path.join(process.env.USERPROFILE || '', 'Desktop', 'nacet-6-li-kod.xls'),
      path.join(process.env.HOME || '', 'Desktop', 'nacet-6-li-kod.xls'),
      path.join(process.cwd(), 'nacet-6-li-kod.xls'),
    ].filter(Boolean) as string[]
    let filePath: string | null = null
    for (const p of candidates) {
      try { if (fs.existsSync(p)) { filePath = p; break } } catch {}
    }
    if (!filePath) { console.log('ℹ️ Turkish XLS not found, skipping.'); return }

    if (!XLSX) {
      try {
        const mod: unknown = await import('xlsx')
        XLSX = (mod as { default?: typeof import('xlsx') }).default || (mod as typeof import('xlsx'))
      } catch (e) {
        console.warn('⚠️ Missing xlsx dependency, install with: npm i xlsx')
        return
      }
    }

    console.log('📥 Reading Excel:', filePath)
    const wb = XLSX.readFile(filePath)
    const wsName = wb.SheetNames[0]
    const ws = wb.Sheets[wsName]
    const rows: Array<Record<string, unknown>> = XLSX.utils.sheet_to_json(ws, { defval: '' }) as Array<Record<string, unknown>>
    // Try to detect columns
    const detect = (row: Record<string, unknown>) => {
      const keys = Object.keys(row)
      const codeKey = keys.find(k => /kod|code|nace/i.test(k)) || keys[0]
      const descKey = keys.find(k => /tanim|tanım|aciklama|açıklama|description|ad/i.test(k)) || keys[1] || keys[0]
      return { codeKey, descKey }
    }
    const { codeKey, descKey } = rows.length ? detect(rows[0]) : { codeKey: 'Kod', descKey: 'Açıklama' }

    let count = 0, updates = 0
    for (const r of rows) {
      const rawVal = r[codeKey] as string | number | undefined
      const descVal = r[descKey] as string | number | undefined
      let raw = String(rawVal || '').trim()
      const tr = String(descVal || '').trim()
      if (!raw || !tr) continue
      // Normalize codes: accept forms like 620101, 62.01.01, 62-01-01, etc.
      raw = raw.replace(/[^0-9]/g, '')
      if (raw.length < 4) continue
      const code4 = `${raw.slice(0,2)}.${raw.slice(2,4)}`
      const code6 = raw.length >= 6 ? `${raw.slice(0,2)}.${raw.slice(2,4)}.${raw.slice(4,6)}` : code4

      // Update Turkish name for 4-digit class
      try {
        await prisma.activitycode.upsert({
          where: { code: code4 },
          update: { name: tr, isActive: true },
          create: { code: code4, name: tr, isActive: true },
        })
        updates++
      } catch {}

      // Insert 6-digit subclass as separate record
      if (code6 !== code4) {
        try {
          await prisma.activitycode.upsert({
            where: { code: code6 },
            update: { name: tr, isActive: true },
            create: { code: code6, name: tr, isActive: true },
          })
          count++
        } catch {}
      }
    }
    console.log(`✅ Turkish Excel processed. Updated TR names: ${updates}, added subclasses: ${count}`)
  } catch (e) {
    console.warn('⚠️ Could not seed from Turkish XLS:', e instanceof Error ? e.message : e)
  }
}
