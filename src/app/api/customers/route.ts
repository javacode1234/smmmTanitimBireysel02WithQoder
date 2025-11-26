import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

function toNullableInt(input: unknown): number | null {
  if (typeof input === 'number') return input
  if (input === null || input === undefined || input === '') return null
  const n = parseInt(String(input), 10)
  return Number.isNaN(n) ? null : n
}

function toOptionalInt(input: unknown): number | null | undefined {
  if (input === undefined) return undefined
  return toNullableInt(input)
}

function toNullableDate(input: unknown): Date | null {
  if (!input) return null
  const d = new Date(input as string)
  return Number.isNaN(d.getTime()) ? null : d
}

function toOptionalDate(input: unknown): Date | null | undefined {
  if (input === undefined) return undefined
  return toNullableDate(input)
}

function toStringOrJson(input: unknown): string | null {
  if (input === undefined || input === null) return null
  if (typeof input === 'string') return input
  try {
    return JSON.stringify(input)
  } catch {
    return String(input)
  }
}

function ensureEnum(val: unknown, allowed: string[], def: string): string {
  const s = String(val)
  return allowed.includes(s) ? s : def
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status')
  const stage = searchParams.get('stage')
  const pageParam = parseInt(searchParams.get('page') || '1', 10)
  const pageSizeParam = parseInt(searchParams.get('pageSize') || '10', 10)
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam
  const pageSize = Number.isNaN(pageSizeParam) || pageSizeParam < 1 ? 10 : Math.min(pageSizeParam, 100)

  try {
    // Check if the customer model exists
    if (!prisma.customer) {
      console.log('Customer model not found in prisma schema')
      // Fallback: return empty list to avoid UI errors when schema lacks customer
      return NextResponse.json({ items: [], total: 0, page, pageSize })
    }
    
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
    const where: Record<string, unknown> = {}

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
  } catch (error: unknown) {
    // Database kapalıyken veya bağlantı hatasında sakin fallback: boş sonuç
    // Özellikle liste isteği için 200 boş cevap dön, UI'da hata göstermeyelim
    if (!id) {
      return NextResponse.json({ items: [], total: 0, page, pageSize })
    }
    // Tekil kayıt isteğinde mevcut davranışı koru (detay sayfası kendi hatasını yönetiyor)
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.warn('Customers GET error:', message)
    return NextResponse.json({ error: 'Müşteri bilgisi alınamadı' }, { status: 500 })
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
    // Resolve tax office by name or id
    let taxOfficeRelation: { connect: { id: string } } | undefined = undefined
    if (data.taxOffice) {
      const val = String(data.taxOffice)
      const isIdLike = /^c[a-z0-9]{24}$/i.test(val)
      let office = isIdLike
        ? await prisma.taxOffice.findUnique({ where: { id: val } })
        : await prisma.taxOffice.findUnique({ where: { name: val } })
      if (!office) {
        office = await prisma.taxOffice.create({ data: { name: val } })
      }
      taxOfficeRelation = { connect: { id: office.id } }
    }

    

    const createData: Record<string, unknown> = {
      companyName: String(data.companyName),
      taxNumber: data.taxNumber || null,
      ...(taxOfficeRelation ? { taxOffice: taxOfficeRelation } : {}),
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      city: data.city || null,
      district: data.district || null,
      establishmentDate: toNullableDate(data.establishmentDate),
      status: ensureEnum(data.status, ['ACTIVE','INACTIVE'], 'ACTIVE'),
      onboardingStage: ensureEnum(data.onboardingStage, ['LEAD','PROSPECT','CUSTOMER'], 'LEAD'),
      ...(data.logo !== undefined ? { logo: data.logo } : {}),
      ...(data.mainActivityCode !== undefined ? { mainActivityCode: data.mainActivityCode } : {}),
      ...(data.facebookUrl !== undefined ? { facebookUrl: data.facebookUrl } : {}),
      ...(data.xUrl !== undefined ? { xUrl: data.xUrl } : {}),
      ...(data.linkedinUrl !== undefined ? { linkedinUrl: data.linkedinUrl } : {}),
      ...(data.instagramUrl !== undefined ? { instagramUrl: data.instagramUrl } : {}),
      ...(data.threadsUrl !== undefined ? { threadsUrl: data.threadsUrl } : {}),
      ...(data.ledgerType !== undefined ? { ledgerType: data.ledgerType } : {}),
      ...(data.subscriptionFee !== undefined ? { subscriptionFee: data.subscriptionFee } : {}),
      ...(data.employeeCount !== undefined ? { employeeCount: toOptionalInt(data.employeeCount) } : {}),
    }
    
    // hasEmployees alanı varsa ekle
    if (data.hasEmployees !== undefined) {
      createData.hasEmployees = Boolean(data.hasEmployees)
    }

    console.log('Creating customer with data:', JSON.stringify(createData, null, 2))
    
    const customer = await prisma.customer.create({
      data: createData as Prisma.customerCreateInput,
    })
    
    console.log('Customer created successfully:', customer.id)

    return NextResponse.json(customer)
  } catch (error: unknown) {
    console.error('Error creating customer:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    const stack = error instanceof Error ? error.stack : undefined
    
    // More detailed error response
    let errorMessage = 'Müşteri oluşturulamadı'
    if (message) {
      errorMessage += ': ' + message
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: message,
        stack: process.env.NODE_ENV === 'development' ? stack : undefined
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
    // Resolve tax office by name or id
    let taxOfficeRelationUpdate: { connect: { id: string } } | { disconnect: true } | undefined = undefined
    if (data.taxOffice !== undefined && data.taxOffice !== null && data.taxOffice !== "") {
      const val = String(data.taxOffice)
      const isIdLike = /^c[a-z0-9]{24}$/i.test(val)
      let office = isIdLike
        ? await prisma.taxOffice.findUnique({ where: { id: val } })
        : await prisma.taxOffice.findUnique({ where: { name: val } })
      if (!office) {
        office = await prisma.taxOffice.create({ data: { name: val } })
      }
      taxOfficeRelationUpdate = { connect: { id: office.id } }
    } else if (data.taxOffice === "") {
      taxOfficeRelationUpdate = { disconnect: true }
    }

    const updateData: Record<string, unknown> = {
      ...(data.logo !== undefined ? { logo: data.logo } : {}),
      ...(data.companyName !== undefined ? { companyName: data.companyName } : {}),
      ...(data.taxNumber !== undefined ? { taxNumber: data.taxNumber } : {}),
      ...(taxOfficeRelationUpdate ? { taxOffice: taxOfficeRelationUpdate } : {}),
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
      ...(data.email !== undefined ? { email: data.email } : {}),
      ...(data.address !== undefined ? { address: data.address } : {}),
      ...(data.city !== undefined ? { city: data.city } : {}),
      ...(data.district !== undefined ? { district: data.district } : {}),
      ...(data.mainActivityCode !== undefined ? { mainActivityCode: data.mainActivityCode } : {}),
      ...(data.facebookUrl !== undefined ? { facebookUrl: data.facebookUrl } : {}),
      ...(data.xUrl !== undefined ? { xUrl: data.xUrl } : {}),
      ...(data.linkedinUrl !== undefined ? { linkedinUrl: data.linkedinUrl } : {}),
      ...(data.instagramUrl !== undefined ? { instagramUrl: data.instagramUrl } : {}),
      ...(data.threadsUrl !== undefined ? { threadsUrl: data.threadsUrl } : {}),
      ...(data.ledgerType !== undefined ? { ledgerType: data.ledgerType } : {}),
      ...(data.subscriptionFee !== undefined ? { subscriptionFee: data.subscriptionFee } : {}),
      ...(data.establishmentDate !== undefined ? { establishmentDate: toOptionalDate(data.establishmentDate) } : {}),
      ...(data.taxPeriodType !== undefined ? { taxPeriodType: data.taxPeriodType } : {}),
      ...(data.authorizedName !== undefined ? { authorizedName: data.authorizedName } : {}),
      ...(data.authorizedTCKN !== undefined ? { authorizedTCKN: data.authorizedTCKN } : {}),
      ...(data.authorizedEmail !== undefined ? { authorizedEmail: data.authorizedEmail } : {}),
      ...(data.authorizedPhone !== undefined ? { authorizedPhone: data.authorizedPhone } : {}),
      ...(data.authorizedAddress !== undefined ? { authorizedAddress: data.authorizedAddress } : {}),
      ...(data.authorizedFacebookUrl !== undefined ? { authorizedFacebookUrl: data.authorizedFacebookUrl } : {}),
      ...(data.authorizedXUrl !== undefined ? { authorizedXUrl: data.authorizedXUrl } : {}),
      ...(data.authorizedLinkedinUrl !== undefined ? { authorizedLinkedinUrl: data.authorizedLinkedinUrl } : {}),
      ...(data.authorizedInstagramUrl !== undefined ? { authorizedInstagramUrl: data.authorizedInstagramUrl } : {}),
      ...(data.authorizedThreadsUrl !== undefined ? { authorizedThreadsUrl: data.authorizedThreadsUrl } : {}),
      ...(data.authorizationDate !== undefined ? { authorizationDate: toOptionalDate(data.authorizationDate) } : {}),
      ...(data.authorizationPeriod !== undefined ? { authorizationPeriod: data.authorizationPeriod } : {}),
      ...(data.declarations !== undefined ? { declarations: toStringOrJson(data.declarations) } : {}),
      ...(data.documents !== undefined ? { documents: toStringOrJson(data.documents) } : {}),
      ...(data.passwords !== undefined ? { passwords: toStringOrJson(data.passwords) } : {}),
      ...(data.authorizedPersons !== undefined ? { authorizedPersons: toStringOrJson(data.authorizedPersons) } : {}),
      ...(data.branches !== undefined ? { branches: toStringOrJson(data.branches) } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.onboardingStage !== undefined ? { onboardingStage: data.onboardingStage } : {}),
      ...(data.employeeCount !== undefined ? { employeeCount: toOptionalInt(data.employeeCount) } : {}),
    }
    
    // hasEmployees alanı varsa ekle
    if (data.hasEmployees !== undefined) {
      updateData.hasEmployees = Boolean(data.hasEmployees)
    }
    
    console.log('Updating customer with data:', JSON.stringify(updateData, null, 2))

    const customer = await prisma.customer.update({
      where: { id },
      data: updateData as Prisma.customerUpdateInput,
    })

    return NextResponse.json(customer)
  } catch (error: unknown) {
    console.error('Error updating customer:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    const stack = error instanceof Error ? error.stack : undefined
    
    // More detailed error response
    let errorMessage = 'Müşteri güncellenemedi'
    if (message) {
      errorMessage += ': ' + message
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: message,
        stack: process.env.NODE_ENV === 'development' ? stack : undefined
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
  } catch (error: unknown) {
    console.error('Error deleting customer:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    const stack = error instanceof Error ? error.stack : undefined
    
    // More detailed error response
    let errorMessage = 'Müşteri silinemedi'
    if (message) {
      errorMessage += ': ' + message
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: message,
        stack: process.env.NODE_ENV === 'development' ? stack : undefined
      }, 
      { status: 500 }
    )
  }
}
