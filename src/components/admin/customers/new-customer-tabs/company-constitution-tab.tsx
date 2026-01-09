"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, ArrowRight, Save, Wand2, Check } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  constitutionText: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface CompanyConstitutionTabProps {
  customerId: string | null
  onSuccess?: () => void
  onBack?: () => void
}

export function CompanyConstitutionTab({ customerId, onSuccess, onBack }: CompanyConstitutionTabProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      constitutionText: "",
    },
  })

  useEffect(() => {
    if (customerId) {
      fetch(`/api/customers?id=${customerId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.constitution) {
            form.setValue("constitutionText", data.constitution)
          }
        })
        .catch((err) => console.error("Error fetching constitution:", err))
    }
  }, [customerId, form])

  const handleGenerate = async () => {
    if (!customerId) return
    
    try {
      setIsGenerating(true)
      const res = await fetch(`/api/customers?id=${customerId}`)
      if (!res.ok) throw new Error("Veri çekilemedi")
      
      const data = await res.json()
      
      // Generate template
      const companyName = data.companyName || "..."
      const city = data.city || "..."
      const district = data.district || "..."
      const address = data.address || "..."
      const capital = data.customercapitalinfo?.amount || "..."
      
      let text = `MADDE 1 - KURULUŞ
Aşağıda adları, soyadları, ikametgahları ve uyrukları yazılı kurucular arasında Türk Ticaret Kanunu hükümlerine göre bir Limited Şirket kurulmuştur.

MADDE 2 - ŞİRKETİN UNVANI
Şirketin unvanı: ${companyName}

MADDE 3 - AMAÇ VE KONU
Şirketin amaç ve konusu başlıca şunlardır:
1. ...
2. ...

MADDE 4 - MERKEZ
Şirketin merkezi ${city} ilindedir. Adresi: ${address} ${district}/${city} şeklindedir.

MADDE 5 - SÜRE
Şirketin süresi tescil ve ilan edildiği tarihten başlamak üzere ${data.duration === 'LIMITED' ? 'belirli bir süre' : 'süresiz'}dir.

MADDE 6 - SERMAYE
Şirketin sermayesi ${capital} TL değerindedir.

MADDE 7 - MÜDÜRLER
Şirketin işleri ve muameleleri ortaklar kurulu tarafından seçilecek bir veya birkaç müdür tarafından yürütülür.
`
      
      form.setValue("constitutionText", text)
      toast.success("Taslak metin oluşturuldu")
    } catch (error) {
      console.error(error)
      toast.error("Taslak oluşturulurken bir hata oluştu")
    } finally {
      setIsGenerating(false)
    }
  }

  const onSubmit = async (values: FormValues, shouldNavigate: boolean = false) => {
    if (!customerId) {
      toast.error("Müşteri kimliği bulunamadı")
      return
    }

    try {
      setIsSaving(true)
      
      const res = await fetch(`/api/customers?id=${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ constitution: values.constitutionText }),
      })

      if (!res.ok) {
        throw new Error("Kaydedilemedi")
      }
      
      toast.success("Şirket ana sözleşmesi kaydedildi")
      if (shouldNavigate && onSuccess) {
        onSuccess()
      }
    } catch (error) {
      toast.error("Kaydetme işlemi başarısız oldu")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Şirket Ana Sözleşmesi</CardTitle>
        <CardDescription>
          Şirket ana sözleşmesi detaylarını buradan yönetebilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="constitutionText"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center mb-2">
                    <FormLabel>Sözleşme Metni / Notlar</FormLabel>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                    >
                      <Wand2 className="mr-2 h-3 w-3" />
                      Taslak Oluştur
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea 
                      placeholder="Şirket ana sözleşmesi ile ilgili notlar veya metin..." 
                      className="min-h-[400px] font-mono text-sm"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between items-center pt-6 border-t">
              <Button type="button" variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Geri
              </Button>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  variant="secondary" 
                  disabled={isSaving}
                  onClick={form.handleSubmit((data) => onSubmit(data))} // Default behavior, but let's make it clear if we separate logic
                >
                  <Save className="mr-2 h-4 w-4" />
                  Kaydet
                </Button>
                <Button 
                  type="button" 
                  disabled={isSaving}
                  onClick={() => {
                    form.handleSubmit((data) => onSubmit(data, true))()
                  }}
                >
                  Tamamla
                  <Check className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
