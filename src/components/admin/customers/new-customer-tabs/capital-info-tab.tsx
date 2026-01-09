"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Edit, Trash2, Save, Plus, Search, X, Check, ArrowRight, ArrowLeft, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { formatTL } from "@/lib/currency"

// Mock partners removed, using availablePartners from state

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];


const capitalSchema = z.object({
  partnerId: z.string().min(1, "Ortak seçiniz"),
  capitalRatio: z.string().min(1, "Sermaye oranı giriniz"),
  totalCapital: z.string().min(1, "Toplam sermaye giriniz"),
  totalShareCount: z.string().min(1, "Toplam pay adedi giriniz"),
  partnerShareCount: z.string().min(1, "Ortak pay adedi giriniz"),
  sharePrice: z.string().min(1, "Hisse fiyatı giriniz"),
  endDate: z.string().optional(),
  status: z.enum(["active", "passive"], {
    required_error: "Durum seçiniz",
  }),
})

type CapitalFormValues = z.infer<typeof capitalSchema>

interface CapitalInfo extends CapitalFormValues {
  id: string
}

interface CapitalInfoTabProps {
  customerId: string | null
  onNext: () => void
  onBack: () => void
}

export function CapitalInfoTab({ customerId, onNext, onBack }: CapitalInfoTabProps) {
  const [capitals, setCapitals] = useState<CapitalInfo[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState(5)
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [availablePartners, setAvailablePartners] = useState<{ id: string; fullName: string }[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!customerId) return
      
      try {
        setIsLoading(true)
        const res = await fetch(`/api/customers?id=${customerId}`)
        if (!res.ok) throw new Error("Müşteri bilgileri alınamadı")
        
        const data = await res.json()
        
        // Parse capitals
        if (data.capitals) {
          try {
            const parsedCapitals = typeof data.capitals === 'string' 
              ? JSON.parse(data.capitals) 
              : data.capitals
            setCapitals(Array.isArray(parsedCapitals) ? parsedCapitals : [])
          } catch (e) {
            console.error("Capitals parse error:", e)
            setCapitals([])
          }
        }

        // Parse partners for combobox
        if (data.partners) {
          try {
            const parsedPartners = typeof data.partners === 'string' 
              ? JSON.parse(data.partners) 
              : data.partners
            setAvailablePartners(Array.isArray(parsedPartners) ? parsedPartners : [])
          } catch (e) {
            console.error("Partners parse error:", e)
            setAvailablePartners([])
          }
        }
      } catch (error) {
        console.error(error)
        toast.error("Müşteri bilgileri yüklenirken hata oluştu")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomerData()
  }, [customerId])

  const form = useForm<CapitalFormValues>({
    resolver: zodResolver(capitalSchema),
    defaultValues: {
      partnerId: "",
      capitalRatio: "",
      totalCapital: "",
      totalShareCount: "",
      partnerShareCount: "",
      sharePrice: "",
      endDate: "",
      status: "active",
    },
  })

  // Auto passive logic
  const endDate = form.watch("endDate")
  const totalCapital = form.watch("totalCapital")
  const totalShareCount = form.watch("totalShareCount")

  useEffect(() => {
    if (endDate) {
      const today = new Date()
      const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0')
      
      if (endDate <= todayStr) {
        form.setValue("status", "passive")
      }
    }
  }, [endDate, form])

  // Helper for Turkish number parsing
  const parseNumber = (value: string) => {
    if (!value) return 0
    // Replace comma with dot for Turkish format support
    const normalized = value.replace(',', '.')
    const parsed = parseFloat(normalized)
    return isNaN(parsed) ? 0 : parsed
  }

  // Auto calculate share price
  useEffect(() => {
    const capital = parseNumber(totalCapital)
    const shareCount = parseNumber(totalShareCount)

    if (capital > 0 && shareCount > 0) {
      const price = capital / shareCount
      // Format with max 2 decimals if needed, but keeping it simple string for input
      form.setValue("sharePrice", price.toString())
    }
  }, [totalCapital, totalShareCount, form])

  // Auto calculate partner share count based on ratio
  const capitalRatio = form.watch("capitalRatio")
  useEffect(() => {
    const shareCount = parseNumber(totalShareCount)
    const ratio = parseNumber(capitalRatio)

    if (shareCount > 0 && ratio > 0) {
      const partnerShares = Math.floor(shareCount * (ratio / 100))
      form.setValue("partnerShareCount", partnerShares.toString())
    }
  }, [totalShareCount, capitalRatio, form])

  const onSubmit = (data: CapitalFormValues) => {
    if (editingId) {
      setCapitals((prev) =>
        prev.map((c) => (c.id === editingId ? { ...data, id: editingId } : c))
      )
      toast.success("Sermaye bilgisi güncellendi")
      setEditingId(null)
    } else {
      const newCapital: CapitalInfo = {
        ...data,
        id: crypto.randomUUID(),
      }
      setCapitals((prev) => [...prev, newCapital])
      toast.success("Yeni sermaye bilgisi eklendi")
    }
    form.reset({
      partnerId: "",
      capitalRatio: "",
      totalCapital: "",
      totalShareCount: "",
      partnerShareCount: "",
      sharePrice: "",
      endDate: "",
      status: "active",
    })
  }

  const handleEdit = (capital: CapitalInfo) => {
    setEditingId(capital.id)
    form.reset({
      partnerId: capital.partnerId,
      capitalRatio: capital.capitalRatio,
      totalCapital: capital.totalCapital,
      totalShareCount: capital.totalShareCount,
      partnerShareCount: capital.partnerShareCount,
      sharePrice: capital.sharePrice,
      endDate: capital.endDate || "",
      status: capital.status,
    })
  }

  const handleDelete = () => {
    if (deleteId) {
      setCapitals((prev) => prev.filter((c) => c.id !== deleteId))
      setDeleteId(null)
      toast.success("Sermaye bilgisi silindi")
      
      // Adjust page if empty
      const remainingCount = capitals.length - 1
      const maxPage = Math.ceil(remainingCount / pageSize)
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(maxPage)
      }
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    form.reset({
      partnerId: "",
      capitalRatio: "",
      totalCapital: "",
      totalShareCount: "",
      partnerShareCount: "",
      sharePrice: "",
      endDate: "",
      status: "active",
    })
  }

  const handleSave = async (shouldNavigate: boolean = false) => {
    if (!customerId) {
      toast.error("Müşteri ID bulunamadı")
      return
    }

    try {
      setIsSaving(true)
      const res = await fetch(`/api/customers?id=${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capitals }),
      })

      if (!res.ok) {
        throw new Error("Kaydedilemedi")
      }

      toast.success("Sermaye bilgileri kaydedildi")
      if (shouldNavigate) {
        onNext()
      }
    } catch (error) {
      console.error(error)
      toast.error("Kaydetme sırasında hata oluştu")
    } finally {
      setIsSaving(false)
    }
  }

  // Filtering and Pagination
  const filteredCapitals = capitals.filter((c) => {
    const partner = availablePartners.find(p => p.id === c.partnerId)
    const partnerName = partner ? partner.fullName.toLowerCase() : ""
    return partnerName.includes(filter.toLowerCase())
  })

  // Chart Data
  const chartData = capitals
    .filter(c => c.status === 'active')
    .map(c => {
      const partner = availablePartners.find(p => p.id === c.partnerId)
      return {
        name: partner ? partner.fullName : "Bilinmeyen Ortak",
        value: parseFloat(c.capitalRatio.replace(',', '.')) || 0
      }
    })
    .filter(d => d.value > 0)

  const totalPages = Math.ceil(filteredCapitals.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedCapitals = filteredCapitals.slice(startIndex, startIndex + pageSize)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Sermaye Bilgileri</CardTitle>
        <CardDescription>
          Ortakların sermaye ve hisse bilgilerini yönetin.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Partner Combobox */}
              <FormField
                control={form.control}
                name="partnerId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ortak</FormLabel>
                    <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? availablePartners.find(
                                  (partner) => partner.id === field.value
                                )?.fullName
                              : "Ortak seçiniz"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Ortak ara..." />
                          <CommandList>
                            <CommandEmpty>Ortak bulunamadı.</CommandEmpty>
                            <CommandGroup>
                              {availablePartners.map((partner) => (
                                <CommandItem
                                  value={partner.fullName}
                                  key={partner.id}
                                  onSelect={() => {
                                    form.setValue("partnerId", partner.id)
                                    setComboboxOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      partner.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {partner.fullName}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capitalRatio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sermaye Oranı (%)</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn: 50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalCapital"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Toplam Sermaye</FormLabel>
                    <FormControl>
                      <Input placeholder="TL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalShareCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Toplam Pay Adet</FormLabel>
                    <FormControl>
                      <Input placeholder="Adet" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="partnerShareCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ortak Pay Adet</FormLabel>
                    <FormControl>
                      <Input placeholder="Adet" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sharePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hisse Adet Fiyatı</FormLabel>
                    <FormControl>
                      <Input placeholder="TL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ort. Bitiş Tarihi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durum</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Durum seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="passive">Pasif</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              {editingId && (
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  <X className="w-4 h-4 mr-2" />
                  İptal
                </Button>
              )}
              <Button type="submit">
                {editingId ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Güncelle
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Ekle
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>


        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Sermaye Listesi</h3>
            <div className="flex items-center gap-2">
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="Sayfa Boyutu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Kayıt</SelectItem>
                  <SelectItem value="10">10 Kayıt</SelectItem>
                  <SelectItem value="20">20 Kayıt</SelectItem>
                  <SelectItem value="50">50 Kayıt</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ortak ismi ile ara..."
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ortak</TableHead>
                  <TableHead>Sermaye Oranı</TableHead>
                  <TableHead>Toplam Sermaye</TableHead>
                  <TableHead>Toplam Pay</TableHead>
                  <TableHead>Ortak Pay</TableHead>
                  <TableHead>Hisse Fiyatı</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCapitals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Kayıt bulunamadı.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCapitals.map((capital) => {
                    const partner = availablePartners.find(p => p.id === capital.partnerId)
                    return (
                      <TableRow 
                        key={capital.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleEdit(capital)}
                      >
                        <TableCell className="font-medium">{partner?.fullName || "Bilinmeyen Ortak"}</TableCell>
                        <TableCell>%{capital.capitalRatio}</TableCell>
                        <TableCell>{formatTL(capital.totalCapital)}</TableCell>
                        <TableCell>{capital.totalShareCount}</TableCell>
                        <TableCell>{capital.partnerShareCount}</TableCell>
                        <TableCell>{formatTL(capital.sharePrice)}</TableCell>
                        <TableCell>
                          <Badge variant={capital.status === "active" ? "default" : "secondary"}>
                            {capital.status === "active" ? "Aktif" : "Pasif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(capital)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(capital.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Önceki
              </Button>
              <div className="text-sm text-muted-foreground">
                Sayfa {currentPage} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Sonraki
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>

        {chartData.length > 0 && (
          <div className="border rounded-lg p-4 bg-white dark:bg-muted/10">
             <h3 className="text-lg font-medium mb-4">Sermaye Dağılımı</h3>
             <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={chartData}
                     cx="50%"
                     cy="50%"
                     labelLine={false}
                     label={({ name, percent }) => `${name} (%${(percent * 100).toFixed(0)})`}
                     outerRadius={100}
                     fill="#8884d8"
                     dataKey="value"
                   >
                     {chartData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip formatter={(value: number) => [`%${value}`, 'Ratio']} />
                   <Legend />
                 </PieChart>
               </ResponsiveContainer>
             </div>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
            disabled={isSaving || isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={isSaving}
            >
              Kaydet
            </Button>
            <Button 
              type="button" 
              onClick={() => handleSave(true)}
              disabled={isSaving}
            >
              İleri
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Emin misiniz?</DialogTitle>
            <DialogDescription>
              Bu sermaye bilgisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
