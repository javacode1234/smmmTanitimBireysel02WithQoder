"use client"

import { useEffect, useState, useCallback, Fragment } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Pencil, Trash2, Plus, Search } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const formSchema = z.object({
  type: z.string().min(1, "Beyanname türü zorunludur"),
  frequency: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]),
  enabled: z.boolean().default(true),
  optional: z.boolean().default(false),
  quarters: z.array(z.number()).default([]),
  
  // Advanced / Scheduling
  dueDay: z.coerce.number().min(1).max(31).optional().or(z.literal("")),
  dueMonth: z.coerce.number().min(1).max(12).optional().or(z.literal("")),
  quarterOffset: z.coerce.number().min(0).max(12).optional().or(z.literal("")),
  taxPeriodType: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function DeclarationsPage() {
  interface DeclarationConfig {
    id: string
    type: string
    frequency: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
    enabled: boolean
    dueDay?: number
    dueMonth?: number
    quarterOffset?: number
    optional?: boolean
    quarters?: string
    taxPeriodType?: string
    createdAt: string
    updatedAt: string
  }

  const [items, setItems] = useState<DeclarationConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [declarationTypes, setDeclarationTypes] = useState<string[]>([])
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // modal + edit state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<DeclarationConfig | null>(null)

  // filter + pagination
  const [search, setSearch] = useState("")
  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      frequency: "MONTHLY",
      enabled: true,
      optional: false,
      quarters: [],
      dueDay: "",
      dueMonth: "",
      quarterOffset: "",
      taxPeriodType: "",
    }
  })

  // Watch frequency to update UI or reset quarters if needed
  const frequency = form.watch("frequency")
  const quarters = form.watch("quarters")

  // Frequency mapping
  const getFrequencyLabel = (frequency: string) => {
    const map: Record<string, string> = {
      'MONTHLY': 'Aylık',
      'QUARTERLY': '3 Aylık',
      'YEARLY': 'Yıllık'
    }
    return map[frequency] || frequency
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [search, typeFilter])

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/declarations-config")
      if (res.ok) {
        const data: DeclarationConfig[] = await res.json()
        setItems(data)
        setDeclarationTypes(Array.from(new Set(data.map(item => item.type).filter(Boolean))))
      } else {
        toast.error("Beyannameler yüklenemedi")
      }
    } catch (e) {
      console.error(e)
      toast.error("Beyannameler yüklenemedi")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const resetForm = () => {
    form.reset({
      type: "",
      frequency: "MONTHLY",
      enabled: true,
      optional: false,
      quarters: [],
      dueDay: "",
      dueMonth: "",
      quarterOffset: "",
      taxPeriodType: "",
    })
  }

  const onSubmit = async (data: FormValues) => {
    try {
      const formData = {
        type: data.type,
        frequency: data.frequency,
        enabled: data.enabled,
        dueDay: data.dueDay === "" ? undefined : Number(data.dueDay),
        dueMonth: data.dueMonth === "" ? undefined : Number(data.dueMonth),
        quarterOffset: data.quarterOffset === "" ? undefined : Number(data.quarterOffset),
        optional: data.optional,
        quarters: data.quarters && data.quarters.length > 0 ? JSON.stringify(data.quarters) : undefined,
        taxPeriodType: data.taxPeriodType || undefined,
      }

      if (editingId) {
        const res = await fetch("/api/declarations-config", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            ...formData
          })
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Güncellenemedi" }))
          toast.error(err.error || "Güncellenemedi")
          return
        }
        toast.success("Beyanname başarıyla güncellendi")
      } else {
        const res = await fetch("/api/declarations-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Kaydedilemedi" }))
          toast.error(err.error || "Kaydedilemedi")
          return
        }
        toast.success("Beyanname başarıyla eklendi")
      }
      setIsModalOpen(false)
      setEditingId(null)
      resetForm()
      fetchItems()
    } catch (e) {
      console.error(e)
      toast.error("İşlem sırasında bir hata oluştu")
    }
  }

  const handleEdit = (item: DeclarationConfig) => {
    setEditingId(item.id)
    
    let parsedQuarters: number[] = []
    try {
      if (item.quarters) {
        parsedQuarters = JSON.parse(item.quarters)
      }
    } catch (e) {
      console.error("Error parsing quarters", e)
    }

    form.reset({
      type: item.type,
      frequency: item.frequency,
      enabled: item.enabled,
      optional: item.optional || false,
      quarters: parsedQuarters,
      dueDay: item.dueDay ?? "",
      dueMonth: item.dueMonth ?? "",
      quarterOffset: item.quarterOffset ?? "",
      taxPeriodType: item.taxPeriodType || "",
    })
    
    setIsModalOpen(true)
  }

  const toggleEnabled = async (id: string, next: boolean) => {
    try {
      const res = await fetch("/api/declarations-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled: next })
      })
      if (!res.ok) throw new Error("update failed")
      setItems(prev => prev.map(i => i.id === id ? { ...i, enabled: next } : i))
      toast.success(`Beyanname ${next ? 'aktif' : 'pasif'} hale getirildi`)
    } catch {
      toast.error("Güncellenemedi")
    }
  }

  const removeItem = async (id: string) => {
    try {
      const res = await fetch(`/api/declarations-config?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("delete failed")
      toast.success("Beyanname başarıyla silindi")
      setItems(prev => prev.filter(i => i.id !== id))
    } catch {
      toast.error("Silinemedi")
    }
  }
  
  const frequencyOptions = [
    { value: "MONTHLY", label: "Aylık" },
    { value: "QUARTERLY", label: "3 Aylık" },
    { value: "YEARLY", label: "Yıllık" }
  ]
  
  const followingMonthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: `Dönemi izleyen ${i + 1}. ay`
  }))
  
  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", 
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ]

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.type.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'all' || item.type === typeFilter
    return matchesSearch && matchesType
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedItems = filteredItems.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Beyannameler</h1>
        <p className="text-muted-foreground mt-2">Genel beyanname türlerini ve özelliklerini tanımlayın.</p>
      </div>

      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open)
        if (!open) {
          setEditingId(null)
          resetForm()
        }
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
          <DialogHeader className="px-6 pt-6 flex-shrink-0">
            <DialogTitle>{editingId ? "Beyannameyi Düzenle" : "Yeni Beyanname Tanımı"}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-5">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Beyanname Türü *</FormLabel>
                          <FormControl>
                            <Input placeholder="Örn: KDV Beyannamesi" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-5">
                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dönem Tipi</FormLabel>
                          <Select 
                            onValueChange={(val) => {
                              field.onChange(val)
                              form.setValue("quarters", []) // Reset quarters when frequency changes
                            }} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seçiniz" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {frequencyOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center gap-6">
                      <FormField
                        control={form.control}
                        name="enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm cursor-pointer font-normal">
                              Aktif
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="optional"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm cursor-pointer font-normal">
                              İsteğe Bağlı
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="advanced-settings">
                      <AccordionTrigger>Gelişmiş Ayarlar (İsteğe Bağlı)</AccordionTrigger>
                      <AccordionContent className="pt-4 pb-2 px-1">
                        <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="quarterOffset"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Dönemi İzleyen Ay</FormLabel>
                                  <Select 
                                    onValueChange={(val) => field.onChange(val)} 
                                    value={field.value?.toString()}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Seçiniz" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="0">Aynı Ay İçinde</SelectItem>
                                      {followingMonthOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>Dönem bitiminden sonra kaçıncı ayda verilmesi gerektiğini seçin.</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="dueDay"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Son Gün</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="1-31" 
                                      type="number" 
                                      min="1" 
                                      max="31" 
                                      {...field}
                                      value={field.value ?? ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {(frequency === "QUARTERLY" || frequency === "MONTHLY") && (
                              <div className="border rounded-lg p-4 bg-muted/10 mt-4">
                                <h3 className="font-medium mb-3">Dönem Seçimi</h3>
                                
                                <div className="mt-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <Label>Vergilendirme Dönemleri</Label>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 text-xs"
                                      onClick={() => {
                                        if (frequency === "MONTHLY") {
                                          if (quarters.length === 12) {
                                            form.setValue("quarters", [])
                                          } else {
                                            form.setValue("quarters", Array.from({ length: 12 }, (_, i) => i + 1))
                                          }
                                        } else if (frequency === "QUARTERLY") {
                                          if (quarters.length === 4) {
                                            form.setValue("quarters", [])
                                          } else {
                                            form.setValue("quarters", [1, 2, 3, 4])
                                          }
                                        }
                                      }}
                                    >
                                      {frequency === "MONTHLY" 
                                        ? (quarters.length === 12 ? "Tümünü Kaldır" : "Tümünü Seç")
                                        : (quarters.length === 4 ? "Tümünü Kaldır" : "Tümünü Seç")
                                      }
                                    </Button>
                                  </div>
                                  
                                  <div className={`grid ${frequency === "MONTHLY" ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-6" : "grid-cols-4"} gap-2 mt-2`}>
                                    {frequency === "QUARTERLY" 
                                      ? [1, 2, 3, 4].map(q => (
                                          <div key={q} className="flex items-center gap-2">
                                            <Checkbox
                                              id={`quarter-${q}`}
                                              checked={quarters.includes(q)}
                                              onCheckedChange={(checked) => {
                                                if (checked) {
                                                  form.setValue("quarters", [...quarters, q].sort((a, b) => a - b))
                                                } else {
                                                  form.setValue("quarters", quarters.filter(item => item !== q))
                                                }
                                              }}
                                            />
                                            <Label htmlFor={`quarter-${q}`} className="text-sm cursor-pointer">
                                              {q}. Dönem
                                            </Label>
                                          </div>
                                        ))
                                      : Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                          <div key={m} className="flex items-center gap-2">
                                            <Checkbox
                                              id={`month-${m}`}
                                              checked={quarters.includes(m)}
                                              onCheckedChange={(checked) => {
                                                if (checked) {
                                                  form.setValue("quarters", [...quarters, m].sort((a, b) => a - b))
                                                } else {
                                                  form.setValue("quarters", quarters.filter(item => item !== m))
                                                }
                                              }}
                                            />
                                            <Label htmlFor={`month-${m}`} className="text-sm cursor-pointer">
                                              {monthNames[m-1]}
                                            </Label>
                                          </div>
                                        ))
                                    }
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Hangi dönemler için beyanname oluşturulacağını seçin (boş bırakılırsa tüm dönemler)
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>

              <DialogFooter className="px-6 pb-6 flex-shrink-0">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => { 
                    setIsModalOpen(false)
                    setEditingId(null)
                    resetForm()
                  }}
                >
                  İptal
                </Button>
                <Button 
                  type="submit"
                  className="bg-green-600 hover:bg-green-700" 
                >
                  {editingId ? "Güncelle" : "Kaydet"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setTimeout(() => setDeletingItem(null), 0)
        }}
        onConfirm={() => {
          if (deletingItem) {
            removeItem(deletingItem.id)
          }
          setIsDeleteDialogOpen(false)
          setDeletingItem(null)
        }}
        title="Beyannameyi Sil"
        description={deletingItem ? `${deletingItem.type} beyannamesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.` : "Silme işlemini onaylıyor musunuz?"}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Tanımlı Beyannameler</CardTitle>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto" 
              onClick={() => { 
                resetForm()
                setEditingId(null)
                setIsModalOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Beyanname
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Beyanname ara..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[200px]">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Türü Filtrele" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {declarationTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Beyanname Türü</TableHead>
                  <TableHead>Dönem Tipi</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      {loading ? "Yükleniyor..." : "Kayıt bulunamadı"}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.type}
                        {item.optional && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">İsteğe Bağlı</span>}
                      </TableCell>
                      <TableCell>{getFrequencyLabel(item.frequency)}</TableCell>
                      <TableCell>
                        <Switch 
                          checked={item.enabled} 
                          onCheckedChange={(checked) => toggleEnabled(item.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEdit(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setDeletingItem(item)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredItems.length > 0 && (
            <div className="flex items-center justify-between px-2 py-4">
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
                <span>Kayıt var. Toplam kayıt sayısı {filteredItems.length}.</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                >
                  İlk
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
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
                          onClick={() => goToPage(page)}
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
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
