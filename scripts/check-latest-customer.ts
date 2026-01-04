
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkLatestCustomer() {
  try {
    const customer = await prisma.customer.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        subscriptionaccrual: true
      }
    })

    if (!customer) {
      console.log('No customer found')
      return
    }

    console.log('Latest Customer:', {
        id: customer.id,
        name: customer.companyName,
        ledgerType: customer.ledgerType,
        subscriptionFee: customer.subscriptionFee,
        establishmentDate: customer.establishmentDate, // Add this
        createdAt: customer.createdAt,
      accrualCount: customer.subscriptionaccrual.length,
      accruals: customer.subscriptionaccrual.map(a => ({
        id: a.id,
        amount: a.amount,
        dueDate: a.dueDate,
        isPaid: a.isPaid
      }))
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkLatestCustomer()
