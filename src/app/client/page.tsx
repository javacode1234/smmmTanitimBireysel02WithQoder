import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Bell, CreditCard, Calendar, Download, Paperclip } from "lucide-react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ClientAnnouncements } from "@/components/client/client-announcements"

export default async function ClientDashboard() {
  const session = await auth()
  if (!session) {
    redirect("/auth/signin")
  }

  // Fetch announcements
  const announcements = await prisma.announcement.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  // Mock data for other cards for now (can be connected to real data later)
  const stats = {
    declarations: 12,
    newDeclarations: 3,
    payment: "₺15,750",
    reminders: 2
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Hoş Geldiniz, {session.user.name}!</h1>
        <p className="text-muted-foreground mt-2">Hesap özetiniz ve son işlemleriniz</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Beyannameler
            </CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.declarations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.newDeclarations} yeni belge
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Duyurular
            </CardTitle>
            <Bell className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Son duyurular
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Ödeme
            </CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.payment}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Bu ay
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Yaklaşan Hatırlatma
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reminders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Bu hafta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Client Logo Carousel removed */}

      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Son Beyannameler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "KDV Beyannamesi", period: "2024-10", status: "completed" },
                { name: "Muhtasar Beyannamesi", period: "2024-10", status: "completed" },
                { name: "Gelir Vergisi", period: "2024-Q3", status: "completed" },
                { name: "KDV Beyannamesi", period: "2024-09", status: "completed" },
              ].map((declaration, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{declaration.name}</p>
                    <p className="text-sm text-muted-foreground">{declaration.period} Dönemi</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Tamamlandı
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son Duyurular</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientAnnouncements announcements={announcements} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
