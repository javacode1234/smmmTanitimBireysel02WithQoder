"use client"

import { useState, useEffect, useMemo, Fragment } from "react"
import { Save, Check, ArrowLeft, ArrowRight, Plus, Trash2, Edit, FileDown, Search, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { format, addMonths, startOfMonth, compareAsc } from "date-fns"
import { tr } from "date-fns/locale"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { loadTurkishFont } from "@/lib/pdf-utils"
import { formatTL } from "@/lib/currency"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AccountsTabProps {
  customerId: string | null
  onFinish: () => void
  onBack: () => void
}

interface AccountTransaction {
  id: string
  date: Date
  description: string
  debt: number
  credit: number
  debtBalance: number
  creditBalance: number
  isManual?: boolean
}

interface ManualTransaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'DEBT' | 'CREDIT' | 'OPENING_DEBT' | 'OPENING_CREDIT' // DEBT = Borç, CREDIT = Alacak, OPENING = Açılış
}

interface AccountingPeriodFee {
  year: number
  monthlyFee: string
  monthlyFees?: { [key: string]: string }
}

export function AccountsTab({ customerId, onFinish, onBack }: AccountsTabProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // PDF Dialog State
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [pdfReportType, setPdfReportType] = useState<'all' | 'filtered' | 'custom'>('filtered')
  const [pdfStartDate, setPdfStartDate] = useState("")
  const [pdfEndDate, setPdfEndDate] = useState("")
  const [companyName, setCompanyName] = useState("")

  // Configuration State
  const [openingBalance, setOpeningBalance] = useState<string>("0")
  const [feeAccrualDay, setFeeAccrualDay] = useState<string>("1")
  const [accountingPeriodFees, setAccountingPeriodFees] = useState<AccountingPeriodFee[]>([])
  const [isFeesDialogOpen, setIsFeesDialogOpen] = useState(false)
  const [newFeeYear, setNewFeeYear] = useState(new Date().getFullYear().toString())
  const [newFeeAmount, setNewFeeAmount] = useState("")
  const [startDate, setStartDate] = useState<string>("") // Start empty to detect if loaded
  const [manualTransactions, setManualTransactions] = useState<ManualTransaction[]>([])

  // Modal State
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null)
  const [newTransDate, setNewTransDate] = useState(new Date().toISOString().split('T')[0])
  const [newTransDesc, setNewTransDesc] = useState("")
  const [newTransAmount, setNewTransAmount] = useState("")
  const [newTransType, setNewTransType] = useState<'DEBT' | 'CREDIT' | 'OPENING_DEBT' | 'OPENING_CREDIT'>('CREDIT')

  // Table State
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filterStartDate, setFilterStartDate] = useState<string>("")
  const [filterEndDate, setFilterEndDate] = useState<string>("")
  const [filterYear, setFilterYear] = useState<string>("")

  // Reset page when filter/size changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, pageSize, filterStartDate, filterEndDate])

  // Year filter effect
  useEffect(() => {
    if (filterYear && filterYear !== "all") {
      setFilterStartDate(`${filterYear}-01-01`)
      setFilterEndDate(`${filterYear}-12-31`)
    } else if (filterYear === "all") {
      setFilterStartDate("")
      setFilterEndDate("")
    }
  }, [filterYear])

  // PDF Generation
  const handleGeneratePDF = async () => {
    setIsGeneratingPdf(true)
    try {
      const doc = new jsPDF()
      
      // Font Loading for Turkish Characters
      await loadTurkishFont(doc)

      // Determine Data Source
      let dataToPrint;
      let dateRangeText = "";
      
      if (pdfReportType === 'all') {
        dataToPrint = getFilteredData(transactions, "", "", "")
        dateRangeText = "Tüm Zamanlar"
      } else if (pdfReportType === 'filtered') {
        dataToPrint = getFilteredData(transactions, filterStartDate, filterEndDate, searchTerm)
         if (filterStartDate || filterEndDate) {
            dateRangeText = `${filterStartDate ? format(new Date(filterStartDate), 'dd.MM.yyyy') : 'Başlangıç'} - ${filterEndDate ? format(new Date(filterEndDate), 'dd.MM.yyyy') : 'Bugün'}`
        } else {
            dateRangeText = "Tüm Zamanlar"
        }
      } else {
        dataToPrint = getFilteredData(transactions, pdfStartDate, pdfEndDate, "")
        dateRangeText = `${pdfStartDate ? format(new Date(pdfStartDate), 'dd.MM.yyyy') : 'Başlangıç'} - ${pdfEndDate ? format(new Date(pdfEndDate), 'dd.MM.yyyy') : 'Bugün'}`
      }

      // Title Section
      doc.setFontSize(18)
      doc.text("Hesap Ekstresi", 14, 20)
      
      doc.setFontSize(10)
      doc.text(`Tarih: ${format(new Date(), 'dd.MM.yyyy HH:mm')}`, 14, 28)
      if (companyName) {
        doc.text(`Firma: ${companyName}`, 14, 33)
        doc.text(`Aralık: ${dateRangeText}`, 14, 38)
      } else {
        doc.text(`Aralık: ${dateRangeText}`, 14, 33)
      }

      // Prepare Table Data
      const tableData = dataToPrint.transactions.map(t => [
        format(t.date, "dd.MM.yyyy"),
        t.documentType,
        t.documentNumber,
        t.description,
        t.debt > 0 ? formatTL(t.debt) : "",
        t.credit > 0 ? formatTL(t.credit) : "",
        `${t.debtBalance > 0 ? formatTL(t.debtBalance) + ' (B)' : formatTL(t.creditBalance) + ' (A)'}`
      ])

      // Add Opening Balance Row if needed
      if (dataToPrint.previousBalance.net !== 0 || (pdfReportType !== 'all' && (filterStartDate || pdfStartDate))) {
          // Only show "Devreden" if there is a start date filter or previous balance exists
           tableData.unshift([
              "", 
              "", 
              "", 
              "DEVREDEN BAKİYE", 
              dataToPrint.previousBalance.debt > 0 ? formatTL(dataToPrint.previousBalance.debt) : "",
              dataToPrint.previousBalance.credit > 0 ? formatTL(dataToPrint.previousBalance.credit) : "",
              `${dataToPrint.previousBalance.net > 0 ? formatTL(dataToPrint.previousBalance.net) + ' (B)' : formatTL(Math.abs(dataToPrint.previousBalance.net)) + ' (A)'}`
          ])
      }

      // Add Closing Balance Row
       tableData.push([
              "", 
              "", 
              "", 
              "Son Bakiye", 
              "",
              "",
              `${formatTL(dataToPrint.finalBalance.amount)} (${dataToPrint.finalBalance.type === 'Debt' ? 'B' : 'A'})`
          ])

      // Generate Table
      autoTable(doc, {
        startY: companyName ? 45 : 40,
        head: [["Tarih", "Belge Tipi", "Belge No", "Açıklama", "Borç", "Alacak", "Bakiye"]],
        body: tableData,
        styles: { 
            font: "Roboto", // Use the loaded font
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak',
            textColor: 50
        },
        columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 25 },
            2: { cellWidth: 20 },
            3: { cellWidth: 'auto' },
            4: { cellWidth: 25, halign: 'right' },
            5: { cellWidth: 25, halign: 'right' },
            6: { cellWidth: 30, halign: 'right' }
        },
        headStyles: {
            fillColor: [41, 128, 185], // A nice blue
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        didDrawPage: (data) => {
            // Footer
            const str = 'Sayfa ' + doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            const pageSize = doc.internal.pageSize;
            const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
            doc.text(str, data.settings.margin.left, pageHeight - 10);
        }
      })

      doc.save(`account-statement-${companyName ? companyName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'client'}-${format(new Date(), 'yyyyMMdd')}.pdf`)
      setIsPdfDialogOpen(false)
      toast.success("PDF başarıyla oluşturuldu")
      
    } catch (error) {
      console.error("PDF generation error:", error)
      toast.error("PDF oluşturulurken hata oluştu")
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  useEffect(() => {
    const fetchAccountData = async () => {
      if (!customerId) {
        // New customer default date
        if (!startDate) setStartDate(new Date().toISOString().split('T')[0])
        return
      }
      
      try {
        setIsLoading(true)
        const res = await fetch(`/api/customers?id=${customerId}`)
        if (!res.ok) throw new Error("Müşteri bilgileri alınamadı")
        
        const data = await res.json()
        
        if (data.companyName) setCompanyName(data.companyName)

        // Handle feeAccrualDay (allow 0) and reset if missing
        setFeeAccrualDay(data.feeAccrualDay !== undefined && data.feeAccrualDay !== null ? data.feeAccrualDay.toString() : "1")
        
        // Handle openingBalance (allow 0) and reset if missing
        setOpeningBalance(data.openingBalance !== undefined && data.openingBalance !== null ? data.openingBalance.toString() : "0")
        
        if (data.establishmentDate) {
           // Ensure date is formatted as YYYY-MM-DD
           const d = new Date(data.establishmentDate)
           if (!isNaN(d.getTime())) {
             setStartDate(d.toISOString().split('T')[0])
           } else {
             setStartDate(new Date().toISOString().split('T')[0])
           }
        } else {
           // Default to today if no date from DB
           setStartDate(new Date().toISOString().split('T')[0])
        }

        // Handle accounting periods
        if (data.accountingperiod && Array.isArray(data.accountingperiod)) {
          const fees: AccountingPeriodFee[] = data.accountingperiod
            .map((p: any) => ({
              year: p.year,
              monthlyFee: p.monthlyFee || "0",
              monthlyFees: p.monthlyFees ? JSON.parse(p.monthlyFees) : {}
            }))
          setAccountingPeriodFees(fees)
        } else {
          setAccountingPeriodFees([])
        }

        if (data.transactions) {
          try {
            // Handle both string JSON and pre-parsed object
            const parsed = typeof data.transactions === 'string' 
              ? JSON.parse(data.transactions) 
              : data.transactions
              
            if (Array.isArray(parsed)) {
              setManualTransactions(parsed)
            } else {
              setManualTransactions([])
            }
          } catch (e) {
            console.error("Failed to parse transactions", e)
            setManualTransactions([])
          }
        } else {
          setManualTransactions([])
        }

      } catch (error) {
        console.error("Error fetching account info:", error)
        toast.error("Hesap bilgileri yüklenemedi")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccountData()
  }, [customerId])

  // Calculated Transactions
  const transactions = useMemo(() => {
    const items: AccountTransaction[] = []
    
    // 1. Opening Balance
    const openDebt = parseFloat(openingBalance) || 0
    if (openDebt > 0) {
      items.push({
        id: "opening",
        date: new Date(startDate),
        description: "Açılış İşlemi",
        debt: openDebt,
        credit: 0,
        debtBalance: 0, // Calculated later
        creditBalance: 0 // Calculated later
      })
    }

    // 2. Monthly Accruals (from startDate to today)
    const start = new Date(startDate)
    const accrualDay = parseInt(feeAccrualDay) || 1

    // Always run loop if we have a valid start date
    if (!isNaN(start.getTime())) {
      let current = startOfMonth(start)
      const now = new Date()
      
      // Loop until current month
      while (current <= now || (current.getMonth() === now.getMonth() && current.getFullYear() === now.getFullYear())) {
        const currentYear = current.getFullYear()
        const currentMonthIndex = current.getMonth() + 1 // 1-12
        
        // Find specific fee for this year
        const yearFeeObj = accountingPeriodFees.find(p => p.year === currentYear)
        
        let currentMonthFee = 0 // Default is 0 if no fee defined for year
        
        if (yearFeeObj) {
          if (yearFeeObj.monthlyFees && yearFeeObj.monthlyFees[currentMonthIndex]) {
            currentMonthFee = parseFloat(yearFeeObj.monthlyFees[currentMonthIndex]) || 0
          } else {
            currentMonthFee = parseFloat(yearFeeObj.monthlyFee) || 0
          }
        }

        if (currentMonthFee > 0) {
          // Determine accrual date based on selected day
          const accrualDate = new Date(current.getFullYear(), current.getMonth(), accrualDay)
          
          // If accrual day is invalid (e.g. Feb 30), it rolls over to next month
          // To prevent this, check if month changed
          if (accrualDate.getMonth() !== current.getMonth()) {
             // Set to last day of the intended month
             accrualDate.setDate(0) 
          }

          // Only accrue if date has passed or is today
          if (accrualDate <= now) {
            items.push({
              id: `accrual-${accrualDate.toISOString()}`,
              date: accrualDate,
              description: `${format(current, 'MMMM yyyy', { locale: tr })} Muhasebe Ücreti`,
              debt: currentMonthFee,
              credit: 0,
              debtBalance: 0,
              creditBalance: 0
            })
          }
        }
        
        current = addMonths(current, 1)
        if (items.length > 500) break; // Safety
      }
    }

    // 3. Manual Transactions
    manualTransactions.forEach(t => {
      items.push({
        id: t.id,
        date: new Date(t.date),
        description: t.description,
        debt: (t.type === 'DEBT' || t.type === 'OPENING_DEBT') ? t.amount : 0,
        credit: (t.type === 'CREDIT' || t.type === 'OPENING_CREDIT') ? t.amount : 0,
        debtBalance: 0,
        creditBalance: 0,
        isManual: true
      })
    })

    // Sort by date
    items.sort((a, b) => compareAsc(a.date, b.date))

    // Calculate Running Balance
    let runningBalance = 0
    return items.map(item => {
      runningBalance += (item.debt - item.credit)
      return {
        ...item,
        debtBalance: runningBalance > 0 ? runningBalance : 0,
        creditBalance: runningBalance < 0 ? Math.abs(runningBalance) : 0
      }
    })

  }, [openingBalance, feeAccrualDay, startDate, manualTransactions, accountingPeriodFees])

  const finalBalance = useMemo(() => {
    if (transactions.length === 0) return { type: 'Debt', amount: 0 }
    const last = transactions[transactions.length - 1]
    if (last.debtBalance > 0) return { type: 'Debt', amount: last.debtBalance }
    return { type: 'Credit', amount: last.creditBalance }
  }, [transactions])

  // Helper function for data filtering logic
  const getFilteredData = (
    baseTransactions: AccountTransaction[],
    fStart: string,
    fEnd: string,
    search: string
  ) => {
    // 1. Text Search Filter
    let filtered = baseTransactions.filter(t => 
      t.description.toLowerCase().includes(search.toLowerCase())
    )

    // 2. Date Range Filter Logic with Balance Calculation
    let previousBalance = 0

    // If we have a start date, we need to calculate the balance before that date
    if (fStart) {
      const start = new Date(fStart)
      start.setHours(0, 0, 0, 0)

      // Calculate previous balance from transactions BEFORE the start date
      // Note: We use baseTransactions here because we want the balance from ALL transactions, 
      // not just the ones matching the search term.
      const previousTrans = baseTransactions.filter(t => t.date < start)
      
      previousTrans.forEach(t => {
        previousBalance += (t.debt - t.credit)
      })

      // Filter transactions for current view
      filtered = filtered.filter(t => t.date >= start)
    }

    if (fEnd) {
      const end = new Date(fEnd)
      end.setHours(23, 59, 59, 999)
      filtered = filtered.filter(t => t.date <= end)
    }

    // Sort by date asc
    filtered.sort((a, b) => a.date.getTime() - b.date.getTime())

    // 3. Recalculate Running Balance for Displayed Transactions
    let currentRunningBalance = previousBalance
    const displayedTransactions = filtered.map(t => {
      currentRunningBalance += (t.debt - t.credit)
      return {
        ...t,
        debtBalance: currentRunningBalance > 0 ? currentRunningBalance : 0,
        creditBalance: currentRunningBalance < 0 ? Math.abs(currentRunningBalance) : 0
      }
    })

    return {
      previousBalance: {
        debt: previousBalance > 0 ? previousBalance : 0,
        credit: previousBalance < 0 ? Math.abs(previousBalance) : 0,
        net: previousBalance
      },
      transactions: displayedTransactions,
      finalBalance: {
        amount: Math.abs(currentRunningBalance),
        type: currentRunningBalance >= 0 ? 'Debt' : 'Credit'
      }
    }
  }

  const processedData = useMemo(() => {
    return getFilteredData(transactions, filterStartDate, filterEndDate, searchTerm)
  }, [transactions, filterStartDate, filterEndDate, searchTerm])

  const totalPages = Math.ceil(processedData.transactions.length / pageSize)
  
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return processedData.transactions.slice(start, start + pageSize)
  }, [processedData.transactions, currentPage, pageSize])

  const handleSaveTransaction = async () => {
    if (!newTransDesc || !newTransAmount) {
      toast.error("Lütfen açıklama ve tutar giriniz")
      return
    }

    let updatedTransactions: ManualTransaction[] = []

    if (editingTransactionId) {
      // Update existing
      updatedTransactions = manualTransactions.map(t => {
        if (t.id === editingTransactionId) {
          return {
            ...t,
            date: newTransDate,
            description: newTransDesc,
            amount: parseFloat(newTransAmount),
            type: newTransType
          }
        }
        return t
      })
    } else {
      // Add new
      const newTrans: ManualTransaction = {
        id: Math.random().toString(36).substr(2, 9),
        date: newTransDate,
        description: newTransDesc,
        amount: parseFloat(newTransAmount),
        type: newTransType
      }
      updatedTransactions = [...manualTransactions, newTrans]
    }

    const previousTransactions = manualTransactions
    setManualTransactions(updatedTransactions)
    
    const success = await handleSave(updatedTransactions)
    if (success) {
      setIsTransactionModalOpen(false)
      resetForm()
    } else {
      setManualTransactions(previousTransactions) // Revert on failure
    }
  }

  const handleEditTransaction = (t: ManualTransaction) => {
    setEditingTransactionId(t.id)
    setNewTransDate(t.date)
    setNewTransDesc(t.description)
    setNewTransAmount(t.amount.toString())
    setNewTransType(t.type)
    setIsTransactionModalOpen(true)
  }

  const resetForm = () => {
    setEditingTransactionId(null)
    setNewTransDesc("")
    setNewTransAmount("")
    setNewTransType('CREDIT')
    setNewTransDate(new Date().toISOString().split('T')[0])
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Bu işlemi silmek istediğinize emin misiniz?")) return
    const updatedTransactions = manualTransactions.filter(t => t.id !== id)
    const previousTransactions = manualTransactions
    setManualTransactions(updatedTransactions)
    
    const success = await handleSave(updatedTransactions)
    if (!success) {
      setManualTransactions(previousTransactions) // Revert on failure
    }
  }

  const handleSave = async (overrideTransactions?: ManualTransaction[]): Promise<boolean> => {
    if (!customerId) {
      toast.error("Müşteri ID bulunamadı")
      return false
    }

    try {
      setIsSaving(true)
      
      const payload = {
        feeAccrualDay: feeAccrualDay ? parseInt(feeAccrualDay) : 1,
        openingBalance: openingBalance ? String(openingBalance) : null,
        establishmentDate: startDate, // Save start date
        transactions: overrideTransactions || manualTransactions,
        accountingPeriods: accountingPeriodFees.map(p => ({
          ...p,
          feeAccrualDay: feeAccrualDay ? parseInt(feeAccrualDay) : 1
        }))
      }

      const res = await fetch(`/api/customers?id=${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.details || "Kaydetme başarısız")
      }
      
      toast.success("Değişiklikler kaydedildi")
      return true
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Değişiklikler kaydedilirken hata oluştu")
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const resetFilters = () => {
    setFilterYear("all")
    setFilterStartDate("")
    setFilterEndDate("")
    setSearchTerm("")
  }



  const handleFinish = async (shouldFinish: boolean = false) => {
    const success = await handleSave()
    if (success && shouldFinish) {
      onFinish()
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Hesap ve Finansal Bilgiler</CardTitle>
          <CardDescription>
            Müşteri açılış bakiyesi, aylık tahakkuk ve tahsilat işlemleri.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3 p-4 border rounded-lg bg-muted/20">
          <div className="space-y-2">
            <Label htmlFor="openingBalance">Açılış Bakiyesi (TL)</Label>
            <Input 
              id="openingBalance" 
              type="number"
              min="0"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
            />
          </div>
          <div className="space-y-2">
             <Label htmlFor="feeAccrualDay">Tahakkuk Günü</Label>
             <Input 
                id="feeAccrualDay" 
                type="number"
                min="1"
                max="31"
                value={feeAccrualDay}
                onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                        setFeeAccrualDay("");
                        return;
                    }
                    const num = parseInt(val);
                    if (num > 31) setFeeAccrualDay("31");
                    else if (num < 1) setFeeAccrualDay("1");
                    else setFeeAccrualDay(val);
                }}
                placeholder="1-31"
             />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Hizmet Başlangıç Tarihi</Label>
            <Input 
              id="startDate" 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <CardTitle>Hesap Hareketleri</CardTitle>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex flex-wrap gap-2 items-center">
              <Select value={filterYear} onValueChange={(v) => setFilterYear(v)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Yıl" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Yıllar</SelectItem>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Range Inputs */}
              <div className="flex items-center gap-2">
                 <Input 
                   type="date" 
                   value={filterStartDate} 
                   onChange={(e) => {
                     setFilterStartDate(e.target.value)
                     setFilterYear("") // Custom date clears year selection
                   }}
                   className="w-[130px]"
                 />
                 <span className="text-muted-foreground">-</span>
                 <Input 
                   type="date" 
                   value={filterEndDate} 
                   onChange={(e) => {
                     setFilterEndDate(e.target.value)
                     setFilterYear("") // Custom date clears year selection
                   }}
                   className="w-[130px]"
                 />
              </div>

              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-[200px]"
          />
              </div>
              {(searchTerm || filterStartDate || filterEndDate || (filterYear && filterYear !== "all")) && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={resetFilters}
                  className="h-10 w-10 text-muted-foreground hover:text-foreground"
                  title="Filtreleri Temizle"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              </div>
              <div className="flex items-center gap-2 justify-end">
                 <Button variant="outline" size="sm" onClick={() => setIsPdfDialogOpen(true)}>
                    <FileDown className="w-4 h-4 mr-2" />
                    PDF
                 </Button>
                 <Dialog open={isTransactionModalOpen} onOpenChange={setIsTransactionModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Ekle
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingTransactionId ? "İşlemi Düzenle" : "Yeni İşlem / Tahsilat Ekle"}</DialogTitle>
                        <DialogDescription>
                          Hesap ekstresine manuel işlem ekleyin. Tahsilat için "Tahsilat (Alacak)" seçiniz.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="t-date" className="text-right">Tarih</Label>
                          <Input 
                            id="t-date" 
                            type="date" 
                            value={newTransDate} 
                            onChange={(e) => setNewTransDate(e.target.value)}
                            className="col-span-3" 
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="t-desc" className="text-right">Açıklama</Label>
                          <Input 
                            id="t-desc" 
                            value={newTransDesc} 
                            onChange={(e) => setNewTransDesc(e.target.value)}
                            placeholder="Örn: Nakit Tahsilat"
                            className="col-span-3" 
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="t-amount" className="text-right">Tutar</Label>
                          <Input 
                            id="t-amount" 
                            type="number" 
                            value={newTransAmount} 
                            onChange={(e) => setNewTransAmount(e.target.value)}
                            className="col-span-3" 
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="t-type" className="text-right">İşlem Türü</Label>
                          <Select value={newTransType} onValueChange={(v: any) => {
                            setNewTransType(v)
                            if (v === 'OPENING_DEBT' || v === 'OPENING_CREDIT') {
                              if (!newTransDesc) setNewTransDesc("Açılış İşlemi")
                            }
                          }}>
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Tür seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CREDIT">Tahsilat (Alacak)</SelectItem>
                              <SelectItem value="DEBT">Borçlandırma (Borç)</SelectItem>
                              <SelectItem value="OPENING_DEBT">Açılış İşlemi (Borç)</SelectItem>
                              <SelectItem value="OPENING_CREDIT">Açılış İşlemi (Alacak)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleSaveTransaction}>
                          {editingTransactionId ? "Güncelle" : "Ekle"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
              </div>
          </div>

          <div className="rounded-md border">
            <Table containerClassName="h-[400px] overflow-auto relative">
              <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead className="text-right">Borç</TableHead>
                    <TableHead className="text-right">Alacak</TableHead>
                    <TableHead className="text-right" colSpan={2}>Bakiye</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Previous Period Balance Row (Devreden Bakiye) */}
                  {(filterStartDate || filterYear) && (
                    <TableRow className="bg-muted/50 font-medium">
                      <TableCell colSpan={2}>Devreden Bakiye (Önceki Dönem)</TableCell>
                      <TableCell className="text-right">{processedData.previousBalance.debt > 0 ? formatTL(processedData.previousBalance.debt) : '-'}</TableCell>
                      <TableCell className="text-right">{processedData.previousBalance.credit > 0 ? formatTL(processedData.previousBalance.credit) : '-'}</TableCell>
                      <TableCell className="text-right">{processedData.previousBalance.net > 0 ? formatTL(processedData.previousBalance.net) : '-'}</TableCell>
                      <TableCell className="text-right">{processedData.previousBalance.net < 0 ? formatTL(Math.abs(processedData.previousBalance.net)) : '-'}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  )}
                  
                  {/* Default Start Row (only show if no filter or devreden bakiye is 0) */}
                  {!filterStartDate && !filterYear && (
                    <TableRow className="bg-muted/50 font-medium">
                      <TableCell colSpan={2}>Başlangıç</TableCell>
                      <TableCell className="text-right">-</TableCell>
                      <TableCell className="text-right">-</TableCell>
                      <TableCell className="text-right">{formatTL(0)}</TableCell>
                      <TableCell className="text-right">{formatTL(0)}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  )}

                  {paginatedTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                        İşlem bulunamadı.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTransactions.map((t) => (
                      <TableRow key={t.id} className={t.isManual ? "bg-blue-50/50" : ""}>
                        <TableCell>{format(t.date, 'dd.MM.yyyy')}</TableCell>
                        <TableCell>
                          {t.description}
                          {t.isManual && <span className="ml-2 text-xs text-blue-600">(Manuel)</span>}
                        </TableCell>
                        <TableCell className="text-right">{t.debt > 0 ? formatTL(t.debt) : '-'}</TableCell>
                        <TableCell className="text-right">{t.credit > 0 ? formatTL(t.credit) : '-'}</TableCell>
                        <TableCell className="text-right">{t.debtBalance > 0 ? formatTL(t.debtBalance) : '-'}</TableCell>
                        <TableCell className="text-right">{t.creditBalance > 0 ? formatTL(t.creditBalance) : '-'}</TableCell>
                        <TableCell>
                          {t.isManual && (
                            <div className="flex justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-blue-500 hover:text-blue-700"
                                onClick={() => {
                                  const manual = manualTransactions.find(m => m.id === t.id)
                                  if (manual) handleEditTransaction(manual)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteTransaction(t.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  
                </TableBody>
              </Table>
          </div>

          {/* Final Balance Display */}
          <div className="flex justify-end mt-4 px-2">
            <div className="bg-muted/40 border rounded-lg p-4 min-w-[250px] shadow-sm">
              <div className="flex justify-between items-center gap-8">
                <span className="font-semibold text-muted-foreground">Son Bakiye:</span>
                <div className="text-right">
                   <div className={`font-bold text-lg ${processedData.finalBalance.type === 'Debt' ? 'text-red-600' : 'text-green-600'}`}>
                    {processedData.finalBalance.type === 'Debt' ? formatTL(processedData.finalBalance.amount) : formatTL(processedData.finalBalance.amount)} {processedData.finalBalance.type === 'Debt' ? '(B)' : '(A)'}
                   </div>
                </div>
              </div>
            </div>
          </div>

          {processedData.transactions.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 gap-4">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground w-full sm:w-auto justify-center sm:justify-start">
                Sayfada
                <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
                  <SelectTrigger className="w-[70px] h-8">
                    <SelectValue placeholder={pageSize.toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                Kayıt var. Toplam kayıt sayısı {processedData.transactions.length}.
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
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Önceki
                </Button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1">
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
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
        </div>

        <Dialog open={isPdfDialogOpen} onOpenChange={setIsPdfDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Hesap Ekstresi PDF Oluştur</DialogTitle>
              <DialogDescription>
                Rapor kapsamını ve tarih aralığını belirleyin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Rapor Kapsamı</Label>
                <Select value={pdfReportType} onValueChange={(v: any) => setPdfReportType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="filtered">Mevcut Filtrelenmiş Görünüm</SelectItem>
                    <SelectItem value="all">Tüm Kayıtlar</SelectItem>
                    <SelectItem value="custom">Özel Tarih Aralığı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {pdfReportType === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Başlangıç</Label>
                    <Input type="date" value={pdfStartDate} onChange={(e) => setPdfStartDate(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Bitiş</Label>
                    <Input type="date" value={pdfEndDate} onChange={(e) => setPdfEndDate(e.target.value)} />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPdfDialogOpen(false)}>İptal</Button>
              <Button onClick={handleGeneratePDF} disabled={isGeneratingPdf}>
                {isGeneratingPdf && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                PDF Oluştur
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex justify-between pt-4 border-t gap-2 mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
            disabled={isSaving}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => handleFinish(false)}
              disabled={isSaving}
            >
              Kaydet
            </Button>
            <Button 
              type="button" 
              onClick={() => handleFinish(true)}
              disabled={isSaving}
            >
              İleri
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
