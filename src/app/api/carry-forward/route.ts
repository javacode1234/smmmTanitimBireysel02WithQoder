import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { randomUUID } from 'crypto'

// Carry forward balances from one period to the next
export async function POST(request: NextRequest) {
  try {
    const { customerId, fromYear, toYear } = await request.json()
    
    if (!customerId || !fromYear || !toYear) {
      return NextResponse.json(
        { error: 'Müşteri ID, kaynak yıl ve hedef yıl gereklidir' },
        { status: 400 }
      )
    }
    
    // Find the source period
    const fromPeriod = await prisma.accountingperiod.findFirst({
      where: {
        customerId,
        year: fromYear
      }
    })
    
    if (!fromPeriod) {
      return NextResponse.json(
        { error: `${fromYear} yılı için muhasebe dönemi bulunamadı` },
        { status: 404 }
      )
    }
    
    // Find or create the target period
    let toPeriod = await prisma.accountingperiod.findFirst({
      where: {
        customerId,
        year: toYear
      }
    })
    
    if (!toPeriod) {
      const startDate = new Date(toYear, 0, 1) // January 1st
      const endDate = new Date(toYear, 11, 31) // December 31st
      
      toPeriod = await prisma.accountingperiod.create({
        data: {
          id: randomUUID(),
          customer: { connect: { id: customerId } },
          year: toYear,
          startDate,
          endDate,
          updatedAt: new Date()
        }
      })
    }
    
    // Calculate the total balance from the source period
    // This would be the sum of all unpaid accruals
    const unpaidAccruals = await prisma.subscriptionaccrual.findMany({
      where: {
        customerId,
        accountingPeriodId: fromPeriod.id,
        isPaid: false
      },
      select: {
        id: true,
        amount: true,
        carryForwardAmount: true
      }
    })
    
    // Calculate total unpaid amount
    let totalUnpaid = 0
    for (const accrual of unpaidAccruals) {
      totalUnpaid += Number(accrual.amount) - Number(accrual.carryForwardAmount)
    }
    
    // Update accruals to mark them as carried forward
    const updatedAccruals = []
    for (const accrual of unpaidAccruals) {
      const accrualTotal = Number(accrual.amount)
      
      const updated = await prisma.subscriptionaccrual.update({
        where: {
          id: accrual.id
        },
        data: {
          carryForwardAmount: accrualTotal,
          carryForwardToPeriodId: toPeriod.id
        }
      })
      
      updatedAccruals.push(updated)
    }
    
    // Create a new accrual in the target period for the carried forward balance
    let carryForwardAccrual = null
    if (totalUnpaid > 0) {
      carryForwardAccrual = await prisma.subscriptionaccrual.create({
        data: {
          id: randomUUID(),
          customerId,
          accountingPeriodId: toPeriod.id,
          amount: totalUnpaid,
          dueDate: new Date(toYear, 0, 28), // Due at the end of January
          description: `${fromYear} yılından devreden bakiye`,
          carryForwardAmount: 0,
          updatedAt: new Date()
        }
      })
    }
    
    // Update the source period status to CLOSED
    await prisma.accountingperiod.update({
      where: {
        id: fromPeriod.id
      },
      data: {
        status: 'CLOSED'
      }
    })
    
    return NextResponse.json({
      message: 'Bakiye devir işlemi başarıyla tamamlandı',
      carriedForwardAmount: totalUnpaid,
      fromPeriod: fromYear,
      toPeriod: toYear,
      carryForwardAccrual: carryForwardAccrual?.id || null
    })
    
  } catch (error) {
    console.error('Error carrying forward balances:', error)
    return NextResponse.json(
      { error: 'Bakiye devir işlemi sırasında hata oluştu' },
      { status: 500 }
    )
  }
}

// Get carry forward information for a customer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Müşteri ID gereklidir' },
        { status: 400 }
      )
    }
    
    // Get the latest accounting period
    const latestPeriod = await prisma.accountingperiod.findFirst({
      where: { customerId },
      orderBy: { year: 'desc' }
    })
    
    if (!latestPeriod) {
      return NextResponse.json({
        hasCarryForward: false,
        message: 'Henüz bakiye devri yapılmamış'
      })
    }
    
    // Check if there are any accruals that have been carried forward
    const carriedForwardAccruals = await prisma.subscriptionaccrual.findMany({
      where: { accountingPeriodId: latestPeriod.id, carryForwardToPeriodId: { not: null } }
    })
    
    return NextResponse.json({
      hasCarryForward: carriedForwardAccruals.length > 0,
      period: latestPeriod.year,
      carriedForwardCount: carriedForwardAccruals.length
    })
    
  } catch (error) {
    console.error('Error checking carry forward status:', error)
    return NextResponse.json(
      { error: 'Bakiye devri durumu kontrol edilirken hata oluştu' },
      { status: 500 }
    )
  }
}
