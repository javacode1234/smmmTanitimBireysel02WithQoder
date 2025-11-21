import { PrismaClient, Prisma } from '@prisma/client'
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
    await prisma.taxOffice.createMany({
      data: [
        { id: 'tax-ist-anadolu', name: 'İstanbul Anadolu VDB', city: 'İstanbul', district: 'Anadolu' },
        { id: 'tax-ist-avrupa', name: 'İstanbul Avrupa VDB', city: 'İstanbul', district: 'Avrupa' },
        { id: 'tax-ankara', name: 'Ankara VDB', city: 'Ankara', district: 'Merkez' },
        { id: 'tax-izmir', name: 'İzmir VDB', city: 'İzmir', district: 'Merkez' },
      ],
      skipDuplicates: true,
    })
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
  ] as Prisma.DeclarationconfigCreateInput[]
  for (const d of defaults) {
    await prisma.declarationconfig.upsert({
      where: { type: d.type },
      update: {},
      create: d,
    })
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
