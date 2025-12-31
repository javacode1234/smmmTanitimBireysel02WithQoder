import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'node:crypto'

// Generate monthly subscription accruals for all active customers
export async function POST() {
  try {
    // Get the current date to determine which month to generate accruals for
    const now = new Date()
    const targetYear = now.getFullYear()
    
    // Get all active customers with subscription fees
    const customers = await prisma.customer.findMany({
      where: {
        status: 'ACTIVE',
        subscriptionFee: {
          not: null
        }
      },
      select: {
        id: true,
        companyName: true,
        subscriptionFee: true,
        establishmentDate: true
      }
    })
    
    const createdAccruals = []
    
    // For each customer, create monthly accruals from establishment date onwards
    for (const customer of customers) {
      // Skip if no establishment date
      if (!customer.establishmentDate) continue
      
      const establishmentDate = new Date(customer.establishmentDate)
      const establishmentYear = establishmentDate.getFullYear()
      const establishmentMonth = establishmentDate.getMonth() // 0-indexed
      
      // Generate accruals from establishment date to current date
      for (let year = establishmentYear; year <= targetYear; year++) {
        // Determine start and end months for this year
        const startMonth = (year === establishmentYear) ? establishmentMonth : 0 // January
        const endMonth = (year === targetYear) ? now.getMonth() : 11 // December or current month
        
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
        
        // Parse the subscription fee (remove currency symbol and convert to number)
        const feeAmount = parseFloat(customer.subscriptionFee!.replace('₺', '').replace(',', '.'))
        
        if (isNaN(feeAmount) || feeAmount <= 0) continue
        
        // Generate accruals for each month in the range
        for (let month = startMonth; month <= endMonth; month++) {
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
            // Create the accrual for this month (due at the end of the month)
            const dueDate = new Date(year, month, 28) // Due at the end of the month
            
            const accrual = await prisma.subscriptionaccrual.create({
              data: {
                id: crypto.randomUUID(),
                customerId: customer.id,
                accountingPeriodId: accountingPeriod.id,
                amount: feeAmount,
                dueDate,
                description: `${year} ${getTurkishMonthName(month + 1)} ayı aidatı`,
                updatedAt: new Date()
              }
            })
            
            createdAccruals.push({
              customerId: customer.id,
              companyName: customer.companyName,
              accrualId: accrual.id,
              amount: feeAmount,
              dueDate: accrual.dueDate
            })
          }
        }
      }
    }
    
    return NextResponse.json({
      message: 'Aidat tahakkukları başarıyla oluşturuldu',
      count: createdAccruals.length,
      accruals: createdAccruals
    })
    
  } catch (error) {
    console.error('Error generating subscription accruals:', error)
    return NextResponse.json(
      { error: 'Aidat tahakkukları oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}

// Get Turkish month name
function getTurkishMonthName(month: number): string {
  const months = [
    '', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]
  return months[month] || ''
}

// Get subscription accruals for a specific customer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const year = searchParams.get('year')
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Müşteri ID gereklidir' },
        { status: 400 }
      )
    }
    
    // If year parameter is "all", get all accruals for the customer
    if (year === "all") {
      const accruals = await prisma.subscriptionaccrual.findMany({
        where: {
          customerId
        },
        orderBy: {
          dueDate: 'asc'
        },
        // no include to avoid type issues; client uses fields from accruals
      })
      
      return NextResponse.json(accruals)
    }
    
    const targetYear = year ? parseInt(year) : new Date().getFullYear()
    const ap = await prisma.accountingperiod.findFirst({ where: { customerId, year: targetYear } })
    const accruals = ap
      ? await prisma.subscriptionaccrual.findMany({
          where: { customerId, accountingPeriodId: ap.id },
          orderBy: { dueDate: 'asc' }
        })
      : []
    
    return NextResponse.json(accruals)
  } catch (error) {
    console.error('Error fetching subscription accruals:', error)
    return NextResponse.json(
      { error: 'Aidat tahakkukları getirilirken hata oluştu' },
      { status: 500 }
    )
  }
}

// Generate accruals for a specific customer from establishment date
export async function PUT(request: NextRequest) {
  try {
    const { customerId } = await request.json()
    
    console.log('Generating accruals for customer:', customerId)
    
    if (!customerId) {
      console.log('Customer ID is missing')
      return NextResponse.json(
        { error: 'Müşteri ID gereklidir' },
        { status: 400 }
      )
    }
    
    // Get the customer with establishment date
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        companyName: true,
        subscriptionFee: true,
        establishmentDate: true
      }
    })
    
    console.log('Customer data:', JSON.stringify(customer, null, 2))
    
    if (!customer) {
      console.log('Customer not found')
      return NextResponse.json(
        { error: 'Müşteri bulunamadı' },
        { status: 404 }
      )
    }
    
    if (!customer.subscriptionFee || !customer.establishmentDate) {
      console.log('Missing subscription fee or establishment date')
      return NextResponse.json(
        { error: 'Müşterinin aidat bilgisi veya kuruluş tarihi eksik' },
        { status: 400 }
      )
    }
    
    const createdAccruals = []
    const establishmentDate = new Date(customer.establishmentDate)
    const establishmentYear = establishmentDate.getFullYear()
    const establishmentMonth = establishmentDate.getMonth() // 0-indexed
    const now = new Date()
    const targetYear = now.getFullYear()
    
    console.log('Establishment date:', establishmentDate)
    console.log('Target year:', targetYear)
    
    // Generate accruals from establishment date to current date
    for (let year = establishmentYear; year <= targetYear; year++) {
      // Determine start and end months for this year
      const startMonth = (year === establishmentYear) ? establishmentMonth : 0 // January
      const endMonth = (year === targetYear) ? now.getMonth() : 11 // December or current month
      
      console.log(`Processing year ${year}: months ${startMonth} to ${endMonth}`)
      
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
        
        console.log(`Creating accounting period for year ${year}`)
        
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
      
      // Parse the subscription fee (remove currency symbol and convert to number)
      const feeAmount = parseFloat(customer.subscriptionFee!.replace('₺', '').replace(',', '.'))
      
      console.log('Fee amount:', feeAmount)
      
      if (isNaN(feeAmount) || feeAmount <= 0) {
        console.log('Invalid fee amount')
        continue
      }
      
      // Generate accruals for each month in the range
      for (let month = startMonth; month <= endMonth; month++) {
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
          // Create the accrual for this month (due at the end of the month)
          const dueDate = new Date(year, month, 28) // Due at the end of the month
          
          console.log(`Creating accrual for ${year}-${month + 1}: amount ${feeAmount}`)
          
          const accrual = await prisma.subscriptionaccrual.create({
            data: {
              id: crypto.randomUUID(),
              customerId: customer.id,
              accountingPeriodId: accountingPeriod.id,
              amount: feeAmount,
              dueDate,
              description: `${year} ${getTurkishMonthName(month + 1)} ayı aidatı`,
              updatedAt: new Date()
            }
          })
          
          createdAccruals.push({
            customerId: customer.id,
            companyName: customer.companyName,
            accrualId: accrual.id,
            amount: feeAmount,
            dueDate: accrual.dueDate
          })
        }
      }
    }
    
    console.log('Successfully created accruals:', createdAccruals.length)
    
    return NextResponse.json({
      message: 'Aidat tahakkukları başarıyla oluşturuldu',
      count: createdAccruals.length,
      accruals: createdAccruals
    })
    
  } catch (error: unknown) {
    console.error('Error generating subscription accruals:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Aidat tahakkukları oluşturulurken hata oluştu: ' + message },
      { status: 500 }
    )
  }
}

// Mark accrual as paid or update fields
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json() as { id?: string; isPaid?: boolean; paymentDate?: string }
    if (!data.id) {
      return NextResponse.json({ error: 'Tahakkuk ID gerekli' }, { status: 400 })
    }
    const updateData: Record<string, unknown> = {}
    if (typeof data.isPaid === 'boolean') updateData.isPaid = data.isPaid
    if (data.paymentDate) updateData.paymentDate = new Date(data.paymentDate)
    updateData.updatedAt = new Date()
    const updated = await prisma.subscriptionaccrual.update({ where: { id: data.id }, data: updateData })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating subscription accrual:', error)
    return NextResponse.json({ error: 'Tahakkuk güncellenemedi' }, { status: 500 })
  }
}
