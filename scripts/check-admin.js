const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('--- KULLANICI KONTROLÜ ---')
  
  // 1. User tablosundaki kullanıcılar
  try {
    const users = await prisma.user.findMany()
    console.log(`User Tablosu (${users.length} kayıt):`)
    users.forEach(u => {
      console.log(`- ID: ${u.id}`)
      console.log(`  Email: ${u.email}`)
      console.log(`  Role: ${u.role}`)
      console.log(`  Name: ${u.name}`)
      console.log('---')
    })
  } catch (error) {
    console.error("User tablosu okunurken hata:", error.message)
  }

  // 2. Customer tablosundaki yetkili e-postalar
  try {
    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { authorizedEmail: { not: null } },
          { username: { not: null } }
        ]
      },
      select: {
        companyName: true,
        authorizedEmail: true,
        username: true
      }
    })
    console.log(`\nMüşteri Giriş Bilgileri (${customers.length} kayıt):`)
    customers.forEach(c => {
      console.log(`- Firma: ${c.companyName}`)
      console.log(`  Email: ${c.authorizedEmail}`)
      console.log(`  Kullanıcı Adı: ${c.username}`)
      console.log('---')
    })
  } catch (error) {
    console.error("Customer tablosu okunurken hata:", error.message)
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
