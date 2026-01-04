"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Edit, Trash2, Save, Plus, Search, Check, X, ArrowRight, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

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

const partnerSchema = z.object({
  tckn: z.string()
    .length(11, "TCKN 11 haneli olmalıdır")
    .regex(/^\d+$/, "Sadece rakam giriniz"),
  fullName: z.string().min(2, "Ad Soyad en az 2 karakter olmalıdır"),
  birthDate: z.string().min(1, "Doğum tarihi seçiniz"),
  startDate: z.string().min(1, "Başlangıç tarihi seçiniz"),
  endDate: z.string().optional(),
  status: z.enum(["active", "passive"], {
    required_error: "Durum seçiniz",
  }),
})

type PartnerFormValues = z.infer<typeof partnerSchema>

interface Partner extends PartnerFormValues {
  id: string
}

interface PartnersTabProps {
  customerId: string | null
  onNext: () => void
  onBack?: () => void
}

export function PartnersTab({ customerId, onNext, onBack }: PartnersTabProps) {
  const [partners, setPartners] = useState<Partner[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState(5)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchPartners = async () => {
      if (!customerId) return
      
      try {
        setIsLoading(true)
        const res = await fetch(`/api/customers?id=${customerId}`)
        if (!res.ok) throw new Error("Müşteri bilgileri alınamadı")
        
        const data = await res.json()
        if (data.partners) {
          try {
            const parsedPartners = typeof data.partners === 'string' 
              ? JSON.parse(data.partners) 
              : data.partners
            setPartners(Array.isArray(parsedPartners) ? parsedPartners : [])
          } catch (e) {
            console.error("Partners parse error:", e)
            setPartners([])
          }
        }
      } catch (error) {
        console.error(error)
        toast.error("Ortak bilgileri yüklenirken hata oluştu")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPartners()
  }, [customerId])

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      tckn: "",
      fullName: "",
      birthDate: "",
      startDate: "",
      endDate: "",
      status: "active",
    },
  })

  const endDate = form.watch("endDate")

  useEffect(() => {
    if (endDate) {
      const today = new Date()
      const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0')
      
      if (endDate <= todayStr) {
        form.setValue("status", "passive")
      }
    }
  }, [endDate, form])

  const onSubmit = (data: PartnerFormValues) => {
    if (editingId) {
      setPartners((prev) =>
        prev.map((p) => (p.id === editingId ? { ...data, id: editingId } : p))
      )
      toast.success("Ortak bilgileri güncellendi")
      setEditingId(null)
    } else {
      const newPartner: Partner = {
        ...data,
        id: crypto.randomUUID(),
      }
      setPartners((prev) => [newPartner, ...prev])
      toast.success("Yeni ortak eklendi")
    }
    form.reset({
      tckn: "",
      fullName: "",
      birthDate: "",
      startDate: "",
      endDate: "",
      status: "active",
    })
  }

  const handleEdit = (partner: Partner) => {
    setEditingId(partner.id)
    form.reset({
      tckn: partner.tckn,
      fullName: partner.fullName,
      birthDate: partner.birthDate,
      startDate: partner.startDate,
      endDate: partner.endDate || "",
      status: partner.status,
    })
  }

  const handleDelete = () => {
    if (deleteId) {
      setPartners((prev) => prev.filter((p) => p.id !== deleteId))
      setDeleteId(null)
      toast.success("Ortak silindi")
      
      // Adjust page if empty
      const remainingCount = partners.length - 1
      const maxPage = Math.ceil(remainingCount / pageSize)
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(maxPage)
      }
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    form.reset({
      tckn: "",
      fullName: "",
      birthDate: "",
      startDate: "",
      endDate: "",
      status: "active",
    })
  }

  const handleSaveAll = async (shouldNavigate: boolean = false) => {
    if (!customerId) {
      toast.error("Müşteri ID bulunamadı")
      return
    }

    try {
      setIsSaving(true)
      const res = await fetch(`/api/customers?id=${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partners }),
      })

      if (!res.ok) {
        throw new Error("Kaydedilemedi")
      }

      toast.success("Ortak bilgileri kaydedildi")
      if (shouldNavigate) {
        onNext()
      }
    } catch (error) {
      console.error(error)
      toast.error("Kaydederken hata oluştu")
    } finally {
      setIsSaving(false)
    }
  }

  // Filtering and Pagination
  const filteredPartners = partners.filter((p) =>
    p.fullName.toLowerCase().includes(filter.toLowerCase()) ||
    p.tckn.includes(filter)
  )

  const totalPages = Math.ceil(filteredPartners.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedPartners = filteredPartners.slice(startIndex, startIndex + pageSize)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Ortak Bilgileri</CardTitle>
        <CardDescription>
          Şirket ortaklarını ekleyin ve yönetin.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="tckn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TCKN</FormLabel>
                    <FormControl>
                      <Input placeholder="11 haneli TCKN" maxLength={11} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Soyad</FormLabel>
                    <FormControl>
                      <Input placeholder="Ad Soyad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doğum Tarihi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Başlangıç Tarihi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel>Bitiş Tarihi</FormLabel>
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
            <h3 className="text-lg font-medium">Ortak Listesi</h3>
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
                  placeholder="TCKN veya İsim ile ara..."
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
                  <TableHead>TCKN</TableHead>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPartners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Kayıt bulunamadı.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPartners.map((partner) => (
                    <TableRow 
                      key={partner.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleEdit(partner)}
                    >
                      <TableCell className="font-medium">{partner.tckn}</TableCell>
                      <TableCell>{partner.fullName}</TableCell>
                      <TableCell>
                        <Badge variant={partner.status === "active" ? "default" : "secondary"}>
                          {partner.status === "active" ? "Aktif" : "Pasif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(partner)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(partner.id)}
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
          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
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
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 gap-2">
          {onBack && (
            <Button variant="outline" onClick={onBack} disabled={isSaving || isLoading}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => handleSaveAll(false)} 
              disabled={isSaving || isLoading}
            >
              <Save className="mr-2 h-4 w-4" />
              Kaydet
            </Button>
            <Button 
              type="button"
              onClick={() => handleSaveAll(true)} 
              disabled={isSaving || isLoading}
            >
              İleri
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Emin misiniz?</DialogTitle>
            <DialogDescription>
              Bu ortağı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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
