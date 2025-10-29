import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Seed Job Applications
  console.log('📝 Seeding job applications...')
  await prisma.jobApplication.createMany({
    data: [
      {
        name: "Selin Akar",
        email: "selin@example.com",
        phone: "0555 111 2233",
        position: "Mali Müşavir Yardımcısı",
        experience: "3 yıl",
        education: "İktisat Fakültesi",
        coverLetter: "Muhasebe alanında 3 yıllık tecrübem ve SMMM sınavına hazırlanıyor olmam nedeniyle ekibinizde yer almak istiyorum.",
        cvFileName: "selin_akar_cv.pdf",
        status: "NEW",
      },
      {
        name: "Murat Çelik",
        email: "murat@example.com",
        phone: "0532 444 5566",
        position: "Muhasebe Elemanı",
        experience: "5 yıl",
        education: "İşletme Fakültesi",
        coverLetter: "Şirketinizde muhasebe departmanında çalışmak ve kendimi geliştirmek istiyorum.",
        cvFileName: "murat_celik_cv.pdf",
        status: "REVIEWING",
      },
      {
        name: "Deniz Yılmaz",
        email: "deniz@example.com",
        phone: "0543 777 8899",
        position: "Stajyer",
        experience: "Yeni Mezun",
        education: "Muhasebe ve Finans Yönetimi",
        coverLetter: "Yeni mezun olarak pratik tecrübe kazanmak ve SMMM olma yolunda ilerlemek istiyorum.",
        cvFileName: "deniz_yilmaz_cv.pdf",
        status: "INTERVIEWED",
      },
      {
        name: "Ayşe Demir",
        email: "ayse.demir@example.com",
        phone: "0533 222 3344",
        position: "Mali Müşavir",
        experience: "8 yıl",
        education: "İktisat Fakültesi - Yüksek Lisans",
        coverLetter: "SMMM ruhsatına sahip, 8 yıllık tecrübeli bir mali müşavir olarak ekibinize katılmak istiyorum.",
        cvFileName: "ayse_demir_cv.pdf",
        status: "REJECTED",
      },
    ],
  })

  // Seed Quote Requests
  console.log('💼 Seeding quote requests...')
  await prisma.quoteRequest.createMany({
    data: [
      {
        name: "Ahmet Yılmaz",
        email: "ahmet@example.com",
        phone: "0555 123 4567",
        company: "ABC Teknoloji A.Ş.",
        serviceType: "Tam Tasdik",
        message: "Yıllık mali tablolarımız için tam tasdik hizmeti almak istiyoruz.",
        status: "PENDING",
      },
      {
        name: "Zeynep Kaya",
        email: "zeynep@example.com",
        phone: "0532 987 6543",
        company: "XYZ Danışmanlık Ltd.",
        serviceType: "Sınırlı Bağımsız Denetim",
        message: "Şirketimiz için sınırlı bağımsız denetim hizmeti talep ediyoruz.",
        status: "REVIEWED",
      },
      {
        name: "Mehmet Öz",
        email: "mehmet@example.com",
        phone: "0543 456 7890",
        company: "Öz Gıda San. Tic.",
        serviceType: "Muhasebe Danışmanlığı",
        message: "Aylık muhasebe takibi ve beyanname hizmetleri için teklif almak istiyorum.",
        status: "CONTACTED",
      },
      {
        name: "Fatma Arslan",
        email: "fatma@example.com",
        phone: "0533 789 0123",
        company: "Arslan İnşaat",
        serviceType: "Vergi Danışmanlığı",
        message: "KDV ve kurumlar vergisi konusunda danışmanlık ihtiyacımız var.",
        status: "COMPLETED",
      },
    ],
  })

  // Seed Contact Messages
  console.log('📧 Seeding contact messages...')
  await prisma.contactMessage.createMany({
    data: [
      {
        name: "Ali Demir",
        email: "ali@example.com",
        phone: "0555 111 2222",
        subject: "Hizmetler Hakkında Bilgi",
        message: "SMMM hizmetleriniz hakkında detaylı bilgi almak istiyorum.",
        status: "NEW",
      },
      {
        name: "Ayşe Şahin",
        email: "ayse@example.com",
        phone: "0532 333 4444",
        subject: "Randevu Talebi",
        message: "Yeni kurduğumuz şirket için randevu almak istiyoruz.",
        status: "PENDING",
      },
      {
        name: "Mustafa Çelik",
        email: "mustafa@example.com",
        phone: "0543 555 6666",
        subject: "Fiyat Bilgisi",
        message: "Aylık muhasebe hizmetiniz için ücret bilgisi alabilir miyim?",
        status: "REPLIED",
      },
      {
        name: "Elif Yıldız",
        email: "elif@example.com",
        phone: "0533 777 8888",
        subject: "E-Fatura Sistemi",
        message: "E-fatura sistemine geçiş konusunda yardım alabilir miyiz?",
        status: "RESOLVED",
      },
    ],
  })

  console.log('✅ Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
