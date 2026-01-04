"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Trash2, Edit2, Check, Save, ArrowRight, ArrowLeft, Settings2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Schema for the form
const declarationSchema = z.object({
  configId: z.string().min(1, "Beyanname türü seçiniz"),
  selectedPeriods: z.array(z.number()).min(1, "En az bir dönem seçmelisiniz"),
  enabled: z.boolean().default(true),
  optional: z.boolean().default(false),
  dueDay: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(1).max(31).optional()
  ),
  quarterOffset: z.coerce.number().min(0).max(12).optional(),
})

type DeclarationFormValues = z.infer<typeof declarationSchema>

// Definition from API
interface DeclarationConfig {
  id: string
  type: string
  frequency: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  quarters?: string // JSON string of default periods
  dueDay?: number
  quarterOffset?: number
  enabled?: boolean
  optional?: boolean
}

// Item to be stored/displayed
interface DeclarationItem {
  id: string // temporary id for list
  configId: string
  type: string
  frequency: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  selectedPeriods: number[]
  dueDay?: number
  quarterOffset?: number
  enabled?: boolean
  optional?: boolean
}

const MONTHS = [
  { id: 1, name: "Ocak" },
  { id: 2, name: "Şubat" },
  { id: 3, name: "Mart" },
  { id: 4, name: "Nisan" },
  { id: 5, name: "Mayıs" },
  { id: 6, name: "Haziran" },
  { id: 7, name: "Temmuz" },
  { id: 8, name: "Ağustos" },
  { id: 9, name: "Eylül" },
  { id: 10, name: "Ekim" },
  { id: 11, name: "Kasım" },
  { id: 12, name: "Aralık" },
]

const followingMonthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `Dönemi izleyen ${i + 1}. ay`
}))

interface DeclarationsTabProps {
  customerId: string | null
  onNext: () => void
  onBack: () => void
}

export function DeclarationsTab({ customerId, onNext, onBack }: DeclarationsTabProps) {
  const router = useRouter()
  const [configs, setConfigs] = useState<DeclarationConfig[]>([])
  const [items, setItems] = useState<DeclarationItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<DeclarationFormValues>({
    resolver: zodResolver(declarationSchema),
    defaultValues: {
      configId: "",
      selectedPeriods: [],
      enabled: true,
      optional: false,
    },
  })

  // Fetch configs and then customer data
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true)
        
        // 1. Fetch Configs
        let loadedConfigs: DeclarationConfig[] = []
        try {
          const resConfig = await fetch("/api/declarations-config")
          if (resConfig.ok) {
            loadedConfigs = await resConfig.json()
            setConfigs(loadedConfigs)
          }
        } catch (error) {
          console.error("Failed to fetch configs", error)
          toast.error("Beyanname tanımları yüklenemedi")
        }

        // 2. Fetch Customer Data if ID exists
        if (customerId) {
          const resCustomer = await fetch(`/api/customers?id=${customerId}`)
          if (!resCustomer.ok) throw new Error("Müşteri bilgileri alınamadı")
          
          const data = await resCustomer.json()
          
          if (data.declarationSettings && Array.isArray(data.declarationSettings)) {
            // Map API data to component state
            const mappedItems: DeclarationItem[] = data.declarationSettings.map((setting: any) => {
              // Find matching config by type
              const matchedConfig = loadedConfigs.find(c => c.type === setting.type)
              
              return {
                id: setting.id,
                configId: matchedConfig?.id || "", // Use matched config ID or empty
                type: setting.type || "", 
                frequency: setting.frequency as 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
                selectedPeriods: typeof setting.quarters === 'string' ? JSON.parse(setting.quarters) : (setting.quarters || []),
                dueDay: setting.dueDay,
                quarterOffset: setting.quarterOffset,
                enabled: setting.enabled !== undefined ? setting.enabled : true,
                optional: setting.optional !== undefined ? setting.optional : false,
              }
            })
            setItems(mappedItems)
          }
        }
      } catch (error) {
        console.error("Error initializing declarations tab:", error)
        toast.error("Veriler yüklenirken hata oluştu")
      } finally {
        setLoading(false)
      }
    }

    initData()
  }, [customerId])

  // Watch configId to auto-fill defaults
  const selectedConfigId = form.watch("configId")
  useEffect(() => {
    if (selectedConfigId && !editingId) {
      const config = configs.find(c => c.id === selectedConfigId)
      if (config) {
        let defaults: number[] = []
        try {
          // If quarters is defined in DB, use it. Otherwise default to all.
          if (config.quarters) {
            defaults = JSON.parse(config.quarters)
          } else {
            if (config.frequency === 'MONTHLY') defaults = Array.from({ length: 12 }, (_, i) => i + 1)
            else if (config.frequency === 'QUARTERLY') defaults = [1, 2, 3, 4]
            else if (config.frequency === 'YEARLY') defaults = [1]
          }
        } catch {
          // fallback
          if (config.frequency === 'MONTHLY') defaults = Array.from({ length: 12 }, (_, i) => i + 1)
          else if (config.frequency === 'QUARTERLY') defaults = [1, 2, 3, 4]
          else defaults = [1]
        }
        form.setValue("selectedPeriods", defaults)
        form.setValue("enabled", config.enabled ?? true)
        form.setValue("optional", config.optional ?? false)
        form.setValue("dueDay", config.dueDay)
        form.setValue("quarterOffset", config.quarterOffset)
      }
    }
  }, [selectedConfigId, configs, form, editingId])

  const onSubmit = (data: DeclarationFormValues) => {
    const config = configs.find(c => c.id === data.configId)
    if (!config) {
      toast.error("Hata: Beyanname tanımı bulunamadı")
      return
    }

    if (editingId) {
      setItems(prev => prev.map(item => 
        item.id === editingId 
          ? { 
              ...item, 
              configId: data.configId, 
              type: config.type, 
              frequency: config.frequency, 
              selectedPeriods: data.selectedPeriods.sort((a, b) => a - b),
              dueDay: data.dueDay,
              quarterOffset: data.quarterOffset,
              enabled: data.enabled,
              optional: data.optional,
            } 
          : item
      ))
      toast.success("Beyanname güncellendi")
    } else {
      // Check if already exists (by type to prevent unique constraint violation)
      if (items.some(i => i.type === config.type)) {
        toast.error(`Bu beyanname türü (${config.type}) zaten eklenmiş`)
        return
      }

      const newItem: DeclarationItem = {
        id: Math.random().toString(36).substr(2, 9),
        configId: data.configId,
        type: config.type,
        frequency: config.frequency,
        selectedPeriods: data.selectedPeriods.sort((a, b) => a - b),
        dueDay: data.dueDay,
        quarterOffset: data.quarterOffset,
        enabled: data.enabled,
        optional: data.optional,
      }
      setItems(prev => [...prev, newItem])
      toast.success("Beyanname eklendi")
    }
    setIsModalOpen(false)
    setEditingId(null)
    form.reset()
  }

  const handleEdit = (item: DeclarationItem) => {
    setEditingId(item.id)
    form.reset({
      configId: item.configId,
      selectedPeriods: item.selectedPeriods,
      dueDay: item.dueDay,
      quarterOffset: item.quarterOffset,
      enabled: item.enabled ?? true,
      optional: item.optional ?? false,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
    toast.success("Beyanname silindi")
  }

  const handleSave = async (shouldNavigate: boolean = false) => {
    console.log("Saving declarations (handleSave)...", items)
    if (!customerId) {
      toast.error("Müşteri ID bulunamadı")
      return
    }

    try {
      setIsSaving(true)
      const res = await fetch(`/api/customers?id=${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ declarationSettings: items }),
      })

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json()
        } catch (e) {
          const text = await res.text()
          console.error("Non-JSON error response (handleSave):", text)
          errorData = { error: `Sunucu hatası (${res.status}): ${text.slice(0, 100)}` }
        }
        console.error("Save error details:", errorData)
        throw new Error(errorData.error || errorData.details || "Kaydedilemedi")
      }

      toast.success("Beyanname bilgileri kaydedildi")
      if (shouldNavigate) onNext()
    } catch (error) {
      console.error(error)
      toast.error("Kaydetme sırasında hata oluştu")
    } finally {
      setIsSaving(false)
    }
  }

  const getFrequencyLabel = (freq: string) => {
    if (freq === 'MONTHLY') return 'Aylık'
    if (freq === 'QUARTERLY') return 'Üç Aylık'
    if (freq === 'YEARLY') return 'Yıllık'
    return freq
  }

  const formatPeriods = (freq: string, periods: number[]) => {
    if (freq === 'YEARLY') return 'Yıllık'
    if (freq === 'QUARTERLY') {
      if (periods.length === 4) return 'Tüm Dönemler'
      return periods.map(p => `${p}. Dönem`).join(', ')
    }
    if (freq === 'MONTHLY') {
      if (periods.length === 12) return 'Tüm Aylar'
      return periods.map(p => MONTHS.find(m => m.id === p)?.name).join(', ')
    }
    return periods.join(', ')
  }

  // Get current selected config to render appropriate checkboxes
  const currentConfig = configs.find(c => c.id === selectedConfigId)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Beyanname Bilgileri</CardTitle>
          <CardDescription>
            Müşteri için beyanname ve dönemleri seçiniz.
          </CardDescription>
        </div>
        <Button onClick={() => {
          setEditingId(null)
          form.reset({ 
            configId: "", 
            selectedPeriods: [],
            enabled: true,
            optional: false,
          })
          setIsModalOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Beyanname Ekle
        </Button>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Beyanname Türü</TableHead>
                  <TableHead>Dönem Türü</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Seçili Dönemler</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.type}
                      {item.optional && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">İsteğe Bağlı</span>}
                    </TableCell>
                    <TableCell>{getFrequencyLabel(item.frequency)}</TableCell>
                    <TableCell>
                      {item.enabled === false ? (
                        <span className="text-red-500 text-xs border border-red-200 bg-red-50 px-2 py-1 rounded">Pasif</span>
                      ) : (
                        <span className="text-green-600 text-xs border border-green-200 bg-green-50 px-2 py-1 rounded">Aktif</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate" title={formatPeriods(item.frequency, item.selectedPeriods)}>
                      {formatPeriods(item.frequency, item.selectedPeriods)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
            Henüz beyanname eklenmedi.
          </div>
        )}

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

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
            <DialogHeader className="px-6 pt-6 flex-shrink-0">
              <DialogTitle>{editingId ? "Beyanname Düzenle" : "Beyanname Ekle"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-5">
                      <FormField
                        control={form.control}
                        name="configId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Beyanname Türü</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
                              disabled={!!editingId} // Disable type change in edit mode
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seçiniz" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {configs.map(config => (
                                  <SelectItem key={config.id} value={config.id}>
                                    {config.type} ({getFrequencyLabel(config.frequency)})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label>Dönem Türü</Label>
                        <Input 
                          value={currentConfig ? getFrequencyLabel(currentConfig.frequency) : "-"} 
                          disabled 
                          className="bg-muted"
                        />
                      </div>

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
                      <AccordionItem value="item-1" className="border-0">
                        <AccordionTrigger className="hover:no-underline py-2">
                          <span className="text-sm font-medium">Gelişmiş Ayarlar</span>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-2 px-1">
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="quarterOffset"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Takip Eden Ay</FormLabel>
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
                                      <SelectItem value="0">Aynı Ay</SelectItem>
                                      {followingMonthOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>Dönem bitimini takip eden ayı seçiniz.</FormDescription>
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

                            {currentConfig && (currentConfig.frequency === "QUARTERLY" || currentConfig.frequency === "MONTHLY") && (
                              <div className="border rounded-lg p-4 bg-muted/10 mt-4">
                                <h3 className="font-medium mb-3">Dönem Seçimi</h3>
                                
                                <div className="mt-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <Label>Vergi Dönemleri</Label>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 text-xs"
                                      onClick={() => {
                                        const currentValues = form.getValues("selectedPeriods")
                                        if (currentConfig.frequency === 'MONTHLY') {
                                          if (currentValues.length === 12) {
                                            form.setValue("selectedPeriods", [])
                                          } else {
                                            form.setValue("selectedPeriods", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
                                          }
                                        } else if (currentConfig.frequency === 'QUARTERLY') {
                                          if (currentValues.length === 4) {
                                            form.setValue("selectedPeriods", [])
                                          } else {
                                            form.setValue("selectedPeriods", [1, 2, 3, 4])
                                          }
                                        }
                                      }}
                                    >
                                      {(() => {
                                        const currentValues = form.watch("selectedPeriods")
                                        if (currentConfig.frequency === 'MONTHLY') {
                                          return currentValues.length === 12 ? "Tümünü Kaldır" : "Tümünü Seç"
                                        } else if (currentConfig.frequency === 'QUARTERLY') {
                                          return currentValues.length === 4 ? "Tümünü Kaldır" : "Tümünü Seç"
                                        }
                                        return ""
                                      })()}
                                    </Button>
                                  </div>
                                  
                                  <div className={`grid ${currentConfig.frequency === "MONTHLY" ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-6" : "grid-cols-4"} gap-2 mt-2`}>
                                    {currentConfig.frequency === "QUARTERLY" 
                                      ? [1, 2, 3, 4].map(q => (
                                          <FormField
                                            key={q}
                                            control={form.control}
                                            name="selectedPeriods"
                                            render={({ field }) => (
                                              <FormItem className="flex items-center gap-2 space-y-0">
                                                <FormControl>
                                                  <Checkbox
                                                    checked={field.value?.includes(q)}
                                                    onCheckedChange={(checked) => {
                                                      if (checked) {
                                                        field.onChange([...field.value, q].sort((a, b) => a - b))
                                                      } else {
                                                        field.onChange(field.value?.filter((value) => value !== q))
                                                      }
                                                    }}
                                                  />
                                                </FormControl>
                                                <FormLabel className="text-sm cursor-pointer font-normal">
                                                  {q}. Dönem
                                                </FormLabel>
                                              </FormItem>
                                            )}
                                          />
                                        ))
                                      : MONTHS.map(m => (
                                          <FormField
                                            key={m.id}
                                            control={form.control}
                                            name="selectedPeriods"
                                            render={({ field }) => (
                                              <FormItem className="flex items-center gap-2 space-y-0">
                                                <FormControl>
                                                  <Checkbox
                                                    checked={field.value?.includes(m.id)}
                                                    onCheckedChange={(checked) => {
                                                      if (checked) {
                                                        field.onChange([...field.value, m.id].sort((a, b) => a - b))
                                                      } else {
                                                        field.onChange(field.value?.filter((value) => value !== m.id))
                                                      }
                                                    }}
                                                  />
                                                </FormControl>
                                                <FormLabel className="text-sm cursor-pointer font-normal">
                                                  {m.name}
                                                </FormLabel>
                                              </FormItem>
                                            )}
                                          />
                                        ))
                                    }
                                  </div>
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
                      form.reset()
                    }}
                  >
                    İptal
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-green-600 hover:bg-green-700" 
                  >
                    {editingId ? "Güncelle" : "Ekle"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

function Label({ children, className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props}>{children}</label>
}
