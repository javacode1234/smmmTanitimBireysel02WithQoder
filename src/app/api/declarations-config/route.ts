import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const items = await (prisma as any).declarationConfig.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(items)
  } catch (error: any) {
    console.error("Error fetching declaration configs:", error)
    const code = error?.code
    // If table not found or column issue during development, return empty list to avoid breaking UI
    if (code === "P2021" || code === "P2022") {
      return NextResponse.json([])
    }
    return NextResponse.json({ error: "Failed to fetch declarations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      type,
      enabled = true,
      frequency,
      dueDay,
      dueHour,
      dueMinute,
      dueMonth,
      quarterOffset,
      yearlyCount,
      skipQuarter,
      optional,
    } = body

    if (!type || !frequency) {
      return NextResponse.json({ error: "type and frequency are required" }, { status: 400 })
    }

    const created = await (prisma as any).declarationConfig.create({
      data: {
        type,
        enabled,
        frequency: String(frequency).toUpperCase(),
        dueDay: dueDay != null ? Number(dueDay) : undefined,
        dueHour: dueHour != null ? Number(dueHour) : undefined,
        dueMinute: dueMinute != null ? Number(dueMinute) : undefined,
        dueMonth: dueMonth != null ? Number(dueMonth) : undefined,
        quarterOffset: quarterOffset != null ? Number(quarterOffset) : undefined,
        yearlyCount: yearlyCount != null ? Number(yearlyCount) : undefined,
        skipQuarter: !!skipQuarter,
        optional: !!optional,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error: any) {
    console.error("Error creating declaration config:", error)
    const msg = String(error?.message || "")
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "type must be unique" }, { status: 409 })
    }
    // Fallback: if Prisma Client is outdated and optional arg is unknown, retry without it
    if (msg.includes("Unknown argument") && msg.toLowerCase().includes("optional")) {
      try {
        const created = await (prisma as any).declarationConfig.create({
          data: {
            type,
            enabled,
            frequency: String(frequency).toUpperCase(),
            dueDay: dueDay != null ? Number(dueDay) : undefined,
            dueHour: dueHour != null ? Number(dueHour) : undefined,
            dueMinute: dueMinute != null ? Number(dueMinute) : undefined,
            dueMonth: dueMonth != null ? Number(dueMonth) : undefined,
            quarterOffset: quarterOffset != null ? Number(quarterOffset) : undefined,
            yearlyCount: yearlyCount != null ? Number(yearlyCount) : undefined,
            skipQuarter: !!skipQuarter,
          },
        })
        return NextResponse.json(created, { status: 201 })
      } catch (e) {
        console.error("Fallback create without optional failed:", e)
      }
    }
    return NextResponse.json({ error: "Failed to create declaration" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    const updated = await (prisma as any).declarationConfig.update({
      where: { id },
      data: {
        ...data,
        frequency: data.frequency ? String(data.frequency).toUpperCase() : undefined,
        dueDay: data.dueDay != null ? Number(data.dueDay) : undefined,
        dueHour: data.dueHour != null ? Number(data.dueHour) : undefined,
        dueMinute: data.dueMinute != null ? Number(data.dueMinute) : undefined,
        dueMonth: data.dueMonth != null ? Number(data.dueMonth) : undefined,
        quarterOffset: data.quarterOffset != null ? Number(data.quarterOffset) : undefined,
        yearlyCount: data.yearlyCount != null ? Number(data.yearlyCount) : undefined,
        skipQuarter: data.skipQuarter != null ? !!data.skipQuarter : undefined,
        optional: data.optional != null ? !!data.optional : undefined,
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error("Error updating declaration config:", error)
    const msg = String(error?.message || "")
    // Fallback: unknown optional argument → retry without it
    if (msg.includes("Unknown argument") && msg.toLowerCase().includes("optional")) {
      try {
        const updated = await (prisma as any).declarationConfig.update({
          where: { id },
          data: {
            ...data,
            frequency: data.frequency ? String(data.frequency).toUpperCase() : undefined,
            dueDay: data.dueDay != null ? Number(data.dueDay) : undefined,
            dueHour: data.dueHour != null ? Number(data.dueHour) : undefined,
            dueMinute: data.dueMinute != null ? Number(data.dueMinute) : undefined,
            dueMonth: data.dueMonth != null ? Number(data.dueMonth) : undefined,
            quarterOffset: data.quarterOffset != null ? Number(data.quarterOffset) : undefined,
            yearlyCount: data.yearlyCount != null ? Number(data.yearlyCount) : undefined,
            skipQuarter: data.skipQuarter != null ? !!data.skipQuarter : undefined,
          },
        })
        return NextResponse.json(updated)
      } catch (e) {
        console.error("Fallback update without optional failed:", e)
      }
    }
    return NextResponse.json({ error: "Failed to update declaration" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    await (prisma as any).declarationConfig.delete({ where: { id } })
    return NextResponse.json({ message: "Declaration deleted" })
  } catch (error) {
    console.error("Error deleting declaration config:", error)
    return NextResponse.json({ error: "Failed to delete declaration" }, { status: 500 })
  }
}
