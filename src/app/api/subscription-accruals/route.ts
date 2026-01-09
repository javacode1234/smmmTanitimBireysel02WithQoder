import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'node:crypto'
import { generateAccrualsForCustomer, getTurkishMonthName } from '@/lib/subscription-logic'

// Generate monthly subscription accruals for all active customers
export async function POST() {
  try {
    // Get all active customers (fees might be in AccountingPeriod even if subscriptionFee is null)
    const customers = await prisma.customer.findMany({
      where: {
        status: 'ACTIVE'
      },
      select: {
        id: true,
        companyName: true,
        subscriptionFee: true,
        establishmentDate: true,
        serviceStartDate: true,
        feeAccrualDay: true
      }
    })
    
    let allCreatedAccruals: any[] = []
    
    // For each customer, create monthly accruals
    for (const customer of customers) {
      const accruals = await generateAccrualsForCustomer(customer, false)
      allCreatedAccruals = [...allCreatedAccruals, ...accruals]
    }
    
    return NextResponse.json({
      message: 'Aidat tahakkukları başarıyla oluşturuldu',
      count: allCreatedAccruals.length,
      accruals: allCreatedAccruals
    })
    
  } catch (error) {
    console.error('Error generating subscription accruals:', error)
    return NextResponse.json(
      { error: 'Aidat tahakkukları oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}

// Get Turkish month name (now imported from subscription-logic)
/*
function getTurkishMonthName(month: number): string {
  const months = [
    '', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]
  return months[month] || ''
}
*/

// Get subscription accruals for a specific customer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode')

    if (mode === 'stats') {
      try {
        const type = searchParams.get('type') // 'card' or 'chart'
        const now = new Date()
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth()

        if (type === 'chart') {
          // Calculate date range (last 12 months)
          const endDate = new Date(currentYear, currentMonth + 1, 1) // First day of next month
          const startDate = new Date(currentYear, currentMonth - 11, 1) // 11 months ago

          // Fetch all active customers to process count in memory
          const allCustomers = await prisma.customer.findMany({
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              serviceStartDate: true,
              establishmentDate: true,
              createdAt: true,
              transactions: true
            }
          })

          // Fetch all relevant accruals in the date range
          const allAccruals = await prisma.subscriptionaccrual.findMany({
            where: {
              dueDate: { gte: startDate, lt: endDate }
            },
            select: {
              amount: true,
              dueDate: true,
              customerId: true
            }
          })

          const chartData = []
          for (let i = 11; i >= 0; i--) {
            const date = new Date(currentYear, currentMonth - i, 1)
            const year = date.getFullYear()
            const month = date.getMonth()
            const monthStart = new Date(year, month, 1)
            const monthEnd = new Date(year, month + 1, 1)

            // Count customers active at this point in time
            const customerCount = allCustomers.filter(c => {
              const start = c.serviceStartDate || c.establishmentDate || c.createdAt
              return start < monthEnd
            }).length

            // Sum accruals for this month
            let accrualSum = 0
            for (const acc of allAccruals) {
              if (acc.dueDate >= monthStart && acc.dueDate < monthEnd) {
                const customer = allCustomers.find(c => c.id === acc.customerId)
                if (customer) {
                  const start = customer.serviceStartDate || customer.establishmentDate || customer.createdAt
                  if (acc.dueDate >= start) {
                    accrualSum += Number(acc.amount)
                  }
                }
              }
            }

            // Sum income for this month using Transactions (Cash Basis)
            let incomeSum = 0
            for (const customer of allCustomers) {
              if (customer.transactions) {
                try {
                  const transactions = JSON.parse(customer.transactions)
                  if (Array.isArray(transactions)) {
                    for (const t of transactions) {
                      if (t.type === 'CREDIT' && t.date) {
                        const tDate = new Date(t.date)
                        if (tDate >= monthStart && tDate < monthEnd) {
                           incomeSum += Number(t.amount)
                        }
                      }
                    }
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }

            chartData.push({
              name: date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }),
              customers: customerCount,
              accrual: accrualSum,
              income: incomeSum
            })
          }
          return NextResponse.json(chartData)
        }

        if (type === 'distribution') {
            const period = searchParams.get('period') || 'this-month'
            const basis = searchParams.get('basis') || 'cash' // 'cash' or 'accrual'
            const now = new Date()
            let startDate: Date, endDate: Date

            if (period === 'this-month') {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
            } else if (period === 'last-month') {
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                endDate = new Date(now.getFullYear(), now.getMonth(), 1)
            } else if (period === 'this-year') {
                startDate = new Date(now.getFullYear(), 0, 1)
                endDate = new Date(now.getFullYear() + 1, 0, 1)
            } else if (period === 'last-year') {
                startDate = new Date(now.getFullYear() - 1, 0, 1)
                endDate = new Date(now.getFullYear(), 0, 1)
            } else {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
            }

            const distribution: Record<string, number> = {}
            let total = 0

            if (basis === 'accrual') {
                // Accrual basis: Filter by due date, ignore payment status
                const accruals = await prisma.subscriptionaccrual.findMany({
                    where: {
                        dueDate: {
                            gte: startDate,
                            lt: endDate
                        }
                    },
                    include: {
                        customer: {
                            select: {
                                ledgerType: true,
                                companyClass: true,
                                serviceStartDate: true,
                                establishmentDate: true,
                                createdAt: true
                            }
                        }
                    }
                })

                for (const accrual of accruals) {
                    const c = accrual.customer
                    if (!c) continue

                    const start = c.serviceStartDate || c.establishmentDate || c.createdAt
                    if (accrual.dueDate < start) {
                        continue
                    }

                    let groupName = 'Diğer'
                    if (c.companyClass === 'SINIF_1') {
                        groupName = '1. Sınıf'
                    } else if (c.companyClass === 'SINIF_2') {
                        groupName = '2. Sınıf'
                    } else if (c.ledgerType) {
                        groupName = c.ledgerType
                    }

                    const amount = Number(accrual.amount)
                    
                    if (!distribution[groupName]) {
                        distribution[groupName] = 0
                    }
                    distribution[groupName] += amount
                    total += amount
                }
            } else {
                // Cash basis: Use Transactions
                // Fetch all customers (we need to filter transactions in memory)
                // Optimization: In a real app, transactions should be in a separate table.
                // Since they are JSON, we must fetch all customers.
                const allCustomers = await prisma.customer.findMany({
                    select: {
                        companyClass: true,
                        ledgerType: true,
                        transactions: true
                    }
                })

                for (const c of allCustomers) {
                    if (c.transactions) {
                        try {
                            const transactions = JSON.parse(c.transactions)
                            if (Array.isArray(transactions)) {
                                for (const t of transactions) {
                                    if (t.type === 'CREDIT' && t.date) {
                                        const tDate = new Date(t.date)
                                        if (tDate >= startDate && tDate < endDate) {
                                            let groupName = 'Diğer'
                                            if (c.companyClass === 'SINIF_1') {
                                                groupName = '1. Sınıf'
                                            } else if (c.companyClass === 'SINIF_2') {
                                                groupName = '2. Sınıf'
                                            } else if (c.ledgerType) {
                                                groupName = c.ledgerType
                                            }

                                            const amount = Number(t.amount)
                                            if (!distribution[groupName]) {
                                                distribution[groupName] = 0
                                            }
                                            distribution[groupName] += amount
                                            total += amount
                                        }
                                    }
                                }
                            }
                        } catch (e) {
                            // Ignore
                        }
                    }
                }
            }

            const result = Object.entries(distribution).map(([name, value]) => ({
                name,
                value
            })).sort((a, b) => b.value - a.value)

            return NextResponse.json({
                data: result,
                total
            })
        }

 
        
        // Card Stats
        // Date Ranges
        // now, currentYear, currentMonth are already defined at the top of the try block

        // Last Month
        const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1)
        const endOfLastMonth = new Date(currentYear, currentMonth, 1)
        
        // Two Months Ago (for monthly trend)
        const startOfTwoMonthsAgo = new Date(currentYear, currentMonth - 2, 1)
        const endOfTwoMonthsAgo = new Date(currentYear, currentMonth - 1, 1)

        // Last Year
        const startOfLastYear = new Date(currentYear - 1, 0, 1)
        const endOfLastYear = new Date(currentYear, 0, 1)

        // Two Years Ago (for yearly trend)
        const startOfTwoYearsAgo = new Date(currentYear - 2, 0, 1)
        const endOfTwoYearsAgo = new Date(currentYear - 1, 0, 1)

        // Helper to calculate income (Tahsilat)
        const calculateValidIncome = async (start: Date, end: Date) => {
            const payments = await prisma.subscriptionaccrual.findMany({
                where: {
                    isPaid: true,
                    paymentDate: {
                        gte: start,
                        lt: end
                    }
                },
                select: {
                    amount: true,
                    dueDate: true,
                    customer: {
                        select: {
                            serviceStartDate: true,
                            establishmentDate: true,
                            createdAt: true
                        }
                    }
                }
            })

            let sum = 0
            for (const payment of payments) {
                if (!payment.customer) continue
                const serviceStart = payment.customer.serviceStartDate || payment.customer.establishmentDate || payment.customer.createdAt
                if (payment.dueDate >= serviceStart) {
                    sum += Number(payment.amount)
                }
            }
            return sum
        }

        // Helper to calculate accrual (Tahakkuk)
        const calculateValidAccrual = async (start: Date, end: Date) => {
            const accruals = await prisma.subscriptionaccrual.findMany({
                where: {
                    dueDate: {
                        gte: start,
                        lt: end
                    }
                },
                select: {
                    amount: true,
                    dueDate: true,
                    customer: {
                        select: {
                            serviceStartDate: true,
                            establishmentDate: true,
                            createdAt: true
                        }
                    }
                }
            })

            let sum = 0
            for (const accrual of accruals) {
                if (!accrual.customer) continue
                const serviceStart = accrual.customer.serviceStartDate || accrual.customer.establishmentDate || accrual.customer.createdAt
                if (accrual.dueDate >= serviceStart) {
                    sum += Number(accrual.amount)
                }
            }
            return sum
        }

        // 1. Income Stats (Tahsilat)
        const lastMonthIncome = await calculateValidIncome(startOfLastMonth, endOfLastMonth)
        const twoMonthsAgoIncome = await calculateValidIncome(startOfTwoMonthsAgo, endOfTwoMonthsAgo)
        const lastYearIncome = await calculateValidIncome(startOfLastYear, endOfLastYear)
        const twoYearsAgoIncome = await calculateValidIncome(startOfTwoYearsAgo, endOfTwoYearsAgo)

        let incomeMonthlyGrowth = 0
        if (twoMonthsAgoIncome > 0) {
            incomeMonthlyGrowth = ((lastMonthIncome - twoMonthsAgoIncome) / twoMonthsAgoIncome) * 100
        } else if (lastMonthIncome > 0) {
            incomeMonthlyGrowth = 100
        }

        let incomeYearlyGrowth = 0
        if (twoYearsAgoIncome > 0) {
            incomeYearlyGrowth = ((lastYearIncome - twoYearsAgoIncome) / twoYearsAgoIncome) * 100
        } else if (lastYearIncome > 0) {
            incomeYearlyGrowth = 100
        }

        // 2. Accrual Stats (Tahakkuk)
        const lastMonthAccrual = await calculateValidAccrual(startOfLastMonth, endOfLastMonth)
        const twoMonthsAgoAccrual = await calculateValidAccrual(startOfTwoMonthsAgo, endOfTwoMonthsAgo)
        const lastYearAccrual = await calculateValidAccrual(startOfLastYear, endOfLastYear)
        const twoYearsAgoAccrual = await calculateValidAccrual(startOfTwoYearsAgo, endOfTwoYearsAgo)

        let accrualMonthlyGrowth = 0
        if (twoMonthsAgoAccrual > 0) {
            accrualMonthlyGrowth = ((lastMonthAccrual - twoMonthsAgoAccrual) / twoMonthsAgoAccrual) * 100
        } else if (lastMonthAccrual > 0) {
            accrualMonthlyGrowth = 100
        }

        let accrualYearlyGrowth = 0
        if (twoYearsAgoAccrual > 0) {
            accrualYearlyGrowth = ((lastYearAccrual - twoYearsAgoAccrual) / twoYearsAgoAccrual) * 100
        } else if (lastYearAccrual > 0) {
            accrualYearlyGrowth = 100
        }

        return NextResponse.json({
          incomeStats: {
            monthly: lastMonthIncome,
            yearly: lastYearIncome,
            monthlyGrowth: incomeMonthlyGrowth.toFixed(1),
            yearlyGrowth: incomeYearlyGrowth.toFixed(1)
          },
          accrualStats: {
            monthly: lastMonthAccrual,
            yearly: lastYearAccrual,
            monthlyGrowth: accrualMonthlyGrowth.toFixed(1),
            yearlyGrowth: accrualYearlyGrowth.toFixed(1)
          }
        })

      } catch (error) {
        console.error('Error calculating income stats:', error)
        return NextResponse.json({ error: 'Stats calculation failed' }, { status: 500 })
      }
    }

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
        establishmentDate: true,
        serviceStartDate: true,
        feeAccrualDay: true
      }
    })
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Müşteri bulunamadı' },
        { status: 404 }
      )
    }
    
    const createdAccruals = await generateAccrualsForCustomer(customer, true)
    
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
