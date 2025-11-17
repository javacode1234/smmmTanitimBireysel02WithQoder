"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useBreadcrumb } from "@/contexts/breadcrumb-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  FileText, 
  FolderOpen, 
  KeyRound,
  Edit,
  Calendar,
  DollarSign,
  Globe,
  Facebook,
  Linkedin,
  Instagram,
  Twitter,
  Plus,
  AlertTriangle,
  MessageSquare,
  Send
} from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { CustomerModal } from "@/components/admin/customer-modal"
import { EditContactModal } from "@/components/admin/customer-detail/edit-contact-modal"
import { EditBusinessModal } from "@/components/admin/customer-detail/edit-business-modal"
import { EditAuthorizedModal } from "@/components/admin/customer-detail/edit-authorized-modal"
import { EditSocialMediaModal } from "@/components/admin/customer-detail/edit-social-media-modal"
import { EditAuthorizedPersonModal } from "@/components/admin/customer-detail/edit-authorized-person-modal"
import { EditAuthorizationInfoModal } from "@/components/admin/customer-detail/edit-authorization-info-modal"
import { EditAuthorizedSocialMediaModal } from "@/components/admin/customer-detail/edit-authorized-social-media-modal"
import { EditBasicInfoModal } from "@/components/admin/customer-detail/edit-basic-info-modal"
import { EditAuthorizedAddressModal } from "@/components/admin/customer-detail/edit-authorized-address-modal"
import { DocumentsTable } from "@/components/admin/customer-detail/documents-table"
import { PasswordsTable } from "@/components/admin/customer-detail/passwords-table"
import { DeclarationsTracker } from "@/components/admin/customer-detail/declarations-tracker"
import { DeclarationSettings } from "@/components/admin/customer-detail/declaration-settings"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trash2, Download, Wallet } from "lucide-react"

type Customer = {
  id: string
  logo: string | null
  companyName: string
  taxNumber: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  facebookUrl: string | null
  xUrl: string | null
  linkedinUrl: string | null
  instagramUrl: string | null
  threadsUrl: string | null
  ledgerType: string | null
  subscriptionFee: string | null
  establishmentDate: string | null
  taxPeriodType: string | null
  authorizedName: string | null
  authorizedTCKN: string | null
  authorizedEmail: string | null
  authorizedPhone: string | null
  authorizedAddress: string | null
  authorizedFacebookUrl: string | null
  authorizedXUrl: string | null
  authorizedLinkedinUrl: string | null
  authorizedInstagramUrl: string | null
  authorizedThreadsUrl: string | null
  authorizationDate: string | null
  authorizationPeriod: string | null
  declarations: string | null
  declarationSettings: string | null // Yeni: Müşteri için seçili beyannameler
  documents: string | null
  passwords: string | null
  notes: string | null
  status: "ACTIVE" | "INACTIVE"
  onboardingStage: "LEAD" | "PROSPECT" | "CUSTOMER"
  createdAt: string
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isMounted, setIsMounted] = useState(false)
  const [tabsReady, setTabsReady] = useState(false)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isEditBasicInfoOpen, setIsEditBasicInfoOpen] = useState(false)
  const [isEditContactOpen, setIsEditContactOpen] = useState(false)
  const [isEditBusinessOpen, setIsEditBusinessOpen] = useState(false)
  const [isEditAuthorizedOpen, setIsEditAuthorizedOpen] = useState(false)
  const [isEditSocialMediaOpen, setIsEditSocialMediaOpen] = useState(false)
  const [isEditAuthorizedPersonOpen, setIsEditAuthorizedPersonOpen] = useState(false)
  const [isEditAuthorizationInfoOpen, setIsEditAuthorizationInfoOpen] = useState(false)
  const [isEditAuthorizedSocialMediaOpen, setIsEditAuthorizedSocialMediaOpen] = useState(false)
  const [isEditAuthorizedAddressOpen, setIsEditAuthorizedAddressOpen] = useState(false)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [declarationsView, setDeclarationsView] = useState<'tracker' | 'settings'>('tracker')

  useEffect(() => {
    setIsMounted(true)
    params.then(p => setCustomerId(p.id))
  }, [params])

  // Wait for tabs to be ready after customer data is loaded AND component is mounted
  useEffect(() => {
    if (isMounted && customer && !loading) {
      // Small delay to ensure DOM is ready and avoid hydration issues
      const timer = setTimeout(() => {
        setTabsReady(true)
      }, 150) // Increased delay to ensure full hydration
      return () => clearTimeout(timer)
    }
  }, [isMounted, customer, loading])

  const fetchCustomer = async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/customers?id=${id}`)
      if (res.ok) {
        const data = await res.json()
        // Load declaration settings from DB and merge into customer
        let merged = data
        try {
          const sRes = await fetch(`/api/customer-declaration-settings?customerId=${data.id}`)
          if (sRes.ok) {
            const sData = await sRes.json()
            merged = { ...data, declarationSettings: JSON.stringify(sData) }
          }
        } catch {}
        setCustomer(merged)
      } else {
        toast.error("Müşteri bilgileri yüklenemedi")
        router.push("/admin/customers")
      }
    } catch (e) {
      console.error(e)
      toast.error("Bir hata oluştu")
      router.push("/admin/customers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isMounted && customerId) {
      fetchCustomer(customerId)
    }
  }, [isMounted, customerId])

  // Set breadcrumb custom label
  const { setCustomLabel } = useBreadcrumb()
  useEffect(() => {
    if (customer) {
      setCustomLabel(customer.companyName)
    }
    return () => {
      setCustomLabel(null)
      // Close all modals on unmount to prevent DOM errors
      setIsEditModalOpen(false)
      setIsEditBasicInfoOpen(false)
      setIsEditContactOpen(false)
      setIsEditBusinessOpen(false)
      setIsEditAuthorizedOpen(false)
      setIsEditSocialMediaOpen(false)
      setIsEditAuthorizedPersonOpen(false)
      setIsEditAuthorizationInfoOpen(false)
      setIsEditAuthorizedSocialMediaOpen(false)
      setIsEditAuthorizedAddressOpen(false)
    }
  }, [customer, setCustomLabel])

  const handleModalSave = () => {
    setIsEditModalOpen(false)
    if (customerId) {
      // Small delay before fetching to ensure modal is closed
      setTimeout(() => {
        fetchCustomer(customerId)
      }, 100)
    }
  }

  const handleBasicInfoSave = (data: any) => {
    if (customer) {
      setCustomer({ ...customer, ...data })
    }
  }

  const handleContactSave = (data: any) => {
    if (customer) {
      setCustomer({ ...customer, ...data })
    }
  }

  const handleBusinessSave = (data: any) => {
    if (customer) {
      setCustomer({ ...customer, ...data })
    }
  }

  const handleAuthorizedSave = (data: any) => {
    if (customer) {
      setCustomer({ ...customer, ...data })
    }
  }

  const handleSocialMediaSave = (data: any) => {
    if (customer) {
      setCustomer({ ...customer, ...data })
    }
  }

  const handleAuthorizedPersonSave = (data: any) => {
    if (customer) {
      setCustomer({ ...customer, ...data })
    }
  }

  const handleAuthorizationInfoSave = (data: any) => {
    if (customer) {
      setCustomer({ ...customer, ...data })
    }
  }

  const handleAuthorizedSocialMediaSave = (data: any) => {
    if (customer) {
      setCustomer({ ...customer, ...data })
    }
  }

  const handleAuthorizedAddressSave = (data: any) => {
    if (customer) {
      setCustomer({ ...customer, ...data })
    }
  }

  const handleDocumentsUpdate = async (documents: any[]) => {
    if (!customerId) return
    
    try {
      const response = await fetch(`/api/customers?id=${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: JSON.stringify(documents) }),
      })

      if (response.ok && customer) {
        setCustomer({ ...customer, documents: JSON.stringify(documents) })
      }
    } catch (error) {
      console.error('Error updating documents:', error)
    }
  }

  const handlePasswordsUpdate = async (passwords: any[]) => {
    if (!customerId) return
    
    try {
      const response = await fetch(`/api/customers?id=${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passwords: JSON.stringify(passwords) }),
      })

      if (response.ok && customer) {
        setCustomer({ ...customer, passwords: JSON.stringify(passwords) })
      }
    } catch (error) {
      console.error('Error updating passwords:', error)
    }
  }

  const handleDeclarationsUpdate = async (declarations: any[]) => {
    if (!customerId) return
    
    try {
      const response = await fetch(`/api/customers?id=${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ declarations: JSON.stringify(declarations) }),
      })

      if (response.ok && customer) {
        setCustomer({ ...customer, declarations: JSON.stringify(declarations) })
      }
    } catch (error) {
      console.error('Error updating declarations:', error)
    }
  }

  const handleDeclarationSettingsUpdate = async (settings: any[]) => {
    if (!customerId) return
    
    try {
      const enabledTypes = Array.isArray(settings) ? settings.filter((s: any) => s?.enabled).map((s: any) => s?.type).filter((t: any) => typeof t === 'string' && t.trim()) : []

      const response = await fetch(`/api/customers?id=${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          declarationSettings: JSON.stringify(settings),
          declarations: JSON.stringify(enabledTypes),
        }),
      })

      if (response.ok && customer) {
        setCustomer({
          ...customer,
          declarationSettings: JSON.stringify(settings),
          declarations: JSON.stringify(enabledTypes),
        })
      }
    } catch (error) {
      console.error('Error updating declaration settings:', error)
    }
  }

  if (!isMounted || loading || !customer) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">
          {!customer && !loading ? "Müşteri bulunamadı" : "Yükleniyor..."}
        </div>
      </div>
    )
  }

  const declarations = customer.declarations ? JSON.parse(customer.declarations) : []
  const declarationSettings = customer.declarationSettings ? JSON.parse(customer.declarationSettings) : []
  const documents = customer.documents ? JSON.parse(customer.documents) : []
  const passwords = customer.passwords ? JSON.parse(customer.passwords) : []

  // Ensure declarations is an array (for backward compatibility)
  const declarationsArray = Array.isArray(declarations) ? declarations : []
  const declarationSettingsArray = Array.isArray(declarationSettings) ? declarationSettings : []

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {customer.logo ? (
              <div className="relative w-20 h-20 border-2 rounded-lg overflow-hidden">
                <Image src={customer.logo} alt={customer.companyName} fill className="object-contain p-2" />
              </div>
            ) : (
              <div className="w-20 h-20 border-2 rounded-lg bg-muted flex items-center justify-center">
                <Building2 className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{customer.companyName}</h1>
              <p className="text-muted-foreground mt-1">
                {customer.taxNumber && `VKN/TCKN: ${customer.taxNumber}`}
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant={customer.status === "ACTIVE" ? "default" : "secondary"}>
                  {customer.status === "ACTIVE" ? "Aktif" : "Pasif"}
                </Badge>
                <Badge variant="outline">
                  {customer.onboardingStage === "LEAD"
                    ? "Aday"
                    : customer.onboardingStage === "PROSPECT"
                    ? "Potansiyel"
                    : "Müşteri"}
                </Badge>
              </div>
            </div>
          </div>
          <Button onClick={() => setIsEditBasicInfoOpen(true)} size="lg">
            <Edit className="h-4 w-4 mr-2" />
            Düzenle
          </Button>
        </div>
      </div>

      {/* Content Tabs */}
      {!tabsReady ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">İçerik yükleniyor...</div>
        </div>
      ) : (
        <Tabs defaultValue="company" className="space-y-6" key="customer-detail-tabs">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="company">Şirket Bilgileri</TabsTrigger>
            <TabsTrigger value="authorized">Yetkili Bilgileri</TabsTrigger>
            <TabsTrigger value="declarations">Beyannameler</TabsTrigger>
            <TabsTrigger value="documents">Evraklar</TabsTrigger>
            <TabsTrigger value="passwords">Kurum Şifreleri</TabsTrigger>
            <TabsTrigger value="messages">Mesajlar</TabsTrigger>
            <TabsTrigger value="accounting">Hesap</TabsTrigger>
          </TabsList>

        {/* Company Information */}
        <TabsContent value="company" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">İletişim Bilgileri</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setIsEditContactOpen(true)}>
                  <Edit className="h-3 w-3 mr-1" />
                  Düzenle
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {customer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.email}</span>
                  </div>
                )}
                {customer.city && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.city}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-start gap-3 pt-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <span className="text-sm">{customer.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">İş Bilgileri</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setIsEditBusinessOpen(true)}>
                  <Edit className="h-3 w-3 mr-1" />
                  Düzenle
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {customer.ledgerType && (
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Defter Tipi</p>
                      <p className="font-medium">{customer.ledgerType}</p>
                    </div>
                  </div>
                )}
                {customer.subscriptionFee && (
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-muted-foreground">₺</span>
                    <div>
                      <p className="text-xs text-muted-foreground">Aidat</p>
                      <p className="font-medium">{customer.subscriptionFee}</p>
                    </div>
                  </div>
                )}
                {customer.establishmentDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Şirket Kuruluş Tarihi</p>
                      <p className="font-medium">{new Date(customer.establishmentDate).toLocaleDateString("tr-TR")}</p>
                    </div>
                  </div>
                )}
                {customer.taxPeriodType && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Vergi Dönemi</p>
                      <p className="font-medium">
                        {customer.taxPeriodType === 'NORMAL' ? 'Normal Dönem (Ocak-Aralık)' : 'Özel Dönem'}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Kayıt Tarihi</p>
                    <p className="font-medium">{new Date(customer.createdAt).toLocaleDateString("tr-TR")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Media */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Sosyal Medya</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setIsEditSocialMediaOpen(true)}>
                <Edit className="h-3 w-3 mr-1" />
                {(customer.facebookUrl || customer.xUrl || customer.linkedinUrl || customer.instagramUrl || customer.threadsUrl) ? "Düzenle" : "Ekle"}
              </Button>
            </CardHeader>
            <CardContent>
              {(customer.facebookUrl || customer.xUrl || customer.linkedinUrl || customer.instagramUrl || customer.threadsUrl) ? (
                <div className="flex flex-wrap gap-3">
                  {customer.facebookUrl && (
                    <a href={customer.facebookUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Facebook className="h-4 w-4 mr-2" />
                        Facebook
                      </Button>
                    </a>
                  )}
                  {customer.xUrl && (
                    <a href={customer.xUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Twitter className="h-4 w-4 mr-2" />
                        X
                      </Button>
                    </a>
                  )}
                  {customer.linkedinUrl && (
                    <a href={customer.linkedinUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </Button>
                    </a>
                  )}
                  {customer.instagramUrl && (
                    <a href={customer.instagramUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Instagram className="h-4 w-4 mr-2" />
                        Instagram
                      </Button>
                    </a>
                  )}
                  {customer.threadsUrl && (
                    <a href={customer.threadsUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Image src="/nsosyal.png" alt="Nsosyal" width={16} height={16} className="mr-2" />
                        Nsosyal
                      </Button>
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Sosyal medya hesabı eklenmemiş
                </p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {customer.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notlar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{customer.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Authorized Person */}
        <TabsContent value="authorized" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Yetkili Kişi Bilgileri</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setIsEditAuthorizedPersonOpen(true)}>
                  <Edit className="h-3 w-3 mr-1" />
                  Düzenle
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {customer.authorizedName && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Ad Soyad</p>
                      <p className="font-medium">{customer.authorizedName}</p>
                    </div>
                  </div>
                )}
                {customer.authorizedTCKN && (
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">TCKN</p>
                      <p className="font-medium">{customer.authorizedTCKN}</p>
                    </div>
                  </div>
                )}
                {customer.authorizedPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.authorizedPhone}</span>
                  </div>
                )}
                {customer.authorizedEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.authorizedEmail}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Yetkilendirme Bilgileri</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setIsEditAuthorizationInfoOpen(true)}>
                  <Edit className="h-3 w-3 mr-1" />
                  {(customer.authorizationDate || customer.authorizationPeriod) ? "Düzenle" : "Ekle"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {(customer.authorizationDate || customer.authorizationPeriod) ? (
                  <>
                    {customer.authorizationDate && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Yetkilendirilme Tarihi</p>
                          <p className="font-medium">{new Date(customer.authorizationDate).toLocaleDateString("tr-TR")}</p>
                        </div>
                      </div>
                    )}
                    {customer.authorizationPeriod && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Yetki Süresi</p>
                          <p className="font-medium">{customer.authorizationPeriod} yıl</p>
                        </div>
                      </div>
                    )}
                    {customer.authorizationDate && customer.authorizationPeriod && (() => {
                      const startDate = new Date(customer.authorizationDate)
                      const periodInYears = parseInt(customer.authorizationPeriod)
                      const endDate = new Date(startDate)
                      endDate.setFullYear(endDate.getFullYear() + periodInYears)
                      const today = new Date()
                      const isExpired = today > endDate
                      const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                      const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 30
                      
                      return (
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Yetki Bitiş Tarihi</p>
                            <p className="font-medium">{endDate.toLocaleDateString("tr-TR")}</p>
                          </div>
                        </div>
                      )
                    })()}
                    {customer.authorizationDate && customer.authorizationPeriod && (() => {
                      const startDate = new Date(customer.authorizationDate)
                      const periodInYears = parseInt(customer.authorizationPeriod)
                      const endDate = new Date(startDate)
                      endDate.setFullYear(endDate.getFullYear() + periodInYears)
                      const today = new Date()
                      const isExpired = today > endDate
                      const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                      const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 30
                      
                      if (isExpired || isExpiringSoon) {
                        return (
                          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-red-900">
                                {isExpired ? 'Yetki Süresi Doldu!' : 'Yetki Süresi Dolmak Üzere!'}
                              </p>
                              <p className="text-xs text-red-700 mt-1">
                                {isExpired 
                                  ? `Yetki ${Math.abs(daysUntilExpiry)} gün önce sona erdi. Lütfen yetkiyi yenileyin.`
                                  : `Yetki ${daysUntilExpiry} gün içinde sona erecek. Lütfen işlem yapın.`
                                }
                              </p>
                            </div>
                          </div>
                        )
                      }
                      return null
                    })()}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Yetkilendirme bilgisi eklenmemiş
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Authorized Address */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Yetkili Adres</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setIsEditAuthorizedAddressOpen(true)}>
                <Edit className="h-3 w-3 mr-1" />
                {customer.authorizedAddress ? "Düzenle" : "Ekle"}
              </Button>
            </CardHeader>
            <CardContent>
              {customer.authorizedAddress ? (
                <p className="text-sm">{customer.authorizedAddress}</p>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Adres bilgisi eklenmemiş
                </p>
              )}
            </CardContent>
          </Card>

          {/* Authorized Social Media */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Yetkili Sosyal Medya</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setIsEditAuthorizedSocialMediaOpen(true)}>
                <Edit className="h-3 w-3 mr-1" />
                {(customer.authorizedFacebookUrl || customer.authorizedXUrl || customer.authorizedLinkedinUrl || customer.authorizedInstagramUrl || customer.authorizedThreadsUrl) ? "Düzenle" : "Ekle"}
              </Button>
            </CardHeader>
            <CardContent>
              {(customer.authorizedFacebookUrl || customer.authorizedXUrl || customer.authorizedLinkedinUrl || customer.authorizedInstagramUrl || customer.authorizedThreadsUrl) ? (
                <div className="flex flex-wrap gap-3">
                  {customer.authorizedFacebookUrl && (
                    <a href={customer.authorizedFacebookUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Facebook className="h-4 w-4 mr-2" />
                        Facebook
                      </Button>
                    </a>
                  )}
                  {customer.authorizedXUrl && (
                    <a href={customer.authorizedXUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Twitter className="h-4 w-4 mr-2" />
                        X
                      </Button>
                    </a>
                  )}
                  {customer.authorizedLinkedinUrl && (
                    <a href={customer.authorizedLinkedinUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </Button>
                    </a>
                  )}
                  {customer.authorizedInstagramUrl && (
                    <a href={customer.authorizedInstagramUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Instagram className="h-4 w-4 mr-2" />
                        Instagram
                      </Button>
                    </a>
                  )}
                  {customer.authorizedThreadsUrl && (
                    <a href={customer.authorizedThreadsUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Image src="/nsosyal.png" alt="Nsosyal" width={16} height={16} className="mr-2" />
                        Nsosyal
                      </Button>
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Sosyal medya hesabı eklenmemiş
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Declarations */}
        <TabsContent value="declarations">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Beyannameler</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={declarationsView === 'tracker' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDeclarationsView('tracker')}
                  >
                    Takip
                  </Button>
                  <Button
                    variant={declarationsView === 'settings' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDeclarationsView('settings')}
                  >
                    Ayarlar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {declarationsView === 'tracker' ? (
                <DeclarationsTracker
                  declarations={declarationsArray}
                  declarationSettings={declarationSettingsArray}
                  customerId={customer.id}
                  onUpdate={handleDeclarationsUpdate}
                />
              ) : (
                <DeclarationSettings
                  settings={declarationSettingsArray}
                  customerId={customer.id}
                  establishmentDate={customer.establishmentDate}
                  onUpdate={handleDeclarationSettingsUpdate}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Yüklenen Evraklar</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentsTable
                documents={documents}
                customerId={customer.id}
                onUpdate={handleDocumentsUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Passwords */}
        <TabsContent value="passwords">
          <Card>
            <CardHeader>
              <CardTitle>Kurum Şifreleri</CardTitle>
            </CardHeader>
            <CardContent>
              <PasswordsTable
                passwords={passwords}
                customerId={customer.id}
                onUpdate={handlePasswordsUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages */}
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Müşteriyle Mesajlaşma
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Messages Area */}
                <div className="border rounded-lg p-4 h-[400px] overflow-y-auto bg-muted/20">
                  <div className="space-y-3">
                    {/* Example messages - will be dynamic later */}
                    <div className="flex justify-start">
                      <div className="bg-white border rounded-lg p-3 max-w-[70%] shadow-sm">
                        <p className="text-sm font-semibold text-primary mb-1">{customer.companyName}</p>
                        <p className="text-sm">Merhaba, evraklarımı yükledim.</p>
                        <p className="text-xs text-muted-foreground mt-1">Bugün 14:30</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-[70%] shadow-sm">
                        <p className="text-sm font-semibold mb-1">Siz</p>
                        <p className="text-sm">Teşekkür ederim, inceleyeceğiz.</p>
                        <p className="text-xs opacity-80 mt-1">Bugün 14:35</p>
                      </div>
                    </div>

                    {/* Empty state */}
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Henüz mesaj bulunmamaktadır</p>
                      <p className="text-sm mt-1">Aşağıdaki alandan ilk mesajınızı gönderin</p>
                    </div>
                  </div>
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Mesajınızı yazın..."
                    className="flex-1"
                  />
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Send className="h-4 w-4 mr-2" />
                    Gönder
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accounting */}
        <TabsContent value="accounting">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Hesap ve Ödeme Takibi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Aidat</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₺0.00</div>
                      <p className="text-xs text-muted-foreground mt-1">Bu dönem</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Ödenen</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">₺0.00</div>
                      <p className="text-xs text-muted-foreground mt-1">Bu dönem</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Bakiye</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">₺0.00</div>
                      <p className="text-xs text-muted-foreground mt-1">Borç</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Payment History Table */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Ödeme Geçmişi</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Dönem</TableHead>
                          <TableHead>Aidat</TableHead>
                          <TableHead>Ödenen</TableHead>
                          <TableHead>Bakiye</TableHead>
                          <TableHead>Ödeme Tarihi</TableHead>
                          <TableHead>Durum</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            Henüz ödeme kaydı bulunmamaktadır
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      )}

      {/* Modals - Only render when customer is loaded */}
      {customer && (
        <>
          {/* Edit Modal */}
          <CustomerModal
            customer={customer}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleModalSave}
          />

      {/* Edit Contact Modal */}
      <EditContactModal
        isOpen={isEditContactOpen}
        onClose={() => setIsEditContactOpen(false)}
        onSave={handleContactSave}
        customerId={customer.id}
        initialData={{
          phone: customer.phone,
          email: customer.email,
          city: customer.city,
          address: customer.address,
        }}
      />

      {/* Edit Business Modal */}
      <EditBusinessModal
        isOpen={isEditBusinessOpen}
        onClose={() => setIsEditBusinessOpen(false)}
        onSave={handleBusinessSave}
        customerId={customer.id}
        initialData={{
          ledgerType: customer.ledgerType,
          subscriptionFee: customer.subscriptionFee,
          establishmentDate: customer.establishmentDate,
          taxPeriodType: customer.taxPeriodType,
          status: customer.status,
          onboardingStage: customer.onboardingStage,
        }}
      />

      {/* Edit Authorized Modal */}
      <EditAuthorizedModal
        isOpen={isEditAuthorizedOpen}
        onClose={() => setIsEditAuthorizedOpen(false)}
        onSave={handleAuthorizedSave}
        customerId={customer.id}
        initialData={{
          authorizedName: customer.authorizedName,
          authorizedTCKN: customer.authorizedTCKN,
          authorizedPhone: customer.authorizedPhone,
          authorizedEmail: customer.authorizedEmail,
          authorizedAddress: customer.authorizedAddress,
          authorizationDate: customer.authorizationDate,
          authorizationPeriod: customer.authorizationPeriod,
        }}
      />

      {/* Edit Social Media Modal */}
      <EditSocialMediaModal
        isOpen={isEditSocialMediaOpen}
        onClose={() => setIsEditSocialMediaOpen(false)}
        onSave={handleSocialMediaSave}
        customerId={customer.id}
        initialData={{
          facebookUrl: customer.facebookUrl,
          xUrl: customer.xUrl,
          linkedinUrl: customer.linkedinUrl,
          instagramUrl: customer.instagramUrl,
          threadsUrl: customer.threadsUrl,
        }}
      />

      {/* Edit Authorized Person Modal */}
      <EditAuthorizedPersonModal
        isOpen={isEditAuthorizedPersonOpen}
        onClose={() => setIsEditAuthorizedPersonOpen(false)}
        onSave={handleAuthorizedPersonSave}
        customerId={customer.id}
        initialData={{
          authorizedName: customer.authorizedName,
          authorizedTCKN: customer.authorizedTCKN,
          authorizedPhone: customer.authorizedPhone,
          authorizedEmail: customer.authorizedEmail,
          authorizedAddress: customer.authorizedAddress,
        }}
      />

      {/* Edit Authorization Info Modal */}
      <EditAuthorizationInfoModal
        isOpen={isEditAuthorizationInfoOpen}
        onClose={() => setIsEditAuthorizationInfoOpen(false)}
        onSave={handleAuthorizationInfoSave}
        customerId={customer.id}
        initialData={{
          authorizationDate: customer.authorizationDate,
          authorizationPeriod: customer.authorizationPeriod,
        }}
      />

      {/* Edit Authorized Social Media Modal */}
      <EditAuthorizedSocialMediaModal
        isOpen={isEditAuthorizedSocialMediaOpen}
        onClose={() => setIsEditAuthorizedSocialMediaOpen(false)}
        onSave={handleAuthorizedSocialMediaSave}
        customerId={customer.id}
        initialData={{
          authorizedFacebookUrl: customer.authorizedFacebookUrl,
          authorizedXUrl: customer.authorizedXUrl,
          authorizedLinkedinUrl: customer.authorizedLinkedinUrl,
          authorizedInstagramUrl: customer.authorizedInstagramUrl,
          authorizedThreadsUrl: customer.authorizedThreadsUrl,
        }}
      />

      {/* Edit Basic Info Modal */}
      <EditBasicInfoModal
        isOpen={isEditBasicInfoOpen}
        onClose={() => setIsEditBasicInfoOpen(false)}
        onSave={handleBasicInfoSave}
        customerId={customer.id}
        initialData={{
          logoUrl: customer.logo,
          companyName: customer.companyName,
          taxNumber: customer.taxNumber,
          status: customer.status,
          onboardingStage: customer.onboardingStage,
        }}
      />

          {/* Edit Authorized Address Modal */}
          <EditAuthorizedAddressModal
            isOpen={isEditAuthorizedAddressOpen}
            onClose={() => setIsEditAuthorizedAddressOpen(false)}
            onSave={handleAuthorizedAddressSave}
            customerId={customer.id}
            initialData={{
              authorizedAddress: customer.authorizedAddress,
            }}
          />
        </>
      )}
    </div>
  )
}
