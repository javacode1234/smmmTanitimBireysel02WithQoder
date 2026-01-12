"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff, Save, ArrowLeft, ArrowRight, Building2, User, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

// Schema for Digital Tax Office
const digitalTaxSchema = z.object({
  username: z.string().optional(),
  password: z.string().optional(),
  secret: z.string().optional(),
})

// Schema for SGK
const sgkSchema = z.object({
  registrationNumber: z.string().length(26, "İşyeri sicil no 26 hane olmalıdır").regex(/^\d+$/, "Sadece rakam giriniz").or(z.literal("")),
  username: z.string().optional(),
  workplaceCode: z.string().optional(),
  systemPassword: z.string().optional(),
  workplacePassword: z.string().optional(),
})

// Schema for Customer Login
const customerLoginSchema = z.object({
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır").or(z.literal("")),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır").or(z.literal("")),
})

interface CorporateCredentialsTabProps {
  customerId: string | null
  onNext: () => void
  onBack: () => void
}

export function CorporateCredentialsTab({ customerId, onNext, onBack }: CorporateCredentialsTabProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [hasLoginPassword, setHasLoginPassword] = useState(false)

  // Forms
  const loginForm = useForm<z.infer<typeof customerLoginSchema>>({
    resolver: zodResolver(customerLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const taxForm = useForm<z.infer<typeof digitalTaxSchema>>({
    resolver: zodResolver(digitalTaxSchema),
    defaultValues: {
      username: "",
      password: "",
      secret: "",
    },
  })

  const sgkForm = useForm<z.infer<typeof sgkSchema>>({
    resolver: zodResolver(sgkSchema),
    defaultValues: {
      registrationNumber: "",
      username: "",
      workplaceCode: "",
      systemPassword: "",
      workplacePassword: "",
    },
  })

  // Fetch existing data
  useEffect(() => {
    const fetchData = async () => {
      if (!customerId) return
      
      try {
        setIsLoading(true)
        const res = await fetch(`/api/customers?id=${customerId}`)
        if (!res.ok) throw new Error("Müşteri bilgileri alınamadı")
        
        const data = await res.json()
        
        if (data.loginPassword) {
            setHasLoginPassword(true)
        }
        
        if (data.username) {
          loginForm.setValue("username", data.username)
        }

        if (data.passwords) {
          try {
            const parsed = typeof data.passwords === 'string' 
              ? JSON.parse(data.passwords) 
              : data.passwords
            
            if (parsed.digitalTaxOffice) {
              taxForm.reset(parsed.digitalTaxOffice)
            }
            if (parsed.sgk) {
              // Handle both array (legacy) and object (new) formats
              if (Array.isArray(parsed.sgk) && parsed.sgk.length > 0) {
                sgkForm.reset(parsed.sgk[0])
              } else if (!Array.isArray(parsed.sgk)) {
                sgkForm.reset(parsed.sgk)
              }
            }

            if (parsed.customerLogin && parsed.customerLogin.password) {
              loginForm.setValue("password", parsed.customerLogin.password)
            }
          } catch (e) {
            console.error("Passwords parse error:", e)
          }
        }
      } catch (error) {
        console.error(error)
        toast.error("Veriler yüklenemedi")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [customerId, taxForm, sgkForm])

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const generateCredentials = () => {
    // Generate username: musteri + random 4 digits
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const newUsername = `musteri${randomSuffix}`
    
    // Generate password: 8 chars alphanumeric
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let newPassword = ""
    for (let i = 0; i < 8; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    loginForm.setValue("username", newUsername)
    loginForm.setValue("password", newPassword)
  }

  const handleSave = async (shouldNavigate: boolean = false) => {
    if (!customerId) {
      toast.error("Müşteri ID bulunamadı")
      return
    }

    try {
      setIsSaving(true)
      const taxValues = taxForm.getValues()
      const sgkValues = sgkForm.getValues()
      const loginValues = loginForm.getValues()
      
      const passwordsData = {
        digitalTaxOffice: taxValues,
        sgk: sgkValues, // Save as object, not array
        customerLogin: {
          username: loginValues.username,
          password: loginValues.password
        }
      }

      const payload: any = { 
        passwords: passwordsData,
        username: loginValues.username
      }
      if (loginValues.password) {
        payload.loginPassword = loginValues.password
      }

      const res = await fetch(`/api/customers?id=${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error("Kaydedilemedi")
      }

      toast.success("Bilgiler kaydedildi")
      
      if (loginValues.password) {
        const currentUsername = loginValues.username;
        const currentPassword = loginValues.password;
        
        loginForm.reset({ 
          username: currentUsername,
          password: currentPassword
        })
        
        // Ensure values are visible
        loginForm.setValue("username", currentUsername)
        loginForm.setValue("password", currentPassword)
        
        setHasLoginPassword(true)
      }

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

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-8">
          {/* Customer Login Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-lg font-medium leading-none">Müşteri Paneli Giriş Bilgileri</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Müşterinin panele girişi için kullanıcı adı ve şifre
                  </p>
                </div>
              </div>
            </div>

            <Form {...loginForm}>
              <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kullanıcı Adı</FormLabel>
                      <FormControl>
                        <Input placeholder="Kullanıcı adı belirle" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Giriş Şifresi 
                        {hasLoginPassword && <span className="text-green-600 ml-2 text-xs">(Tanımlı)</span>}
                      </FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            type={showPasswords['login_password'] ? "text" : "password"} 
                            placeholder={hasLoginPassword ? "Yeni şifre belirle (Boş bırakılabilir)" : "Şifre belirle"} 
                            {...field} 
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('login_password')}
                        >
                          {showPasswords['login_password'] ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-end pb-1 gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={generateCredentials}
                    className="flex-1"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Oluştur
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => handleSave()} 
                    disabled={isSaving}
                    className="flex-1"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Kaydet
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          <Separator />

          {/* Digital Tax Office Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-lg font-medium leading-none">Dijital Vergi Dairesi</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  İnternet Vergi Dairesi giriş bilgileri
                </p>
              </div>
            </div>

            <Form {...taxForm}>
              <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={taxForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kullanıcı Kodu</FormLabel>
                      <FormControl>
                        <Input placeholder="Kullanıcı Kodu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={taxForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parola</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            type={showPasswords['tax_password'] ? "text" : "password"} 
                            placeholder="Parola" 
                            {...field} 
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('tax_password')}
                        >
                          {showPasswords['tax_password'] ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={taxForm.control}
                  name="secret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Şifre</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            type={showPasswords['tax_secret'] ? "text" : "password"} 
                            placeholder="Şifre" 
                            {...field} 
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('tax_secret')}
                        >
                          {showPasswords['tax_secret'] ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>

          <Separator />

          {/* SGK Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-lg font-medium leading-none">SGK Şifresi</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  SGK işyeri giriş bilgileri
                </p>
              </div>
            </div>

            <Form {...sgkForm}>
              <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={sgkForm.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2 lg:col-span-1">
                      <FormLabel>İşyeri Sicil No (26 Hane)</FormLabel>
                      <FormControl>
                        <Input placeholder="26 haneli sicil numarası" maxLength={26} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={sgkForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kullanıcı Adı</FormLabel>
                      <FormControl>
                        <Input placeholder="Kullanıcı Adı" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={sgkForm.control}
                  name="workplaceCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İşyeri Kodu</FormLabel>
                      <FormControl>
                        <Input placeholder="İşyeri Kodu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={sgkForm.control}
                  name="systemPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sistem Şifresi</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            type={showPasswords['sgk_system'] ? "text" : "password"} 
                            placeholder="Sistem Şifresi" 
                            {...field} 
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('sgk_system')}
                        >
                          {showPasswords['sgk_system'] ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={sgkForm.control}
                  name="workplacePassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İşyeri Şifresi</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            type={showPasswords['sgk_workplace'] ? "text" : "password"} 
                            placeholder="İşyeri Şifresi" 
                            {...field} 
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('sgk_workplace')}
                        >
                          {showPasswords['sgk_workplace'] ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>

          <div className="flex justify-between items-center pt-6 border-t">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => handleSave(false)} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                Kaydet
              </Button>
              <Button onClick={() => handleSave(true)} disabled={isSaving}>
                {isSaving ? (
                  "Kaydediliyor..."
                ) : (
                  <>
                    İleri
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
