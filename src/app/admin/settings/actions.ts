'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// --- Common Types ---
export type PaginationParams = {
  page: number
  pageSize: number
  search?: string
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
}

export type ActionResponse<T> = {
  success: boolean
  data?: T
  error?: string
  total?: number
  pageCount?: number
}

// --- CITIES ---
export async function getCities({ page, pageSize, search, sortColumn, sortDirection }: PaginationParams): Promise<ActionResponse<any[]>> {
  try {
    const where = search ? {
      OR: [
        { name: { contains: search } },
        { id: { equals: parseInt(search) || 0 } }
      ]
    } : {}

    let orderBy: any = { id: 'asc' }
    if (sortColumn && sortDirection) {
      orderBy = { [sortColumn]: sortDirection }
    }

    const [data, total] = await Promise.all([
      prisma.city.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy
      }),
      prisma.city.count({ where })
    ])

    return { success: true, data, total, pageCount: Math.ceil(total / pageSize) }
  } catch (error) {
    console.error('getCities error:', error)
    return { success: false, error: 'İller getirilemedi' }
  }
}

export async function upsertCity(data: { id: number; name: string }) {
  try {
    await prisma.city.upsert({
      where: { id: data.id },
      update: { name: data.name },
      create: { id: data.id, name: data.name }
    })
    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    console.error('upsertCity error:', error)
    return { success: false, error: 'İl kaydedilemedi' }
  }
}

export async function deleteCity(id: number) {
  try {
    await prisma.city.delete({ where: { id } })
    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    console.error('deleteCity error:', error)
    return { success: false, error: 'İl silinemedi' }
  }
}

export async function deleteAllCities() {
  try {
    await prisma.$transaction(async (tx) => {
      // Önce ilçeleri sil
      await tx.district.deleteMany()
      
      // Vergi dairelerinin il bağlantısını kopar
      await tx.taxOffice.updateMany({
        data: { cityId: null }
      })
      
      // Sonra illeri sil
      await tx.city.deleteMany()
    })
    
    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error: any) {
    console.error('deleteAllCities error:', error)
    return { success: false, error: 'İller silinemedi. ' + (error.message || '') }
  }
}

// --- DISTRICTS ---
export async function getDistricts({ page, pageSize, search, sortColumn, sortDirection }: PaginationParams): Promise<ActionResponse<any[]>> {
  try {
    const where = search ? {
      OR: [
        { name: { contains: search } },
        { city: { name: { contains: search } } },
        { id: { equals: parseInt(search) || 0 } }
      ]
    } : {}

    let orderBy: any = { id: 'asc' }

    if (sortColumn && sortDirection) {
      if (sortColumn === 'city') {
        orderBy = [
          { city: { name: sortDirection } },
          { name: 'asc' }
        ]
      } else {
        orderBy = { [sortColumn]: sortDirection }
      }
    }

    const [data, total] = await Promise.all([
      prisma.district.findMany({
        where,
        include: { city: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy
      }),
      prisma.district.count({ where })
    ])

    return { success: true, data, total, pageCount: Math.ceil(total / pageSize) }
  } catch (error) {
    console.error('getDistricts error:', error)
    return { success: false, error: 'İlçeler getirilemedi' }
  }
}

export async function upsertDistrict(data: { id: number; name: string; cityId: number }) {
  try {
    await prisma.district.upsert({
      where: { id: data.id },
      update: { name: data.name, cityId: data.cityId },
      create: { id: data.id, name: data.name, cityId: data.cityId }
    })
    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    console.error('upsertDistrict error:', error)
    return { success: false, error: 'İlçe kaydedilemedi' }
  }
}

export async function deleteDistrict(id: number) {
  try {
    await prisma.district.delete({ where: { id } })
    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    console.error('deleteDistrict error:', error)
    return { success: false, error: 'İlçe silinemedi' }
  }
}

export async function deleteAllDistricts() {
  try {
    await prisma.district.deleteMany()
    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    console.error('deleteAllDistricts error:', error)
    return { success: false, error: 'İlçeler silinemedi' }
  }
}

// --- TAX OFFICES ---
export async function getTaxOffices({ page, pageSize, search, sortColumn, sortDirection }: PaginationParams): Promise<ActionResponse<any[]>> {
  try {
    const where = search ? {
      OR: [
        { name: { contains: search } },
        { code: { contains: search } },
        { city: { name: { contains: search } } },
        { district: { contains: search } }
      ]
    } : {}

    let orderBy: any = [{ code: 'asc' }, { name: 'asc' }]

    if (sortColumn && sortDirection) {
      if (sortColumn === 'city') {
        orderBy = [
          { city: { name: sortDirection } },
          { name: 'asc' }
        ]
      } else {
        orderBy = [
          { [sortColumn]: sortDirection },
          { name: 'asc' }
        ]
      }
    }

    const [data, total] = await Promise.all([
      prisma.taxOffice.findMany({
        where,
        include: { city: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy
      }),
      prisma.taxOffice.count({ where })
    ])

    return { success: true, data, total, pageCount: Math.ceil(total / pageSize) }
  } catch (error) {
    console.error('getTaxOffices error:', error)
    return { success: false, error: 'Vergi daireleri getirilemedi' }
  }
}

export async function upsertTaxOffice(data: { id?: string; code?: string; name: string; cityId?: number; district?: string }) {
  try {
    if (data.id) {
      await prisma.taxOffice.update({
        where: { id: data.id },
        data: { name: data.name, code: data.code || null, cityId: data.cityId || null, district: data.district }
      })
    } else {
      await prisma.taxOffice.create({
        data: { name: data.name, code: data.code || null, cityId: data.cityId || null, district: data.district }
      })
    }
    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    console.error('upsertTaxOffice error:', error)
    return { success: false, error: 'Vergi dairesi kaydedilemedi' }
  }
}

export async function deleteTaxOffice(id: string) {
  try {
    await prisma.taxOffice.delete({ where: { id } })
    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    console.error('deleteTaxOffice error:', error)
    return { success: false, error: 'Vergi dairesi silinemedi' }
  }
}

export async function deleteAllTaxOffices() {
  try {
    await prisma.$transaction(async (tx) => {
      // Müşterilerin vergi dairesi bağlantısını kopar
      await tx.customer.updateMany({
        data: { taxOfficeId: null }
      })
      
      // Vergi dairelerini sil
      await tx.taxOffice.deleteMany()
    })

    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error: any) {
    console.error('deleteAllTaxOffices error:', error)
    return { success: false, error: 'Vergi daireleri silinemedi. ' + (error.message || '') }
  }
}

// --- ACTIVITY CODES (NACE) ---
export async function getActivityCodes({ page, pageSize, search, sortColumn, sortDirection }: PaginationParams): Promise<ActionResponse<any[]>> {
  try {
    const where = search ? {
      OR: [
        { code: { contains: search } },
        { name: { contains: search } }
      ]
    } : {}

    const orderBy: any = {}
    if (sortColumn && sortDirection) {
      orderBy[sortColumn] = sortDirection
    } else {
      orderBy.code = 'asc'
    }

    const [data, total] = await Promise.all([
      prisma.activitycode.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy
      }),
      prisma.activitycode.count({ where })
    ])

    return { success: true, data, total, pageCount: Math.ceil(total / pageSize) }
  } catch (error) {
    console.error('getActivityCodes error:', error)
    return { success: false, error: 'Faaliyet kodları getirilemedi' }
  }
}

// --- SYSTEM SETTINGS ---
export async function getSystemSettings() {
  try {
    // Fallback to raw query if model is not generated yet
    let settings: any[] = []
    try {
      if ((prisma as any).systemSetting) {
        settings = await (prisma as any).systemSetting.findMany()
      } else {
        settings = await prisma.$queryRaw`SELECT * FROM SystemSetting`
      }
    } catch (e) {
       settings = await prisma.$queryRaw`SELECT * FROM SystemSetting`
    }

    const settingsMap: Record<string, string> = {}
    settings.forEach(s => {
      settingsMap[s.key] = s.value
    })
    return { success: true, data: settingsMap }
  } catch (error) {
    console.error('getSystemSettings error:', error)
    return { success: false, error: 'Sistem ayarları getirilemedi' }
  }
}

export async function updateSystemSetting(key: string, value: string) {
  try {
    console.log(`Updating setting: ${key} = ${value}`)
    
    // Fallback to raw query if model is not generated yet
    if ((prisma as any).systemSetting) {
      await (prisma as any).systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      })
    } else {
       // Raw SQL upsert for MySQL
       await prisma.$executeRaw`
        INSERT INTO SystemSetting (\`key\`, value, createdAt, updatedAt)
        VALUES (${key}, ${value}, NOW(), NOW())
        ON DUPLICATE KEY UPDATE value = ${value}, updatedAt = NOW()
       `
    }

    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    console.error('updateSystemSetting error:', error)
    return { success: false, error: 'Ayar güncellenemedi: ' + (error instanceof Error ? error.message : String(error)) }
  }
}

export async function upsertActivityCode(data: { id?: string; code: string; name: string }) {
  try {
    if (data.id) {
      await prisma.activitycode.update({
        where: { id: data.id },
        data: { code: data.code, name: data.name }
      })
    } else {
      // Check if code exists
      const exists = await prisma.activitycode.findUnique({ where: { code: data.code } })
      if (exists) {
        // Update if exists by code (fallback for uniqueness)
         await prisma.activitycode.update({
          where: { code: data.code },
          data: { name: data.name }
        })
      } else {
        await prisma.activitycode.create({
          data: { code: data.code, name: data.name }
        })
      }
    }
    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    console.error('upsertActivityCode error:', error)
    return { success: false, error: 'NACE kodu kaydedilemedi' }
  }
}

export async function deleteActivityCode(id: string) {
  try {
    await prisma.activitycode.delete({ where: { id } })
    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    console.error('deleteActivityCode error:', error)
    return { success: false, error: 'NACE kodu silinemedi' }
  }
}

export async function deleteAllActivityCodes() {
  try {
    await prisma.activitycode.deleteMany()
    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    console.error('deleteAllActivityCodes error:', error)
    return { success: false, error: 'NACE kodları silinemedi' }
  }
}
