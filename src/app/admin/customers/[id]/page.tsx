"use client";

import React, { useMemo } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentsTable } from "@/components/admin/customer-detail/documents-table";
import { DeclarationSettings } from "@/components/admin/customer-detail/declaration-settings";
import type { DeclarationSetting } from "@/components/admin/customer-detail/declaration-settings";
import { 
  Save, 
  Upload, 
  X, 
  ArrowLeft,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  MessageSquare,
  Image as ImageIcon,
  ChevronDown,
  Trash2
} from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { TaxOfficeCombobox } from "@/components/ui/tax-office-combobox";
import Link from "next/link";
import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
type Customer = {
  id: string;
  logo: string | null;
  companyName: string;
  taxNumber: string | null;
  taxOffice: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  facebookUrl: string | null;
  xUrl: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  threadsUrl: string | null;
  ledgerType: string | null;
  hasEmployees: boolean | null;
  subscriptionFee: string | null;
  establishmentDate: string | null;
  mainActivityCode: string | null;
  taxPeriodType: string | null;
  authorizedName: string | null;
  authorizedTCKN: string | null;
  authorizedEmail: string | null;
  authorizedPhone: string | null;
  authorizedAddress: string | null;
  authorizedFacebookUrl: string | null;
  authorizedXUrl: string | null;
  authorizedLinkedinUrl: string | null;
  authorizedInstagramUrl: string | null;
  authorizedThreadsUrl: string | null;
  authorizationDate: string | null;
  authorizationPeriod: string | null;
  declarations: string | null;
  branches: string | null;
  declarationSettings: string | null; // Yeni: Müşteri için seçili beyannameler
  documents: string | null;
  passwords: string | null;
  authorizedPersons: string | null;
  notes: string | null;
  status: "ACTIVE" | "INACTIVE";
  onboardingStage: "LEAD" | "PROSPECT" | "CUSTOMER";
  createdAt: string;
  employeeCount: number | null;
};

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = React.use(params);
  const [openCompany, setOpenCompany] = useState(false);
  const [openAuthorized, setOpenAuthorized] = useState(false);
  
  const [openBranches, setOpenBranches] = useState(false);
  const [openFiles, setOpenFiles] = useState(false);
  const [openNotes, setOpenNotes] = useState(false);
  const [openDeclarations, setOpenDeclarations] = useState(false);
  
  // Company Information
  const [logo, setLogo] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [taxOffice, setTaxOffice] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  
  // Social Media
  const [facebookUrl, setFacebookUrl] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [threadsUrl, setThreadsUrl] = useState("");
  
  // Business Details
  const [ledgerType, setLedgerType] = useState("");
  const [hasEmployees, setHasEmployees] = useState(false);
  const [employeeCount, setEmployeeCount] = useState<number | null>(null);
  const [subscriptionFee, setSubscriptionFee] = useState("");
  const [establishmentDate, setEstablishmentDate] = useState("");
  const [mainActivityCode, setMainActivityCode] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [onboardingStage, setOnboardingStage] = useState("LEAD");
  
  // Authorized Person
  const [authorizedName, setAuthorizedName] = useState("");
  const [authorizedTCKN, setAuthorizedTCKN] = useState("");
  const [authorizedEmail, setAuthorizedEmail] = useState("");
  const [authorizedPhone, setAuthorizedPhone] = useState("");
  const [authorizedAddress, setAuthorizedAddress] = useState("");
  const [authorizedFacebookUrl, setAuthorizedFacebookUrl] = useState("");
  const [authorizedXUrl, setAuthorizedXUrl] = useState("");
  const [authorizedLinkedinUrl, setAuthorizedLinkedinUrl] = useState("");
  const [authorizedInstagramUrl, setAuthorizedInstagramUrl] = useState("");
  const [authorizedThreadsUrl, setAuthorizedThreadsUrl] = useState("");
  const [authorizationDate, setAuthorizationDate] = useState("");
  const [authorizationPeriod, setAuthorizationPeriod] = useState("");
  const [authorizedPersons, setAuthorizedPersons] = useState<Array<{ id: string; name: string; tckn: string; email: string; phone: string; address: string; authorizationDate: string; authorizationPeriod: string }>>([])
  const [authorizedFilter, setAuthorizedFilter] = useState("")
  const [authorizedPage, setAuthorizedPage] = useState(1)
  const [authorizedPageSize, setAuthorizedPageSize] = useState(5)
  
  // Notes
  const [notes, setNotes] = useState<Array<{ id: string; title: string; content: string; date: string }>>([]);
  const [noteForm, setNoteForm] = useState<{ title: string; content: string }>({ title: "", content: "" })
  const [noteFilter, setNoteFilter] = useState("")
  const [notePage, setNotePage] = useState(1)
  const [notePageSize, setNotePageSize] = useState(10)
  const [noteEditingId, setNoteEditingId] = useState<string | null>(null)
  
  // Documents
  const [documents, setDocuments] = useState<Array<{id: string, name: string, file: string, uploadDate: string, type: 'incoming' | 'outgoing', isRead: boolean}>>([]);
  
  
  // Tax offices
  const [taxOffices, setTaxOffices] = useState<Array<{id: string, name: string, city?: string | null, district?: string | null}>>([]);
  const [branches, setBranches] = useState<Array<{ id: string; name: string; openingDate?: string; closingDate?: string; activityCode?: string; city?: string; district?: string; address: string }>>([])
  const [branchForm, setBranchForm] = useState<{ name: string; openingDate?: string; closingDate?: string; activityCode?: string; city?: string; district?: string; address: string }>({ name: "", openingDate: "", closingDate: "", activityCode: "", city: "", district: "", address: "" })
  const [branchEditingId, setBranchEditingId] = useState<string | null>(null)
  const [branchFilter, setBranchFilter] = useState("")
  const [branchPage, setBranchPage] = useState(1)
  const [branchPageSize, setBranchPageSize] = useState(10)
  const cityOptions = useMemo(() => {
    const names = Array.from(new Set((taxOffices || []).map(o => (o.city || '').trim()).filter(Boolean)))
    return names.map((c, idx) => ({ id: `city-${idx}`, name: c }))
  }, [taxOffices])
  const districtOptions = useMemo(() => {
    const targetCity = (branchForm.city || '').trim()
    const names = Array.from(new Set((taxOffices || []).filter(o => (o.city || '').trim() === targetCity).map(o => (o.district || '').trim()).filter(Boolean)))
    return names.map((d, idx) => ({ id: `district-${idx}`, name: d }))
  }, [taxOffices, branchForm.city])
  const [activityCodeOptions, setActivityCodeOptions] = useState<Array<{ id: string; name: string }>>([])
  const [declarationSettings, setDeclarationSettings] = useState<DeclarationSetting[]>([])
  
  // Load customer data
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/customers?id=${id}`);
        if (response.ok) {
          const data: Customer = await response.json();
          setCustomer(data);
          
          // Initialize form fields
          setLogo(data.logo || "");
          setCompanyName(data.companyName || "");
          setTaxNumber(data.taxNumber || "");
          setTaxOffice(data.taxOffice || "");
          setPhone(data.phone || "");
          setEmail(data.email || "");
          setAddress(data.address || "");
          setFacebookUrl(data.facebookUrl || "");
          setXUrl(data.xUrl || "");
          setLinkedinUrl(data.linkedinUrl || "");
          setInstagramUrl(data.instagramUrl || "");
          setThreadsUrl(data.threadsUrl || "");
          setLedgerType(data.ledgerType || "");
          setHasEmployees(data.hasEmployees || false);
          setEmployeeCount(data.employeeCount ?? null);
          setSubscriptionFee(data.subscriptionFee || "");
          setEstablishmentDate(data.establishmentDate ? new Date(data.establishmentDate).toISOString().split('T')[0] : "");
          setMainActivityCode(data.mainActivityCode || "");
          setStatus(data.status || "ACTIVE");
          setOnboardingStage(data.onboardingStage || "LEAD");
          setAuthorizedName(data.authorizedName || "");
          setAuthorizedTCKN(data.authorizedTCKN || "");
          setAuthorizedEmail(data.authorizedEmail || "");
          setAuthorizedPhone(data.authorizedPhone || "");
          setAuthorizedAddress(data.authorizedAddress || "");
          setAuthorizedFacebookUrl(data.authorizedFacebookUrl || "");
          setAuthorizedXUrl(data.authorizedXUrl || "");
          setAuthorizedLinkedinUrl(data.authorizedLinkedinUrl || "");
          setAuthorizedInstagramUrl(data.authorizedInstagramUrl || "");
          setAuthorizedThreadsUrl(data.authorizedThreadsUrl || "");
          setAuthorizationDate(data.authorizationDate ? new Date(data.authorizationDate).toISOString().split('T')[0] : "");
          setAuthorizationPeriod(data.authorizationPeriod || "");
          try {
            const authPersons: Array<{ id: string; name: string; tckn: string; email: string; phone: string; address: string; authorizationDate: string; authorizationPeriod: string }> = data.authorizedPersons ? JSON.parse(data.authorizedPersons) : []
            setAuthorizedPersons(Array.isArray(authPersons) ? authPersons : [])
          } catch { setAuthorizedPersons([]) }
          setBranches(data.branches ? JSON.parse(data.branches) : [])
          const docs: Array<{ id: string; name: string; file: string; uploadDate: string; type?: 'incoming' | 'outgoing'; isRead?: boolean }> = data.documents ? JSON.parse(data.documents) : []
          setDocuments((docs || []).map(d => ({ id: d.id, name: d.name, file: d.file, uploadDate: d.uploadDate, type: d.type || 'outgoing', isRead: d.isRead ?? false })))
          const declSettings = data.declarationSettings ? (JSON.parse(data.declarationSettings) as DeclarationSetting[]) : []
          setDeclarationSettings(declSettings)
          try {
            const parsedNotes = data.notes ? JSON.parse(data.notes) : []
            if (Array.isArray(parsedNotes)) {
              setNotes(parsedNotes)
            } else if (typeof parsedNotes === 'string') {
              setNotes([{ id: `note-${Date.now()}`, title: "Genel Not", content: parsedNotes, date: new Date().toISOString().split('T')[0] }])
            } else {
              setNotes([])
            }
          } catch {
            if (data.notes) {
              setNotes([{ id: `note-${Date.now()}`, title: "Genel Not", content: data.notes, date: new Date().toISOString().split('T')[0] }])
            } else {
              setNotes([])
            }
          }
        } else {
          toast.error("Müşteri bilgileri yüklenemedi");
          router.push('/admin/customers');
        }
      } catch (error) {
        console.error('Error fetching customer:', error);
        toast.error("Müşteri bilgileri yüklenemedi");
        router.push('/admin/customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id, router]);

  useEffect(() => {
    const fetchActivityCodes = async () => {
      try {
        const res = await fetch('/api/activity-codes')
        if (res.ok) {
          const data = await res.json() as { codes: Array<{ id: string; name: string }> }
          setActivityCodeOptions(data.codes || [])
        }
      } catch {}
    }
    fetchActivityCodes()
  }, [])

  useEffect(() => {
    const loadTaxOffices = async () => {
      try {
        const res = await fetch('/api/tax-offices', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json() as { taxOffices: Array<{ id: string; name: string; city?: string | null; district?: string | null }> }
          setTaxOffices(data.taxOffices || [])
        }
      } catch {}
    }
    loadTaxOffices()
  }, [])
  
  // Listen for close-all-dialogs event
  
  
  const patchCustomer = async (body: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/customers?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success("Kaydedildi");
      } else {
        toast.error("Kaydetme başarısız");
      }
    } catch {
      toast.error("Kaydetme hatası");
    } finally {
      setSaving(false);
    }
  };

  

  const saveBranches = async () => {
    await patchCustomer({ branches: JSON.stringify(branches) });
  };

  const saveDocuments = async () => {
    await patchCustomer({ documents: JSON.stringify(documents) });
  };

  const saveNotes = async () => {
    await patchCustomer({ notes: JSON.stringify(notes) });
  };

  const handleCancel = () => {
    router.push('/admin/customers')
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setLogo(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogo("");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link 
          href="/admin/customers" 
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          onClick={() => {
            // Dispatch event to close any open dialogs across the app
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('close-all-dialogs'));
            }
            
            // Use setTimeout to ensure DOM cleanup before navigation
            setTimeout(() => {
              router.push('/admin/customers');
            }, 80);
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Müşteri Listesine Dön
        </Link>
        <h1 className="text-3xl font-bold">Müşteri Detayları</h1>
        <p className="text-muted-foreground mt-2">
          {customer?.companyName || "Müşteri"} bilgilerini görüntüleyin ve düzenleyin
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Collapsible open={openCompany} onOpenChange={setOpenCompany}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="flex items-center justify-between cursor-pointer">
                <CardTitle>Firma bilgileri</CardTitle>
                <ChevronDown className={`h-4 w-4 transition-transform ${openCompany ? 'rotate-180' : ''}`} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-1">
                    <Label>Logo</Label>
                    <div className="mt-2">
                  {logo ? (
                    <div className="relative">
                      <div className="relative w-full aspect-square border rounded overflow-hidden">
                        <Image src={logo} alt="Company Logo" fill className="object-contain p-1" />
                      </div>
                      <Button type="button" variant="ghost" size="sm" className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 text-white rounded-full" onClick={removeLogo}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mt-1 text-center">Logo Yükle</p>
                    </div>
                  )}
                  <div className="mt-2">
                    <Input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" />
                    <Label htmlFor="logo-upload">
                      <Button type="button" variant="outline" size="sm" className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Seç
                      </Button>
                    </Label>
                  </div>
                </div>
              </div>
              <div className="md:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <Label>Şirket Ünvanı</Label>
                    <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="ABC Ltd. Şti." />
                  </div>
                  <div>
                    <Label>VKN/TCKN</Label>
                    <Input value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} placeholder="1234567890" maxLength={11} />
                  </div>
                  <div>
                    <Label>Vergi Dairesi</Label>
                    <TaxOfficeCombobox value={taxOffice} onValueChange={setTaxOffice} taxOffices={taxOffices} placeholder="Vergi dairesi seçin..." searchPlaceholder="Vergi dairesi ara..." emptyMessage="Vergi dairesi bulunamadı." minCharsToSearch={0} />
                  </div>
                  <div>
                    <Label>Telefon</Label>
                    <PhoneInput value={phone} onChange={setPhone} placeholder="(5__) ___ __ __" />
                  </div>
                  <div>
                    <Label>E-posta</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="info@firma.com" />
                  </div>
                  <div>
                    <Label>Defter Tipi</Label>
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
                <div className="mt-6">
                  <Label>Adres</Label>
                  <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Mahalle, sokak, bina no, daire no, ilçe, il" rows={3} className="min-h-[80px]" />
                </div>
               
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <Label>Aidat</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">₺</span>
                  <Input value={subscriptionFee} onChange={(e) => setSubscriptionFee(e.target.value)} placeholder="5.000" className="pl-8" />
                </div>
              </div>
              <div>
                <Label>Şirket Kuruluş Tarihi</Label>
                <Input type="date" value={establishmentDate} onChange={(e) => setEstablishmentDate(e.target.value)} />
              </div>
              <div>
                <Label>Ana Faaliyet Kodu</Label>
                <TaxOfficeCombobox id="mainActivityCode" value={mainActivityCode} onValueChange={setMainActivityCode} taxOffices={activityCodeOptions} placeholder="Ana faaliyet kodu seçin..." searchPlaceholder="Faaliyet kodu ara..." emptyMessage="Kod bulunamadı." allowCustom />
              </div>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Label>Sigortalı Çalışan</Label>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <input type="radio" id="hasEmployeesYes" name="hasEmployees" checked={hasEmployees === true} onChange={() => setHasEmployees(true)} className="h-4 w-4 text-blue-600" />
                      <Label htmlFor="hasEmployeesYes" className="cursor-pointer">Var</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="radio" id="hasEmployeesNo" name="hasEmployees" checked={hasEmployees === false} onChange={() => setHasEmployees(false)} className="h-4 w-4 text-blue-600" />
                      <Label htmlFor="hasEmployeesNo" className="cursor-pointer">Yok</Label>
                    </div>
                  </div>
                </div>
                {hasEmployees && (
                  <div className="flex-1">
                    <Label htmlFor="employeeCount">Sigortalı Sayısı</Label>
                    <Input id="employeeCount" type="number" value={employeeCount ?? ""} onChange={(e) => setEmployeeCount(e.target.value ? parseInt(e.target.value, 10) : null)} placeholder="0" min="0" />
                  </div>
                )}
              </div>
              <div>
                <Label>Durum</Label>
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
                <Label>Müşteri Aşaması</Label>
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
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <div>
                    <Label>Facebook</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Facebook className="h-4 w-4 text-muted-foreground" /></div>
                      <Input value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/..." className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <Label>X (Twitter)</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Twitter className="h-4 w-4 text-muted-foreground" /></div>
                      <Input value={xUrl} onChange={(e) => setXUrl(e.target.value)} placeholder="https://x.com/..." className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <Label>LinkedIn</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Linkedin className="h-4 w-4 text-muted-foreground" /></div>
                      <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/..." className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <Label>Instagram</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Instagram className="h-4 w-4 text-muted-foreground" /></div>
                      <Input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/..." className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <Label>Nsosyal</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MessageSquare className="h-4 w-4 text-muted-foreground" /></div>
                      <Input value={threadsUrl} onChange={(e) => setThreadsUrl(e.target.value)} placeholder="https://threads.net/..." className="pl-10" />
                    </div>
                  </div>
                </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={handleCancel} disabled={saving}>İptal</Button>
                <Button onClick={() => patchCustomer({ logo, companyName, taxNumber, taxOffice, phone, email, address, ledgerType, hasEmployees, employeeCount, subscriptionFee, establishmentDate, mainActivityCode, status, onboardingStage, facebookUrl, xUrl, linkedinUrl, instagramUrl, threadsUrl })} disabled={saving || !companyName.trim()} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        

        <Collapsible open={openAuthorized} onOpenChange={setOpenAuthorized}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="flex items-center justify-between cursor-pointer">
                <CardTitle>Yetkili Bilgileri</CardTitle>
                <ChevronDown className={`h-4 w-4 transition-transform ${openAuthorized ? 'rotate-180' : ''}`} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Ad Soyad</Label>
                    <Input value={authorizedName} onChange={(e) => setAuthorizedName(e.target.value)} placeholder="Ad Soyad" />
              </div>
              <div>
                <Label>TCKN</Label>
                <Input value={authorizedTCKN} onChange={(e) => setAuthorizedTCKN(e.target.value)} placeholder="12345678901" maxLength={11} />
              </div>
              <div>
                <Label>E-posta</Label>
                <Input type="email" value={authorizedEmail} onChange={(e) => setAuthorizedEmail(e.target.value)} placeholder="email" />
              </div>
              <div>
                <Label>Telefon</Label>
                <PhoneInput value={authorizedPhone} onChange={setAuthorizedPhone} placeholder="(5__) ___ __ __" />
              </div>
              <div className="md:col-span-2">
                <Label>Adres</Label>
                <Textarea value={authorizedAddress} onChange={(e) => setAuthorizedAddress(e.target.value)} rows={3} />
              </div>
              <div>
                <Label>Yetki Belgesi Tarihi</Label>
                <Input type="date" value={authorizationDate} onChange={(e) => setAuthorizationDate(e.target.value)} />
              </div>
              <div>
                <Label>Yetki Belgesi Süresi (Ay)</Label>
                <Input type="number" value={authorizationPeriod} onChange={(e) => setAuthorizationPeriod(e.target.value)} placeholder="12" min="1" />
              </div>
            </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={handleCancel} disabled={saving}>İptal</Button>
                <Button onClick={() => patchCustomer({ authorizedName, authorizedTCKN, authorizedEmail, authorizedPhone, authorizedAddress, authorizationDate, authorizationPeriod, authorizedFacebookUrl, authorizedXUrl, authorizedLinkedinUrl, authorizedInstagramUrl, authorizedThreadsUrl })} disabled={saving} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        

        <Collapsible open={openBranches} onOpenChange={setOpenBranches}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="flex items-center justify-between cursor-pointer">
                <CardTitle>Şubeler</CardTitle>
                <ChevronDown className={`h-4 w-4 transition-transform ${openBranches ? 'rotate-180' : ''}`} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label>Şube Adı</Label>
                <Input value={branchForm.name} onChange={(e) => setBranchForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Şube adı" />
              </div>
              <div>
                <Label>Açılış Tarihi</Label>
                <Input type="date" value={branchForm.openingDate} onChange={(e) => setBranchForm(prev => ({ ...prev, openingDate: e.target.value }))} />
              </div>
              <div>
                <Label>Kapanış Tarihi</Label>
                <Input type="date" value={branchForm.closingDate} onChange={(e) => setBranchForm(prev => ({ ...prev, closingDate: e.target.value }))} />
              </div>
              <div>
                <Label>Faaliyet Kodu</Label>
                <Input value={branchForm.activityCode} onChange={(e) => setBranchForm(prev => ({ ...prev, activityCode: e.target.value }))} placeholder="NACE / faaliyet kodu" />
              </div>
              <div>
                <Label>İl</Label>
                <Select value={branchForm.city || ""} onValueChange={(v) => setBranchForm(prev => ({ ...prev, city: v, district: "" }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cityOptions.map(c => (<SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>İlçe</Label>
                <Select value={branchForm.district || ""} onValueChange={(v) => setBranchForm(prev => ({ ...prev, district: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {districtOptions.map(d => (<SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-3">
                <Label>Adres</Label>
                <Textarea value={branchForm.address} onChange={(e) => setBranchForm(prev => ({ ...prev, address: e.target.value }))} placeholder="Adres" rows={3} />
              </div>
            </div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mt-4">
              <div className="flex flex-wrap items-center gap-3">
                <Label>Filtre</Label>
                <Input value={branchFilter} onChange={(e) => { setBranchFilter(e.target.value); setBranchPage(1) }} placeholder="Şube adı, adres, il/ilçe" className="w-full sm:w-64" />
                <Label>Sayfa Boyutu</Label>
                <Select value={String(branchPageSize)} onValueChange={(v) => { setBranchPageSize(parseInt(v)); setBranchPage(1) }}>
                  <SelectTrigger className="w-full sm:w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setBranchEditingId(null); setBranchForm({ name: "", openingDate: "", closingDate: "", activityCode: "", city: "", district: "", address: "" }) }} disabled={!branchEditingId}>Temizle</Button>
                <Button variant="outline" onClick={() => {
                if (!branchForm.name || !branchForm.address) return
                if (branchEditingId) {
                  setBranches(prev => prev.map(b => b.id === branchEditingId ? { ...b, ...branchForm } : b))
                  setBranchEditingId(null)
                } else {
                  const item = { id: `branch-${Date.now()}`, ...branchForm }
                  setBranches(prev => [...prev, item])
                }
                setBranchForm({ name: "", openingDate: "", closingDate: "", activityCode: "", city: "", district: "", address: "" })
              }}>{branchEditingId ? "Güncelle" : "Ekle"}</Button>
              </div>
            </div>
            <div className="rounded-md border mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Şube Adı</TableHead>
                    <TableHead>Adres</TableHead>
                    <TableHead>İl</TableHead>
                    <TableHead>İlçe</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.filter(b => {
                    const q = branchFilter.toLowerCase()
                    if (!q) return true
                    return (b.name || "").toLowerCase().includes(q) || (b.address || "").toLowerCase().includes(q) || (b.city || "").toLowerCase().includes(q) || (b.district || "").toLowerCase().includes(q)
                  }).slice((branchPage - 1) * branchPageSize, (branchPage - 1) * branchPageSize + branchPageSize).map(b => (
                    <TableRow key={b.id} onClick={() => { setBranchEditingId(b.id); setBranchForm({ name: b.name || "", openingDate: b.openingDate || "", closingDate: b.closingDate || "", activityCode: b.activityCode || "", city: b.city || "", district: b.district || "", address: b.address || "" }) }} className="cursor-pointer">
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell>{b.address}</TableCell>
                      <TableCell>{b.city || ""}</TableCell>
                      <TableCell>{b.district || ""}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); setBranches(prev => prev.filter(x => x.id !== b.id)) }} title="Sil">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row items-start sm:items-center justify-between mt-4">
              {(() => {
                const filtered = branches.filter(b => {
                  const q = branchFilter.toLowerCase()
                  if (!q) return true
                  return (b.name || "").toLowerCase().includes(q) || (b.address || "").toLowerCase().includes(q) || (b.city || "").toLowerCase().includes(q) || (b.district || "").toLowerCase().includes(q)
                })
                const total = filtered.length
                const totalPages = Math.ceil(total / branchPageSize)
                const start = (branchPage - 1) * branchPageSize
                const end = Math.min(start + branchPageSize, total)
                return (
                  <>
                    <div className="text-sm text-muted-foreground">Toplam {total} kayıttan {start + 1}-{end} arası gösteriliyor</div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setBranchPage(p => Math.max(1, p - 1))} disabled={branchPage === 1}>Önceki</Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button key={page} variant={branchPage === page ? "default" : "outline"} size="sm" className="w-8" onClick={() => setBranchPage(page)}>
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setBranchPage(p => Math.min(totalPages, p + 1))} disabled={branchPage === totalPages}>Sonraki</Button>
                    </div>
                  </>
                )
              })()}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <Label>Facebook</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Facebook className="h-4 w-4 text-muted-foreground" /></div>
                    <Input value={authorizedFacebookUrl} onChange={(e) => setAuthorizedFacebookUrl(e.target.value)} placeholder="https://facebook.com/..." className="pl-10" />
                  </div>
                </div>
                  <div>
                    <Label>X (Twitter)</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Twitter className="h-4 w-4 text-muted-foreground" /></div>
                      <Input value={authorizedXUrl} onChange={(e) => setAuthorizedXUrl(e.target.value)} placeholder="https://x.com/..." className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <Label>LinkedIn</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Linkedin className="h-4 w-4 text-muted-foreground" /></div>
                      <Input value={authorizedLinkedinUrl} onChange={(e) => setAuthorizedLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/..." className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <Label>Instagram</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Instagram className="h-4 w-4 text-muted-foreground" /></div>
                      <Input value={authorizedInstagramUrl} onChange={(e) => setAuthorizedInstagramUrl(e.target.value)} placeholder="https://instagram.com/..." className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <Label>Threads</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MessageSquare className="h-4 w-4 text-muted-foreground" /></div>
                      <Input value={authorizedThreadsUrl} onChange={(e) => setAuthorizedThreadsUrl(e.target.value)} placeholder="https://threads.net/..." className="pl-10" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <Label>Filtre</Label>
                    <Input value={authorizedFilter} onChange={(e) => { setAuthorizedFilter(e.target.value); setAuthorizedPage(1) }} placeholder="Ad, e-posta veya telefon" className="w-full sm:w-64" />
                    <Label>Sayfa Boyutu</Label>
                    <Select value={String(authorizedPageSize)} onValueChange={(v) => { setAuthorizedPageSize(parseInt(v)); setAuthorizedPage(1) }}>
                      <SelectTrigger className="w-full sm:w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="rounded-md border mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ad Soyad</TableHead>
                        <TableHead>E-posta</TableHead>
                        <TableHead>Telefon</TableHead>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Süre (Ay)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {authorizedPersons.filter(p => {
                        const q = authorizedFilter.toLowerCase()
                        if (!q) return true
                        return (p.name || '').toLowerCase().includes(q) || (p.email || '').toLowerCase().includes(q) || (p.phone || '').toLowerCase().includes(q)
                      }).slice((authorizedPage - 1) * authorizedPageSize, (authorizedPage - 1) * authorizedPageSize + authorizedPageSize).map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell>{p.email}</TableCell>
                          <TableCell>{p.phone}</TableCell>
                          <TableCell>{p.authorizationDate}</TableCell>
                          <TableCell>{p.authorizationPeriod}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row items-start sm:items-center justify-between mt-4">
                  {(() => {
                    const filtered = authorizedPersons.filter(p => {
                      const q = authorizedFilter.toLowerCase()
                      if (!q) return true
                      return (p.name || '').toLowerCase().includes(q) || (p.email || '').toLowerCase().includes(q) || (p.phone || '').toLowerCase().includes(q)
                    })
                    const total = filtered.length
                    const totalPages = Math.ceil(total / authorizedPageSize)
                    const start = (authorizedPage - 1) * authorizedPageSize
                    const end = Math.min(start + authorizedPageSize, total)
                    return (
                      <>
                        <div className="text-sm text-muted-foreground">Toplam {total} kayıttan {start + 1}-{end} arası gösteriliyor</div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setAuthorizedPage(p => Math.max(1, p - 1))} disabled={authorizedPage === 1}>Önceki</Button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <Button key={page} variant={authorizedPage === page ? "default" : "outline"} size="sm" className="w-8" onClick={() => setAuthorizedPage(page)}>
                                {page}
                              </Button>
                            ))}
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setAuthorizedPage(p => Math.min(totalPages, p + 1))} disabled={authorizedPage === totalPages}>Sonraki</Button>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={handleCancel} disabled={saving}>İptal</Button>
                  <Button onClick={saveBranches} disabled={saving} className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <Collapsible open={openFiles} onOpenChange={setOpenFiles}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="flex items-center justify-between cursor-pointer">
                <CardTitle>Dosyalar</CardTitle>
                <ChevronDown className={`h-4 w-4 transition-transform ${openFiles ? 'rotate-180' : ''}`} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <DocumentsTable documents={documents} onUpdate={(d) => setDocuments(d)} />
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={handleCancel} disabled={saving}>İptal</Button>
                  <Button onClick={saveDocuments} disabled={saving} className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <Collapsible open={openNotes} onOpenChange={setOpenNotes}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="flex items-center justify-between cursor-pointer">
                <CardTitle>Notlar</CardTitle>
                <ChevronDown className={`h-4 w-4 transition-transform ${openNotes ? 'rotate-180' : ''}`} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label>Not Başlığı</Label>
                <Input value={noteForm.title} onChange={(e) => setNoteForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Başlık" />
              </div>
              <div className="md:col-span-2">
                <Label>Not İçeriği</Label>
                <Textarea value={noteForm.content} onChange={(e) => setNoteForm(prev => ({ ...prev, content: e.target.value }))} placeholder="Not" rows={4} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => { setNoteEditingId(null); setNoteForm({ title: "", content: "" }) }} disabled={!noteEditingId}>Temizle</Button>
              <Button variant="outline" onClick={() => {
                if (!noteForm.title || !noteForm.content) return
                if (noteEditingId) {
                  setNotes(prev => prev.map(n => n.id === noteEditingId ? { ...n, title: noteForm.title, content: noteForm.content } : n))
                  setNoteEditingId(null)
                } else {
                  const item = { id: `note-${Date.now()}`, title: noteForm.title, content: noteForm.content, date: new Date().toISOString().split('T')[0] }
                  setNotes(prev => [...prev, item])
                }
                setNoteForm({ title: "", content: "" })
              }}>{noteEditingId ? "Güncelle" : "Ekle"}</Button>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mt-4">
              <div className="flex flex-wrap items-center gap-3">
                <Label>Filtre</Label>
                <Input value={noteFilter} onChange={(e) => { setNoteFilter(e.target.value); setNotePage(1) }} placeholder="Başlık veya içerik" className="w-full sm:w-64" />
                <Label>Sayfa Boyutu</Label>
                <Select value={String(notePageSize)} onValueChange={(v) => { setNotePageSize(parseInt(v)); setNotePage(1) }}>
                  <SelectTrigger className="w-full sm:w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="rounded-md border mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Başlık</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notes.filter(n => {
                    const q = noteFilter.toLowerCase()
                    if (!q) return true
                    return (n.title || "").toLowerCase().includes(q) || (n.content || "").toLowerCase().includes(q)
                  }).slice((notePage - 1) * notePageSize, (notePage - 1) * notePageSize + notePageSize).map(n => (
                    <TableRow key={n.id} onClick={() => { setNoteEditingId(n.id); setNoteForm({ title: n.title || "", content: n.content || "" }) }} className="cursor-pointer">
                      <TableCell className="font-medium">{n.title}</TableCell>
                      <TableCell>{n.date}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); setNotes(prev => prev.filter(x => x.id !== n.id)) }} title="Sil">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row items-start sm:items-center justify-between mt-4">
              {(() => {
                const filtered = notes.filter(n => {
                  const q = noteFilter.toLowerCase()
                  if (!q) return true
                  return (n.title || "").toLowerCase().includes(q) || (n.content || "").toLowerCase().includes(q)
                })
                const total = filtered.length
                const totalPages = Math.ceil(total / notePageSize)
                const start = (notePage - 1) * notePageSize
                const end = Math.min(start + notePageSize, total)
                return (
                  <>
                    <div className="text-sm text-muted-foreground">Toplam {total} kayıttan {start + 1}-{end} arası gösteriliyor</div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setNotePage(p => Math.max(1, p - 1))} disabled={notePage === 1}>Önceki</Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button key={page} variant={notePage === page ? "default" : "outline"} size="sm" className="w-8" onClick={() => setNotePage(page)}>
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setNotePage(p => Math.min(totalPages, p + 1))} disabled={notePage === totalPages}>Sonraki</Button>
                    </div>
                  </>
                )
              })()}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handleCancel} disabled={saving}>İptal</Button>
              <Button onClick={saveNotes} disabled={saving} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <Collapsible open={openDeclarations} onOpenChange={setOpenDeclarations}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="flex items-center justify-between cursor-pointer">
                <CardTitle>Beyanname Ayarları</CardTitle>
                <ChevronDown className={`h-4 w-4 transition-transform ${openDeclarations ? 'rotate-180' : ''}`} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <DeclarationSettings settings={declarationSettings} customerId={id} establishmentDate={establishmentDate} onUpdate={(s: DeclarationSetting[]) => { setDeclarationSettings(s); patchCustomer({ declarationSettings: JSON.stringify(s) }) }} />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      
    </div>
  );
}
