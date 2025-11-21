import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Default team members
function getDefaultTeamMembers() {
  return [
    {
      id: "default-1",
      name: "Muammer Uzun",
      position: "Kurucu Ortak & Baş Mali Müşavir",
      bio: "20 yıllık deneyimi ile ekibimize liderlik ediyor. TÜRMOB üyesi, YMM.",
      avatar: "",
      initials: "MU",
      color: "from-blue-600 to-cyan-600",
      email: "muammer@smmm.com",
      phone: "+90 532 123 45 67",
      linkedinUrl: "#",
      xUrl: "",
      facebookUrl: "",
      instagramUrl: "",
      threadsUrl: "",
      isActive: true,
      order: 0
    },
    {
      id: "default-2",
      name: "Ayşe Demir",
      position: "Kıdemli Mali Müşavir",
      bio: "Kurumsal şirketler ve holding muhasebesi konusunda uzman. 15 yıl deneyim.",
      avatar: "",
      initials: "AD",
      color: "from-purple-600 to-purple-700",
      email: "ayse@smmm.com",
      phone: "+90 532 234 56 78",
      linkedinUrl: "#",
      xUrl: "",
      facebookUrl: "",
      instagramUrl: "",
      threadsUrl: "",
      isActive: true,
      order: 1
    },
    {
      id: "default-3",
      name: "Mehmet Yılmaz",
      position: "Vergi Uzmanı",
      bio: "Vergi danışmanlığı ve optimizasyon konularında uzman. 12 yıl deneyim.",
      avatar: "",
      initials: "MY",
      color: "from-green-600 to-green-700",
      email: "mehmet@smmm.com",
      phone: "+90 532 345 67 89",
      linkedinUrl: "#",
      xUrl: "",
      facebookUrl: "",
      instagramUrl: "",
      threadsUrl: "",
      isActive: true,
      order: 2
    },
    {
      id: "default-4",
      name: "Zeynep Kaya",
      position: "Denetim Müdürü",
      bio: "Bağımsız denetim ve iç kontrol sistemleri konusunda uzman. 10 yıl deneyim.",
      avatar: "",
      initials: "ZK",
      color: "from-orange-600 to-orange-700",
      email: "zeynep@smmm.com",
      phone: "+90 532 456 78 90",
      linkedinUrl: "#",
      xUrl: "",
      facebookUrl: "",
      instagramUrl: "",
      threadsUrl: "",
      isActive: true,
      order: 3
    },
    {
      id: "default-5",
      name: "Can Öztürk",
      position: "Bordro ve SGK Uzmanı",
      bio: "İnsan kaynakları ve SGK işlemleri konusunda uzman. 8 yıl deneyim.",
      avatar: "",
      initials: "CÖ",
      color: "from-red-600 to-red-700",
      email: "can@smmm.com",
      phone: "+90 532 567 89 01",
      linkedinUrl: "#",
      xUrl: "",
      facebookUrl: "",
      instagramUrl: "",
      threadsUrl: "",
      isActive: true,
      order: 4
    },
    {
      id: "default-6",
      name: "Elif Şahin",
      position: "Dijital Dönüşüm Uzmanı",
      bio: "E-dönüşüm ve dijital muhasebe sistemleri konusunda uzman. 6 yıl deneyim.",
      avatar: "",
      initials: "EŞ",
      color: "from-cyan-600 to-cyan-700",
      email: "elif@smmm.com",
      phone: "+90 532 678 90 12",
      linkedinUrl: "#",
      xUrl: "",
      facebookUrl: "",
      instagramUrl: "",
      threadsUrl: "",
      isActive: true,
      order: 5
    }
  ];
}

export async function GET() {
  try {
    const members = await prisma.teamMember.findMany({
      orderBy: {
        order: 'asc'
      }
    })

    if (!members || members.length === 0) {
      return NextResponse.json(getDefaultTeamMembers())
    }

    return NextResponse.json(members)
  } catch (error: unknown) {
    console.error('Error fetching team members:', error)
    const err = error as { code?: string; message?: string }
    if (err.code === 'P2021' || err.message?.includes('does not exist')) {
      return NextResponse.json(getDefaultTeamMembers())
    }
    return NextResponse.json(getDefaultTeamMembers())
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    console.log('POST /api/content/team - Received data:', JSON.stringify(data, null, 2))
    
    if (!data.name || !data.position) {
      console.error('POST /api/content/team - Missing required fields')
      return NextResponse.json(
        { error: 'Name ve position zorunludur', details: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const member = await prisma.teamMember.create({
      data: {
        name: String(data.name),
        position: String(data.position),
        bio: data.bio ? String(data.bio) : null,
        avatar: data.avatar || null,
        initials: String(data.initials || '??'),
        color: String(data.color || 'from-blue-500 to-blue-600'),
        email: data.email ? String(data.email) : null,
        phone: data.phone ? String(data.phone) : null,
        linkedinUrl: data.linkedinUrl ? String(data.linkedinUrl) : null,
        xUrl: data.xUrl ? String(data.xUrl) : null,
        facebookUrl: data.facebookUrl ? String(data.facebookUrl) : null,
        instagramUrl: data.instagramUrl ? String(data.instagramUrl) : null,
        threadsUrl: data.threadsUrl ? String(data.threadsUrl) : null,
        isActive: Boolean(data.isActive ?? true),
        order: Number(data.order ?? 0)
      }
    })

    console.log('POST /api/content/team - Team member created successfully:', member.id)
    return NextResponse.json(member)
  } catch (error) {
    console.error('POST /api/content/team - Error creating team member:', error)
    return NextResponse.json(
      { 
        error: 'Ekip üyesi eklenemedi', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID gerekli' },
        { status: 400 }
      )
    }

    const data = await request.json()
    
    const member = await prisma.teamMember.update({
      where: { id },
      data: {
        name: data.name,
        position: data.position,
        bio: data.bio,
        avatar: data.avatar,
        initials: data.initials || '??',
        color: data.color || 'from-blue-500 to-blue-600',
        email: data.email,
        phone: data.phone,
        linkedinUrl: data.linkedinUrl,
        xUrl: data.xUrl,
        facebookUrl: data.facebookUrl,
        instagramUrl: data.instagramUrl,
        threadsUrl: data.threadsUrl,
        isActive: data.isActive,
        order: data.order
      }
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json(
      { error: 'Ekip üyesi güncellenemedi', details: error instanceof Error ? error.message : 'Unknown error' },
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
        { error: 'ID gerekli' },
        { status: 400 }
      )
    }

    await prisma.teamMember.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting team member:', error)
    return NextResponse.json(
      { error: 'Ekip üyesi silinemedi' },
      { status: 500 }
    )
  }
}
