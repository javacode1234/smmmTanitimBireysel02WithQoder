import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import AccountSummaryClient from "./account-summary-client"

export default async function AccountSummaryPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Fetch customer
  const customer = await prisma.customer.findUnique({
    where: { id: session.user.id },
    include: {
      subscriptionaccrual: { orderBy: { dueDate: 'desc' } }
    }
  })

  if (!customer) {
    redirect("/auth/signin")
  }

  // Parse Manual Transactions
  const manualTransactions = (JSON.parse((customer.transactions as string) || "[]") as any[]).map((t: any) => ({
    ...t,
    debit: (t.type === 'DEBT' || t.type === 'OPENING_DEBT') ? Number(t.amount) : (t.debit ? Number(t.debit) : 0),
    credit: (t.type === 'CREDIT' || t.type === 'OPENING_CREDIT') ? Number(t.amount) : (t.credit ? Number(t.credit) : 0),
  }))

  // Process Subscription Accruals
  const accrualTransactions = (customer.subscriptionaccrual || []).flatMap((accrual: any) => {
    const items = []
    
    // 1. Accrual
    items.push({
      date: accrual.dueDate,
      description: accrual.description || "Aidat Tahakkuku",
      debit: Number(accrual.amount),
      credit: 0,
      type: 'accrual',
      id: accrual.id
    })
    
    // 2. Payment
    if (accrual.isPaid) {
      items.push({
        date: accrual.paymentDate || accrual.updatedAt,
        description: (accrual.description || "Aidat") + " Ödemesi",
        debit: 0,
        credit: Number(accrual.amount),
        type: 'payment',
        id: accrual.id + '_payment'
      })
    }
    
    return items
  })

  // Opening Balance
  const openingBalance = Number(customer.openingBalance || 0)
  const openingTransaction = openingBalance !== 0 ? [{
    date: customer.establishmentDate || customer.createdAt,
    description: "Açılış İşlemi",
    debit: openingBalance > 0 ? openingBalance : 0,
    credit: openingBalance < 0 ? Math.abs(openingBalance) : 0,
    type: 'opening',
    id: 'opening_balance'
  }] : []

  // Merge and Sort (Oldest First for Balance Calculation)
  const allTransactions = [...openingTransaction, ...manualTransactions, ...accrualTransactions].sort((a: any, b: any) => {
    if (a.type === 'opening') return -1
    if (b.type === 'opening') return 1
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateA - dateB
  })

  // Calculate Running Balance
  let runningBalance = 0
  const transactionsWithBalance = allTransactions.map((t: any) => {
    const debit = Number(t.debit || 0)
    const credit = Number(t.credit || 0)
    runningBalance += debit - credit
    return { 
      ...t, 
      balance: runningBalance,
      // Ensure date is string for serialization
      date: new Date(t.date).toISOString() 
    }
  })

  return (
    <AccountSummaryClient 
      transactions={transactionsWithBalance} 
      customerName={customer.companyName || "Müşteri"}
      openingBalance={openingBalance}
    />
  )
}
