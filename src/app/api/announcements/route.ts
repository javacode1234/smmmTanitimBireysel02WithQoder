import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { prisma } from '@/lib/prisma'
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    // Allow customers and admins to view
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(announcements)
  } catch (error) {
    console.error("[ANNOUNCEMENTS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized: Role is " + (session?.user?.role || "null"), { status: 401 })
    }

    const body = await req.json()
    const { title, description, content, attachments, isActive } = body

    if (!title || !description) {
      return new NextResponse("Title and description are required", { status: 400 })
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        description,
        content,
        attachments: attachments ? JSON.stringify(attachments) : null,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json(announcement)
  } catch (error) {
    console.error("[ANNOUNCEMENTS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { id, title, description, content, attachments, isActive } = body

    if (!id) {
      return new NextResponse("ID is required", { status: 400 })
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        description,
        content,
        attachments: attachments ? JSON.stringify(attachments) : undefined,
        isActive
      }
    })

    return NextResponse.json(announcement)
  } catch (error) {
    console.error("[ANNOUNCEMENTS_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return new NextResponse("ID is required", { status: 400 })
    }

    await prisma.announcement.delete({
      where: { id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[ANNOUNCEMENTS_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
