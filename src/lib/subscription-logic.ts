
import { prisma } from '@/lib/db'
import crypto from 'node:crypto'

// Type definition for customer data needed for accrual generation
export type CustomerData = {
  id: string
  companyName: string | null
  subscriptionFee: string | null
  establishmentDate: Date | null
  serviceStartDate?: Date | null
  feeAccrualDay: number | null
}

// Helper to parse fee string safely handling both TR (1.000,00) and Standard (1000.00) formats
function parseFee(fee: string | null | undefined): number {
  if (!fee) return 0
  
  let cleanFee = fee.replace('₺', '').trim()
  
  // Check if it looks like TR format (contains comma)
  if (cleanFee.includes(',')) {
    // Remove dots (thousands), replace comma with dot
    cleanFee = cleanFee.replace(/\./g, '').replace(',', '.')
  } else {
    // If no comma, check if it has dots.
    // If it looks like "1.000", it could be 1000 or 1.0.
    // Usually if it has multiple dots, it's thousands separator.
    // If it has one dot, it could be decimal or thousands.
    // If it comes from DB/Input as number-string, "1000.50" is 1000.50.
    // If it comes from formatted display "1.000", it is 1000.
    
    // Heuristic: If there is exactly one dot and it is followed by 1 or 2 digits, treat as decimal?
    // Or just assume standard format if no comma?
    // But "1.000" is common for 1000 in TR.
    
    // Safest approach given the bug:
    // If we assume the input might be "1000.00" (standard), we should NOT remove dots.
    // But if we assume input is "1.000" (TR thousands), we SHOULD remove dots.
    
    // Let's rely on the context. If the input is from a "text" input formatted with masks, it's likely TR.
    // If it's from a "number" input, it's Standard.
    // Since we don't know, let's try to be smart.
    
    // If the string contains multiple dots, it's definitely thousands separators.
    if ((cleanFee.match(/\./g) || []).length > 1) {
       cleanFee = cleanFee.replace(/\./g, '')
    } else if (cleanFee.includes('.')) {
       // One dot. "1.000" vs "1000.50"
       // If the part after dot is 3 digits (e.g. 1.000), it's likely thousands.
       // If it is 2 digits (1000.50), it's likely decimal.
       const parts = cleanFee.split('.')
       if (parts[1].length === 3) {
          cleanFee = cleanFee.replace(/\./g, '')
       }
       // Else leave it as is (1000.50 -> 1000.50)
    }
  }
  
  const val = parseFloat(cleanFee)
  return isNaN(val) ? 0 : val
}

// Helper function to generate accruals for a customer
export async function generateAccrualsForCustomer(customer: CustomerData, verbose: boolean = false) {
  const createdAccruals = []
  
  // Determine start date for accruals
  // User request: use serviceStartDate if available, otherwise fallback to establishmentDate
  const startDateSource = customer.serviceStartDate || customer.establishmentDate

  // Skip if no start date
  if (!startDateSource) {
    if (verbose) console.log('Missing start date (service or establishment)')
    return []
  }

  const startDate = new Date(startDateSource)
  const startYear = startDate.getFullYear()
  const startMonthIndex = startDate.getMonth() // 0-indexed
  
  const now = new Date()
  const targetYear = now.getFullYear()
  
  if (verbose) {
    console.log('Start date for accruals:', startDate)
    console.log('Target year:', targetYear)
  }
  
  // Cleanup: Remove unpaid accruals before the start date
  // This ensures that if the service start date was moved forward, we don't keep old invalid accruals
  // This aligns with the rule: "dashboard statistics and calculations are based on service start date"
  if (verbose) console.log('Cleaning up unpaid accruals before start date...')
  await prisma.subscriptionaccrual.deleteMany({
    where: {
      customerId: customer.id,
      isPaid: false,
      dueDate: { lt: startDate }
    }
  })
  
  // Default customer fee
  const customerDefaultFee = parseFee(customer.subscriptionFee)
  
  // Generate accruals from start date to current date
  for (let year = startYear; year <= targetYear; year++) {
    // Determine start and end months for this year
    const startMonth = (year === startYear) ? startMonthIndex : 0 // January
    const endMonth = (year === targetYear) ? now.getMonth() : 11 // December or current month
    
    if (verbose) console.log(`Processing year ${year}: months ${startMonth} to ${endMonth}`)
    
    // Create accounting period if it doesn't exist
    let accountingPeriod = await prisma.accountingperiod.findFirst({
      where: {
        customerId: customer.id,
        year: year
      }
    })
    
    // If no accounting period exists, create one
    if (!accountingPeriod) {
      const startDate = new Date(year, 0, 1) // January 1st
      const endDate = new Date(year, 11, 31) // December 31st
      
      if (verbose) console.log(`Creating accounting period for year ${year}`)
      
      accountingPeriod = await prisma.accountingperiod.create({
        data: {
          id: crypto.randomUUID(),
          customer: { connect: { id: customer.id } },
          year: year,
          startDate,
          endDate,
          updatedAt: new Date()
        }
      })
    }
    
    // Determine Period Base Fee
    // If accountingPeriod has a specific monthlyFee, use it. Otherwise 0.
    const periodBaseFee = accountingPeriod.monthlyFee ? parseFee(accountingPeriod.monthlyFee) : 0
    
    // Determine Monthly Specific Fees Map
    let monthlyFeesMap: Record<string, string> = {}
    if (accountingPeriod.monthlyFees) {
        try {
            monthlyFeesMap = typeof accountingPeriod.monthlyFees === 'string' 
                ? JSON.parse(accountingPeriod.monthlyFees) 
                : accountingPeriod.monthlyFees
        } catch {}
    }
    
    // Generate accruals for each month in the range
    for (let month = startMonth; month <= endMonth; month++) {
      // Determine effective fee for this month
      let effectiveFee = 0
      
      // 1. Check specific month fee in period settings
      // monthlyFees keys are usually "1", "2"... "12"
      const monthKey = String(month + 1)
      if (monthlyFeesMap[monthKey]) {
        effectiveFee = parseFee(monthlyFeesMap[monthKey])
      }
      // 2. If no specific month fee, use period base fee
      else if (periodBaseFee > 0) {
        effectiveFee = periodBaseFee
      }
      // 3. If no period fee, use customer default subscription fee
      else if (customerDefaultFee > 0) {
        effectiveFee = customerDefaultFee
      }
      
      if (effectiveFee <= 0) {
        if (verbose) console.log(`No fee found for ${year}-${month+1}, skipping`)
        continue
      }

      // Check if an accrual already exists for this customer and month
      const existingAccrual = await prisma.subscriptionaccrual.findFirst({
        where: {
          customerId: customer.id,
          accountingPeriodId: accountingPeriod.id,
          dueDate: {
            gte: new Date(year, month, 1),
            lt: new Date(year, month + 1, 1)
          }
        }
      })
      
      // If no accrual exists, create one
      if (!existingAccrual) {
        // Create the accrual for this month
        // Use feeAccrualDay if available, otherwise default to 1st of month (or user logic)
        const accrualDay = (accountingPeriod.feeAccrualDay) || (customer.feeAccrualDay) || 1
        const lastDayOfMonth = new Date(year, month + 1, 0).getDate()
        const day = Math.min(accrualDay, lastDayOfMonth)
        const dueDate = new Date(year, month, day)
        
        if (verbose) console.log(`Creating accrual for ${year}-${month + 1}: amount ${effectiveFee} due ${dueDate.toISOString().split('T')[0]}`)
        
        const accrual = await prisma.subscriptionaccrual.create({
          data: {
            id: crypto.randomUUID(),
            customerId: customer.id,
            accountingPeriodId: accountingPeriod.id,
            amount: effectiveFee,
            dueDate,
            description: `${year} ${getTurkishMonthName(month + 1)} ayı aidatı`,
            updatedAt: new Date()
          }
        })
        
        createdAccruals.push({
          customerId: customer.id,
          companyName: customer.companyName,
          accrualId: accrual.id,
          amount: effectiveFee,
          dueDate: accrual.dueDate
        })
      }
    }
  }
  
  return createdAccruals
}

// Get Turkish month name
export function getTurkishMonthName(month: number): string {
  const months = [
    '', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]
  return months[month] || ''
}
