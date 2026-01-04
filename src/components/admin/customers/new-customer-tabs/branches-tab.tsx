"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Edit, Trash2, Save, Plus, Search, X, List, Check, ArrowRight, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const branchSchema = z.object({
  name: z.string().min(2, "Şube adı en az 2 karakter olmalıdır"),
  addressNo: z.string().length(10, "Adres no 10 karakter olmalıdır").regex(/^\d+$/, "Sadece rakam giriniz"),
  address: z.string().min(5, "Adres en az 5 karakter olmalıdır"),
  startDate: z.string().min(1, "Başlangıç tarihi seçiniz"),
  endDate: z.string().optional(),
  activityCode: z.string().min(1, "Faaliyet kodu seçiniz"),
  status: z.enum(["active", "passive"] as const, {
    required_error: "Durum seçiniz",
  }),
})

type BranchFormValues = z.infer<typeof branchSchema>

interface ActivityCode {
  id: string
  name: string
}

interface Branch extends BranchFormValues {
  id: string
}

interface BranchesTabProps {
  customerId: string | null
  onNext: () => void
  onBack: () => void
}

export function BranchesTab({ customerId, onNext, onBack }: BranchesTabProps) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState(5)
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [activityCodes, setActivityCodes] = useState<ActivityCode[]>([])
  const [isLoadingCodes, setIsLoadingCodes] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchBranches = async () => {
      if (!customerId) return
      
      try {
        setIsLoading(true)
        const res = await fetch(`/api/customers?id=${customerId}`)
        if (!res.ok) throw new Error("Müşteri bilgileri alınamadı")
        
        const data = await res.json()
        if (data.branches) {
          try {
            const parsedBranches = typeof data.branches === 'string' 
              ? JSON.parse(data.branches) 
              : data.branches
            setBranches(Array.isArray(parsedBranches) ? parsedBranches : [])
          } catch (e) {
            console.error("Branches parse error:", e)
            setBranches([])
          }
        }
      } catch (error) {
        console.error(error)
        toast.error("Şube bilgileri yüklenirken hata oluştu")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBranches()
  }, [customerId])

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        setIsLoadingCodes(true)
        const res = await fetch("/api/activity-codes")
        if (res.ok) {
          const data = await res.json()
          setActivityCodes(data.codes || [])
        }
      } catch (error) {
        console.error("Failed to fetch activity codes", error)
      } finally {
        setIsLoadingCodes(false)
      }
    }

    fetchCodes()
  }, [])

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: "",
      addressNo: "",
      address: "",
      startDate: "",
      endDate: "",
      activityCode: "",
      status: "active",
    },
  })

  // Auto passive logic
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

  const handleSave = async (shouldNavigate: boolean = false) => {
    if (!customerId) {
      toast.error("Müşteri ID bulunamadı")
      return
    }

    setIsSaving(true)
    try {
      let branchesToSave = [...branches]

      // If no branches in list, check form and add if valid
      if (branchesToSave.length === 0) {
        const isValid = await form.trigger()
        if (!isValid) {
          toast.error("Lütfen en az bir şube ekleyin")
          setIsSaving(false)
          return
        }
        
        // Add form data as new branch
        const formData = form.getValues()
        const newBranch: Branch = {
          ...formData,
          id: crypto.randomUUID(),
        }
        branchesToSave.push(newBranch)
        setBranches(branchesToSave) // Update UI
      }
      // If branches exist, skip form validation (User request)

      // Prepare data
      const dataToSave = {
        branches: branchesToSave
      }

      console.log("Saving branches for customer:", customerId)
      console.log("Payload:", dataToSave)

      const res = await fetch(`/api/customers?id=${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      })

      // Handle non-JSON responses (like 404 Not Found HTML page)
      const contentType = res.headers.get("content-type");
      if (!res.ok) {
        let errorData;
        if (contentType && contentType.includes("application/json")) {
           try {
             errorData = await res.json();
           } catch (e) {
             errorData = { error: `Sunucu hatası (${res.status}) - Veri işleme hatası` };
           }
        } else {
           const textBody = await res.text();
           console.error("Non-JSON error response:", textBody);
           errorData = { error: `Sunucu hatası (${res.status}): Beklenmeyen yanıt formatı` };
        }

        if (!errorData || (typeof errorData === 'object' && Object.keys(errorData).length === 0)) {
             errorData = { error: `Sunucu hatası (${res.status}): ${res.statusText || 'Detay yok'}` }
        }

        console.error("Save error details:", errorData)
        throw new Error(errorData.error || errorData.details || "Kaydetme başarısız")
      }

      toast.success("Şube bilgileri kaydedildi")
      if (shouldNavigate) {
        onNext()
      }
    } catch (error: any) {
      console.error("Save operation failed:", error)
      toast.error(error.message || "Değişiklikler kaydedilirken hata oluştu")
    } finally {
      setIsSaving(false)
    }
  }

  const onSubmit = (data: BranchFormValues) => {
    if (editingId) {
      setBranches((prev) =>
        prev.map((b) => (b.id === editingId ? { ...data, id: editingId } : b))
      )
      toast.success("Şube bilgileri güncellendi")
      setEditingId(null)
    } else {
      const newBranch: Branch = {
        ...data,
        id: crypto.randomUUID(),
      }
      setBranches((prev) => [...prev, newBranch])
      toast.success("Yeni şube eklendi")
    }
    form.reset({
      name: "",
      addressNo: "",
      address: "",
      startDate: "",
      endDate: "",
      activityCode: "",
      status: "active",
    })
  }

  const handleEdit = (branch: Branch) => {
    setEditingId(branch.id)
    form.reset({
      name: branch.name,
      addressNo: branch.addressNo,
      address: branch.address,
      startDate: branch.startDate,
      endDate: branch.endDate || "",
      activityCode: branch.activityCode,
      status: branch.status,
    })
  }

  const handleDelete = () => {
    if (deleteId) {
      setBranches((prev) => prev.filter((b) => b.id !== deleteId))
      setDeleteId(null)
      toast.success("Şube silindi")
      
      // Adjust page if empty
      const remainingCount = branches.length - 1
      const maxPage = Math.ceil(remainingCount / pageSize)
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(maxPage)
      }
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    form.reset({
      name: "",
      addressNo: "",
      address: "",
      startDate: "",
      endDate: "",
      activityCode: "",
      status: "active",
    })
  }



  // Filtering and Pagination
  const filteredBranches = branches.filter((b) =>
    b.name.toLowerCase().includes(filter.toLowerCase()) ||
    b.address.toLowerCase().includes(filter.toLowerCase())
  )

  const totalPages = Math.ceil(filteredBranches.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedBranches = filteredBranches.slice(startIndex, startIndex + pageSize)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Şube Bilgileri</CardTitle>
        <CardDescription>
          Firma şube bilgilerini buradan yönetebilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şube Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="Şube adı" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addressNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adres No</FormLabel>
                    <FormControl>
                      <Input placeholder="Adres no" maxLength={10} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2 lg:col-span-3">
                    <FormLabel>Adres</FormLabel>
                    <FormControl>
                      <Input placeholder="Tam adres" {...field} />
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
                name="activityCode"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2 lg:col-span-3">
                    <FormLabel>Faaliyet Kodu</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Textarea 
                          placeholder="Faaliyet kodu seçiniz..." 
                          className="resize-none min-h-[80px]" 
                          readOnly 
                          value={(() => {
                            const code = activityCodes.find(c => c.id === field.value)
                            return code ? code.name : field.value
                          })()}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-[80px] w-[80px] shrink-0"
                        onClick={() => setIsActivityModalOpen(true)}
                        title="Faaliyet Kodu Seç"
                      >
                        <Search className="h-6 w-6" />
                      </Button>
                    </div>
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
            <h3 className="text-lg font-medium">Şube Listesi</h3>
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
                  placeholder="Şube adı veya adres ile ara..."
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
                  <TableHead>Şube Adı</TableHead>
                  <TableHead>Adres No</TableHead>
                  <TableHead>Adres</TableHead>
                  <TableHead>Başlangıç Tarihi</TableHead>
                  <TableHead>Bitiş Tarihi</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBranches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Kayıtlı şube bulunamadı.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedBranches.map((branch) => (
                    <TableRow 
                      key={branch.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleEdit(branch)}
                    >
                      <TableCell className="font-medium">{branch.name}</TableCell>
                      <TableCell>{branch.addressNo}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={branch.address}>
                        {branch.address}
                      </TableCell>
                      <TableCell>{branch.startDate}</TableCell>
                      <TableCell>{branch.endDate || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={branch.status === "active" ? "default" : "secondary"}>
                          {branch.status === "active" ? "Aktif" : "Pasif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(branch)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(branch.id)}
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
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Önceki
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
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

        <div className="flex justify-between pt-4 border-t gap-2">
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
              variant="secondary"
              onClick={() => handleSave(false)}
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              Kaydet
            </Button>
            <Button 
              type="button" 
              onClick={() => handleSave(true)}
              disabled={isSaving}
            >
              Sonrakine Geç
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
              Bu şubeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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

      <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
        <DialogContent className="max-w-[600px] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Faaliyet Kodu Seçimi</DialogTitle>
          </DialogHeader>
          <Command className="overflow-hidden rounded-t-none border-0">
            <CommandInput placeholder="Faaliyet kodu veya tanımı ara..." />
            <CommandList className="max-h-[400px]">
              <CommandEmpty>
                {isLoadingCodes ? "Yükleniyor..." : "Sonuç bulunamadı."}
              </CommandEmpty>
              <CommandGroup>
                {activityCodes.map((code) => (
                  <CommandItem
                    key={code.id}
                    value={code.name}
                    onSelect={() => {
                      form.setValue("activityCode", code.id, { shouldValidate: true })
                      setIsActivityModalOpen(false)
                    }}
                    className="cursor-pointer p-3"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        form.watch("activityCode") === code.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{code.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
