import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { randomUUID } from 'crypto'

export async function GET() {
  try {
    // Check if the model exists
    if (!prisma.contactmessage) {
      console.log('contactmessage model not found in prisma schema')
      return NextResponse.json([])
    }
    
    const messages = await prisma.contactmessage.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching contact messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if the model exists
    if (!prisma.contactmessage) {
      console.log('contactmessage model not found in prisma schema')
      return NextResponse.json(
        { error: 'Contact messages not supported in current database schema' },
        { status: 501 }
      )
    }
    
    const { name, email, phone, subject, message } = await request.json()

    if (!name || !email || !phone || !subject || !message) {
      return NextResponse.json(
        { error: 'Tüm alanları doldurun' },
        { status: 400 }
      )
    }

    const contactMessage = await prisma.contactmessage.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
        phone,
        subject,
        message,
        status: 'NEW',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(
      { message: 'Mesajınız başarıyla gönderildi', contactMessage },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating contact message:', error)
    return NextResponse.json(
      { error: 'Mesaj gönderilirken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check if the model exists
    if (!prisma.contactmessage) {
      console.log('contactmessage model not found in prisma schema')
      return NextResponse.json(
        { error: 'Contact messages not supported in current database schema' },
        { status: 501 }
      )
    }
    
    const { id, status } = await request.json()

    const message = await prisma.contactmessage.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Error updating contact message:', error)
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check if the model exists
    if (!prisma.contactmessage) {
      console.log('contactmessage model not found in prisma schema')
      return NextResponse.json(
        { error: 'Contact messages not supported in current database schema' },
        { status: 501 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID gereklidir' },
        { status: 400 }
      )
    }

    await prisma.contactmessage.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Mesaj başarıyla silindi' })
  } catch (error) {
    console.error('Error deleting contact message:', error)
    return NextResponse.json(
      { error: 'Mesaj silinirken hata oluştu' },
      { status: 500 }
    )
  }
}