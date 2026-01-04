import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { declarationconfig_frequency, declarationconfig_taxPeriodType } from "@prisma/client"

export async function GET() {
  try {
    const items = await prisma.declarationconfig.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(items)
  } catch (error: unknown) {
    console.error("Error fetching declaration configs:", error)
    const err = error as { code?: string }
    if (err?.code === "P2021" || err?.code === "P2022") {
      return NextResponse.json([])
    }
    return NextResponse.json({ error: "Failed to fetch declarations" }, { status: 500 })
  }
}

type ReqBody = Record<string, unknown>

export async function POST(request: NextRequest) {
  try {
    const body: ReqBody = await request.json()
    const {
      type,
      enabled = true,
      frequency,
      taxPeriodType,
      dueDay,
      dueMonth,
      quarterOffset,
      optional,
      quarters,
    } = body

    if (!type || !frequency) {
      return NextResponse.json({ error: "type and frequency are required" }, { status: 400 })
    }

    const created = await prisma.declarationconfig.create({
      data: {
        id: (await import('crypto')).randomUUID(),
        type: String(type),
        enabled: Boolean(enabled),
        frequency: String(frequency).toUpperCase() as declarationconfig_frequency,
        taxPeriodType: taxPeriodType ? (String(taxPeriodType).toUpperCase() as declarationconfig_taxPeriodType) : undefined,
        dueDay: dueDay != null ? Number(dueDay) : undefined,
        dueMonth: dueMonth != null ? Number(dueMonth) : undefined,
        quarterOffset: quarterOffset != null ? Number(quarterOffset) : undefined,
        optional: !!optional,
        quarters: (quarters as string | null) ?? null,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error: unknown) {
    console.error("Error creating declaration config:", error)
    const err = error as { code?: string; message?: string }
    const msg = String(err?.message || "")
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "type must be unique" }, { status: 409 })
    }
    // Fallback: if Prisma Client is outdated and optional arg is unknown, retry without it
    if (msg.includes("Unknown argument") && msg.toLowerCase().includes("optional")) {
      try {
        const body2: ReqBody = await request.clone().json()
        const { type: t, enabled: e, frequency: f, dueDay: dd, dueMonth: dmo, quarterOffset: qo } = body2
        const created = await prisma.declarationconfig.create({
          data: {
            id: (await import('crypto')).randomUUID(),
            type: String(t),
            enabled: Boolean(e),
            frequency: String(f).toUpperCase() as declarationconfig_frequency,
            dueDay: dd != null ? Number(dd) : undefined,
            dueMonth: dmo != null ? Number(dmo) : undefined,
            quarterOffset: qo != null ? Number(qo) : undefined,
            updatedAt: new Date(),
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
    const body: ReqBody = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    const updated = await prisma.declarationconfig.update({
      where: { id: String(id) },
      data: {
        ...data,
        frequency: data.frequency ? (String(data.frequency).toUpperCase() as declarationconfig_frequency) : undefined,
        taxPeriodType: data.taxPeriodType ? (String(data.taxPeriodType).toUpperCase() as declarationconfig_taxPeriodType) : undefined,
        dueDay: data.dueDay != null ? Number(data.dueDay) : undefined,
        dueMonth: data.dueMonth != null ? Number(data.dueMonth) : undefined,
        quarterOffset: data.quarterOffset != null ? Number(data.quarterOffset) : undefined,
        optional: data.optional != null ? !!data.optional : undefined,
        quarters: data.quarters !== undefined ? data.quarters : undefined,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(updated)
  } catch (error: unknown) {
    console.error("Error updating declaration config:", error)
    const err = error as { message?: string }
    const msg = String(err?.message || "")
    // Fallback: unknown optional argument → retry without it
    if (msg.includes("Unknown argument") && msg.toLowerCase().includes("optional")) {
      try {
        const body2: ReqBody = await request.clone().json()
        const { id: updateId, ...updateData } = body2
        const updated = await prisma.declarationconfig.update({
          where: { id: String(updateId) },
          data: {
            ...updateData,
            frequency: updateData.frequency ? (String(updateData.frequency).toUpperCase() as declarationconfig_frequency) : undefined,
            dueDay: updateData.dueDay != null ? Number(updateData.dueDay) : undefined,
            dueMonth: updateData.dueMonth != null ? Number(updateData.dueMonth) : undefined,
            quarterOffset: updateData.quarterOffset != null ? Number(updateData.quarterOffset) : undefined,
            updatedAt: new Date(),
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

    await prisma.declarationconfig.delete({ where: { id } })
    return NextResponse.json({ message: "Declaration deleted" })
  } catch (error) {
    console.error("Error deleting declaration config:", error)
    return NextResponse.json({ error: "Failed to delete declaration" }, { status: 500 })
  }
}
