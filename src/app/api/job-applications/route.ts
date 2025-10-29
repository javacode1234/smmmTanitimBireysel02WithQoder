import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { JobApplicationStatus } from '@prisma/client'

export async function GET() {
  try {
    const applications = await prisma.jobApplication.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error fetching job applications:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const position = formData.get('position') as string
    const experience = formData.get('experience') as string
    const education = formData.get('education') as string
    const coverLetter = formData.get('coverLetter') as string
    const cvFile = formData.get('cv') as File

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !position || !experience || !education || !cvFile) {
      return NextResponse.json(
        { error: 'Tüm zorunlu alanları doldurun' },
        { status: 400 }
      )
    }

    // Convert CV file to base64
    const bytes = await cvFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')

    // Create application in database with base64 CV
    const application = await prisma.jobApplication.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        phone,
        position,
        experience,
        education,
        coverLetter: coverLetter || 'Ön yazı eklenmedi',
        cvFileName: cvFile.name,
        cvFileData: base64Data,
        cvMimeType: cvFile.type,
        status: JobApplicationStatus.NEW,
      } as any, // TypeScript cache issue workaround - Prisma schema is correct
    })

    return NextResponse.json(
      { 
        message: 'Başvurunuz başarıyla alındı',
        application 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Job application error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        error: 'Başvuru gönderilirken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json()

    const application = await prisma.jobApplication.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error updating job application:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID gereklidir' },
        { status: 400 }
      )
    }

    await prisma.jobApplication.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Başvuru başarıyla silindi' })
  } catch (error) {
    console.error('Error deleting job application:', error)
    return NextResponse.json(
      { error: 'Başvuru silinirken hata oluştu' },
      { status: 500 }
    )
  }
}
