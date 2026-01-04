"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Bell, TrendingUp, CreditCard } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar, Area, AreaChart, PieChart, Pie, Cell } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow } from "date-fns"
import { enUS, tr } from "date-fns/locale"

function PeriodSelector({ period, setPeriod }: { period: 'monthly' | 'yearly', setPeriod: (p: 'monthly' | 'yearly') => void }) {
  return (
    <div className="flex text-[10px] border rounded overflow-hidden">
      <button 
        className={`px-1.5 py-0.5 transition-colors ${period === 'monthly' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
        onClick={() => setPeriod('monthly')}
      >Ay</button>
      <button 
        className={`px-1.5 py-0.5 transition-colors ${period === 'yearly' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
        onClick={() => setPeriod('yearly')}
      >Yıl</button>
    </div>
  )
}

export default function AdminDashboard() {
  const [customerStats, setCustomerStats] = useState({
    totalActive: 0,
    monthlyGrowthRate: "0.0",
    yearlyGrowthRate: "0.0"
  })
  const [latestCustomers, setLatestCustomers] = useState<any[]>([])
  const [latestCustomersLimit, setLatestCustomersLimit] = useState('5')
  const [latestTaxReturns, setLatestTaxReturns] = useState<any[]>([])
  const [latestTaxReturnsLimit, setLatestTaxReturnsLimit] = useState('5')
  const [customerStatsPeriod, setCustomerStatsPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const [declarationStats, setDeclarationStats] = useState({
    currentMonthCount: 0,
    monthlyGrowthRate: "0.0",
    yearlyGrowthRate: "0.0"
  })
  const [declarationStatsPeriod, setDeclarationStatsPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const [incomeStats, setIncomeStats] = useState({
    monthly: 0,
    yearly: 0,
    monthlyGrowth: "0.0",
    yearlyGrowth: "0.0"
  })
  const [incomeStatsPeriod, setIncomeStatsPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const [accrualStats, setAccrualStats] = useState({
    monthly: 0,
    yearly: 0,
    monthlyGrowth: "0.0",
    yearlyGrowth: "0.0"
  })
  const [accrualStatsPeriod, setAccrualStatsPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const [chartData, setChartData] = useState<any[]>([])
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area' | 'composed'>('line')
  const [dateRange, setDateRange] = useState<'6' | '12'>('12')

  const [incomeDistribution, setIncomeDistribution] = useState<any[]>([])
  const [incomeDistributionFilter, setIncomeDistributionFilter] = useState('this-month')
  const [incomeDistributionBasis, setIncomeDistributionBasis] = useState('accrual')
  const [incomeDistributionTotal, setIncomeDistributionTotal] = useState(0)

  useEffect(() => {
    fetch('/api/customers?mode=stats')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
            setCustomerStats(data)
        }
      })
      .catch(err => console.error(err))

    fetch(`/api/customers?pageSize=${latestCustomersLimit}`)
      .then(res => res.json())
      .then(data => {
        if (data.items) {
          setLatestCustomers(data.items)
        }
      })
      .catch(err => console.error(err))
  }, [latestCustomersLimit])

  useEffect(() => {
    fetch(`/api/tax-returns?sort=latest&limit=${latestTaxReturnsLimit}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLatestTaxReturns(data)
        }
      })
      .catch(err => console.error(err))
  }, [latestTaxReturnsLimit])

  useEffect(() => {
    fetch('/api/tax-returns?mode=stats')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
            setDeclarationStats(data)
        }
      })
      .catch(err => console.error(err))

    fetch('/api/subscription-accruals?mode=stats&type=card')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
            if (data.incomeStats) setIncomeStats(data.incomeStats)
            if (data.accrualStats) setAccrualStats(data.accrualStats)
        }
      })
      .catch(err => console.error(err))

    fetch('/api/subscription-accruals?mode=stats&type=chart')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
            // Reverse data to show oldest to newest if API returns newest first (API loop is 11 down to 0, so it pushes oldest first? No.
            // Loop: i=11 (11 months ago) -> date. chartData.push. So it pushes oldest first. Correct.
            setChartData(data)
        }
      })
      .catch(err => console.error(err))
  }, [])

  useEffect(() => {
    fetch(`/api/subscription-accruals?mode=stats&type=distribution&period=${incomeDistributionFilter}&basis=${incomeDistributionBasis}`)
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setIncomeDistribution(data.data)
          setIncomeDistributionTotal(data.total)
        }
      })
      .catch(err => console.error(err))
  }, [incomeDistributionFilter, incomeDistributionBasis])

  const formatGrowth = (rate: string) => {
    const val = Number(rate)
    return `${val > 0 ? '+' : ''}${rate}%`
  }

  const stats = [
    {
      title: "Toplam Müşteri",
      value: customerStats.totalActive.toString(),
      icon: Users,
      trend: formatGrowth(customerStatsPeriod === 'monthly' ? customerStats.monthlyGrowthRate : customerStats.yearlyGrowthRate),
      color: "text-blue-600",
      period: customerStatsPeriod,
      setPeriod: setCustomerStatsPeriod,
      periodLabel: customerStatsPeriod === 'monthly' ? 'geçen aya göre' : 'geçen yıla göre'
    },
    {
      title: "Beyannameler (Bu Ay)",
      value: declarationStats.currentMonthCount.toString(),
      icon: FileText,
      trend: formatGrowth(declarationStatsPeriod === 'monthly' ? declarationStats.monthlyGrowthRate : declarationStats.yearlyGrowthRate),
      color: "text-green-600",
      period: declarationStatsPeriod,
      setPeriod: setDeclarationStatsPeriod,
      periodLabel: declarationStatsPeriod === 'monthly' ? 'geçen aya göre' : 'geçen yıl aynı aya göre'
    },
    {
      title: "Tahakkuk",
      value: `₺${(accrualStatsPeriod === 'monthly' ? accrualStats.monthly : accrualStats.yearly).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: CreditCard,
      trend: formatGrowth(accrualStatsPeriod === 'monthly' ? accrualStats.monthlyGrowth : accrualStats.yearlyGrowth),
      color: "text-indigo-600",
      period: accrualStatsPeriod,
      setPeriod: setAccrualStatsPeriod,
      periodLabel: accrualStatsPeriod === 'monthly' ? 'geçen aya göre' : 'geçen yıla göre'
    },
    {
      title: "Aylık Gelir (Tahsilat)",
      value: `₺${(incomeStatsPeriod === 'monthly' ? incomeStats.monthly : incomeStats.yearly).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      trend: formatGrowth(incomeStatsPeriod === 'monthly' ? incomeStats.monthlyGrowth : incomeStats.yearlyGrowth),
      color: "text-purple-600",
      period: incomeStatsPeriod,
      setPeriod: setIncomeStatsPeriod,
      periodLabel: incomeStatsPeriod === 'monthly' ? 'geçen aya göre' : 'geçen yıla göre'
    },
    {
      title: "Duyurular",
      value: "12",
      icon: Bell,
      trend: "+2",
      color: "text-orange-600"
    }
  ]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gösterge Paneli</h1>
        <p className="text-muted-foreground mt-2">Sistem genel bakışı ve istatistikler</p>
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
              <div className="flex justify-between items-start">
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.setPeriod && stat.period && (
                  <PeriodSelector period={stat.period} setPeriod={stat.setPeriod} />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className={parseFloat(stat.trend) >= 0 ? "text-green-600" : "text-red-600"}>{stat.trend}</span> {stat.periodLabel || 'geçen aya göre'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Chart Section */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Finansal Durum ve Müşteri Analizi</CardTitle>
            <div className="flex items-center gap-4">
              <Tabs id="dashboard-chart-tabs" defaultValue="line" value={chartType} onValueChange={(v) => setChartType(v as any)}>
                <TabsList>
                  <TabsTrigger value="line">Trend (Çizgi)</TabsTrigger>
                  <TabsTrigger value="bar">Karşılaştırma (Sütun)</TabsTrigger>
                  <TabsTrigger value="composed">Birleşik</TabsTrigger>
                </TabsList>
              </Tabs>
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as any)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Dönem Seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">Son 6 Ay</SelectItem>
                  <SelectItem value="12">Son 12 Ay</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData.slice(dateRange === '6' ? -6 : 0)}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#ff7300" />
                  <Tooltip />
                  <Legend />
                  {chartType === 'line' && (
                    <>
                      <Line yAxisId="left" type="monotone" dataKey="accrual" name="Tahakkuk (₺)" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                      <Line yAxisId="left" type="monotone" dataKey="income" name="Gelir (₺)" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                      <Line yAxisId="right" type="monotone" dataKey="customers" name="Müşteri Sayısı" stroke="#ff7300" strokeWidth={2} dot={{ r: 4 }} />
                    </>
                  )}
                  {chartType === 'bar' && (
                    <>
                      <Bar yAxisId="left" dataKey="accrual" name="Tahakkuk (₺)" fill="#8884d8" />
                      <Bar yAxisId="left" dataKey="income" name="Gelir (₺)" fill="#82ca9d" />
                      <Bar yAxisId="right" dataKey="customers" name="Müşteri Sayısı" fill="#ff7300" />
                    </>
                  )}
                  {chartType === 'composed' && (
                    <>
                      <Bar yAxisId="left" dataKey="accrual" name="Tahakkuk (₺)" fill="#8884d8" barSize={20} />
                      <Bar yAxisId="left" dataKey="income" name="Gelir (₺)" fill="#82ca9d" barSize={20} />
                      <Line yAxisId="right" type="monotone" dataKey="customers" name="Müşteri Sayısı" stroke="#ff7300" strokeWidth={2} />
                    </>
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Gelir Dağılımı (Sınıf Bazlı)</CardTitle>
            <div className="flex gap-2">
                <Select value={incomeDistributionBasis} onValueChange={setIncomeDistributionBasis}>
                    <SelectTrigger className="w-[100px] h-8 text-xs">
                    <SelectValue placeholder="Baz" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="accrual">Tahakkuk</SelectItem>
                    <SelectItem value="cash">Tahsilat</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={incomeDistributionFilter} onValueChange={setIncomeDistributionFilter}>
                    <SelectTrigger className="w-[100px] h-8 text-xs">
                    <SelectValue placeholder="Dönem" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="this-month">Bu Ay</SelectItem>
                    <SelectItem value="last-month">Geçen Ay</SelectItem>
                    <SelectItem value="this-year">Bu Yıl</SelectItem>
                    <SelectItem value="last-year">Geçen Yıl</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {incomeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₺${Number(value).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">Toplam Gelir</p>
                <p className="text-2xl font-bold">₺{incomeDistributionTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Son Eklenen Müşteriler</CardTitle>
            <Select value={latestCustomersLimit} onValueChange={setLatestCustomersLimit}>
                <SelectTrigger className="w-[80px] h-8 text-xs">
                    <SelectValue placeholder="Limit" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {latestCustomers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Henüz müşteri bulunamadı.</p>
              ) : (
                  latestCustomers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">{customer.companyName}</p>
                        <p className="text-sm text-muted-foreground">{customer.email || customer.phone || 'İletişim bilgisi yok'}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(customer.createdAt), { addSuffix: true, locale: tr })}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Son Beyannameler</CardTitle>
            <Select value={latestTaxReturnsLimit} onValueChange={setLatestTaxReturnsLimit}>
                <SelectTrigger className="w-[80px] h-8 text-xs">
                    <SelectValue placeholder="Limit" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {latestTaxReturns.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Henüz beyanname bulunamadı.</p>
              ) : (
                  latestTaxReturns.map((taxReturn) => (
                    <div key={taxReturn.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">{taxReturn.customer.companyName}</p>
                        <p className="text-sm text-muted-foreground">{taxReturn.type} - {taxReturn.period}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs px-2 py-1 rounded ${taxReturn.isSubmitted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {taxReturn.isSubmitted ? 'Tamamlandı' : 'Bekliyor'}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(taxReturn.createdAt), { addSuffix: true, locale: tr })}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
