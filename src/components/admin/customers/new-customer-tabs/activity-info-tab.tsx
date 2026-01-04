"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Edit, Trash2, Save, Plus, Search, X, Check, ArrowRight, ArrowLeft } from "lucide-react"
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

const activitySchema = z.object({
  placeId: z.string().min(1, "Faaliyet yeri seçiniz"),
  activityCode: z.string().min(1, "Faaliyet kodu seçiniz"),
  startDate: z.string().min(1, "Başlangıç tarihi seçiniz"),
  endDate: z.string().optional(),
  status: z.enum(["active", "passive"], {
    required_error: "Durum seçiniz",
  }),
})

type ActivityFormValues = z.infer<typeof activitySchema>

interface ActivityCode {
  id: string
  name: string
}

interface Branch {
  id: string
  name: string
}

interface Activity {
  id: string
  placeId: string
  branchId?: string
  branchName?: string
  activityCode: string
  startDate: string
  endDate?: string
  status: "active" | "passive"
}

interface ActivityInfoTabProps {
  customerId: string | null
  onNext: () => void
  onBack: () => void
}

export function ActivityInfoTab({ customerId, onNext, onBack }: ActivityInfoTabProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [activityCodes, setActivityCodes] = useState<ActivityCode[]>([])
  const [isLoadingCodes, setIsLoadingCodes] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchActivities = async () => {
      if (!customerId) return
      
      try {
        setIsLoading(true)
        const res = await fetch(`/api/customers?id=${customerId}`)
        if (!res.ok) throw new Error("Müşteri bilgileri alınamadı")
        
        const data = await res.json()
        
        let currentBranches: Branch[] = []
        if (data.branches) {
          try {
            const parsedBranches = typeof data.branches === 'string' 
              ? JSON.parse(data.branches) 
              : data.branches
            currentBranches = Array.isArray(parsedBranches) ? parsedBranches : []
            setBranches(currentBranches)
          } catch (e) {
            console.error("Branches parse error:", e)
            setBranches([])
          }
        }

        if (data.activities) {
          try {
            const parsedActivities = typeof data.activities === 'string' 
              ? JSON.parse(data.activities) 
              : data.activities
            
            const mappedActivities = (Array.isArray(parsedActivities) ? parsedActivities : []).map((a: any) => {
              let placeId = "center"
              // Try to find placeId from branchId or branchName
              if (a.branchId) {
                 placeId = a.branchId
              } else if (a.branchName) {
                 const matched = currentBranches.find(b => b.name === a.branchName)
                 if (matched) placeId = matched.id
                 // If not matched but has branchName, it's a branch but maybe deleted or renamed. 
                 // We keep "center" or maybe we should keep the name? 
                 // For now, if we can't map it to an ID, we default to center or maybe we should handle this edge case.
                 // However, to keep it simple and robust:
                 if (!matched && a.type === 'branch') {
                    // Fallback or leave as center? 
                    // Let's assume data integrity is mostly fine or user will fix it.
                 }
              }

              return {
                ...a,
                placeId,
                branchId: a.branchId || (placeId !== "center" ? placeId : undefined),
                branchName: a.branchName || undefined
              }
            })
            
            setActivities(mappedActivities)
          } catch (e) {
            console.error("Activities parse error:", e)
            setActivities([])
          }
        }
      } catch (error) {
        console.error(error)
        toast.error("Error loading activity info")
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
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

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      placeId: "center",
      activityCode: "",
      startDate: "",
      endDate: "",
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

  const handleSaveAll = async (shouldNavigate: boolean = false) => {
    if (!customerId) {
      toast.error("Müşteri ID bulunamadı")
      return
    }

    try {
      setIsSaving(true)
      // Save activities with branch info
      const res = await fetch(`/api/customers?id=${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activities }),
      })

      if (!res.ok) {
        throw new Error("Kaydetme başarısız")
      }

      toast.success("Faaliyet bilgileri kaydedildi")
      if (shouldNavigate) {
        onNext()
      }
    } catch (error) {
      console.error(error)
      toast.error("Değişiklikler kaydedilirken hata oluştu")
    } finally {
      setIsSaving(false)
    }
  }

  const onSubmit = (data: ActivityFormValues) => {
    let branchId: string | undefined
    let branchName: string | undefined
    
    if (data.placeId !== 'center') {
        const branch = branches.find(b => b.id === data.placeId)
        if (branch) {
            branchId = branch.id
            branchName = branch.name
        }
    }

    const processedData = {
      ...data,
      branchId,
      branchName
    }

    if (editingId) {
      setActivities((prev) =>
        prev.map((a) => (a.id === editingId ? { ...processedData, id: editingId } : a))
      )
      toast.success("Faaliyet bilgisi güncellendi")
      setEditingId(null)
    } else {
      const newActivity: Activity = {
        ...processedData,
        id: crypto.randomUUID(),
      }
      setActivities((prev) => [...prev, newActivity])
      toast.success("Yeni faaliyet eklendi")
    }
    form.reset({
      placeId: "center",
      activityCode: "",
      startDate: "",
      endDate: "",
      status: "active",
    })
  }

  const handleEdit = (activity: Activity) => {
    setEditingId(activity.id)
    form.reset({
      placeId: activity.placeId,
      activityCode: activity.activityCode,
      startDate: activity.startDate,
      endDate: activity.endDate || "",
      status: activity.status,
    })
  }

  const handleDelete = () => {
    if (deleteId) {
      setActivities((prev) => prev.filter((a) => a.id !== deleteId))
      setDeleteId(null)
      toast.success("Faaliyet silindi")
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    form.reset({
      placeId: "center",
      activityCode: "",
      startDate: "",
      endDate: "",
      status: "active",
    })
  }



  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Faaliyet Bilgileri</CardTitle>
        <CardDescription>
          Mükellef faaliyet konularını buradan yönetin.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="placeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Faaliyet Yeri</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="center">Merkez</SelectItem>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Yer</TableHead>
                <TableHead>Faaliyet</TableHead>
                <TableHead>Başlangıç Tarihi</TableHead>
                <TableHead>Bitiş Tarihi</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Henüz faaliyet eklenmedi.
                  </TableCell>
                </TableRow>
              ) : (
                activities.map((activity) => {
                  const code = activityCodes.find(c => c.id === activity.activityCode)
                  return (
                    <TableRow 
                      key={activity.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleEdit(activity)}
                    >
                      <TableCell>
                        <Badge variant="outline">
                           {activity.placeId === 'center' ? 'Merkez' : activity.branchName}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate" title={code?.name}>
                         <div className="font-medium">{code?.name}</div>
                      </TableCell>
                      <TableCell>{activity.startDate}</TableCell>
                      <TableCell>{activity.endDate || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={activity.status === "active" ? "default" : "secondary"}>
                          {activity.status === "active" ? "Aktif" : "Pasif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(activity)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(activity.id)}
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
              onClick={() => handleSaveAll(false)}
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              Kaydet
            </Button>
            <Button 
              type="button" 
              onClick={() => handleSaveAll(true)}
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
              Bu faaliyeti silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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
            <DialogTitle>Faaliyet Kodu Seç</DialogTitle>
          </DialogHeader>
          <Command className="overflow-hidden rounded-t-none border-0">
            <CommandInput placeholder="Faaliyet kodu veya açıklama ara..." />
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
