import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const session = await auth()

    if (session?.user) {
      if (session.user.role === 'CUSTOMER') {
        const customer = await prisma.customer.findUnique({
          where: { id: session.user.id },
          select: {
            id: true,
            companyName: true,
            authorizedName: true,
            username: true,
            authorizedEmail: true,
            logo: true,
            authorizedPhone: true,
            authorizedAddress: true,
            taxNumber: true
          }
        })
        
        if (customer) {
          return NextResponse.json({
            id: customer.id,
            name: customer.authorizedName || customer.username || "Mükellef",
            companyName: customer.companyName,
            email: customer.authorizedEmail,
            image: customer.logo,
            phone: customer.authorizedPhone,
            address: customer.authorizedAddress,
            taxNumber: customer.taxNumber,
            role: "CUSTOMER"
          })
        }
      } else {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
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
      }
    }

    // Fallback: Return admin user (legacy behavior)
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
  } catch (error) {
    console.error("Profile fetch error:", error)
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
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, email, image, clientData, passwordChange } = body

    // Update based on role
    if (session.user.role === 'CUSTOMER') {
        const customer = await prisma.customer.findUnique({
            where: { id: session.user.id }
        })

        if (!customer) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 })
        }

        const updateData: any = {}
        
        // Handle Password Change
        if (passwordChange) {
            const { currentPassword, newPassword } = passwordChange
            
            if (!currentPassword || !newPassword) {
                return NextResponse.json({ error: "Mevcut şifre ve yeni şifre gereklidir." }, { status: 400 })
            }

            if (!customer.loginPassword) {
                 return NextResponse.json({ error: "Mevcut şifre tanımlı değil. Lütfen yöneticinizle iletişime geçin." }, { status: 400 })
            }

            const isMatch = await bcrypt.compare(currentPassword, customer.loginPassword)
            if (!isMatch) {
                return NextResponse.json({ error: "Mevcut şifre hatalı." }, { status: 400 })
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10)
            updateData.loginPassword = hashedPassword
        }
        
        // Handle Standard Profile Update
        if (clientData) {
            if (clientData.phone) updateData.authorizedPhone = clientData.phone
            if (clientData.address) updateData.authorizedAddress = clientData.address
        }
        
        if (name) updateData.authorizedName = name
        if (email) updateData.authorizedEmail = email
        if (image) updateData.logo = image

        if (Object.keys(updateData).length > 0) {
            const updatedCustomer = await prisma.customer.update({
                where: { id: session.user.id },
                data: updateData,
                select: {
                    id: true,
                    companyName: true,
                    authorizedName: true,
                    authorizedEmail: true,
                    logo: true
                }
            })

            return NextResponse.json({
                user: {
                    id: updatedCustomer.id,
                    name: updatedCustomer.authorizedName || updatedCustomer.companyName,
                    email: updatedCustomer.authorizedEmail,
                    image: updatedCustomer.logo,
                    role: "CUSTOMER"
                }
            })
        }
        
        return NextResponse.json({ message: "No changes to update" })
    }

    // Admin update logic
    if (!prisma.user) {
      return NextResponse.json({ error: "User model not available" }, { status: 501 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name,
        email: email,
        image: image,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      }
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
