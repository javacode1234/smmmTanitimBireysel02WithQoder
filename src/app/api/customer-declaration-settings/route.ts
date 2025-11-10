import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET /api/customer-declaration-settings?customerId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get("customerId")
    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 })
    }

    const items = await (prisma as any).customerDeclarationSetting.findMany({
      where: { customerId },
      orderBy: { type: "asc" },
    })

    // Map DB enum to lower-case strings for UI
    const mapped = items.map((i: any) => ({
      type: i.type,
      enabled: i.enabled,
      frequency: String(i.frequency).toLowerCase(),
      dueDay: i.dueDay,
      dueHour: i.dueHour,
      dueMinute: i.dueMinute,
      dueMonth: i.dueMonth ?? undefined,
      quarterOffset: i.quarterOffset ?? undefined,
      yearlyCount: i.yearlyCount ?? undefined,
      skipQuarter: i.skipQuarter ?? undefined,
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error("GET customer-declaration-settings error:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

// POST /api/customer-declaration-settings
// Body: { customerId: string, settings: Array<...same shape as UI...> }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customerId, settings } = body
    if (!customerId || !Array.isArray(settings)) {
      return NextResponse.json({ error: "customerId and settings are required" }, { status: 400 })
    }

    // Replace existing set: delete and create many
    await (prisma as any).customerDeclarationSetting.deleteMany({ where: { customerId } })

    if (settings.length > 0) {
      await (prisma as any).customerDeclarationSetting.createMany({
        data: settings.map((s: any) => ({
          customerId,
          type: s.type,
          enabled: !!s.enabled,
          frequency: String(s.frequency).toUpperCase(),
          dueDay: Number(s.dueDay),
          dueHour: Number(s.dueHour),
          dueMinute: Number(s.dueMinute),
          dueMonth: s.dueMonth != null ? Number(s.dueMonth) : null,
          quarterOffset: s.quarterOffset != null ? Number(s.quarterOffset) : null,
          yearlyCount: s.yearlyCount != null ? Number(s.yearlyCount) : null,
          skipQuarter: s.skipQuarter != null ? Number(s.skipQuarter) : null,
        })),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("POST customer-declaration-settings error:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
