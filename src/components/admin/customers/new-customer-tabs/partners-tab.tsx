"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Edit, Trash2, Save, Plus, Search, Check, X, ArrowRight, ArrowLeft, Shield, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

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
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"

const partnerSchema = z.object({
  tckn: z.string()
    .length(11, "TCKN 11 haneli olmalıdır")
    .regex(/^\d+$/, "Sadece rakam giriniz"),
  fullName: z.string().min(2, "Ad Soyad en az 2 karakter olmalıdır"),
  birthDate: z.string().min(1, "Doğum tarihi seçiniz"),
  startDate: z.string().min(1, "Başlangıç tarihi seçiniz"),
  endDate: z.string().optional(),
  shareAmount: z.string().optional(),
  shareRatio: z.string().optional(),
  status: z.enum(["active", "passive"], {
    required_error: "Durum seçiniz",
  }),
  isAuthorized: z.boolean().default(false),
  authorizationDuration: z.string().optional(),
  authorizationStartDate: z.string().optional(),
  authorizationEndDate: z.string().optional(),
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
      shareAmount: "",
      shareRatio: "",
      status: "active",
      isAuthorized: false,
      authorizationDuration: "",
      authorizationStartDate: new Date().toISOString().split('T')[0],
      authorizationEndDate: "",
    },
  })

  const endDate = form.watch("endDate")
  const authStartDate = form.watch("authorizationStartDate")
  const authDuration = form.watch("authorizationDuration")
  const isAuthorized = form.watch("isAuthorized")
  const authEndDate = form.watch("authorizationEndDate")

  useEffect(() => {
    if (authStartDate && authDuration && isAuthorized) {
      const start = new Date(authStartDate)
      const years = parseInt(authDuration)
      if (!isNaN(years) && start.toString() !== 'Invalid Date') {
        const end = new Date(start)
        end.setFullYear(end.getFullYear() + years)
        const endStr = end.toISOString().split('T')[0]
        form.setValue("authorizationEndDate", endStr)
      } else {
        form.setValue("authorizationEndDate", "")
      }
    } else {
      form.setValue("authorizationEndDate", "")
    }
  }, [authStartDate, authDuration, isAuthorized, form])

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
      shareAmount: "",
      shareRatio: "",
      status: "active",
      isAuthorized: false,
      authorizationDuration: "",
      authorizationStartDate: new Date().toISOString().split('T')[0],
      authorizationEndDate: "",
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
      shareAmount: partner.shareAmount || "",
      shareRatio: partner.shareRatio || "",
      status: partner.status,
      isAuthorized: partner.isAuthorized || false,
      authorizationDuration: partner.authorizationDuration || "",
      authorizationStartDate: partner.authorizationStartDate || new Date().toISOString().split('T')[0],
      authorizationEndDate: partner.authorizationEndDate || "",
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
      shareAmount: "",
      shareRatio: "",
      status: "active",
      isAuthorized: false,
      authorizationDuration: "",
      authorizationStartDate: new Date().toISOString().split('T')[0],
      authorizationEndDate: "",
    })
  }

  const handleToggleAuthority = (partner: Partner, e: React.MouseEvent) => {
    e.stopPropagation()
    const updatedPartners = partners.map(p => 
      p.id === partner.id ? { ...p, isAuthorized: !p.isAuthorized } : p
    )
    setPartners(updatedPartners)
    toast.info(`Yetki durumu değiştirildi: ${!partner.isAuthorized ? 'Yetkili' : 'Yetki Yok'}. Kaydetmeyi unutmayın.`)
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
                name="shareAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hisse Tutarı (TL)</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn: 10000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shareRatio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hisse Oranı (%)</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn: 50" {...field} />
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

              <FormField
                control={form.control}
                name="isAuthorized"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm md:col-span-2 lg:col-span-1">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Yetkili
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Bu ortak aynı zamanda yetkili kişidir.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {isAuthorized && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 col-span-full">
                  <FormField
                    control={form.control}
                    name="authorizationStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Yetki Başlangıç</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="authorizationDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Yetki Süresi (Yıl)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            placeholder="Örn: 3" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="authorizationEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Yetki Bitiş (Hesaplanan)</FormLabel>
                        <FormControl>
                          <Input 
                            readOnly 
                            className="bg-muted" 
                            {...field} 
                            value={field.value ? new Date(field.value).toLocaleDateString('tr-TR') : ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 mr-4">
                {isAuthorized && authEndDate && authStartDate && (
                  (() => {
                    const end = new Date(authEndDate)
                    const start = new Date(authStartDate)
                    const now = new Date()
                    const total = end.getTime() - start.getTime()
                    const elapsed = now.getTime() - start.getTime()
                    let percent = (elapsed / total) * 100
                    if (percent < 0) percent = 0
                    if (percent > 100) percent = 100
                    
                    const diff = end.getTime() - now.getTime()
                    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24))
                    let text = ""
                    
                    if (diff < 0) {
                       text = "Süresi Doldu"
                    } else {
                       const years = Math.floor(daysLeft / 365)
                       const months = Math.floor((daysLeft % 365) / 30)
                       const days = (daysLeft % 365) % 30
                       
                       if (years > 0) text += `${years} Yıl `
                       if (months > 0) text += `${months} Ay `
                       if (years === 0 && months === 0) text += `${days} Gün `
                       text += "kaldı"
                    }

                    return (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Kalan Süre</span>
                          <span>{text}</span>
                        </div>
                        <Progress value={percent} className="h-2" />
                      </div>
                    )
                  })()
                )}
              </div>
              <div className="flex justify-end gap-2 shrink-0">
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
                  <TableHead>Hisse Tutarı</TableHead>
                  <TableHead>Hisse Oranı</TableHead>
                  <TableHead>Yetki</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPartners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                      <TableCell>{partner.shareAmount ? `${partner.shareAmount} TL` : "-"}</TableCell>
                      <TableCell>{partner.shareRatio ? `%${partner.shareRatio}` : "-"}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Button
                            variant={partner.isAuthorized ? "default" : "outline"}
                            size="sm"
                            className={partner.isAuthorized ? "bg-green-600 hover:bg-green-700 h-7 text-xs w-fit" : "h-7 text-xs text-muted-foreground w-fit"}
                            onClick={(e) => handleToggleAuthority(partner, e)}
                          >
                            {partner.isAuthorized ? (
                              <>
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                Yetkili
                              </>
                            ) : (
                              <>
                                <Shield className="w-3 h-3 mr-1" />
                                Yetki Ver
                              </>
                            )}
                          </Button>
                          {partner.isAuthorized && partner.authorizationEndDate && (
                             <div className="flex flex-col gap-1 w-32">
                               <span className="text-xs text-muted-foreground">
                                 Bitiş: {new Date(partner.authorizationEndDate).toLocaleDateString('tr-TR')}
                               </span>
                               {(() => {
                                  const start = new Date(partner.authorizationStartDate || partner.startDate).getTime()
                                  const end = new Date(partner.authorizationEndDate).getTime()
                                  const now = new Date().getTime()
                                  let progress = 0
                                  if (end > start) {
                                    progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100))
                                  }
                                  // Remaining days
                                  const remainingDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
                                  
                                  return (
                                    <div className="space-y-1">
                                      <Progress value={progress} className="h-1.5" />
                                      <span className={cn(
                                        "text-[10px]",
                                        remainingDays < 30 ? "text-destructive font-bold" : "text-muted-foreground"
                                      )}>
                                        {remainingDays > 0 ? `${remainingDays} gün kaldı` : "Süre doldu"}
                                      </span>
                                    </div>
                                  )
                               })()}
                             </div>
                          )}
                        </div>
                      </TableCell>
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
