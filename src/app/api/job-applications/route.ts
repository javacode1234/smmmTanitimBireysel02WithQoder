import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { mkdir } from 'fs/promises'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const position = formData.get('position') as string | null
    const coverLetter = formData.get('coverLetter') as string | null
    const cvFile = formData.get('cv') as File

    if (!firstName || !lastName || !email || !phone || !cvFile) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      )
    }

    // Save CV file
    const bytes = await cvFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'cvs')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = cvFile.name.split('.').pop()
    const fileName = `${firstName}-${lastName}-${timestamp}.${fileExtension}`
    const filePath = join(uploadDir, fileName)
    
    await writeFile(filePath, buffer)
    
    const cvUrl = `/uploads/cvs/${fileName}`

    // Save to database
    const application = await prisma.jobApplication.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        position: position || undefined,
        cvUrl,
        coverLetter: coverLetter || undefined,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ 
      success: true, 
      application 
    })
  } catch (error) {
    console.error('Job application error:', error)
    return NextResponse.json(
      { error: 'Başvuru kaydedilemedi' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    const where = status ? { status: status as any } : {}
    
    const applications = await prisma.jobApplication.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Get applications error:', error)
    return NextResponse.json(
      { error: 'Başvurular yüklenemedi' },
      { status: 500 }
    )
  }
}
