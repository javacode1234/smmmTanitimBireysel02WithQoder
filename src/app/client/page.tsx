import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Bell, CreditCard, Calendar } from "lucide-react"
import { InstitutionLogoCarousel } from "@/components/client/client-logo-carousel"

export default function ClientDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Hoş Geldiniz!</h1>
        <p className="text-muted-foreground mt-2">Hesap özetiniz ve son işlemleriniz</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Beyannameler
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">
              3 yeni belge
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Okunmamış Duyuru
            </CardTitle>
            <Bell className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground mt-1">
              Yeni bildirimler
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Ödeme
            </CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺15,750</div>
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
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground mt-1">
              Bu hafta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Client Logo Carousel */}
      <InstitutionLogoCarousel />

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
            <div className="space-y-4">
              {[
                { title: "Vergi Takvimi Güncellendi", date: "2 gün önce", unread: true },
                { title: "Yeni Mevzuat Değişiklikleri", date: "5 gün önce", unread: true },
                { title: "Ofis Tatil Bildirisi", date: "1 hafta önce", unread: false },
                { title: "SGK Prim Ödemeleri", date: "2 hafta önce", unread: false },
              ].map((announcement, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <p className={`font-medium ${announcement.unread ? "text-primary" : ""}`}>
                      {announcement.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{announcement.date}</p>
                  </div>
                  {announcement.unread && (
                    <Badge variant="default" className="ml-2">Yeni</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}