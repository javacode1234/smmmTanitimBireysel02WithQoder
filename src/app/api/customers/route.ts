import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const stage = searchParams.get('stage')

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
    console.log('GET /api/customers - search:', search, 'status:', status, 'stage:', stage)

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

    console.log('Query where:', JSON.stringify(where, null, 2))

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    console.log('Found', customers.length, 'customers')

    return NextResponse.json(customers)
  } catch (error: any) {
    console.error('Error fetching customers:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    return NextResponse.json({ error: 'Müşteri listesi alınamadı: ' + error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    console.log('Received customer data:', JSON.stringify(data, null, 2))

    if (!data.companyName) {
      return NextResponse.json({ error: 'Şirket adı zorunludur' }, { status: 400 })
    }

    console.log('Creating customer with companyName:', data.companyName)

    const customer = await prisma.customer.create({
      data: {
        logo: data.logo || null,
        companyName: String(data.companyName),
        taxNumber: data.taxNumber || null,
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
        notes: data.notes || null,
        status: data.status || 'ACTIVE',
        onboardingStage: data.onboardingStage || 'LEAD',
      },
    })
    
    console.log('Customer created successfully:', customer.id)

    // Sync declarations to DefinedDeclaration if provided
    try {
      if (data.declarations) {
        const decls = Array.isArray(data.declarations)
          ? data.declarations
          : JSON.parse(data.declarations || '[]')
        if (Array.isArray(decls)) {
          for (const t of decls) {
            if (typeof t === 'string' && t.trim()) {
              await (prisma as any).definedDeclaration.upsert({
                where: { customerId_type: { customerId: customer.id, type: t } },
                update: {},
                create: { customerId: customer.id, type: t },
              })
            }
          }
        }
      }
    } catch (e) {
      console.error('Declaration sync failed (POST):', e)
    }

    return NextResponse.json(customer)
  } catch (error: any) {
    console.error('Error creating customer:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    return NextResponse.json({ error: 'Müşteri oluşturulamadı: ' + error.message }, { status: 500 })
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

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        logo: data.logo,
        companyName: data.companyName,
        taxNumber: data.taxNumber,
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
        establishmentDate: data.establishmentDate ? new Date(data.establishmentDate) : null,
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
        notes: data.notes,
        status: data.status,
        onboardingStage: data.onboardingStage,
      },
    })

    // Sync declarations to DefinedDeclaration (replace existing set)
    try {
      if (data.declarations) {
        const decls = Array.isArray(data.declarations)
          ? data.declarations
          : JSON.parse(data.declarations || '[]')
        if (Array.isArray(decls)) {
          const existing = await (prisma as any).definedDeclaration.findMany({
            where: { customerId: id },
            select: { type: true },
          })
          const existingSet = new Set(existing.map((e: any) => e.type))
          const desired = decls.filter((t: any) => typeof t === 'string' && t.trim())
          const desiredSet = new Set(desired)

          for (const t of desiredSet) {
            if (!existingSet.has(t)) {
              await (prisma as any).definedDeclaration.create({ data: { customerId: id, type: t as string } })
            }
          }
          for (const t of existingSet) {
            if (!desiredSet.has(t)) {
              await (prisma as any).definedDeclaration.delete({ where: { customerId_type: { customerId: id, type: t as string } } })
            }
          }
        }
      }
    } catch (e) {
      console.error('Declaration sync failed (PATCH):', e)
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json({ error: 'Müşteri güncellenemedi' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID gerekli' }, { status: 400 })
    }

    await prisma.customer.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json({ error: 'Müşteri silinemedi' }, { status: 500 })
  }
}
