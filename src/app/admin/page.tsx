import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Bell, TrendingUp } from "lucide-react"

export default function AdminDashboard() {
  const stats = [
    {
      title: "Toplam Müşteri",
      value: "48",
      icon: Users,
      trend: "+12%",
      color: "text-blue-600"
    },
    {
      title: "Beyannameler",
      value: "156",
      icon: FileText,
      trend: "+8%",
      color: "text-green-600"
    },
    {
      title: "Duyurular",
      value: "12",
      icon: Bell,
      trend: "+2",
      color: "text-orange-600"
    },
    {
      title: "Aylık Gelir",
      value: "₺124,500",
      icon: TrendingUp,
      trend: "+15%",
      color: "text-purple-600"
    }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Sistem genel bakış ve istatistikler</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">{stat.trend}</span> geçen aya göre
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Son Müşteriler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">Müşteri {i}</p>
                    <p className="text-sm text-muted-foreground">musteri{i}@example.com</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2 gün önce</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son Beyannameler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">KDV Beyannamesi {i}</p>
                    <p className="text-sm text-muted-foreground">2024-0{i} Dönemi</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Tamamlandı
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
