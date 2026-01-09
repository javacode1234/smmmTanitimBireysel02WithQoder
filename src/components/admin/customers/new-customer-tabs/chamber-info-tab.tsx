"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Save, ArrowRight, ArrowLeft } from "lucide-react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const chamberSchema = z.object({
  type: z.enum(["COMMERCE", "TRADESMAN"], {
    required_error: "Lütfen oda türünü seçiniz",
  }),
  chamberName: z.string().min(1, "Oda adı gereklidir"),
  registryNo: z.string().optional(),
  chamberRegistryNo: z.string().optional(),
  registerDate: z.string().optional(),
})

type ChamberFormValues = z.infer<typeof chamberSchema>

interface ChamberInfoTabProps {
  customerId: string | null
  onNext: () => void
  onBack: () => void
}

export function ChamberInfoTab({ customerId, onNext, onBack }: ChamberInfoTabProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ChamberFormValues>({
    resolver: zodResolver(chamberSchema),
    defaultValues: {
      type: "COMMERCE",
      chamberName: "",
      registryNo: "",
      chamberRegistryNo: "",
      registerDate: "",
    },
  })

  const type = form.watch("type")

  useEffect(() => {
    const fetchChamberInfo = async () => {
      if (!customerId) return
      
      try {
        setIsLoading(true)
        const res = await fetch(`/api/customers?id=${customerId}`)
        if (!res.ok) throw new Error("Müşteri bilgileri alınamadı")
        
        const data = await res.json()
        
        if (data.chambers) {
          try {
            const parsedChambers = typeof data.chambers === 'string' 
              ? JSON.parse(data.chambers) 
              : data.chambers
            
            // Assuming we store a single chamber or taking the first one if array
            const chamber = Array.isArray(parsedChambers) ? parsedChambers[0] : parsedChambers

            if (chamber) {
              form.reset({
                type: chamber.type || "COMMERCE",
                chamberName: chamber.chamberName || "",
                registryNo: chamber.registryNo || "",
                chamberRegistryNo: chamber.chamberRegistryNo || "",
                registerDate: chamber.registerDate || "",
              })
            }
          } catch (e) {
            console.error("Chambers parse error:", e)
          }
        }
      } catch (error) {
        console.error(error)
        toast.error("Oda bilgileri yüklenirken hata oluştu")
      } finally {
        setIsLoading(false)
      }
    }

    fetchChamberInfo()
  }, [customerId, form])

  const onSubmit = async (values: ChamberFormValues, goNext: boolean = true) => {
    if (!customerId) {
      toast.error("Müşteri kimliği bulunamadı")
      return
    }

    try {
      setIsSaving(true)
      
      // Store as array to be compatible if we want multiple later, but for now single
      const chamberData = [{
        type: values.type,
        chamberName: values.chamberName,
        registryNo: values.registryNo,
        chamberRegistryNo: values.chamberRegistryNo,
        registerDate: values.registerDate,
        // Helper fields for easier reading/display if needed elsewhere
        chamber: values.chamberName,
        membershipDate: values.registerDate
      }]

      const res = await fetch(`/api/customers?id=${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chambers: chamberData }),
      })

      if (!res.ok) throw new Error("Kaydedilemedi")

      toast.success("Oda bilgileri kaydedildi")
      if (goNext) {
        onNext()
      }
    } catch (error) {
      toast.error("Kaydetme işlemi başarısız oldu")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div>Yükleniyor...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Oda Bilgileri</CardTitle>
        <CardDescription>
          Müşterinin bağlı olduğu oda bilgilerini yönetin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Oda Türü</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="COMMERCE" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Ticaret Odası
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="TRADESMAN" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Esnaf Odası
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="chamberName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Oda Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn: İstanbul Ticaret Odası" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {type === "COMMERCE" && (
                <FormField
                  control={form.control}
                  name="registryNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ticaret Sicil No</FormLabel>
                      <FormControl>
                        <Input placeholder="Sicil No" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {type === "TRADESMAN" && (
                <FormField
                  control={form.control}
                  name="registryNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Esnaf Sicil No</FormLabel>
                      <FormControl>
                        <Input placeholder="Esnaf Sicil No" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="chamberRegistryNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Oda Sicil No</FormLabel>
                    <FormControl>
                      <Input placeholder="Oda Sicil No" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registerDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kayıt Tarihi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                  onClick={form.handleSubmit((values) => onSubmit(values, false))}
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Kaydet
                </Button>
                <Button 
                  type="button" 
                  onClick={form.handleSubmit((values) => onSubmit(values, true))}
                  disabled={isSaving}
                >
                  İleri
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
