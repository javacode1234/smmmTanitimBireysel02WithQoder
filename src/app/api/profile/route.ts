import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // TODO: Get user ID from session
    // For now, using the first admin user from database
    const users = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      take: 1,
      include: { client: true }
    })
    
    const user = users[0]
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, image, clientData } = body
    
    // TODO: Get user ID from session
    // For now, using the first admin user from database
    const users = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      take: 1
    })
    
    const userId = users[0]?.id
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        image,
      },
      include: {
        client: true
      }
    })

    // If client data is provided, update client info
    if (clientData && updatedUser.client) {
      await prisma.client.update({
        where: { id: updatedUser.client.id },
        data: {
          companyName: clientData.companyName,
          taxNumber: clientData.taxNumber,
          phone: clientData.phone,
          address: clientData.address,
        }
      })
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
