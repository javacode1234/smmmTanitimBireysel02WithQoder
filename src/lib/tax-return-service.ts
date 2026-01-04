import { prisma } from "@/lib/db"
import { Customer, customerdeclarationsetting } from "@prisma/client"
import crypto from "crypto"

export async function generateHistoricalTaxReturns(customerId?: string) {
  // 1. Get customers (all or single)
  const whereClause: any = { status: 'ACTIVE' }
  if (customerId) {
    whereClause.id = customerId
  }

  const customers = await prisma.customer.findMany({
    where: whereClause,
    include: {
      customerdeclarationsetting: {
        where: { enabled: true }
      }
    }
  })

  // 2. Pre-fetch existing tax returns to minimize DB queries in loop
  // We only need customerId, type, period to check existence
  const existingReturns = await prisma.taxreturn.findMany({
    where: customerId ? { customerId } : {},
    select: {
      customerId: true,
      type: true,
      period: true
    }
  })

  // Create a Set for fast lookup: "customerId|type|period"
  const existingSet = new Set(
    existingReturns.map(r => `${r.customerId}|${r.type}|${r.period}`)
  )

  const newReturns: any[] = []
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 1-12

  // 3. Iterate customers
  for (const customer of customers) {
    if (!customer.establishmentDate) continue
    
    const estDate = new Date(customer.establishmentDate)
    const startYear = estDate.getFullYear()
    const startMonth = estDate.getMonth() + 1

    // Iterate months from establishment until now + 1 month
    // Limit to reasonable past (e.g. 2020) if establishment is ancient? 
    // User said "establishment date", so we respect it.
    
    let iterYear = startYear
    let iterMonth = startMonth

    while (true) {
      // Break if we are past current month
      if (iterYear > currentYear || (iterYear === currentYear && iterMonth > currentMonth)) {
        break
      }

      // Process for this month (iterYear, iterMonth)
      for (const setting of customer.customerdeclarationsetting) {
        processSettingForDateInMemory(customer, setting, iterYear, iterMonth, existingSet, newReturns)
      }

      // Next month
      iterMonth++
      if (iterMonth > 12) {
        iterMonth = 1
        iterYear++
      }
    }
  }

  // 4. Bulk create
  if (newReturns.length > 0) {
    // SQLite has limits on variables, but prisma handles createMany well usually.
    // If huge, might need chunking. Assuming reasonable size here.
    const CHUNK_SIZE = 100
    for (let i = 0; i < newReturns.length; i += CHUNK_SIZE) {
      const chunk = newReturns.slice(i, i + CHUNK_SIZE)
      await prisma.taxreturn.createMany({
        data: chunk
      })
    }
  }

  return { created: newReturns.length }
}

function processSettingForDateInMemory(
  customer: Customer,
  setting: customerdeclarationsetting,
  dueYear: number,
  dueMonth: number,
  existingSet: Set<string>,
  newReturns: any[]
) {
  const { frequency, quarterOffset, dueDay, quarters, type } = setting
  const offset = quarterOffset || 0
  const day = dueDay || 26
  
  let selectedPeriods: number[] = []
  try {
    selectedPeriods = quarters ? JSON.parse(quarters) : []
  } catch (e) { return }

  if (selectedPeriods.length === 0) return

  // Logic copied from generateTaxReturnsForDuePeriod but pushing to newReturns array
  if (frequency === 'MONTHLY') {
    const absDue = dueYear * 12 + dueMonth
    const absPeriod = absDue - offset
    
    const pYear = Math.floor((absPeriod - 1) / 12)
    const pMonth = ((absPeriod - 1) % 12) + 1
    
    if (selectedPeriods.includes(pMonth)) {
      const periodKey = `${pYear}-${pMonth.toString().padStart(2, '0')}`
      addReturnIfMissing(customer, type, periodKey, pYear, pMonth, dueYear, dueMonth, day, existingSet, newReturns)
    }

  } else if (frequency === 'QUARTERLY') {
    for (const q of selectedPeriods) {
      for (let pYear = dueYear - 1; pYear <= dueYear; pYear++) {
        const qEndMonth = q * 3
        const absPeriodEnd = pYear * 12 + qEndMonth
        const absDue = absPeriodEnd + offset
        
        const calcDueYear = Math.floor((absDue - 1) / 12)
        const calcDueMonth = ((absDue - 1) % 12) + 1
        
        if (calcDueYear === dueYear && calcDueMonth === dueMonth) {
          const periodKey = `${pYear}-Q${q}`
          addReturnIfMissing(customer, type, periodKey, pYear, null, dueYear, dueMonth, day, existingSet, newReturns)
        }
      }
    }
  } else if (frequency === 'YEARLY') {
    const settingDueMonth = setting.dueMonth
    if (settingDueMonth && settingDueMonth === dueMonth) {
      const pYear = dueYear - 1
      const periodKey = `${pYear}`
      addReturnIfMissing(customer, type, periodKey, pYear, null, dueYear, dueMonth, day, existingSet, newReturns)
    }
  }
}

function addReturnIfMissing(
  customer: Customer,
  type: string,
  period: string,
  year: number,
  month: number | null,
  dueYear: number,
  dueMonth: number,
  dueDay: number,
  existingSet: Set<string>,
  newReturns: any[]
) {
  // Check establishment date
  if (customer.establishmentDate) {
    const estDate = new Date(customer.establishmentDate)
    
    // Check if period is valid for establishment
    // Logic: If period year < est year, invalid.
    if (year < estDate.getFullYear()) return
    if (year === estDate.getFullYear() && month !== null) {
      if (month < estDate.getMonth() + 1) return
    }
  }

  const key = `${customer.id}|${type}|${period}`
  if (existingSet.has(key)) return

  // Add to newReturns
  const dueDate = new Date(dueYear, dueMonth - 1, dueDay)
  
  newReturns.push({
    id: crypto.randomUUID(),
    customerId: customer.id,
    type: type,
    period: period,
    year: year,
    month: month,
    dueDate: dueDate,
    isSubmitted: false,
    updatedAt: new Date(),
    createdAt: new Date() // Explicitly set createdAt
  })
  
  // Add to set to prevent duplicates within same batch
  existingSet.add(key)
}

export async function generateTaxReturnsForDuePeriod(dueYear: number, dueMonth: number) {
  // 1. Get all active customers with their declaration settings
  const customers = await prisma.customer.findMany({
    where: { status: 'ACTIVE' },
    include: {
      customerdeclarationsetting: {
        where: { enabled: true }
      }
    }
  })

  const results = {
    created: 0,
    skipped: 0,
    errors: 0
  }

  for (const customer of customers) {
    for (const setting of customer.customerdeclarationsetting) {
      try {
        await processSettingForDate(customer, setting, dueYear, dueMonth, results)
      } catch (e) {
        console.error(`Error processing setting ${setting.id} for customer ${customer.id}:`, e)
        results.errors++
      }
    }
  }

  return results
}

async function processSettingForDate(
  customer: Customer,
  setting: customerdeclarationsetting,
  dueYear: number,
  dueMonth: number,
  results: { created: number; skipped: number; errors: number }
) {
  const { frequency, quarterOffset, dueDay, quarters, type } = setting
  const offset = quarterOffset || 0
  const day = dueDay || 26 // Default to 26th if not set
  
  // Parse quarters (stored as string "[1,2,3]")
  let selectedPeriods: number[] = []
  try {
    selectedPeriods = quarters ? JSON.parse(quarters) : []
  } catch (e) {
    // If parse fails, assume empty
    return
  }

  if (selectedPeriods.length === 0) return

  // Calculate the target due date object to compare
  // We are looking for declarations that have a due date in (dueYear, dueMonth)

  if (frequency === 'MONTHLY') {
    // Logic: Period Month + Offset = Due Month
    // So: Period Month = Due Month - Offset
    
    // Calculate absolute months to handle year crossing easily
    // Abs Due = dueYear * 12 + dueMonth
    // Abs Period = Abs Due - offset
    
    const absDue = dueYear * 12 + dueMonth
    const absPeriod = absDue - offset
    
    const pYear = Math.floor((absPeriod - 1) / 12)
    const pMonth = ((absPeriod - 1) % 12) + 1
    
    // Check if this period month is selected in settings
    if (selectedPeriods.includes(pMonth)) {
      const periodKey = `${pYear}-${pMonth.toString().padStart(2, '0')}`
      await createTaxReturnIfNotExists(customer, type, periodKey, pYear, pMonth, dueYear, dueMonth, day, results)
    }

  } else if (frequency === 'QUARTERLY') {
    // Logic: Quarter End Month + Offset = Due Month
    // Quarters: 1 (Ends 3), 2 (Ends 6), 3 (Ends 9), 4 (Ends 12)
    
    for (const q of selectedPeriods) {
      // Try to match this quarter for current or previous year
      // Usually Quarter 4 (ends Dec) due in next year
      
      // Iterate potential Period Years (DueYear - 1, DueYear)
      for (let pYear = dueYear - 1; pYear <= dueYear; pYear++) {
        const qEndMonth = q * 3
        const absPeriodEnd = pYear * 12 + qEndMonth
        const absDue = absPeriodEnd + offset
        
        const calcDueYear = Math.floor((absDue - 1) / 12)
        const calcDueMonth = ((absDue - 1) % 12) + 1
        
        if (calcDueYear === dueYear && calcDueMonth === dueMonth) {
          const periodKey = `${pYear}-Q${q}`
          await createTaxReturnIfNotExists(customer, type, periodKey, pYear, null, dueYear, dueMonth, day, results)
        }
      }
    }
  } else if (frequency === 'YEARLY') {
    // Logic: Due Month is fixed in settings (e.g. March or April)
    // If requested dueMonth matches setting.dueMonth
    
    const settingDueMonth = setting.dueMonth
    if (settingDueMonth && settingDueMonth === dueMonth) {
      // Period is usually Previous Year
      const pYear = dueYear - 1
      const periodKey = `${pYear}`
      
      // Check if establishment date allows this
      // If established in pYear or before
      
      await createTaxReturnIfNotExists(customer, type, periodKey, pYear, null, dueYear, dueMonth, day, results)
    }
  }
}

async function createTaxReturnIfNotExists(
  customer: Customer,
  type: string,
  period: string,
  year: number,
  month: number | null,
  dueYear: number,
  dueMonth: number,
  dueDay: number,
  results: { created: number; skipped: number; errors: number }
) {
  // Check establishment date
  if (customer.establishmentDate) {
    const estDate = new Date(customer.establishmentDate)
    const periodStartDate = getPeriodStartDate(year, month, period)
    
    // If period starts before establishment, skip?
    // Or if period ends before establishment?
    // Let's say if period END date is before establishment, definitely skip.
    // If establishment is in the middle of period, usually we still file.
    
    // Simplified: If period year < establishment year, skip.
    if (year < estDate.getFullYear()) {
      results.skipped++
      return
    }
    // If same year, check month
    if (year === estDate.getFullYear() && month !== null) {
      if (month < estDate.getMonth() + 1) {
        results.skipped++
        return
      }
    }
  }

  // Check if exists
  const existing = await prisma.taxreturn.findFirst({
    where: {
      customerId: customer.id,
      type: type,
      period: period
    }
  })

  if (existing) {
    // Check if due date needs update?
    // Maybe better not to touch existing records to preserve manual edits.
    results.skipped++
    return
  }

  // Create
  const dueDate = new Date(dueYear, dueMonth - 1, dueDay)
  // Adjust for weekends? usually handled by logic, but for now simple date.
  // Actually, standard tax calendar handles weekends, but for automation base date is fine.
  
  await prisma.taxreturn.create({
    data: {
      id: crypto.randomUUID(),
      customerId: customer.id,
      type: type,
      period: period,
      year: year,
      month: month,
      dueDate: dueDate,
      isSubmitted: false,
      updatedAt: new Date()
    }
  })
  
  results.created++
}

function getPeriodStartDate(year: number, month: number | null, period: string): Date {
  if (month !== null) {
    return new Date(year, month - 1, 1)
  }
  if (period.includes('Q')) {
    const q = parseInt(period.split('Q')[1])
    return new Date(year, (q - 1) * 3, 1)
  }
  // Yearly
  return new Date(year, 0, 1)
}
