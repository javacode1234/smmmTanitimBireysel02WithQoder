import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return new NextResponse("Unauthorized", { status: 401 })

  const { searchParams } = new URL(req.url)
  const customerId = searchParams.get("customerId")

  if (!customerId) return new NextResponse("Customer ID required", { status: 400 })

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { documents: true }
    })

    if (!customer) return new NextResponse("Customer not found", { status: 404 })

    let documents = []
    try {
        documents = customer.documents ? JSON.parse(customer.documents) : []
    } catch (e) {
        documents = []
    }
    
    return NextResponse.json(documents)
  } catch (error) {
    console.error("Error fetching documents:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return new NextResponse("Unauthorized", { status: 401 })

  try {
    const body = await req.json()
    const { customerId, documents } = body

    if (!customerId) return new NextResponse("Customer ID required", { status: 400 })

    await prisma.customer.update({
      where: { id: customerId },
      data: { documents: JSON.stringify(documents) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving documents:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
