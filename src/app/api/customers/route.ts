import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import fs from 'fs'
import path from 'path'

type DeleteCreateManyDelegate = {
  deleteMany: (args: unknown) => Prisma.PrismaPromise<unknown>
  createMany: (args: { data: unknown }) => Prisma.PrismaPromise<unknown>
}
type UpsertDelegate = {
  upsert: (args: unknown) => Prisma.PrismaPromise<unknown>
}

function toNullableInt(input: unknown): number | null {
  if (typeof input === 'number') return Number.isNaN(input) ? null : Math.trunc(input)
  if (input === null || input === undefined || input === '') return null
  const n = Number(String(input).trim())
  return Number.isNaN(n) ? null : Math.trunc(n)
}

function toOptionalInt(input: unknown): number | null | undefined {
  if (input === undefined) return undefined
  return toNullableInt(input)
}

function toNullableDate(input: unknown): Date | null {
  if (input === null || input === undefined || input === '') return null
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input
  if (typeof input === 'number') {
    const d = new Date(input)
    return Number.isNaN(d.getTime()) ? null : d
  }
  const s = String(input).trim()
  if (!s) return null
  const d = new Date(s)
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

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9-_\. ]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 120)
}

function getExtFromMime(mime: string): string {
  const map: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  }
  return map[mime] || 'bin'
}

function decodeDataUrl(dataUrl: string): { mime: string; buffer: Buffer } | null {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl || '')
  if (!match) return null
  const mime = match[1]
  const b64 = match[2]
  try {
    return { mime, buffer: Buffer.from(b64, 'base64') }
  } catch {
    return null
  }
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function saveCustomerFile(customerId: string, subPathParts: string[], filename: string, buffer: Buffer): string {
  const uploadsRoot = path.join(process.cwd(), 'public', 'uploads', 'customers', customerId, ...subPathParts)
  ensureDir(uploadsRoot)
  const fullPath = path.join(uploadsRoot, filename)
  fs.writeFileSync(fullPath, buffer)
  const urlPath = ['','uploads','customers', customerId, ...subPathParts, filename].join('/')
  return urlPath
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
        include: {
          taxOffice: true,
        },
      })

      if (!customer) {
        return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 })
      }

      const normalized = {
        ...customer,
        taxOffice: (customer as unknown as { taxOffice?: { name?: string | null } }).taxOffice?.name ?? null,
      }

      const px: Record<string, unknown> = prisma as unknown as Record<string, unknown>
      const out: Record<string, unknown> = { ...normalized }
      try {
        if (px['customerpartner']) {
          out['customerpartner'] = await (px['customerpartner'] as { findMany: (args: unknown) => Prisma.PrismaPromise<unknown[]> }).findMany({ where: { customerId: id } })
        }
        if (px['chambermembership']) {
          out['chambermembership'] = await (px['chambermembership'] as { findMany: (args: unknown) => Prisma.PrismaPromise<unknown[]> }).findMany({ where: { customerId: id } })
        }
        if (px['customerbranch']) {
          out['customerbranch'] = await (px['customerbranch'] as { findMany: (args: unknown) => Prisma.PrismaPromise<unknown[]> }).findMany({ where: { customerId: id } })
        }
        if (px['customeractivity']) {
          out['customeractivity'] = await (px['customeractivity'] as { findMany: (args: unknown) => Prisma.PrismaPromise<unknown[]> }).findMany({ where: { customerId: id } })
        }
        if (px['authorizedperson']) {
          out['authorizedperson'] = await (px['authorizedperson'] as { findMany: (args: unknown) => Prisma.PrismaPromise<unknown[]> }).findMany({ where: { customerId: id } })
        }
        if (px['customercapitalinfo']) {
          out['customercapitalinfo'] = await (px['customercapitalinfo'] as { findUnique: (args: unknown) => Prisma.PrismaPromise<unknown | null> }).findUnique({ where: { customerId: id } })
        }
        if (px['customerfile']) {
          out['customerfile'] = await (px['customerfile'] as { findMany: (args: unknown) => Prisma.PrismaPromise<unknown[]> }).findMany({ where: { customerId: id } })
        }
      } catch {}

      return NextResponse.json(out)
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
      ...(data.mainActivityCode !== undefined ? { mainActivityCode: data.mainActivityCode } : {}),
      establishmentDate: toNullableDate(data.establishmentDate),
      status: ensureEnum(data.status, ['ACTIVE','INACTIVE'], 'ACTIVE'),
      onboardingStage: ensureEnum(data.onboardingStage, ['LEAD','PROSPECT','CUSTOMER'], 'LEAD'),
      ...(data.logo !== undefined ? { logo: data.logo } : {}),
      ...(data.facebookUrl !== undefined ? { facebookUrl: data.facebookUrl } : {}),
      ...(data.xUrl !== undefined ? { xUrl: data.xUrl } : {}),
      ...(data.linkedinUrl !== undefined ? { linkedinUrl: data.linkedinUrl } : {}),
      ...(data.instagramUrl !== undefined ? { instagramUrl: data.instagramUrl } : {}),
      ...(data.threadsUrl !== undefined ? { threadsUrl: data.threadsUrl } : {}),
      ...(data.ledgerType !== undefined ? { ledgerType: data.ledgerType } : {}),
      ...(data.subscriptionFee !== undefined ? { subscriptionFee: data.subscriptionFee } : {}),
      ...(data.employeeCount !== undefined ? { employeeCount: toOptionalInt(data.employeeCount) } : {}),
      ...(data.partners !== undefined ? { partners: toStringOrJson(data.partners) } : {}),
      ...(data.branches !== undefined ? { branches: toStringOrJson(data.branches) } : {}),
      ...(data.chambers !== undefined ? { chambers: toStringOrJson(data.chambers) } : {}),
      ...(data.activities !== undefined ? { activities: toStringOrJson(data.activities) } : {}),
      ...(data.authorizedPersons !== undefined ? { authorizedPersons: toStringOrJson(data.authorizedPersons) } : {}),
      ...(data.messages !== undefined ? { messages: toStringOrJson(data.messages) } : {}),
    }
    
    // hasEmployees alanı varsa ekle
    if (data.hasEmployees !== undefined) {
      createData.hasEmployees = Boolean(data.hasEmployees)
    }

    console.log('Creating customer with data:', JSON.stringify(createData, null, 2))
    
    const customer = await prisma.customer.create({
      data: createData as Prisma.customerCreateInput,
    })

    // Persist logo and documents as files with classified naming
    const updatedFields: Record<string, unknown> = {}
    if (typeof data.logo === 'string' && data.logo.startsWith('data:')) {
      const decoded = decodeDataUrl(data.logo)
      if (decoded) {
        const ext = getExtFromMime(decoded.mime)
        const filename = `logo_${new Date().toISOString().replace(/[:.]/g,'-')}.${ext}`
        const url = saveCustomerFile(customer.id, ['logo'], filename, decoded.buffer)
        updatedFields.logo = url
      }
    }
    if (Array.isArray(data.documents)) {
      const docs = data.documents as Array<{ id: string; name: string; file: string; uploadDate: string; category: string; relatedTaxReturnType?: string }>
      const mapped = docs.map((d) => {
        if (typeof d.file === 'string' && d.file.startsWith('data:')) {
          const decoded = decodeDataUrl(d.file)
          if (decoded) {
            const ext = getExtFromMime(decoded.mime)
            const date = (d.uploadDate || new Date().toISOString().split('T')[0]).replace(/\s.*/, '')
            const safeName = sanitizeFilename(d.name || 'dosya')
            const cat = sanitizeFilename(d.category || 'unknown')
            const type = sanitizeFilename(d.relatedTaxReturnType || 'genel')
            const filename = `${type}__${safeName}__${date}__${d.id}.${ext}`
            const url = saveCustomerFile(customer.id, ['documents', cat], filename, decoded.buffer)
            return { ...d, file: `/${url}` }
          }
        }
        return d
      })
      updatedFields.documents = JSON.stringify(mapped)
    }

    if (Object.keys(updatedFields).length) {
      await prisma.customer.update({ where: { id: customer.id }, data: updatedFields as Prisma.customerUpdateInput })
    }

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
      ...(data.partners !== undefined ? { partners: toStringOrJson(data.partners) } : {}),
      ...(data.chambers !== undefined ? { chambers: toStringOrJson(data.chambers) } : {}),
      ...(data.activities !== undefined ? { activities: toStringOrJson(data.activities) } : {}),
      ...(data.messages !== undefined ? { messages: toStringOrJson(data.messages) } : {}),
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

    // Pre-process files if provided
    if (typeof data.logo === 'string' && data.logo.startsWith('data:')) {
      const decoded = decodeDataUrl(data.logo)
      if (decoded) {
        const ext = getExtFromMime(decoded.mime)
        const filename = `logo_${new Date().toISOString().replace(/[:.]/g,'-')}.${ext}`
        const url = saveCustomerFile(id, ['logo'], filename, decoded.buffer)
        updateData.logo = `/${url}`
      }
    }

    if (Array.isArray(data.documents)) {
      const docs = data.documents as Array<{ id: string; name: string; file: string; uploadDate: string; category: string; relatedTaxReturnType?: string }>
      const mapped = docs.map((d) => {
        if (typeof d.file === 'string' && d.file.startsWith('data:')) {
          const decoded = decodeDataUrl(d.file)
          if (decoded) {
            const ext = getExtFromMime(decoded.mime)
            const date = (d.uploadDate || new Date().toISOString().split('T')[0]).replace(/\s.*/, '')
            const safeName = sanitizeFilename(d.name || 'dosya')
            const cat = sanitizeFilename(d.category || 'unknown')
            const type = sanitizeFilename(d.relatedTaxReturnType || 'genel')
            const filename = `${type}__${safeName}__${date}__${d.id}.${ext}`
            const url = saveCustomerFile(id, ['documents', cat], filename, decoded.buffer)
            return { ...d, file: `/${url}` }
          }
        }
        return d
      })
      updateData.documents = JSON.stringify(mapped)
    }

    const px: Record<string, unknown> = prisma as unknown as Record<string, unknown>
    if (px['customerpartner'] && Array.isArray(data.partners)) {
      const arr = data.partners as Array<{ id?: string; name: string; tckn: string; startDate?: string; isManager?: boolean }>
      await (px['customerpartner'] as DeleteCreateManyDelegate).deleteMany({ where: { customerId: id } })
      if (arr.length) {
        await (px['customerpartner'] as DeleteCreateManyDelegate).createMany({
          data: arr.map(p => ({
            customerId: id,
            name: String(p.name || ''),
            tckn: String(p.tckn || ''),
            startDate: p.startDate ? new Date(p.startDate) : null,
            isManager: !!p.isManager,
          }))
        })
      }
    }
    if (px['chambermembership'] && Array.isArray(data.chambers)) {
      const arr = data.chambers as Array<{ chamber: string; registryNo: string; membershipDate: string; membershipEndDate?: string; status?: 'ACTIVE'|'PASSIVE' }>
      await (px['chambermembership'] as DeleteCreateManyDelegate).deleteMany({ where: { customerId: id } })
      if (arr.length) {
        await (px['chambermembership'] as DeleteCreateManyDelegate).createMany({
          data: arr.map(c => ({
            customerId: id,
            chamber: String(c.chamber || ''),
            registryNo: String(c.registryNo || ''),
            membershipDate: new Date(c.membershipDate),
            membershipEndDate: c.membershipEndDate ? new Date(c.membershipEndDate) : null,
            status: c.status === 'PASSIVE' ? 'PASSIVE' : 'ACTIVE',
          }))
        })
      }
    }
    if (px['customerbranch'] && Array.isArray(data.branches)) {
      const arr = data.branches as Array<{ name: string; openingDate?: string; closingDate?: string; activityCode?: string; city?: string; district?: string; address: string }>
      await (px['customerbranch'] as DeleteCreateManyDelegate).deleteMany({ where: { customerId: id } })
      if (arr.length) {
        await (px['customerbranch'] as DeleteCreateManyDelegate).createMany({
          data: arr.map(b => ({
            customerId: id,
            name: String(b.name || ''),
            openingDate: b.openingDate ? new Date(b.openingDate) : null,
            closingDate: b.closingDate ? new Date(b.closingDate) : null,
            activityCode: b.activityCode || null,
            city: b.city || null,
            district: b.district || null,
            address: String(b.address || ''),
          }))
        })
      }
    }
    if (px['customeractivity'] && Array.isArray(data.activities)) {
      const arr = data.activities as Array<{ branchName?: string; activityCode: string; startDate?: string; endDate?: string; status?: 'ACTIVE'|'PASSIVE' }>
      await (px['customeractivity'] as DeleteCreateManyDelegate).deleteMany({ where: { customerId: id } })
      if (arr.length) {
        await (px['customeractivity'] as DeleteCreateManyDelegate).createMany({
          data: arr.map(a => ({
            customerId: id,
            branchName: a.branchName || null,
            activityCode: String(a.activityCode || ''),
            startDate: a.startDate ? new Date(a.startDate) : null,
            endDate: a.endDate ? new Date(a.endDate) : null,
            status: a.status === 'PASSIVE' ? 'PASSIVE' : 'ACTIVE',
          }))
        })
      }
    }
    if (px['authorizedperson'] && (Array.isArray(data.authorizedPersons) || typeof data.authorizedPersons === 'string')) {
      const arr = Array.isArray(data.authorizedPersons)
        ? data.authorizedPersons as Array<{ name: string; tckn: string; email?: string; phone?: string; address?: string; authorizationDate?: string; authorizationPeriod?: string; facebookUrl?: string; xUrl?: string; linkedinUrl?: string; instagramUrl?: string; threadsUrl?: string }>
        : (() => { try { return JSON.parse(String(data.authorizedPersons)) as Array<{ name: string; tckn: string; email?: string; phone?: string; address?: string; authorizationDate?: string; authorizationPeriod?: string; facebookUrl?: string; xUrl?: string; linkedinUrl?: string; instagramUrl?: string; threadsUrl?: string }> } catch { return [] } })()
      await (px['authorizedperson'] as DeleteCreateManyDelegate).deleteMany({ where: { customerId: id } })
      if (arr.length) {
        await (px['authorizedperson'] as DeleteCreateManyDelegate).createMany({
          data: arr.map(p => ({
            customerId: id,
            name: String(p.name || ''),
            tckn: String(p.tckn || ''),
            email: p.email || null,
            phone: p.phone || null,
            address: p.address || null,
            authorizationDate: p.authorizationDate ? new Date(p.authorizationDate) : null,
            authorizationPeriod: p.authorizationPeriod || null,
            facebookUrl: p.facebookUrl || null,
            xUrl: p.xUrl || null,
            linkedinUrl: p.linkedinUrl || null,
            instagramUrl: p.instagramUrl || null,
            threadsUrl: p.threadsUrl || null,
          }))
        })
      }
    }
    if (px['customercapitalinfo'] && data.capitalInfo) {
      try {
        const cap = typeof data.capitalInfo === 'string' ? JSON.parse(data.capitalInfo) : data.capitalInfo
        await (px['customercapitalinfo'] as UpsertDelegate).upsert({
          where: { customerId: id },
          update: {
            paidInCapital: cap?.paidInCapital ? String(cap.paidInCapital) : null,
            allocations: cap?.allocations ? JSON.stringify(cap.allocations) : null,
          },
          create: {
            customerId: id,
            paidInCapital: cap?.paidInCapital ? String(cap.paidInCapital) : null,
            allocations: cap?.allocations ? JSON.stringify(cap.allocations) : null,
          }
        })
      } catch {}
    }

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

    try {
      const dir = path.join(process.cwd(), 'public', 'uploads', 'customers', id)
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true })
      }
    } catch {}

    const ops: Array<Prisma.PrismaPromise<unknown>> = []
    const p: Record<string, unknown> = prisma as unknown as Record<string, unknown>
    if (p['customerfile']) ops.push((p['customerfile'] as { deleteMany: (args: unknown) => Prisma.PrismaPromise<unknown> }).deleteMany({ where: { customerId: id } }))
    if (p['customercapitalinfo']) ops.push((p['customercapitalinfo'] as { deleteMany: (args: unknown) => Prisma.PrismaPromise<unknown> }).deleteMany({ where: { customerId: id } }))
    if (p['authorizedperson']) ops.push((p['authorizedperson'] as { deleteMany: (args: unknown) => Prisma.PrismaPromise<unknown> }).deleteMany({ where: { customerId: id } }))
    if (p['customeractivity']) ops.push((p['customeractivity'] as { deleteMany: (args: unknown) => Prisma.PrismaPromise<unknown> }).deleteMany({ where: { customerId: id } }))
    if (p['customerbranch']) ops.push((p['customerbranch'] as { deleteMany: (args: unknown) => Prisma.PrismaPromise<unknown> }).deleteMany({ where: { customerId: id } }))
    if (p['chambermembership']) ops.push((p['chambermembership'] as { deleteMany: (args: unknown) => Prisma.PrismaPromise<unknown> }).deleteMany({ where: { customerId: id } }))
    if (p['customerpartner']) ops.push((p['customerpartner'] as { deleteMany: (args: unknown) => Prisma.PrismaPromise<unknown> }).deleteMany({ where: { customerId: id } }))
    if (p['subscriptionaccrual']) ops.push((p['subscriptionaccrual'] as { deleteMany: (args: unknown) => Prisma.PrismaPromise<unknown> }).deleteMany({ where: { customerId: id } }))
    if (p['accountingperiod']) ops.push((p['accountingperiod'] as { deleteMany: (args: unknown) => Prisma.PrismaPromise<unknown> }).deleteMany({ where: { customerId: id } }))
    if (p['taxreturn']) ops.push((p['taxreturn'] as { deleteMany: (args: unknown) => Prisma.PrismaPromise<unknown> }).deleteMany({ where: { customerId: id } }))
    if (p['customerdeclarationsetting']) ops.push((p['customerdeclarationsetting'] as { deleteMany: (args: unknown) => Prisma.PrismaPromise<unknown> }).deleteMany({ where: { customerId: id } }))
    ops.push(prisma.customer.delete({ where: { id } }))
    await prisma.$transaction(ops)
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
