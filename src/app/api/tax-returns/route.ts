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
    const year = searchParams.get('year')
    const month = searchParams.get('month') // Yeni eklenen ay parametresi
    const dueDateYear = searchParams.get('dueDateYear')
    const dueDateMonth = searchParams.get('dueDateMonth')
    const periodFilter = searchParams.get('periodFilter')

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

    // Use period filter if provided, otherwise use the old dueDateYear/dueDateMonth logic
    if (periodFilter && periodFilter !== 'all') {
      where.period = periodFilter
    } else if (period) {
      where.period = period
    } else if (year && month) {
      // Yıl ve ay parametrelerine göre filtreleme
      where.period = `${year}-${month.toString().padStart(2, '0')}`
    }

    if (type) {
      where.type = type
    }

    if (isSubmitted !== null && isSubmitted !== undefined) {
      where.isSubmitted = isSubmitted === 'true'
    }

    // Filter by year (period year) - sadece ay parametresi yoksa
    if (year && !(month) && !(periodFilter && periodFilter !== 'all')) {
      where.year = parseInt(year)
    }

    // Filter by due date year and month (old method - keep for backward compatibility)
    if (dueDateYear && dueDateMonth && !(periodFilter && periodFilter !== 'all') && !(year && month)) {
      const yearNum = parseInt(dueDateYear)
      const monthNum = parseInt(dueDateMonth)
      
      // Filter returns where dueDate falls in the specified month
      const startDate = new Date(yearNum, monthNum - 1, 1)
      const endDate = new Date(yearNum, monthNum, 1)
      
      // For Turkish tax system, some declarations for previous month are due in current month
      // For example, December declarations are due in January
      // So we also need to include declarations from previous month that are due in current month
      const prevMonthStartDate = new Date(yearNum, monthNum - 2, 1);
      const prevMonthEndDate = new Date(yearNum, monthNum - 1, 1);
      
      where.OR = [
        {
          dueDate: {
            gte: startDate,
            lt: endDate
          }
        },
        {
          // Include declarations from previous month that are due in current month
          // Specifically for KDV and Muhtasar declarations which have this pattern
          dueDate: {
            gte: prevMonthStartDate,
            lt: prevMonthEndDate
          },
          type: {
            contains: 'KDV'
          }
        },
        {
          // Include declarations from previous month that are due in current month
          // Specifically for KDV and Muhtasar declarations which have this pattern
          dueDate: {
            gte: prevMonthStartDate,
            lt: prevMonthEndDate
          },
          type: {
            contains: 'Muhtasar'
          }
        }
      ];
    }

    // Fetch tax returns
    const taxReturns = await prisma.taxReturn.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            companyName: true,
            taxNumber: true,
            establishmentDate: true,
          }
        }
      },
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ],
    })

    // Filter out tax returns that are before establishment date
    const filteredTaxReturns = taxReturns.filter(tr => {
      if (tr.customer.establishmentDate) {
        const estDate = new Date(tr.customer.establishmentDate)
        const dueDate = new Date(tr.dueDate)
        return dueDate >= estDate
      }
      return true
    })

    // Remove establishmentDate from response
    const response = filteredTaxReturns.map(tr => ({
      ...tr,
      customer: {
        id: tr.customer.id,
        companyName: tr.customer.companyName,
        taxNumber: tr.customer.taxNumber,
      }
    }))

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching tax returns:', error)
    return NextResponse.json({ error: 'Beyannameler alınamadı: ' + error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Debug log
    console.log('=== Tax Return Creation Request ===')
    console.log('Raw data:', JSON.stringify(data, null, 2))
    console.log('Request headers:', Object.fromEntries(request.headers))

    if (!data.customerId || !data.type || !data.period || !data.dueDate) {
      console.log('Missing required fields:', {
        customerId: data.customerId,
        type: data.type,
        period: data.period,
        dueDate: data.dueDate
      })
      return NextResponse.json({ 
        error: 'Müşteri, beyanname tipi, dönem ve son tarih zorunludur',
        missingFields: {
          customerId: !data.customerId,
          type: !data.type,
          period: !data.period,
          dueDate: !data.dueDate
        }
      }, { status: 400 })
    }
    
    // Log successful validation
    console.log('Required fields validated successfully')
    
    // Check customer establishment date
    console.log('Checking customer establishment date for:', data.customerId)
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
      select: { establishmentDate: true, companyName: true }
    })
    console.log('Customer data:', JSON.stringify(customer, null, 2))

    if (customer?.establishmentDate) {
      const estDate = new Date(customer.establishmentDate)
      const dueDate = new Date(data.dueDate)
      
      // Validate dates are valid
      if (isNaN(estDate.getTime()) || isNaN(dueDate.getTime())) {
        return NextResponse.json({ 
          error: 'Geçersiz tarih formatı',
          establishmentDate: customer.establishmentDate,
          dueDate: data.dueDate
        }, { status: 400 })
      }
      
      if (dueDate < estDate) {
        return NextResponse.json({ 
          error: `Şirket kuruluş tarihinden (${estDate.toLocaleDateString('tr-TR')}) önce beyanname oluşturulamaz` 
        }, { status: 400 })
      }
    }

    // Check for duplicate (same customer, type, and period)
    const existing = await prisma.taxReturn.findFirst({
      where: {
        customerId: data.customerId,
        type: data.type,
        period: data.period,
      }
    })

    if (existing) {
      return NextResponse.json({ 
        error: 'Bu beyanname zaten mevcut',
        duplicate: true 
      }, { status: 409 })
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
    // Detaylı hata logu
    console.error('Request data:', JSON.stringify(request.body, null, 2))
    return NextResponse.json({ error: 'Beyanname oluşturulamadı: ' + error.message, details: error }, { status: 500 })
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
    const customerId = searchParams.get('customerId')
    
    // If ID provided, delete single tax return
    if (id) {
      await prisma.taxReturn.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }
    
    // If customerId provided, delete all tax returns for customer
    if (customerId) {
      await prisma.taxReturn.deleteMany({ where: { customerId } })
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ error: 'ID veya müşteri ID gerekli' }, { status: 400 })
  } catch (error: any) {
    console.error('Error deleting tax return:', error)
    return NextResponse.json({ error: 'Beyanname silinemedi: ' + error.message }, { status: 500 })
  }
}
