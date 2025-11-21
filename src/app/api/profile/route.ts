import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const user = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      }
    })

    if (user) {
      return NextResponse.json(user)
    }

    return NextResponse.json({
      id: "default-admin",
      name: "Yönetici",
      email: "admin@example.com",
      image: null,
      role: "ADMIN"
    })
  } catch {
    return NextResponse.json({
      id: "default-admin",
      name: "Yönetici",
      email: "admin@example.com",
      image: null,
      role: "ADMIN"
    })
  }
}

// PATCH /api/profile - Update current user profile
export async function PATCH(req: NextRequest) {
  try {
    // Check if the model exists
    if (!prisma.user) {
      console.log('user model not found in prisma schema')
      return NextResponse.json({ error: "User model not available" }, { status: 501 })
    }
    
    const body = await req.json()
    const { name, email, image } = body

    // TODO: Get user ID from session/auth
    // For now, update admin user as default
    const currentUser = await prisma.user.findFirst({
      where: { role: "ADMIN" }
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: name || currentUser.name,
        email: email || currentUser.email,
        image: image !== undefined ? image : currentUser.image,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
