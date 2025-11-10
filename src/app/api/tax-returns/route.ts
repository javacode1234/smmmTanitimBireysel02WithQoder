import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Helper function to get current month's date range for filtering by due date
function getCurrentMonthDueDateRange() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() // 0-11
  
  // Start of current month
  const startDate = new Date(year, month, 1)
  
  // Start of next month
  const endDate = new Date(year, month + 1, 1)
  
  return { startDate, endDate }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const customerId = searchParams.get('customerId')
    const period = searchParams.get('period')
    const type = searchParams.get('type')
    const isSubmitted = searchParams.get('isSubmitted')
    
    // Default to current period if no filter specified
    const currentPeriod = searchParams.get('currentPeriod') !== 'false'

    // If ID is provided, return single tax return
    if (id) {
      const taxReturn = await prisma.taxReturn.findUnique({
        where: { id },
        include: {
          customer: {
            select: {
              id: true,
              companyName: true,
              taxNumber: true,
            }
          }
        }
      })

      if (!taxReturn) {
        return NextResponse.json({ error: 'Beyanname bulunamadı' }, { status: 404 })
      }

      return NextResponse.json(taxReturn)
    }

    // Build where clause
    const where: any = {}

    if (customerId) {
      where.customerId = customerId
    }

    if (period) {
      where.period = period
    }

    if (type) {
      where.type = type
    }

    if (isSubmitted !== null && isSubmitted !== undefined) {
      where.isSubmitted = isSubmitted === 'true'
    }

    // Default filter: current month's due dates
    if (currentPeriod && !period) {
      const { startDate, endDate } = getCurrentMonthDueDateRange()
      where.dueDate = {
        gte: startDate,
        lt: endDate
      }
    }

    const taxReturns = await prisma.taxReturn.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            companyName: true,
            taxNumber: true,
          }
        }
      },
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ],
    })

    return NextResponse.json(taxReturns)
  } catch (error: any) {
    console.error('Error fetching tax returns:', error)
    return NextResponse.json({ error: 'Beyannameler alınamadı: ' + error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.customerId || !data.type || !data.period || !data.dueDate) {
      return NextResponse.json({ 
        error: 'Müşteri, beyanname tipi, dönem ve son tarih zorunludur' 
      }, { status: 400 })
    }

    // Parse period to extract year and month
    const periodParts = data.period.split('-')
    const year = parseInt(periodParts[0])
    const month = periodParts.length > 1 ? parseInt(periodParts[1]) : null

    const taxReturn = await prisma.taxReturn.create({
      data: {
        customerId: data.customerId,
        type: data.type,
        period: data.period,
        year,
        month,
        dueDate: new Date(data.dueDate),
        submittedDate: data.submittedDate ? new Date(data.submittedDate) : null,
        isSubmitted: data.isSubmitted || false,
        notes: data.notes || null,
      },
      include: {
        customer: {
          select: {
            id: true,
            companyName: true,
            taxNumber: true,
          }
        }
      }
    })

    return NextResponse.json(taxReturn)
  } catch (error: any) {
    console.error('Error creating tax return:', error)
    return NextResponse.json({ error: 'Beyanname oluşturulamadı: ' + error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID gerekli' }, { status: 400 })
    }

    const data = await request.json()

    // Parse period if it changed
    let year = data.year
    let month = data.month
    if (data.period) {
      const periodParts = data.period.split('-')
      year = parseInt(periodParts[0])
      month = periodParts.length > 1 ? parseInt(periodParts[1]) : null
    }

    const taxReturn = await prisma.taxReturn.update({
      where: { id },
      data: {
        type: data.type,
        period: data.period,
        year,
        month,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        submittedDate: data.submittedDate ? new Date(data.submittedDate) : null,
        isSubmitted: data.isSubmitted,
        notes: data.notes,
      },
      include: {
        customer: {
          select: {
            id: true,
            companyName: true,
            taxNumber: true,
          }
        }
      }
    })

    return NextResponse.json(taxReturn)
  } catch (error: any) {
    console.error('Error updating tax return:', error)
    return NextResponse.json({ error: 'Beyanname güncellenemedi: ' + error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID gerekli' }, { status: 400 })
    }

    await prisma.taxReturn.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting tax return:', error)
    return NextResponse.json({ error: 'Beyanname silinemedi: ' + error.message }, { status: 500 })
  }
}
