import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Bell, CreditCard, Calendar, Download, Paperclip } from "lucide-react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ClientAnnouncements } from "@/components/client/client-announcements"
import { ClientLastDeclarations } from "@/components/client/client-last-declarations"
import { DashboardFilter } from "@/components/client/dashboard-filter"
import { generateHistoricalTaxReturns } from "@/lib/tax-return-service"

export default async function ClientDashboard({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await auth()
  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  // Get the customer linked to this user
  const customer = await prisma.customer.findFirst({
    where: {
      OR: [
        { authorizedEmail: session.user.email },
        { username: session.user.email }
      ]
    }
  })

  // Ensure tax returns exist for the current period (Generates missing returns up to now)
  if (customer) {
    await generateHistoricalTaxReturns(customer.id)
  }

  // Get selected year or default to current year
  const currentYear = new Date().getFullYear()
  const selectedYear = searchParams?.year 
    ? parseInt(searchParams.year as string) 
    : currentYear

  // Fetch available years for filter
  const availableYears = customer ? await prisma.taxreturn.findMany({
    where: { customerId: customer.id },
    select: { year: true },
    distinct: ['year'],
    orderBy: { year: 'desc' }
  }) : []

  const years = availableYears.map(y => y.year)
  if (!years.includes(currentYear)) {
    years.unshift(currentYear)
    years.sort((a, b) => b - a)
  }

  // Fetch announcements (fetch more for client-side pagination)
  const announcements = await prisma.announcement.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  // Fetch tax returns if customer exists, filtered by year
  const taxReturns = customer ? await prisma.taxreturn.findMany({
    where: { 
      customerId: customer.id,
      year: selectedYear
    },
    orderBy: { dueDate: 'desc' },
  }) : []

  // Fetch this month's unpaid accruals for "Toplam Ödeme" (Payable this month)
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  const monthlyAccruals = customer ? await prisma.subscriptionaccrual.findMany({
    where: {
      customerId: customer.id,
      dueDate: {
        gte: startOfMonth,
        lte: endOfMonth
      },
      isPaid: false
    }
  }) : []

  const totalPayable = monthlyAccruals.reduce((sum, item) => sum + Number(item.amount), 0)

  // Fetch upcoming reminders (Tax returns due in next 30 days and not submitted)
  const next30Days = new Date(now)
  next30Days.setDate(now.getDate() + 30)
  
  const upcomingReturns = customer ? await prisma.taxreturn.count({
    where: {
      customerId: customer.id,
      isSubmitted: false,
      dueDate: {
        gte: now,
        lte: next30Days
      }
    }
  }) : 0

  // Serialize tax returns for client component
  const serializedTaxReturns = taxReturns.map(t => ({
    ...t,
    dueDate: t.dueDate.toISOString(),
    submittedDate: t.submittedDate ? t.submittedDate.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }))

  // Serialize announcements for client component
  const serializedAnnouncements = announcements.map(a => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }))

  const stats = {
    declarations: taxReturns.length,
    newDeclarations: taxReturns.filter(t => !t.isSubmitted).length,
    payment: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalPayable),
    reminders: upcomingReturns
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Hoş Geldiniz, {session.user.name}!</h1>
          <p className="text-muted-foreground mt-2">Hesap özetiniz ve son işlemleriniz</p>
        </div>
        <DashboardFilter years={years} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Beyannameler ({selectedYear})
            </CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.declarations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.newDeclarations} bekleyen belge
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
              Aktif duyurular
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ödenecek Tutar
            </CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.payment}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Bu ay (Ödenmemiş)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Yaklaşan Beyannameler
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reminders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Önümüzdeki 30 gün
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
            <ClientLastDeclarations declarations={serializedTaxReturns} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son Duyurular</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientAnnouncements announcements={serializedAnnouncements} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
