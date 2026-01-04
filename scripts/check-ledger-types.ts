
import { prisma } from '../src/lib/db'

async function checkLedgerTypes() {
  try {
    const types = await prisma.customer.groupBy({
      by: ['ledgerType'],
      _count: true
    })
    console.log('Ledger Types:', types)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkLedgerTypes()
