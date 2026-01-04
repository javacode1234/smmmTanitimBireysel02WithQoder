"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowRight, Upload, X, Save, Search, Check } from "lucide-react"

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
  Dialog,
  DialogContent,
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
import { TaxOfficeCombobox } from "@/components/ui/tax-office-combobox"
import { LocationCombobox } from "@/components/ui/location-combobox"
import { PhoneInput } from "@/components/ui/phone-input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  logo: z.string().optional(),
  companyName: z.string().min(2, "Ünvan en az 2 karakter olmalıdır"),
  companyType: z.string().min(1, "Şirket türü seçiniz"),
  companyClass: z.string().min(1, "Sınıf seçiniz"),
  vkn: z.string().length(10, "Vergi No 10 haneli olmalıdır").regex(/^\d+$/, "Sadece rakam giriniz"),
  tckn: z.string().length(11, "TCKN 11 haneli olmalıdır").regex(/^\d+$/, "Sadece rakam giriniz").optional().or(z.literal("")),
  city: z.string().min(1, "İl seçiniz"),
  district: z.string().min(1, "İlçe seçiniz"),
  taxOfficeId: z.string().min(1, "Vergi dairesi seçiniz"),
  mainActivityCode: z.string().min(1, "Ana faaliyet kodu seçiniz"),
  address: z.string().min(1, "Adres giriniz"),
  addressCode: z.string().length(10, "Adres kodu 10 haneli olmalıdır").regex(/^\d+$/, "Sadece rakam giriniz"),
  establishmentDate: z.string().min(1, "Kuruluş tarihi seçiniz"),
  serviceStartDate: z.string().optional(),
  employeeCount: z.coerce.number().min(0, "Geçerli bir sayı giriniz"),
  phone: z.string().min(10, "Geçerli bir telefon numarası giriniz"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  website: z.string().optional(),
  social: z.object({
      x: z.string().optional(),
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      linkedin: z.string().optional(),
      telegram: z.string().optional(),
      nsosyal: z.string().optional(),
    }).optional(),
  })

type FormValues = z.infer<typeof formSchema>

interface ActivityCode {
  id: string
  name: string
}

interface GeneralInfoTabProps {
  onSuccess?: (id: string, companyName?: string, shouldNavigate?: boolean) => void
  customerId?: string | null
}

export function GeneralInfoTab({ onSuccess, customerId }: GeneralInfoTabProps) {
  const router = useRouter()
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [activityCodes, setActivityCodes] = useState<ActivityCode[]>([])
  const [isLoadingCodes, setIsLoadingCodes] = useState(false)

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
        toast.error("Faaliyet kodları yüklenemedi")
      } finally {
        setIsLoadingCodes(false)
      }
    }

    fetchCodes()
  }, [])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      logo: "",
      companyType: "",
      companyClass: "",
      vkn: "",
      tckn: "",
      city: "",
      district: "",
      taxOfficeId: "",
      mainActivityCode: "",
      address: "",
      addressCode: "",
      establishmentDate: "",
      serviceStartDate: "",
      employeeCount: 0,
      phone: "",
      email: "",
      website: "",
      social: {
        x: "",
        instagram: "",
        facebook: "",
        linkedin: "",
        telegram: "",
        nsosyal: "",
      },
    },
  })

  useEffect(() => {
    if (customerId) {
      const fetchCustomer = async () => {
        try {
          const res = await fetch(`/api/customers?id=${customerId}`)
          if (!res.ok) {
            if (res.status === 404) {
              toast.error("Müşteri bulunamadı, listeye yönlendiriliyor...")
              router.push('/admin/customers')
              return
            }
            throw new Error("Müşteri bilgileri alınamadı")
          }
          
          const data = await res.json()
          
          // Address parsing logic
          // Format: "Address / District (UAVT: Code)"
          // Regex to capture: (Address) / (District) (UAVT: (Code))
          let address = data.address || ""
          let district = data.district || data.city || "" // Use separate field, fallback to city
          let addressCode = data.addressCode || ""
          
          // Legacy support: try parsing if fields are empty
          if (!addressCode && address.includes("UAVT:")) {
            const addressMatch = data.address?.match(/^(.*?) \/ (.*?) \(UAVT: (\d+)\)$/)
            if (addressMatch) {
              address = addressMatch[1]
              district = addressMatch[2]
              addressCode = addressMatch[3]
            }
          }

          // Date formatting
          const establishmentDate = data.establishmentDate ? new Date(data.establishmentDate).toISOString().split('T')[0] : ""
          const serviceStartDate = data.serviceStartDate ? new Date(data.serviceStartDate).toISOString().split('T')[0] : ""

          // Company Type mapping
          let companyType = data.companyType || ""
          let companyClass = data.companyClass || ""
          
          if (!companyType) {
            if (data.ledgerType === 'İşletme Defteri') {
              companyType = "ISLETME"
              companyClass = "SINIF_2"
            } else if (data.ledgerType === 'Bilanço Usulü') {
              companyType = "SERMAYE"
              companyClass = "SINIF_1"
            }
          }

          form.reset({
            logo: data.logo || "",
            companyName: data.companyName || "",
            companyType,
            companyClass,
            vkn: data.taxNumber || "",
            tckn: data.tckn || "",
            city: data.city || "",
            district: district, // This might need validation against district list if combobox enforces it
            taxOfficeId: data.taxOfficeId || data.taxOffice || "", // Prefer ID, fallback to name
            mainActivityCode: data.mainActivityCode || "",
            address,
            addressCode,
            establishmentDate,
            serviceStartDate,
            employeeCount: data.employeeCount || 0,
            phone: data.phone || "",
            email: data.email || "",
            website: data.website || "",
            social: {
              x: data.xUrl || "",
              instagram: data.instagramUrl || "",
              facebook: data.facebookUrl || "",
              linkedin: data.linkedinUrl || "",
              telegram: data.telegramUrl || "",
              nsosyal: data.threadsUrl || "",
            },
          })
          
          if (data.logo) {
            setLogoPreview(data.logo)
          }

        } catch (error) {
          console.error("Error fetching customer:", error)
          toast.error("Müşteri bilgileri yüklenemedi")
        }
      }

      fetchCustomer()
    }
  }, [customerId, form])

  const selectedCity = form.watch("city")
  const selectedDistrict = form.watch("district")
  const selectedCompanyType = form.watch("companyType")

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setLogoPreview(base64)
        form.setValue("logo", base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoPreview(null)
    form.setValue("logo", "")
  }

  const onSubmit = async (data: FormValues, shouldNavigate: boolean = false) => {
    try {
      setIsSaving(true)
      
      const fullAddress = data.address + (data.district ? ` / ${data.district}` : "") + (data.addressCode ? ` (UAVT: ${data.addressCode})` : "")

      const payload: Record<string, any> = {
        companyName: data.companyName,
        tckn: data.tckn,
        taxNumber: data.vkn,
        taxOffice: data.taxOfficeId,
        city: data.city,
        district: data.district,
        addressCode: data.addressCode,
        address: fullAddress, // Keep saving full address for legacy compatibility
        mainActivityCode: data.mainActivityCode,
        establishmentDate: data.establishmentDate,
        phone: data.phone,
        email: data.email,
        website: data.website,
        employeeCount: data.employeeCount,
        logo: data.logo,
        // Socials
        facebookUrl: data.social?.facebook,
        xUrl: data.social?.x,
        linkedinUrl: data.social?.linkedin,
        instagramUrl: data.social?.instagram,
        telegramUrl: data.social?.telegram,
        // Using threadsUrl for nsosyal as a placeholder since schema might not have it
        threadsUrl: data.social?.nsosyal, 
        
        companyType: data.companyType,
        companyClass: data.companyClass,
        ledgerType: data.companyType === 'ISLETME' ? 'İşletme Defteri' : 'Bilanço Usulü',
        status: 'ACTIVE',
        onboardingStage: 'CUSTOMER'
      }

      // Yeni müşteri oluşturulurken Merkez Şube'yi otomatik ekle
      if (!customerId) {
        const centralBranch = {
          id: crypto.randomUUID(),
          name: "Central Branch",
          addressNo: data.addressCode,
          address: fullAddress,
          startDate: data.establishmentDate,
          endDate: "",
          activityCode: data.mainActivityCode,
          status: "active"
        }
        payload.branches = [centralBranch]

        // Yeni müşteri oluşturulurken Ana Faaliyet Kodu'nu otomatik ekle
        if (data.mainActivityCode) {
          const initialActivity = {
            id: crypto.randomUUID(),
            activityCode: data.mainActivityCode,
            startDate: data.establishmentDate,
            status: "active"
          }
          payload.activities = [initialActivity]
        }
      }

      const url = customerId ? `/api/customers?id=${customerId}` : "/api/customers"
      const method = customerId ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Kaydedilemedi")
      }

      const result = await res.json()
      
      if (result.id) {
        toast.success(customerId ? "Müşteri güncellendi" : "Müşteri başarıyla oluşturuldu")
        if (onSuccess) onSuccess(result.id, data.companyName, shouldNavigate)
      } else {
        throw new Error("Müşteri ID bulunamadı")
      }
      
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Kaydederken bir hata oluştu")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Genel Bilgiler</CardTitle>
        <CardDescription>
          Müşterinin temel bilgilerini girin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => onSubmit(data, false))} className="space-y-6">
            
            {/* Logo and Title */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo Upload */}
              <div className="flex flex-col gap-4">
                <FormLabel>Logo</FormLabel>
                <div className="flex items-center gap-4">
                  <Avatar className="h-24 w-24 border">
                    <AvatarImage src={logoPreview || undefined} />
                    <AvatarFallback>Logo</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="relative"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Logo Yükle
                        <input
                          type="file"
                          className="absolute inset-0 cursor-pointer opacity-0"
                          accept="image/*"
                          onChange={handleLogoUpload}
                        />
                      </Button>
                      {logoPreview && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-9 w-9"
                          onClick={removeLogo}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG veya GIF. Maks 2MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ünvan</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Şirket ünvanını girin..." 
                          className="resize-none h-24" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Type */}
              <FormField
                control={form.control}
                name="companyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tür</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value)
                        // Auto class selection
                        if (value === "ISLETME") {
                          form.setValue("companyClass", "SINIF_2")
                        } else if (value === "SERMAYE") {
                          form.setValue("companyClass", "SINIF_1")
                          form.setValue("tckn", "")
                        }
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ISLETME">Şahıs İşletmesi</SelectItem>
                        <SelectItem value="SERMAYE">Sermaye Şirketi</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Class */}
              <FormField
                control={form.control}
                name="companyClass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sınıf</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SINIF_1">1. Sınıf</SelectItem>
                        <SelectItem value="SINIF_2">2. Sınıf</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tax ID */}
              <FormField
                control={form.control}
                name="vkn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vergi No</FormLabel>
                    <FormControl>
                      <Input placeholder="1234567890" maxLength={10} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* TCKN */}
              {selectedCompanyType !== "SERMAYE" && (
                <FormField
                  control={form.control}
                  name="tckn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TCKN</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678901" maxLength={11} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* City */}
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İl</FormLabel>
                    <FormControl>
                      <LocationCombobox
                        type="city"
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          form.setValue("district", "")
                          form.setValue("taxOfficeId", "")
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* District */}
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İlçe</FormLabel>
                    <FormControl>
                      <LocationCombobox
                        type="district"
                        parentValue={selectedCity}
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                        }}
                        disabled={!selectedCity}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tax Office */}
              <FormField
                control={form.control}
                name="taxOfficeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vergi Dairesi</FormLabel>
                    <FormControl>
                      <TaxOfficeCombobox
                        value={field.value}
                        onValueChange={field.onChange}
                        city={selectedCity}
                        disabled={!selectedCity}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Establishment Date */}
              <FormField
                control={form.control}
                name="establishmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kuruluş Tarihi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Employee Count */}
              <FormField
                control={form.control}
                name="employeeCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Çalışan Sayısı</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} className="text-right" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Main Activity Code */}
            <FormField
              control={form.control}
              name="mainActivityCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ana Faaliyet Kodu</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Textarea 
                        placeholder="Faaliyet kodu seçiniz..." 
                        className="resize-none min-h-[80px]" 
                        readOnly 
                        value={activityCodes.find(c => c.id === field.value)?.name || field.value} 
                      />
                    </FormControl>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      className="h-[80px] w-[80px] shrink-0"
                      onClick={() => setIsActivityModalOpen(true)}
                    >
                      <Search className="h-6 w-6" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <PhoneInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ornek@sirket.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Website */}
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Web Sitesi</FormLabel>
                    <FormControl>
                      <Input placeholder="www.sirket.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Merkez Adresi</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Adres detayları..." className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addressCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adres Kodu</FormLabel>
                    <FormControl>
                      <Input placeholder="10 haneli UAVT kodu" maxLength={10} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Sosyal Medya Hesapları</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="social.x"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>X (Twitter) Bağlantısı</FormLabel>
                      <FormControl>
                        <Input placeholder="X profil bağlantısı" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="social.instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram Bağlantısı</FormLabel>
                      <FormControl>
                        <Input placeholder="Instagram profil bağlantısı" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="social.facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook Bağlantısı</FormLabel>
                      <FormControl>
                        <Input placeholder="Facebook profil bağlantısı" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="social.linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Bağlantısı</FormLabel>
                      <FormControl>
                        <Input placeholder="LinkedIn profil bağlantısı" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="social.telegram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telegram Bağlantısı</FormLabel>
                      <FormControl>
                        <Input placeholder="Telegram kullanıcı adı/bağlantısı" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="social.nsosyal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nsosyal Bağlantısı</FormLabel>
                      <FormControl>
                        <Input placeholder="Nsosyal profil bağlantısı" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 gap-2">
              <Button 
                type="button" 
                variant="secondary"
                disabled={isSaving}
                onClick={form.handleSubmit((data) => onSubmit(data, false))}
              >
                {isSaving ? (
                  <>Kaydediliyor...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Kaydet
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                disabled={isSaving}
                onClick={form.handleSubmit((data) => onSubmit(data, true))}
              >
                {isSaving ? (
                  <>Kaydediliyor...</>
                ) : (
                  <>
                    İleri
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
        <DialogContent className="max-w-[600px] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Faaliyet Kodu Seç</DialogTitle>
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
                      form.setValue("mainActivityCode", code.id)
                      setIsActivityModalOpen(false)
                    }}
                    className="cursor-pointer p-3"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        form.watch("mainActivityCode") === code.id
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
