"use client"

import { useState, useMemo, Fragment } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PdfExportButton } from "@/components/client/company-profile/pdf-export-button"
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  Calendar as CalendarIcon, 
  Download,
  Filter,
  Search,
  CreditCard,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Transaction {
  id: string
  date: string | Date
  description: string
  debit: number
  credit: number
  balance: number
  type: string
}

interface AccountSummaryClientProps {
  transactions: Transaction[]
  customerName: string
  openingBalance: number
}

export default function AccountSummaryClient({ 
  transactions, 
  customerName,
  openingBalance: initialOpeningBalance 
}: AccountSummaryClientProps) {
  const [startDate, setStartDate] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-01-01`
  })
  const [endDate, setEndDate] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-12-31`
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Safe date parser
  const parseDate = (dateStr: string | Date) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d;
  }

  // Filter Transactions
  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      const tDate = parseDate(t.date);
      if (!tDate) return true;
      
      tDate.setHours(0, 0, 0, 0);
      
      let start = parseDate(startDate);
      let end = parseDate(endDate);
      
      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(0, 0, 0, 0);

      if (start && tDate < start) return false;
      if (end && tDate > end) return false;
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          t.description.toLowerCase().includes(term) ||
          t.type.toLowerCase().includes(term)
        );
      }

      return true;
    });
  }, [transactions, startDate, endDate, searchTerm]);

  // Calculate Opening Balance for the filtered period
  const currentOpeningBalance = useMemo(() => {
    if (!startDate) return initialOpeningBalance;
    
    const start = parseDate(startDate);
    if (!start) return initialOpeningBalance;
    start.setHours(0, 0, 0, 0);
    
    // Find the balance of the last transaction before start date
    // Transactions are assumed to be sorted by date (oldest first) from the server
    let lastBalance = initialOpeningBalance;
    
    // We need to iterate through ALL transactions to find the balance right before start date
    for (const t of transactions) {
      const tDate = parseDate(t.date);
      if (tDate && tDate < start) {
        lastBalance = t.balance;
      } else if (tDate && tDate >= start) {
        break; 
      }
    }
    
    return lastBalance;
  }, [transactions, startDate, initialOpeningBalance]);

  // Calculate Period Stats
  const periodStats = useMemo(() => {
    const totalDebit = filteredData.reduce((sum, t) => sum + t.debit, 0);
    const totalCredit = filteredData.reduce((sum, t) => sum + t.credit, 0);
    
    // Period Closing Balance
    const closingBalance = filteredData.length > 0 
      ? filteredData[filteredData.length - 1].balance 
      : currentOpeningBalance;

    return {
      totalDebit,
      totalCredit,
      closingBalance
    };
  }, [filteredData, currentOpeningBalance]);

  // Overall Stats (Latest Balance)
  const finalBalance = useMemo(() => {
    if (transactions.length === 0) return initialOpeningBalance;
    return transactions[transactions.length - 1].balance;
  }, [transactions, initialOpeningBalance]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  // Reset page when filter changes
  useMemo(() => {
    setCurrentPage(1)
  }, [startDate, endDate, searchTerm, pageSize])

  // Date Range String for PDF
  const dateRangeStr = useMemo(() => {
    if (startDate && endDate) {
      return `${format(new Date(startDate), 'd MMMM yyyy', { locale: tr })} - ${format(new Date(endDate), 'd MMMM yyyy', { locale: tr })}`
    } else if (startDate) {
      return `${format(new Date(startDate), 'd MMMM yyyy', { locale: tr })} Sonrası`
    } else if (endDate) {
      return `${format(new Date(endDate), 'd MMMM yyyy', { locale: tr })} Öncesi`
    }
    return "Tüm Zamanlar"
  }, [startDate, endDate])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hesap Özeti</h1>
          <p className="text-muted-foreground mt-1">
            Finansal durumunuzu ve hesap hareketlerinizi takip edin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PdfExportButton 
            type="account" 
            data={filteredData} 
            title="Hesap Özeti" 
            fileName="hesap-ozeti"
            customerName={customerName}
            dateRange={dateRangeStr}
            openingBalance={currentOpeningBalance}
            finalBalance={periodStats.closingBalance}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Borç</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {periodStats.totalDebit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
            </div>
            <p className="text-xs text-muted-foreground">
              Seçili dönemdeki toplam borçlanma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Ödeme</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {periodStats.totalCredit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
            </div>
            <p className="text-xs text-muted-foreground">
              Seçili dönemdeki toplam ödeme
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dönem Bakiyesi</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {periodStats.closingBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
            </div>
            <p className="text-xs text-muted-foreground">
              Seçili dönem sonundaki bakiye
            </p>
          </CardContent>
        </Card>

        <Card className={finalBalance > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Genel Toplam Bakiye</CardTitle>
            <CreditCard className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${finalBalance > 0 ? "text-red-700" : "text-green-700"}`}>
              {finalBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
            </div>
            <p className="text-xs text-muted-foreground">
              Güncel hesap bakiyesi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Hareketler</CardTitle>
          <CardDescription>
            Hesap hareketlerinizi görüntüleyin ve filtreleyin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="grid gap-2">
              <Label htmlFor="start-date">Başlangıç</Label>
              <div className="relative">
                <Input 
                  id="start-date"
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full md:w-[160px]"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-date">Bitiş</Label>
              <div className="relative">
                <Input 
                  id="end-date"
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full md:w-[160px]"
                />
              </div>
            </div>
            <div className="grid gap-2 flex-1">
              <Label htmlFor="search">Ara</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="search"
                  placeholder="Açıklama veya işlem türü ara..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead className="text-right">Borç</TableHead>
                  <TableHead className="text-right">Alacak</TableHead>
                  <TableHead className="text-right">Bakiye</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Previous Period Balance Row (Top of Page 1 if Start Date Selected) */}
                {currentPage === 1 && startDate && (
                  <TableRow className="bg-muted/30 font-medium">
                    <TableCell colSpan={3} className="text-muted-foreground">
                       {`${format(new Date(startDate), 'd MMMM yyyy', { locale: tr })} Öncesi Devreden`}
                    </TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">
                      {currentOpeningBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </TableCell>
                  </TableRow>
                )}

                {paginatedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Kayıt bulunamadı.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTransactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">
                        {t.date ? format(new Date(t.date), 'd MMM yyyy', { locale: tr }) : '-'}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate" title={t.description}>
                        {t.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {t.type === 'accrual' ? 'Tahakkuk' : 
                           t.type === 'payment' ? 'Ödeme' : 
                           t.type === 'opening' ? 'Açılış' :
                           t.type === 'DEBT' ? 'Borç Dekontu' :
                           t.type === 'CREDIT' ? 'Alacak Dekontu' :
                           t.type === 'OPENING_DEBT' ? 'Açılış Borcu' :
                           t.type === 'OPENING_CREDIT' ? 'Açılış Alacağı' :
                           t.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {t.debit > 0 ? `${t.debit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL` : '-'}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {t.credit > 0 ? `${t.credit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL` : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {t.balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                      </TableCell>
                    </TableRow>
                  ))
                )}

                {/* Next Period Balance Row (End of Last Page) */}
                {currentPage === totalPages && (
                  <TableRow className="bg-muted/30 font-medium border-t-2">
                    <TableCell colSpan={3} className="text-muted-foreground">
                       Sonraki Döneme Devreden
                    </TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">
                      {periodStats.closingBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {filteredData.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Sayfada</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    setPageSize(Number(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={pageSize.toString()} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[5, 10, 20, 50, 100].map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>Kayıt var. Toplam kayıt sayısı {filteredData.length}.</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  İlk
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Önceki
                </Button>
                
                {/* Page numbers */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first, last, current, and adjacent pages
                      if (page === 1 || page === totalPages) return true
                      if (Math.abs(page - currentPage) <= 1) return true
                      return false
                    })
                    .map((page, idx, arr) => (
                      <Fragment key={page}>
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span key={`ellipsis-${page}`} className="px-2 text-muted-foreground">...</span>
                        )}
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-9"
                        >
                          {page}
                        </Button>
                      </Fragment>
                    ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Sonraki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Son
                </Button>
              </div>
            </div>
          )}

           {/* Final Balance Display */}
           <div className="flex justify-end mt-2">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 min-w-[250px]">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-muted-foreground">Son Bakiye (Genel Toplam)</span>
                  <span className="text-2xl font-bold text-primary text-right">
                    {finalBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                  </span>
                </div>
              </div>
           </div>
        </CardContent>
      </Card>
    </div>
  )
}
