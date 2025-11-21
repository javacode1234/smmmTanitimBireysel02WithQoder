import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Check if the customer model exists
    if (!prisma.customer) {
      console.log('Customer model not found in prisma schema')
      return NextResponse.json(
        { error: 'Customer management not supported in current database schema' },
        { status: 501 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const stage = searchParams.get('stage')
    const pageParam = parseInt(searchParams.get('page') || '1', 10)
    const pageSizeParam = parseInt(searchParams.get('pageSize') || '10', 10)
    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam
    const pageSize = Number.isNaN(pageSizeParam) || pageSizeParam < 1 ? 10 : Math.min(pageSizeParam, 100)

    // If ID is provided, return single customer
    if (id) {
      const customer = await prisma.customer.findUnique({
        where: { id },
      })

      if (!customer) {
        return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 })
      }

      return NextResponse.json(customer)
    }

    // Otherwise, return list of customers
    const where: any = {}

    if (search) {
      where.OR = [
        { companyName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { taxNumber: { contains: search } },
      ]
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (stage && stage !== 'all') {
      where.onboardingStage = stage
    }

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          logo: true,
          companyName: true,
          taxNumber: true,
          taxOffice: true,
          email: true,
          phone: true,
          status: true,
          onboardingStage: true,
          createdAt: true,
        }
      })
    ])

    return NextResponse.json({ items: customers, total, page, pageSize })
  } catch (error: any) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'Müşteri listesi alınamadı: ' + error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if the customer model exists
    if (!prisma.customer) {
      console.log('Customer model not found in prisma schema')
      return NextResponse.json(
        { error: 'Customer management not supported in current database schema' },
        { status: 501 }
      )
    }
    
    const data = await request.json()
    
    console.log('Received customer data:', JSON.stringify(data, null, 2))

    if (!data.companyName) {
      return NextResponse.json({ error: 'Şirket adı zorunludur' }, { status: 400 })
    }

    console.log('Creating customer with companyName:', data.companyName)
    
    // hasEmployees alanını kontrol et
    const createData: any = {
      logo: data.logo || null,
      companyName: String(data.companyName),
      taxNumber: data.taxNumber || null,
      taxOffice: data.taxOffice ? { connect: { id: data.taxOffice } } : undefined,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      city: data.city || null,
      facebookUrl: data.facebookUrl || null,
      xUrl: data.xUrl || null,
      linkedinUrl: data.linkedinUrl || null,
      instagramUrl: data.instagramUrl || null,
      threadsUrl: data.threadsUrl || null,
      ledgerType: data.ledgerType || null,
      subscriptionFee: data.subscriptionFee || null,
      establishmentDate: data.establishmentDate ? new Date(data.establishmentDate) : null,
      taxPeriodType: data.taxPeriodType || null,
      authorizedName: data.authorizedName || null,
      authorizedTCKN: data.authorizedTCKN || null,
      authorizedEmail: data.authorizedEmail || null,
      authorizedPhone: data.authorizedPhone || null,
      authorizedAddress: data.authorizedAddress || null,
      authorizedFacebookUrl: data.authorizedFacebookUrl || null,
      authorizedXUrl: data.authorizedXUrl || null,
      authorizedLinkedinUrl: data.authorizedLinkedinUrl || null,
      authorizedInstagramUrl: data.authorizedInstagramUrl || null,
      authorizedThreadsUrl: data.authorizedThreadsUrl || null,
      authorizationDate: data.authorizationDate ? new Date(data.authorizationDate) : null,
      authorizationPeriod: data.authorizationPeriod || null,
      declarations: data.declarations || null,
      documents: data.documents || null,
      passwords: data.passwords || null,
      notes: data.notes || null,
      status: data.status || 'ACTIVE',
      onboardingStage: data.onboardingStage || 'LEAD',
      employeeCount: data.employeeCount !== undefined ? parseInt(data.employeeCount) : null, // New field
    }
    
    // hasEmployees alanı varsa ekle
    if (data.hasEmployees !== undefined) {
      createData.hasEmployees = Boolean(data.hasEmployees)
    }

    console.log('Creating customer with data:', JSON.stringify(createData, null, 2))
    
    const customer = await prisma.customer.create({
      data: createData,
    })
    
    console.log('Customer created successfully:', customer.id)

    return NextResponse.json(customer)
  } catch (error: any) {
    console.error('Error creating customer:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    // More detailed error response
    let errorMessage = 'Müşteri oluşturulamadı'
    if (error.message) {
      errorMessage += ': ' + error.message
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check if the customer model exists
    if (!prisma.customer) {
      console.log('Customer model not found in prisma schema')
      return NextResponse.json(
        { error: 'Customer management not supported in current database schema' },
        { status: 501 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID gerekli' }, { status: 400 })
    }

    const data = await request.json()
    
    console.log('Updating customer with ID:', id)
    console.log('Received update data:', JSON.stringify(data, null, 2))

    // hasEmployees alanını kontrol et
    const updateData: any = {
      logo: data.logo,
      companyName: data.companyName,
      taxNumber: data.taxNumber,
      taxOffice: data.taxOffice ? { connect: { id: data.taxOffice } } : { disconnect: true },
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      facebookUrl: data.facebookUrl,
      xUrl: data.xUrl,
      linkedinUrl: data.linkedinUrl,
      instagramUrl: data.instagramUrl,
      threadsUrl: data.threadsUrl,
      ledgerType: data.ledgerType,
      subscriptionFee: data.subscriptionFee,
      establishmentDate: data.establishmentDate ? new Date(data.establishmentDate) : undefined,
      taxPeriodType: data.taxPeriodType !== undefined ? data.taxPeriodType : undefined,
      authorizedName: data.authorizedName,
      authorizedTCKN: data.authorizedTCKN,
      authorizedEmail: data.authorizedEmail,
      authorizedPhone: data.authorizedPhone,
      authorizedAddress: data.authorizedAddress,
      authorizedFacebookUrl: data.authorizedFacebookUrl,
      authorizedXUrl: data.authorizedXUrl,
      authorizedLinkedinUrl: data.authorizedLinkedinUrl,
      authorizedInstagramUrl: data.authorizedInstagramUrl,
      authorizedThreadsUrl: data.authorizedThreadsUrl,
      authorizationDate: data.authorizationDate ? new Date(data.authorizationDate) : null,
      authorizationPeriod: data.authorizationPeriod,
      declarations: data.declarations !== undefined ? data.declarations : undefined,
      documents: data.documents !== undefined ? data.documents : undefined,
      passwords: data.passwords !== undefined ? data.passwords : undefined,
      notes: data.notes,
      status: data.status,
      onboardingStage: data.onboardingStage,
      employeeCount: data.employeeCount !== undefined ? parseInt(data.employeeCount) : undefined, // New field
    }
    
    // hasEmployees alanı varsa ekle
    if (data.hasEmployees !== undefined) {
      updateData.hasEmployees = Boolean(data.hasEmployees)
    }
    
    console.log('Updating customer with data:', JSON.stringify(updateData, null, 2))

    const customer = await prisma.customer.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(customer)
  } catch (error: any) {
    console.error('Error updating customer:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    // More detailed error response
    let errorMessage = 'Müşteri güncellenemedi'
    if (error.message) {
      errorMessage += ': ' + error.message
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check if the customer model exists
    if (!prisma.customer) {
      console.log('Customer model not found in prisma schema')
      return NextResponse.json(
        { error: 'Customer management not supported in current database schema' },
        { status: 501 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID gerekli' }, { status: 400 })
    }

    await prisma.customer.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting customer:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    // More detailed error response
    let errorMessage = 'Müşteri silinemedi'
    if (error.message) {
      errorMessage += ': ' + error.message
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: 500 }
    )
  }
}