import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { AnnouncementsTable } from "@/components/client/announcements-table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default async function AnnouncementsPage() {
  const session = await auth()
  if (!session) {
    redirect("/auth/signin")
  }

  const announcements = await prisma.announcement.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  })

  // Convert dates to strings to avoid serialization issues
  const serializedAnnouncements = announcements.map(a => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    content: a.content || null, // Ensure null instead of undefined
    attachments: a.attachments || null
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Duyurular</h1>
        <p className="text-muted-foreground mt-2">
          Mali müşavirinizden gelen tüm duyurular
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Duyuru Listesi</CardTitle>
          <CardDescription>
            Toplam {announcements.length} duyuru listeleniyor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnnouncementsTable announcements={serializedAnnouncements} />
        </CardContent>
      </Card>
    </div>
  )
}
