"use client"

import { useEffect, useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, User, FileText, Save, Upload, FolderOpen, KeyRound, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"

interface CustomerModalProps {
  customer: any | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function CustomerModal({ customer, isOpen, onClose, onSave }: CustomerModalProps) {
  const isEdit = !!customer
  const isMountedRef = useRef(true)

  // Track mount status
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Company Information
  const [logo, setLogo] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [taxNumber, setTaxNumber] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  
  // Social Media
  const [facebookUrl, setFacebookUrl] = useState("")
  const [xUrl, setXUrl] = useState("")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [instagramUrl, setInstagramUrl] = useState("")
  const [threadsUrl, setThreadsUrl] = useState("")
  
  // Business Details
  const [ledgerType, setLedgerType] = useState("")
  const [subscriptionFee, setSubscriptionFee] = useState("")
  const [establishmentDate, setEstablishmentDate] = useState("")
  const [status, setStatus] = useState("ACTIVE")
  const [onboardingStage, setOnboardingStage] = useState("LEAD")
  
  // Authorized Person
  const [authorizedName, setAuthorizedName] = useState("")
  const [authorizedTCKN, setAuthorizedTCKN] = useState("")
  const [authorizedEmail, setAuthorizedEmail] = useState("")
  const [authorizedPhone, setAuthorizedPhone] = useState("")
  const [authorizedAddress, setAuthorizedAddress] = useState("")
  const [authorizedFacebookUrl, setAuthorizedFacebookUrl] = useState("")
  const [authorizedXUrl, setAuthorizedXUrl] = useState("")
  const [authorizedLinkedinUrl, setAuthorizedLinkedinUrl] = useState("")
  const [authorizedInstagramUrl, setAuthorizedInstagramUrl] = useState("")
  const [authorizedThreadsUrl, setAuthorizedThreadsUrl] = useState("")
  const [authorizationDate, setAuthorizationDate] = useState("")
  const [authorizationPeriod, setAuthorizationPeriod] = useState("")
  
  // Declarations
  const [declarations, setDeclarations] = useState<string[]>([])
  const [availableDeclarations, setAvailableDeclarations] = useState<Array<{id:string,type:string,enabled:boolean}>>([])
  const [notes, setNotes] = useState("")
  
  // Documents
  const [documents, setDocuments] = useState<Array<{id: string, name: string, file: string, uploadDate: string}>>([])
  
  // Institutional Passwords
  const [passwords, setPasswords] = useState<Array<{id: string, institution: string, username: string, password: string}>>([])
  const [newInstitution, setNewInstitution] = useState("")
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (customer && isOpen) {
      setLogo(customer.logo || "")
      setCompanyName(customer.companyName || "")
      setTaxNumber(customer.taxNumber || "")
      setPhone(customer.phone || "")
      setEmail(customer.email || "")
      setAddress(customer.address || "")
      setCity(customer.city || "")
      setFacebookUrl(customer.facebookUrl || "")
      setXUrl(customer.xUrl || "")
      setLinkedinUrl(customer.linkedinUrl || "")
      setInstagramUrl(customer.instagramUrl || "")
      setThreadsUrl(customer.threadsUrl || "")
      setLedgerType(customer.ledgerType || "")
      setSubscriptionFee(customer.subscriptionFee || "")
      setEstablishmentDate(customer.establishmentDate ? customer.establishmentDate.split('T')[0] : "")
      setStatus(customer.status || "ACTIVE")
      setOnboardingStage(customer.onboardingStage || "LEAD")
      setAuthorizedName(customer.authorizedName || "")
      setAuthorizedTCKN(customer.authorizedTCKN || "")
      setAuthorizedEmail(customer.authorizedEmail || "")
      setAuthorizedPhone(customer.authorizedPhone || "")
      setAuthorizedAddress(customer.authorizedAddress || "")
      setAuthorizedFacebookUrl(customer.authorizedFacebookUrl || "")
      setAuthorizedXUrl(customer.authorizedXUrl || "")
      setAuthorizedLinkedinUrl(customer.authorizedLinkedinUrl || "")
      setAuthorizedInstagramUrl(customer.authorizedInstagramUrl || "")
      setAuthorizedThreadsUrl(customer.authorizedThreadsUrl || "")
      setAuthorizationDate(customer.authorizationDate ? customer.authorizationDate.split('T')[0] : "")
      setAuthorizationPeriod(customer.authorizationPeriod || "")
      
      // Parse declarations JSON
      try {
        const decls = customer.declarations ? JSON.parse(customer.declarations) : []
        setDeclarations(Array.isArray(decls) ? decls : [])
      } catch {
        setDeclarations([])
      }
      
      // Parse documents JSON
      try {
        const docs = customer.documents ? JSON.parse(customer.documents) : []
        setDocuments(Array.isArray(docs) ? docs : [])
      } catch {
        setDocuments([])
      }
      
      // Parse passwords JSON
      try {
        const pwds = customer.passwords ? JSON.parse(customer.passwords) : []
        setPasswords(Array.isArray(pwds) ? pwds : [])
      } catch {
        setPasswords([])
      }
      
      setNotes(customer.notes || "")
    } else if (!isOpen) {
      // Reset form when closing
      resetForm()
    }
  }, [customer, isOpen])

  // Load available declaration configs once
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const res = await fetch('/api/declarations-config')
        if (res.ok) {
          const data = await res.json()
          setAvailableDeclarations(Array.isArray(data) ? data.filter((d:any)=>d.enabled) : [])
        }
      } catch(e) {
        console.error('Failed to load declarations config', e)
      }
    }
    loadConfigs()
  }, [])

  const resetForm = () => {
    setLogo("")
    setCompanyName("")
    setTaxNumber("")
    setPhone("")
    setEmail("")
    setAddress("")
    setCity("")
    setFacebookUrl("")
    setXUrl("")
    setLinkedinUrl("")
    setInstagramUrl("")
    setThreadsUrl("")
    setLedgerType("")
    setSubscriptionFee("")
    setEstablishmentDate("")
    setStatus("ACTIVE")
    setOnboardingStage("LEAD")
    setAuthorizedName("")
    setAuthorizedTCKN("")
    setAuthorizedEmail("")
    setAuthorizedPhone("")
    setAuthorizedAddress("")
    setAuthorizedFacebookUrl("")
    setAuthorizedXUrl("")
    setAuthorizedLinkedinUrl("")
    setAuthorizedInstagramUrl("")
    setAuthorizedThreadsUrl("")
    setAuthorizationDate("")
    setAuthorizationPeriod("")
    setDeclarations([])
    setDocuments([])
    setPasswords([])
    setNotes("")
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Logo boyutu 5MB'dan küçük olmalıdır")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogo(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Dosya boyutu 10MB'dan küçük olmalıdır")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const newDoc = {
          id: Date.now().toString(),
          name: file.name,
          file: reader.result as string,
          uploadDate: new Date().toISOString()
        }
        setDocuments(prev => [...prev, newDoc])
        toast.success("Dosya yüklendi")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id))
    toast.success("Dosya kaldırıldı")
  }

  const handleAddPassword = () => {
    if (!newInstitution.trim() || !newUsername.trim() || !newPassword.trim()) {
      toast.error("Tüm alanları doldurun")
      return
    }
    const newPwd = {
      id: Date.now().toString(),
      institution: newInstitution,
      username: newUsername,
      password: newPassword
    }
    setPasswords(prev => [...prev, newPwd])
    setNewInstitution("")
    setNewUsername("")
    setNewPassword("")
    toast.success("Şifre eklendi")
  }

  const handleRemovePassword = (id: string) => {
    setPasswords(prev => prev.filter(pwd => pwd.id !== id))
    toast.success("Şifre kaldırıldı")
  }

  const toggleDeclaration = (declaration: string) => {
    setDeclarations(prev => {
      if (prev.includes(declaration)) {
        return prev.filter(d => d !== declaration)
      } else {
        return [...prev, declaration]
      }
    })
  }

  const handleSave = async () => {
    if (!companyName.trim()) {
      toast.error("Şirket ünvanı zorunludur")
      return
    }

    setSaving(true)
    try {
      const customerData = {
        logo,
        companyName,
        taxNumber,
        phone,
        email,
        address,
        city,
        facebookUrl,
        xUrl,
        linkedinUrl,
        instagramUrl,
        threadsUrl,
        ledgerType,
        subscriptionFee,
        establishmentDate: establishmentDate || null,
        status,
        onboardingStage,
        authorizedName,
        authorizedTCKN,
        authorizedEmail,
        authorizedPhone,
        authorizedAddress,
        authorizedFacebookUrl,
        authorizedXUrl,
        authorizedLinkedinUrl,
        authorizedInstagramUrl,
        authorizedThreadsUrl,
        authorizationDate: authorizationDate || null,
        authorizationPeriod,
        declarations: JSON.stringify(declarations),
        documents: JSON.stringify(documents),
        passwords: JSON.stringify(passwords),
        notes,
      }

      const url = isEdit ? `/api/customers?id=${customer.id}` : '/api/customers'
      const method = isEdit ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      })

      if (response.ok) {
        toast.success(isEdit ? "Müşteri güncellendi" : "Müşteri eklendi")
        onSave()
        onClose()
      } else {
        const error = await response.json()
        console.error('API Error (Save Customer):', error)
        toast.error(error.error || "Bir hata oluştu")
      }
    } catch (error) {
      console.error('Error saving customer:', error)
      toast.error("Müşteri kaydedilemedi")
    } finally {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setSaving(false)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[99vw] w-[99vw] max-h-[98vh] h-[98vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl">
            {isEdit ? "Müşteri Düzenle" : "Yeni Müşteri Ekle"}
          </DialogTitle>
          <DialogDescription>
            Müşteri bilgilerini girin. Zorunlu alanlar: Şirket Ünvanı
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="company" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3 grid-rows-2 gap-y-2 h-auto">
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Şirket Bilgileri
            </TabsTrigger>
            <TabsTrigger value="authorized" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Yetkili Bilgileri
            </TabsTrigger>
            <TabsTrigger value="declarations" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Beyannameler
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Evraklar
            </TabsTrigger>
            <TabsTrigger value="passwords" className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Kurum Şifreleri
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4 px-6">
            {/* Company Information Tab */}
            <TabsContent value="company" className="space-y-6 mt-0">
              {/* Logo */}
              <div>
                <Label htmlFor="logo">Logo</Label>
                <div className="mt-2">
                  {logo && (
                    <div className="mb-4 flex items-center gap-4">
                      <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                        <Image src={logo} alt="Logo" fill className="object-contain p-2" />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setLogo("")}
                      >
                        Kaldır
                      </Button>
                    </div>
                  )}
                  <div className="relative">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="logo"
                      className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
                    >
                      <Upload className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {logo ? "Logoyu Değiştir" : "Logo Yükle (Max 5MB)"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Row 1: Company Name, Tax Number */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName" className="text-red-600">Şirket Ünvanı *</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="ABC Ltd. Şti."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="taxNumber">VKN/TCKN</Label>
                  <Input
                    id="taxNumber"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    placeholder="1234567890"
                  />
                </div>
              </div>

              {/* Row 2: Phone, Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <PhoneInput
                    id="phone"
                    value={phone}
                    onChange={setPhone}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@firma.com"
                  />
                </div>
              </div>

              {/* Row 3: City, Ledger Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Şehir</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="İstanbul"
                  />
                </div>
                <div>
                  <Label htmlFor="ledgerType">Defter Tipi</Label>
                  <Select value={ledgerType} onValueChange={setLedgerType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bilanço Esası">Bilanço Esası</SelectItem>
                      <SelectItem value="İşletme Hesabı Esası">İşletme Hesabı Esası</SelectItem>
                      <SelectItem value="Serbest Meslek Kazanç Defteri">Serbest Meslek Kazanç Defteri</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 4: Subscription Fee, Establishment Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subscriptionFee">Aidat</Label>
                  <Input
                    id="subscriptionFee"
                    value={subscriptionFee}
                    onChange={(e) => setSubscriptionFee(e.target.value)}
                    placeholder="₺5.000"
                  />
                </div>
                <div>
                  <Label htmlFor="establishmentDate">Şirket Kuruluş Tarihi</Label>
                  <Input
                    id="establishmentDate"
                    type="date"
                    value={establishmentDate}
                    onChange={(e) => setEstablishmentDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 5: Status, Onboarding Stage */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Durum</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Aktif</SelectItem>
                      <SelectItem value="INACTIVE">Pasif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="onboardingStage">Müşteri Aşaması</Label>
                  <Select value={onboardingStage} onValueChange={setOnboardingStage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LEAD">Aday</SelectItem>
                      <SelectItem value="PROSPECT">Potansiyel</SelectItem>
                      <SelectItem value="CUSTOMER">Müşteri</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address">Adres</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Tam adres bilgisi"
                  rows={3}
                />
              </div>

              {/* Social Media */}
              <div>
                <Label className="text-base font-semibold">Sosyal Medya Hesapları</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="facebookUrl">Facebook</Label>
                    <Input
                      id="facebookUrl"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="xUrl">X (Twitter)</Label>
                    <Input
                      id="xUrl"
                      value={xUrl}
                      onChange={(e) => setXUrl(e.target.value)}
                      placeholder="https://x.com/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedinUrl">LinkedIn</Label>
                    <Input
                      id="linkedinUrl"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagramUrl">Instagram</Label>
                    <Input
                      id="instagramUrl"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="threadsUrl">Threads</Label>
                    <Input
                      id="threadsUrl"
                      value={threadsUrl}
                      onChange={(e) => setThreadsUrl(e.target.value)}
                      placeholder="https://threads.net/..."
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notlar</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Müşteri hakkında önemli notlar"
                  rows={4}
                />
              </div>
            </TabsContent>

            {/* Authorized Person Tab */}
            <TabsContent value="authorized" className="space-y-6 mt-0">
              {/* Row 1: Name, TCKN */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="authorizedName">Yetkili Ad Soyad</Label>
                  <Input
                    id="authorizedName"
                    value={authorizedName}
                    onChange={(e) => setAuthorizedName(e.target.value)}
                    placeholder="Ahmet Yılmaz"
                  />
                </div>
                <div>
                  <Label htmlFor="authorizedTCKN">Yetkili TCKN</Label>
                  <Input
                    id="authorizedTCKN"
                    value={authorizedTCKN}
                    onChange={(e) => setAuthorizedTCKN(e.target.value)}
                    placeholder="12345678901"
                  />
                </div>
              </div>

              {/* Row 2: Email, Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="authorizedEmail">Yetkili E-posta</Label>
                  <Input
                    id="authorizedEmail"
                    type="email"
                    value={authorizedEmail}
                    onChange={(e) => setAuthorizedEmail(e.target.value)}
                    placeholder="yetkili@firma.com"
                  />
                </div>
                <div>
                  <Label htmlFor="authorizedPhone">Yetkili Telefon</Label>
                  <PhoneInput
                    id="authorizedPhone"
                    value={authorizedPhone}
                    onChange={setAuthorizedPhone}
                  />
                </div>
              </div>

              {/* Row 3: Authorization Date, Period */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="authorizationDate">Yetkilendirilme Tarihi</Label>
                  <Input
                    id="authorizationDate"
                    type="date"
                    value={authorizationDate}
                    onChange={(e) => setAuthorizationDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="authorizationPeriod">Yetki Süresi</Label>
                  <Input
                    id="authorizationPeriod"
                    value={authorizationPeriod}
                    onChange={(e) => setAuthorizationPeriod(e.target.value)}
                    placeholder="5 yıl"
                  />
                </div>
              </div>

              {/* Authorized Address */}
              <div>
                <Label htmlFor="authorizedAddress">Yetkili Adres</Label>
                <Textarea
                  id="authorizedAddress"
                  value={authorizedAddress}
                  onChange={(e) => setAuthorizedAddress(e.target.value)}
                  placeholder="Yetkili kişinin adres bilgisi"
                  rows={3}
                />
              </div>

              {/* Authorized Social Media */}
              <div>
                <Label className="text-base font-semibold">Yetkili Sosyal Medya Hesapları</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="authorizedFacebookUrl">Facebook</Label>
                    <Input
                      id="authorizedFacebookUrl"
                      value={authorizedFacebookUrl}
                      onChange={(e) => setAuthorizedFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="authorizedXUrl">X (Twitter)</Label>
                    <Input
                      id="authorizedXUrl"
                      value={authorizedXUrl}
                      onChange={(e) => setAuthorizedXUrl(e.target.value)}
                      placeholder="https://x.com/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="authorizedLinkedinUrl">LinkedIn</Label>
                    <Input
                      id="authorizedLinkedinUrl"
                      value={authorizedLinkedinUrl}
                      onChange={(e) => setAuthorizedLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="authorizedInstagramUrl">Instagram</Label>
                    <Input
                      id="authorizedInstagramUrl"
                      value={authorizedInstagramUrl}
                      onChange={(e) => setAuthorizedInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="authorizedThreadsUrl">Threads</Label>
                    <Input
                      id="authorizedThreadsUrl"
                      value={authorizedThreadsUrl}
                      onChange={(e) => setAuthorizedThreadsUrl(e.target.value)}
                      placeholder="https://threads.net/..."
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Declarations Tab */}
            <TabsContent value="declarations" className="space-y-6 mt-0">
              <div>
                <Label className="text-base font-semibold">Verilmesi Gereken Beyannameler</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Müşteri için geçerli olan beyannametleri seçin
                </p>
                <div className="space-y-3">
                  {availableDeclarations.length > 0 ? (
                    availableDeclarations.map((cfg) => (
                      <div key={cfg.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                        <Checkbox
                          id={`decl-${cfg.id}`}
                          checked={declarations.includes(cfg.type)}
                          onCheckedChange={() => toggleDeclaration(cfg.type)}
                        />
                        <label
                          htmlFor={`decl-${cfg.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          {cfg.type}
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">Tanımlı aktif beyanname yok. Lütfen Beyannameler sayfasından ekleyin.</div>
                  )}
                </div>
                
                {declarations.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-2">Seçili Beyannameler:</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {declarations.map((decl, idx) => (
                        <li key={idx}>• {decl}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-6 mt-0">
              <div>
                <Label className="text-base font-semibold">Evrak Yükleme</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Müşteriye ait evrakları yükleyin (Max 10MB)
                </p>
                
                <div className="mb-6">
                  <Input
                    id="document-upload"
                    type="file"
                    onChange={handleDocumentUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="document-upload"
                    className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="h-6 w-6 text-gray-400" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Evrak Yükle</p>
                      <p className="text-xs text-gray-500">PDF, Word, Excel, Görsel dosyaları</p>
                    </div>
                  </label>
                </div>
                
                {documents.length > 0 && (
                  <div className="space-y-2">
                    <Label>Yüklenen Evraklar ({documents.length})</Label>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(doc.uploadDate).toLocaleDateString("tr-TR")}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveDocument(doc.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {documents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FolderOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Henüz evrak yüklenmedi</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Passwords Tab */}
            <TabsContent value="passwords" className="space-y-6 mt-0">
              <div>
                <Label className="text-base font-semibold">Kurum Şifreleri</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Vergi Dairesi, SGK, MERSİS gibi kurum şifrelerini kaydedin
                </p>
                
                <div className="space-y-4 mb-6 p-4 border rounded-lg bg-gray-50">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="newInstitution">Kurum</Label>
                      <Input
                        id="newInstitution"
                        value={newInstitution}
                        onChange={(e) => setNewInstitution(e.target.value)}
                        placeholder="Örn: Vergi Dairesi"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newUsername">Kullanıcı Adı</Label>
                      <Input
                        id="newUsername"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Kullanıcı adı"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">Şifre</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Şifre"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddPassword}
                    className="w-full"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Kurum Şifresi Ekle
                  </Button>
                </div>
                
                {passwords.length > 0 && (
                  <div className="space-y-2">
                    <Label>Kayıtlı Şifreler ({passwords.length})</Label>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {passwords.map((pwd) => (
                        <div key={pwd.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex-1 grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Kurum</p>
                              <p className="text-sm font-medium">{pwd.institution}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Kullanıcı Adı</p>
                              <p className="text-sm font-medium">{pwd.username}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Şifre</p>
                              <p className="text-sm font-mono">{'•'.repeat(pwd.password.length)}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePassword(pwd.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {passwords.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <KeyRound className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Henüz kurum şifresi eklenmedi</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="px-6 pb-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            İptal
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !companyName.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
