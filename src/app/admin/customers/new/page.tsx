"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { TaxOfficeCombobox } from "@/components/ui/tax-office-combobox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import Image from "next/image";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Edit3, Trash2, Eye } from "lucide-react";


export default function NewCustomerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [createdCustomerId, setCreatedCustomerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("company");
  
  // Company Information
  const [logo, setLogo] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState<"PERSONAL" | "CAPITAL">("PERSONAL");
  const [personalTaxNumber, setPersonalTaxNumber] = useState(""); // For TCKN
  const [corporateTaxNumber, setCorporateTaxNumber] = useState(""); // For VKN
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
  const [employeeCount, setEmployeeCount] = useState<number | null>(null); // New field
  const [subscriptionFee, setSubscriptionFee] = useState("");
  const [establishmentDate, setEstablishmentDate] = useState("");
  const [mainActivityCode, setMainActivityCode] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [onboardingStage, setOnboardingStage] = useState("LEAD");
  
  // Authorized Person
  
  const [authorizedFacebookUrl, setAuthorizedFacebookUrl] = useState("");
  const [authorizedXUrl, setAuthorizedXUrl] = useState("");
  const [authorizedLinkedinUrl, setAuthorizedLinkedinUrl] = useState("");
  const [authorizedInstagramUrl, setAuthorizedInstagramUrl] = useState("");
  const [authorizedThreadsUrl, setAuthorizedThreadsUrl] = useState("");
  
  const [authorizedPersons, setAuthorizedPersons] = useState<Array<{ id: string; name: string; tckn: string; email: string; phone: string; address: string; authorizationDate: string; authorizationPeriod: string }>>([]);
  const [authorizedForm, setAuthorizedForm] = useState<{ name: string; tckn: string; email: string; phone: string; address: string; authorizationDate: string; authorizationPeriod: string }>({ name: "", tckn: "", email: "", phone: "", address: "", authorizationDate: "", authorizationPeriod: "" });
  const [authorizedEditingId, setAuthorizedEditingId] = useState<string | null>(null)
  const [authorizedFilter, setAuthorizedFilter] = useState("")
  const [authorizedPage, setAuthorizedPage] = useState(1)
  const [authorizedPageSize, setAuthorizedPageSize] = useState(5)
  
  // Declarations
  const [declarations] = useState<string[]>([]);
  
  // Notes
  const [notes, setNotes] = useState<Array<{ id: string; title: string; content: string; date: string }>>([])
  const [noteForm, setNoteForm] = useState<{ title: string; content: string }>({ title: "", content: "" })
  const [noteFilter, setNoteFilter] = useState("")
  const [notePage, setNotePage] = useState(1)
  const [notePageSize, setNotePageSize] = useState(5)
  const [noteEditingId, setNoteEditingId] = useState<string | null>(null)
  
  // Documents
  const [documents, setDocuments] = useState<Array<{id: string, name: string, file: string, uploadDate: string}>>([]);
  const [docForm, setDocForm] = useState<{ name: string; file: string }>({ name: "", file: "" })
  const [docEditingId, setDocEditingId] = useState<string | null>(null)
  const [docFilter, setDocFilter] = useState("")
  const [docPage, setDocPage] = useState(1)
  const [docPageSize, setDocPageSize] = useState(5)
  const [chambers, setChambers] = useState<Array<{ id: string; chamber: string; registryNo: string; membershipDate: string; membershipEndDate: string; status: 'ACTIVE' | 'PASSIVE' }>>([])
  const [chamberForm, setChamberForm] = useState<{ chamber: string; registryNo: string; membershipDate: string; membershipEndDate: string; status: 'ACTIVE' | 'PASSIVE' }>({ chamber: "", registryNo: "", membershipDate: "", membershipEndDate: "", status: "ACTIVE" })
  const [chamberEditingId, setChamberEditingId] = useState<string | null>(null)
  const [chamberFilter, setChamberFilter] = useState("")
  const [chamberPage, setChamberPage] = useState(1)
  const [chamberPageSize, setChamberPageSize] = useState(5)
  
  // Tax offices
  const [taxOffices, setTaxOffices] = useState<Array<{id: string, name: string, city?: string | null, district?: string | null}>>([]);
  const [companyCity, setCompanyCity] = useState<string>("");
  const [companyDistrict, setCompanyDistrict] = useState<string>("");
  const [branches, setBranches] = useState<Array<{ id: string; name: string; openingDate?: string; closingDate?: string; activityCode?: string; city?: string; district?: string; address: string }>>([]);
  const [branchForm, setBranchForm] = useState<{ name: string; openingDate?: string; closingDate?: string; activityCode?: string; city?: string; district?: string; address: string }>({ name: "", openingDate: "", closingDate: "", activityCode: "", city: "", district: "", address: "" });
  const [branchEditingId, setBranchEditingId] = useState<string | null>(null)
  const [branchFilter, setBranchFilter] = useState("")
  const [branchPage, setBranchPage] = useState(1)
  const [branchPageSize, setBranchPageSize] = useState(5)
  const [cityOptions, setCityOptions] = useState<Array<{ id: string; name: string }>>([])
  const [districtOptions, setDistrictOptions] = useState<Array<{ id: string; name: string }>>([])
  const [companyDistrictOptions, setCompanyDistrictOptions] = useState<Array<{ id: string; name: string }>>([])
  const [activityCodeOptions, setActivityCodeOptions] = useState<Array<{ id: string; name: string }>>([])
  const [mounted, setMounted] = useState(false)
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [activityCodeSearch, setActivityCodeSearch] = useState("")
  const [activityModalTarget, setActivityModalTarget] = useState<'main' | 'branch' | 'activity'>('main')
  const [activities, setActivities] = useState<Array<{ id: string; branchName: string; activityCode: string; startDate: string; endDate: string; status: 'ACTIVE' | 'PASSIVE' }>>([])
  const [activityForm, setActivityForm] = useState<{ branchName: string; activityCode: string; startDate: string; endDate: string; status: 'ACTIVE' | 'PASSIVE' }>({ branchName: "", activityCode: "", startDate: "", endDate: "", status: 'ACTIVE' })
  const [activityEditingId, setActivityEditingId] = useState<string | null>(null)
  const [activityFilter, setActivityFilter] = useState("")
  const [activityPage, setActivityPage] = useState(1)
  const [activityPageSize, setActivityPageSize] = useState(5)
  
  // Vergi dairelerini DB'den yükle
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

  const companyTaxOfficeOptions = useMemo(() => {
    if (!companyCity) return taxOffices
    const cityName = companyCity.trim().toLowerCase()
    const districtName = (companyDistrict || '').trim().toLowerCase()
    const hasStructuredCity = taxOffices.some(o => !!(o.city || '').trim())
    const hasStructuredDistrict = taxOffices.some(o => !!(o.district || '').trim())
    const filtered = taxOffices.filter(o => {
      const oCity = (o.city || '').trim().toLowerCase()
      const oName = (o.name || '').toLowerCase()
      return hasStructuredCity ? (oCity === cityName) : oName.includes(cityName)
    })
    if (!companyDistrict) return filtered.length ? filtered : taxOffices
    const byDistrict = filtered.filter(o => {
      const oDistrict = (o.district || '').trim().toLowerCase()
      const oName = (o.name || '').toLowerCase()
      return hasStructuredDistrict ? (oDistrict === districtName) : oName.includes(districtName)
    })
    return byDistrict.length ? byDistrict : filtered.length ? filtered : taxOffices
  }, [taxOffices, companyCity, companyDistrict])
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchActivityCodes = async () => {
      try {
        const res = await fetch('/api/activity-codes', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json() as { codes: Array<{ id: string; name: string }> }
          setActivityCodeOptions(data.codes || [])
        }
      } catch {}
    }
    fetchActivityCodes()
  }, [])

  // Şehirleri DB'den yükle
  useEffect(() => {
    const loadCities = async () => {
      try {
        const res = await fetch('/api/cities', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json() as { cities: Array<{ id: string; name: string; code?: string | null }> }
          setCityOptions(data.cities || [])
        }
      } catch {}
    }
    loadCities()
  }, [])

  // İl değişince ilgili ilçeleri yükle
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        if (!branchForm.city) { setDistrictOptions([]); return }
        let cityCode: string | null = null
        try {
          const cres = await fetch(`/api/cities`, { cache: 'no-store' })
          if (cres.ok) {
            const cdata = await cres.json() as { cities: Array<{ id: string; name: string; code?: string | null }> }
            const found = (cdata.cities || []).find(c => (c.name || '').trim() === String(branchForm.city).trim())
            cityCode = String(found?.code || '').trim() || null
          }
        } catch {}
        const url = cityCode
          ? `/api/districts?cityCode=${encodeURIComponent(cityCode)}`
          : `/api/districts?city=${encodeURIComponent(branchForm.city)}`
        const res = await fetch(url, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json() as { districts: Array<{ id: string; name: string }> }
          setDistrictOptions(data.districts || [])
        }
      } catch {}
    }
    loadDistricts()
  }, [branchForm.city])

  // Şirket il değişince şirket ilçelerini yükle
  useEffect(() => {
    const loadCompanyDistricts = async () => {
      try {
        if (!companyCity) { setCompanyDistrictOptions([]); return }
        let cityCode: string | null = null
        try {
          const cres = await fetch(`/api/cities`, { cache: 'no-store' })
          if (cres.ok) {
            const cdata = await cres.json() as { cities: Array<{ id: string; name: string; code?: string | null }> }
            const found = (cdata.cities || []).find(c => (c.name || '').trim() === companyCity.trim())
            cityCode = String(found?.code || '').trim() || null
          }
        } catch {}
        const url = cityCode
          ? `/api/districts?cityCode=${encodeURIComponent(cityCode)}`
          : `/api/districts?city=${encodeURIComponent(companyCity)}`
        const res = await fetch(url, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json() as { districts: Array<{ id: string; name: string }> }
          setCompanyDistrictOptions(data.districts || [])
        }
      } catch {}
    }
    loadCompanyDistricts()
  }, [companyCity])
  
  const handleSaveTab = async () => {
    setSaving(true);
    try {
      const tabsSequence = ["company", "branches", "authorized", "files", "declarations", "notes"] as const
        if (activeTab === "company") {
          const companyData = {
            companyName,
            taxNumber: companyType === "PERSONAL" ? personalTaxNumber : corporateTaxNumber,
            taxOffice,
            phone,
            email,
            websiteUrl,
            address,
            city: companyCity || null,
            district: companyDistrict || null,
            establishmentDate: establishmentDate || null,
            status,
            onboardingStage,
            hasEmployees,
            logo,
            ledgerType,
            subscriptionFee,
            mainActivityCode,
            facebookUrl,
            xUrl,
            linkedinUrl,
            instagramUrl,
            threadsUrl,
          };

        const response = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(companyData),
        });
        if (!response.ok) {
          toast.error("Şirket bilgileri kaydedilemedi");
          return;
        }
        const created = await response.json();
        setCreatedCustomerId(created.id);
        toast.success("Şirket bilgileri kaydedildi");
        {
          const idx = tabsSequence.indexOf("company")
          const next = tabsSequence[idx + 1]
          if (next) setActiveTab(next)
        }
        return;
      }

      if (!createdCustomerId) {
        toast.error("Önce şirket bilgilerini kaydedin");
        return;
      }

      const url = `/api/customers?id=${encodeURIComponent(createdCustomerId)}`;
      let patchBody: Record<string, unknown> = {};

      if (activeTab === "branches") {
        patchBody = { branches: JSON.stringify(branches) };
      } else if (activeTab === "authorized") {
        const firstAuthorized = authorizedPersons[0];
        patchBody = {
          authorizedName: firstAuthorized?.name || "",
          authorizedTCKN: firstAuthorized?.tckn || "",
          authorizedEmail: firstAuthorized?.email || "",
          authorizedPhone: firstAuthorized?.phone || "",
          authorizedAddress: firstAuthorized?.address || "",
          authorizationDate: firstAuthorized?.authorizationDate || null,
          authorizationPeriod: firstAuthorized?.authorizationPeriod || "",
          authorizationEndDate: computeAuthorizationEndDate(firstAuthorized?.authorizationDate || "", firstAuthorized?.authorizationPeriod || "") || null,
          authorizedFacebookUrl,
          authorizedXUrl,
          authorizedLinkedinUrl,
          authorizedInstagramUrl,
          authorizedThreadsUrl,
        };
      } else if (activeTab === "files") {
        patchBody = { documents: JSON.stringify(documents) };
      } else if (activeTab === "declarations") {
        patchBody = { declarations: JSON.stringify(declarations) };
      } else if (activeTab === "notes") {
        patchBody = { notes: JSON.stringify(notes) };
      }

      const resp = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchBody),
      });
      if (!resp.ok) {
        toast.error("Sekme kaydedilemedi");
        return;
      }
      toast.success("Sekme kaydedildi");
      {
        const idx = tabsSequence.indexOf(activeTab as typeof tabsSequence[number])
        const next = tabsSequence[idx + 1]
        if (next) setActiveTab(next)
      }
    } catch (error) {
      console.error('Error saving tab:', error);
      toast.error("Kaydetme hatası");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/customers');
  };
  
  const logoInputRef = useRef<HTMLInputElement | null>(null)

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

  const addAuthorizedPerson = () => {
    if (!authorizedForm.name || !authorizedForm.tckn) return;
    if (authorizedEditingId) {
      setAuthorizedPersons(prev => prev.map(p => p.id === authorizedEditingId ? { ...p, ...authorizedForm } : p))
      setAuthorizedEditingId(null)
    } else {
      const newItem = { id: `temp-${Date.now()}`, ...authorizedForm };
      setAuthorizedPersons(prev => [newItem, ...prev]);
      setAuthorizedPage(1)
    }
    setAuthorizedFilter("")
    setAuthorizedForm({ name: "", tckn: "", email: "", phone: "", address: "", authorizationDate: "", authorizationPeriod: "" });
  };

  const removeAuthorizedPerson = (id: string) => {
    setAuthorizedPersons(prev => prev.filter(p => p.id !== id));
  };

  const addBranch = () => {
    if (!branchForm.name || !branchForm.address) return;
    if (branchEditingId) {
      setBranches(prev => prev.map(b => b.id === branchEditingId ? { ...b, ...branchForm } : b))
      setBranchEditingId(null)
    } else {
      const newBranch = { id: `temp-${Date.now()}`, ...branchForm };
      setBranches(prev => [...prev, newBranch]);
    }
    setBranchForm({ name: "", openingDate: "", closingDate: "", activityCode: "", city: "", district: "", address: "" });
  };

  const removeBranch = (id: string) => {
    setBranches(prev => prev.filter(b => b.id !== id));
  };

  const branchFiltered = branches.filter(b => {
    const q = branchFilter.toLowerCase()
    if (!q) return true
    return (
      (b.name || "").toLowerCase().includes(q) ||
      (b.address || "").toLowerCase().includes(q) ||
      (b.city || "").toLowerCase().includes(q) ||
      (b.district || "").toLowerCase().includes(q)
    )
  })
  const branchTotalPages = Math.max(1, Math.ceil(branchFiltered.length / branchPageSize))
  const branchCurrentPage = Math.min(branchPage, branchTotalPages)
  const branchStart = (branchCurrentPage - 1) * branchPageSize
  const branchPaginated = branchFiltered.slice(branchStart, branchStart + branchPageSize)

  const authorizedFiltered = authorizedPersons.filter(p => {
    const q = authorizedFilter.toLowerCase()
    if (!q) return true
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p.tckn || "").toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q) ||
      (p.phone || "").toLowerCase().includes(q)
    )
  })
  const authorizedTotalPages = Math.max(1, Math.ceil(authorizedFiltered.length / authorizedPageSize))
  const authorizedCurrentPage = Math.min(authorizedPage, authorizedTotalPages)
  const authorizedStart = (authorizedCurrentPage - 1) * authorizedPageSize
  const authorizedPaginated = authorizedFiltered.slice(authorizedStart, authorizedStart + authorizedPageSize)

  const computeAuthorizationEndDate = (start: string, monthsStr: string): string => {
    const m = parseInt(monthsStr, 10)
    if (!start || !m || Number.isNaN(m)) return ""
    const parts = start.split('-').map((x) => parseInt(x, 10))
    const y = parts[0]
    const mo = parts[1]
    const d = parts[2]
    if (!y || !mo || !d) return ""
    const dt = new Date(y, mo - 1, d)
    dt.setMonth(dt.getMonth() + m)
    const yyyy = String(dt.getFullYear())
    const mm = String(dt.getMonth() + 1).padStart(2, '0')
    const dd = String(dt.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/admin/customers" className="flex items-center text-blue-600 hover:text-blue-800 mb-3">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Müşteri Listesine Dön
        </Link>
        <h1 className="text-3xl font-bold">Yeni Müşteri</h1>
        <p className="text-muted-foreground mt-2">
          Yeni müşteri bilgilerini girin
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Müşteri Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          {!mounted && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
                <Skeleton className="h-8 lg:col-span-2" />
                <Skeleton className="h-8 lg:col-span-2" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <Skeleton className="h-24 md:col-span-1" />
                <Skeleton className="h-10 md:col-span-2" />
                <Skeleton className="h-10 md:col-span-2" />
              </div>
            </div>
          )}
          {mounted && (
            <>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4" 
              id="new-customer-tabs">
            <TabsList className="flex flex-wrap w-full gap-2 bg-primary p-2 rounded-lg">
              <TabsTrigger value="company">Şirket Bilgileri</TabsTrigger>
              <TabsTrigger value="chamber">Oda Bilgileri</TabsTrigger>
              <TabsTrigger value="branches">Şube Bilgileri</TabsTrigger>
              <TabsTrigger value="activities">Faaliyet Bilgileri</TabsTrigger>
              <TabsTrigger value="authorized">Yetkili Bilgileri</TabsTrigger>
              <TabsTrigger value="files">Dosyalar</TabsTrigger>
              <TabsTrigger value="declarations">Beyannameler</TabsTrigger>
              <TabsTrigger value="notes">Notlar</TabsTrigger>
            </TabsList>

            {/* Company Information */}
            <TabsContent value="company" className="space-y-4 mt-15 [&_[data-slot=input]]:h-8 [&_[data-slot=input]]:py-1 [&_[data-slot=select-trigger]]:h-8 [&_[data-slot=textarea]]:py-1 [&_[data-slot=textarea]]:min-h-14">
              {/* Logo Upload Area and Company Info in same row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <div className="md:col-span-1">
                  <Label>Logo Yükle</Label>
                  <div className="mt-2">
                    {logo ? (
                      <div className="relative">
                        <div className="relative w-full aspect-square border rounded overflow-hidden">
                          <Image 
                            src={logo} 
                            alt="Company Logo" 
                            fill 
                            className="object-contain p-1" 
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 text-white rounded-full"
                          onClick={removeLogo}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground mt-1 text-center">
                          Logo Yükle
                        </p>
                      </div>
                    )}
                    <div className="mt-2">
                      <Input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => logoInputRef.current?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Seç
                      </Button>
                    </div>
                  </div>
                </div>
                
                    <div className="md:col-span-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <div>
                      <Label htmlFor="companyType">Şirket Türü</Label>
                      <Select value={companyType} onValueChange={(value: "PERSONAL" | "CAPITAL") => setCompanyType(value)}>
                        <SelectTrigger id="companyType">
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PERSONAL">Şahıs Şirketi</SelectItem>
                          <SelectItem value="CAPITAL">Sermaye Şirketi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="companyName" className="text-red-600">Şirket Ünvanı *</Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="ABC Ltd. Şti."
                        required
                      />
                    </div>
                    
                    {/* TCKN Field - only for Şahıs Şirketi */}
                    {companyType === "PERSONAL" && (
                      <div>
                        <Label htmlFor="personalTaxNumber">TCKN</Label>
                        <Input
                          id="personalTaxNumber"
                          value={personalTaxNumber}
                          onChange={(e) => setPersonalTaxNumber(e.target.value)}
                          placeholder="12345678901"
                          maxLength={11}
                        />
                      </div>
                    )}
                    
                    {/* VKN Field - for both company types */}
                    <div>
                      <Label htmlFor="corporateTaxNumber">VKN</Label>
                      <Input
                        id="corporateTaxNumber"
                        value={corporateTaxNumber}
                        onChange={(e) => setCorporateTaxNumber(e.target.value)}
                        placeholder="1234567890"
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyCity">İl</Label>
                      <TaxOfficeCombobox
                        id="companyCity"
                        value={companyCity}
                        onValueChange={(val) => { setCompanyCity(val); setCompanyDistrict("") }}
                        taxOffices={cityOptions}
                        placeholder="İl seçin..."
                        searchPlaceholder="İl ara..."
                        emptyMessage="İl bulunamadı."
                        minCharsToSearch={0}
                        displayMode="name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyDistrict">İlçe</Label>
                      <TaxOfficeCombobox
                        id="companyDistrict"
                        value={companyDistrict}
                        onValueChange={setCompanyDistrict}
                        taxOffices={companyDistrictOptions}
                        placeholder="İlçe seçin..."
                        searchPlaceholder="İlçe ara..."
                        emptyMessage="İlçe bulunamadı."
                        minCharsToSearch={0}
                        displayMode="name"
                      />
                    </div>
                    
                    
                    <div>
                      <Label htmlFor="taxOffice">Vergi Dairesi</Label>
                      <TaxOfficeCombobox
                        id="taxOffice"
                        value={taxOffice}
                        onValueChange={(value) => {
                          setTaxOffice(value)
                        }}
                        taxOffices={companyTaxOfficeOptions}
                        placeholder="Vergi dairesi seçin..."
                        searchPlaceholder="Vergi dairesi ara..."
                        emptyMessage="Vergi dairesi bulunamadı."
                        minCharsToSearch={0}
                      />
                    </div>
                    <div className="md:col-span-4">
                      <Label htmlFor="mainActivityCode">Ana Faaliyet Kodu</Label>
                      <div className="flex flex-col md:flex-row gap-2">
                        <Textarea
                          id="mainActivityCode"
                          value={mainActivityCode}
                          onChange={(e) => setMainActivityCode(e.target.value)}
                          placeholder="62.01 - Bilgisayar programlama faaliyetleri"
                          className="flex-1 min-h-[64px]"
                          rows={3}
                        />
                    <Button type="button" variant="outline" className="w-full md:w-auto" onClick={() => { setActivityModalTarget('main'); setIsActivityModalOpen(true) }}>
                      <Search className="h-4 w-4 mr-2" />
                      Seç
                    </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Telefon</Label>
                      <PhoneInput
                        id="phone"
                        value={phone}
                        onChange={setPhone}
                        placeholder="(5__) ___ __ __"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="email">E-posta</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="info@firma.com"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="websiteUrl">Web Adresi</Label>
                      <Input
                        id="websiteUrl"
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://firma.com"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="ledgerType">Defter Tipi</Label>
                      <Select value={ledgerType} onValueChange={setLedgerType}>
                        <SelectTrigger id="ledgerType">
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
                  
                  {/* Address field moved to the right of the logo */}
                  <div className="mt-6">
                    <Label htmlFor="address">Adres</Label>
                    <Textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Mahalle, sokak, bina no, daire no, ilçe, il"
                      rows={3}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </div>
              

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="subscriptionFee">Aidat</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">₺</span>
                    <Input
                      id="subscriptionFee"
                      value={subscriptionFee}
                      onChange={(e) => setSubscriptionFee(e.target.value)}
                      placeholder="5.000"
                      className="pl-8"
                    />
                  </div>
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
                
                
                
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                      <div className="flex-1">
                        <Label htmlFor="hasEmployees">Sigortalı Çalışan</Label>
                        <div className="flex flex-wrap gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              id="hasEmployeesYes"
                              name="hasEmployees"
                              checked={hasEmployees === true}
                              onChange={() => setHasEmployees(true)}
                              className="h-4 w-4 text-blue-600"
                            />
                            <Label htmlFor="hasEmployeesYes" className="cursor-pointer">Var</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              id="hasEmployeesNo"
                              name="hasEmployees"
                              checked={hasEmployees === false}
                              onChange={() => setHasEmployees(false)}
                              className="h-4 w-4 text-blue-600"
                            />
                            <Label htmlFor="hasEmployeesNo" className="cursor-pointer">Yok</Label>
                          </div>
                        </div>
                      </div>
                      {hasEmployees && (
                        <div className="flex-1">
                          <Label htmlFor="employeeCount">Sigortalı Sayısı</Label>
                          <Input
                            id="employeeCount"
                            type="number"
                            value={employeeCount || ""}
                            onChange={(e) => setEmployeeCount(e.target.value ? parseInt(e.target.value) : null)}
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      )}
                    </div>
                
                <div>
                  <Label htmlFor="status">Durum</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
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
                    <SelectTrigger id="onboardingStage">
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
              <hr className="my-4" />
              <div>
                <h3 className="text-base font-medium mb-3">Firma Sosyal Medya Hesapları</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="facebookUrl">Facebook</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Facebook className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="facebookUrl"
                        value={facebookUrl}
                        onChange={(e) => setFacebookUrl(e.target.value)}
                        placeholder="https://facebook.com/..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="xUrl">X (Twitter)</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Twitter className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="xUrl"
                        value={xUrl}
                        onChange={(e) => setXUrl(e.target.value)}
                        placeholder="https://x.com/..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="linkedinUrl">LinkedIn</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Linkedin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="linkedinUrl"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="instagramUrl">Instagram</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Instagram className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="instagramUrl"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        placeholder="https://instagram.com/..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="threadsUrl">Nsosyal</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="threadsUrl"
                        value={threadsUrl}
                        onChange={(e) => setThreadsUrl(e.target.value)}
                        placeholder="https://threads.net/..."
                        className="pl-10"
                      />
                    </div>
                  
                  </div>

                </div>
              </div>
              <hr className="my-4" />
          </TabsContent>

            <TabsContent value="chamber" className="space-y-4 mt-5 [&_[data-slot=input]]:h-8 [&_[data-slot=input]]:py-1 [&_[data-slot=select-trigger]]:h-8 [&_[data-slot=textarea]]:py-1 [&_[data-slot=textarea]]:min-h-14">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <div className="md:col-span-2">
                  <Label htmlFor="chamberName">Meslek Odası</Label>
                  <Input
                    id="chamberName"
                    value={chamberForm.chamber}
                    onChange={(e) => setChamberForm(prev => ({ ...prev, chamber: e.target.value }))}
                    placeholder="Örneğin: İSMMMO"
                  />
                </div>
                <div>
                  <Label htmlFor="registryNo">Sicil No</Label>
                  <Input
                    id="registryNo"
                    value={chamberForm.registryNo}
                    onChange={(e) => setChamberForm(prev => ({ ...prev, registryNo: e.target.value }))}
                    placeholder="123456"
                  />
                </div>
                <div>
                  <Label htmlFor="membershipDate">Üyelik Tarihi</Label>
                  <Input
                    id="membershipDate"
                    type="date"
                    value={chamberForm.membershipDate}
                    onChange={(e) => setChamberForm(prev => ({ ...prev, membershipDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="membershipEndDate">Üyelik Bitiş Tarihi</Label>
                  <Input
                    id="membershipEndDate"
                    type="date"
                    value={chamberForm.membershipEndDate}
                    onChange={(e) => {
                      const v = e.target.value
                      if (chamberForm.membershipDate && v && v < chamberForm.membershipDate) {
                        toast.error('Bitiş tarihi üyelik tarihinden önce olamaz')
                        return
                      }
                      const t = new Date()
                      const yyyy = String(t.getFullYear())
                      const mm = String(t.getMonth() + 1).padStart(2, '0')
                      const dd = String(t.getDate()).padStart(2, '0')
                      const todayStr = `${yyyy}-${mm}-${dd}`
                      const st = v && v <= todayStr ? 'PASSIVE' : 'ACTIVE'
                      setChamberForm(prev => ({ ...prev, membershipEndDate: v, status: st }))
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="chamberStatus">Durum</Label>
                  <Select value={chamberForm.status} onValueChange={(v: 'ACTIVE' | 'PASSIVE') => setChamberForm(prev => ({ ...prev, status: v }))}>
                    <SelectTrigger id="chamberStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Aktif</SelectItem>
                      <SelectItem value="PASSIVE">Pasif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Label>Filtre</Label>
                  <Input value={chamberFilter} onChange={(e) => { setChamberFilter(e.target.value); setChamberPage(1) }} placeholder="Oda adı veya sicil no" className="w-full sm:w-64" />
                  <Label>Sayfa Boyutu</Label>
                  <Select value={String(chamberPageSize)} onValueChange={(v) => { setChamberPageSize(parseInt(v)); setChamberPage(1) }}>
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
                  <Button variant="outline" onClick={() => { setChamberEditingId(null); setChamberForm({ chamber: '', registryNo: '', membershipDate: '', membershipEndDate: '', status: 'ACTIVE' }) }} disabled={!chamberEditingId}>Temizle</Button>
                  <Button className="bg-violet-600 hover:bg-violet-700 text-white" variant="outline" onClick={() => {
                    if (!chamberForm.chamber || !chamberForm.registryNo || !chamberForm.membershipDate) return
                    if (chamberForm.membershipEndDate && chamberForm.membershipDate && chamberForm.membershipEndDate < chamberForm.membershipDate) {
                      toast.error('Bitiş tarihi üyelik tarihinden önce olamaz')
                      return
                    }
                    const t = new Date()
                    const yyyy = String(t.getFullYear())
                    const mm = String(t.getMonth() + 1).padStart(2, '0')
                    const dd = String(t.getDate()).padStart(2, '0')
                    const todayStr = `${yyyy}-${mm}-${dd}`
                    const computedStatus: 'ACTIVE' | 'PASSIVE' = (chamberForm.membershipEndDate && chamberForm.membershipEndDate <= todayStr) ? 'PASSIVE' : 'ACTIVE'
                    if (chamberEditingId) {
                      setChambers(prev => prev.map(c => c.id === chamberEditingId ? { ...c, chamber: chamberForm.chamber, registryNo: chamberForm.registryNo, membershipDate: chamberForm.membershipDate, membershipEndDate: chamberForm.membershipEndDate, status: computedStatus } : c))
                      setChamberEditingId(null)
                    } else {
                      const item = { id: `ch-${Date.now()}`, chamber: chamberForm.chamber, registryNo: chamberForm.registryNo, membershipDate: chamberForm.membershipDate, membershipEndDate: chamberForm.membershipEndDate, status: computedStatus }
                      setChambers(prev => [...prev, item])
                    }
                    setChamberForm({ chamber: '', registryNo: '', membershipDate: '', membershipEndDate: '', status: 'ACTIVE' })
                  }}>{chamberEditingId ? "Güncelle" : "Ekle"}</Button>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Meslek Odası</TableHead>
                      <TableHead>Sicil No</TableHead>
                      <TableHead>Üyelik Tarihi</TableHead>
                      <TableHead>Bitiş Tarihi</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const filtered = chambers.filter(c => {
                        const q = chamberFilter.toLowerCase()
                        if (!q) return true
                        return (c.chamber || '').toLowerCase().includes(q) || (c.registryNo || '').toLowerCase().includes(q)
                      })
                      const start = (chamberPage - 1) * chamberPageSize
                      const paginated = filtered.slice(start, start + chamberPageSize)
                      return paginated.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">{chamberFilter ? "Arama kriterlerine uygun sonuç bulunamadı" : "Henüz kayıt eklenmemiş"}</TableCell>
                        </TableRow>
                      ) : (
                        paginated.map(c => (
                          <TableRow key={c.id} onClick={() => { setChamberEditingId(c.id); setChamberForm({ chamber: c.chamber || '', registryNo: c.registryNo || '', membershipDate: c.membershipDate || '', membershipEndDate: c.membershipEndDate || '', status: c.status }) }} className="cursor-pointer">
                            <TableCell className="font-medium">{c.chamber}</TableCell>
                            <TableCell>{c.registryNo}</TableCell>
                            <TableCell>{c.membershipDate}</TableCell>
                            <TableCell>{c.membershipEndDate}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{c.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => { e.stopPropagation(); setChamberEditingId(c.id); setChamberForm({ chamber: c.chamber || '', registryNo: c.registryNo || '', membershipDate: c.membershipDate || '', membershipEndDate: c.membershipEndDate || '', status: c.status }) }}
                                  title="Düzenle"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); setChambers(prev => prev.filter(x => x.id !== c.id)) }} title="Sil">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )
                    })()}
                  </TableBody>
                </Table>
              </div>

              {(() => {
                const total = chambers.filter(c => {
                  const q = chamberFilter.toLowerCase()
                  if (!q) return true
                  return (c.chamber || '').toLowerCase().includes(q) || (c.registryNo || '').toLowerCase().includes(q)
                }).length
                const totalPages = Math.ceil(total / chamberPageSize) || 1
                return totalPages > 1 ? (
                  <div className="flex flex-col gap-3 sm:flex-row items-start sm:items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">Toplam {total} sonuçtan {(chamberPage - 1) * chamberPageSize + 1}-{Math.min(chamberPage * chamberPageSize, total)} arası gösteriliyor</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setChamberPage(p => Math.max(1, p - 1))} disabled={chamberPage === 1}>Önceki</Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button key={page} variant={chamberPage === page ? "default" : "outline"} size="sm" onClick={() => setChamberPage(page)} className="w-8">{page}</Button>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setChamberPage(p => Math.min(totalPages, p + 1))} disabled={chamberPage === totalPages}>Sonraki</Button>
                    </div>
                  </div>
                ) : null
              })()}
            </TabsContent>

            <TabsContent value="activities" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-1">
                  <Label htmlFor="activityBranch">Şube Adı</Label>
                  {branches.length > 0 ? (
                    <Select value={activityForm.branchName} onValueChange={(v) => setActivityForm((p) => ({ ...p, branchName: v }))}>
                      <SelectTrigger id="activityBranch">
                        <SelectValue placeholder="Şube seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((b) => (
                          <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input id="activityBranch" value={activityForm.branchName} onChange={(e) => setActivityForm((p) => ({ ...p, branchName: e.target.value }))} placeholder="Şube adı" />
                  )}
                </div>
                <div className="md:col-span-1">
                  <Label htmlFor="activityCode">Faaliyet Kodu</Label>
                  <div className="flex gap-2">
                    <Textarea
                      id="activityCode"
                      value={activityForm.activityCode}
                      onChange={(e) => setActivityForm((p) => ({ ...p, activityCode: e.target.value }))}
                      placeholder="62.01 - Bilgisayar programlama faaliyetleri"
                      className="flex-1 min-h-[64px]"
                      rows={3}
                    />
                    <Button type="button" variant="outline" onClick={() => { setActivityModalTarget('activity'); setIsActivityModalOpen(true) }}>
                      <Search className="h-4 w-4 mr-2" />
                      Seç
                    </Button>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="activityStart">Faaliyet Başlama Tarihi</Label>
                      <Input id="activityStart" type="date" value={activityForm.startDate} onChange={(e) => setActivityForm((p) => ({ ...p, startDate: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="activityEnd">Faaliyet Bitiş Tarihi</Label>
                      <Input
                        id="activityEnd"
                        type="date"
                        value={activityForm.endDate}
                        onChange={(e) => {
                          const v = e.target.value
                          setActivityForm((p) => ({ ...p, endDate: v, status: v ? 'PASSIVE' : 'ACTIVE' }))
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="activityStatus">Durum</Label>
                      <Select value={activityForm.status} onValueChange={(v: 'ACTIVE' | 'PASSIVE') => setActivityForm((p) => ({ ...p, status: v }))}>
                        <SelectTrigger id="activityStatus">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Aktif</SelectItem>
                          <SelectItem value="PASSIVE">Pasif</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { setActivityForm({ branchName: "", activityCode: "", startDate: "", endDate: "", status: 'ACTIVE' }); setActivityEditingId(null) }}>Temizle</Button>
                  <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={() => {
                    if (!activityForm.activityCode || !activityForm.branchName) return
                    if (activityEditingId) {
                      setActivities((prev) => prev.map((a) => a.id === activityEditingId ? { ...a, ...activityForm } : a))
                    } else {
                      const id = `activity-${Date.now()}`
                      setActivities((prev) => [...prev, { id, ...activityForm }])
                    }
                    setActivityForm({ branchName: "", activityCode: "", startDate: "", endDate: "", status: 'ACTIVE' })
                    setActivityEditingId(null)
                  }}>{activityEditingId ? 'Güncelle' : 'Ekle'}</Button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Label>Filtre</Label>
                  <Input value={activityFilter} onChange={(e) => { setActivityFilter(e.target.value); setActivityPage(1) }} placeholder="Şube, kod, tarih, durum" className="w-full sm:w-64" />
                  <Label>Sayfa Boyutu</Label>
                  <Select value={String(activityPageSize)} onValueChange={(v) => { setActivityPageSize(parseInt(v)); setActivityPage(1) }}>
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
                      <TableHead>Şube</TableHead>
                      <TableHead>Kod</TableHead>
                      <TableHead>Başlama</TableHead>
                      <TableHead>Bitiş</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const filtered = activities.filter(a => {
                        const q = activityFilter.toLowerCase()
                        if (!q) return true
                        const name = a.activityCode || ""
                        return (
                          (a.branchName || "").toLowerCase().includes(q) ||
                          name.toLowerCase().includes(q) ||
                          (a.startDate || "").toLowerCase().includes(q) ||
                          (a.endDate || "").toLowerCase().includes(q) ||
                          (a.status || "").toLowerCase().includes(q)
                        )
                      })
                      const totalPages = Math.max(1, Math.ceil(filtered.length / activityPageSize))
                      const currentPage = Math.min(activityPage, totalPages)
                      const start = (currentPage - 1) * activityPageSize
                      const paginated = filtered.slice(start, start + activityPageSize)
                      return paginated.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">{activityFilter ? "Arama kriterlerine uygun sonuç bulunamadı" : "Faaliyet eklenmemiş"}</TableCell>
                        </TableRow>
                      ) : (
                        paginated.map((a) => {
                          const name = a.activityCode || ''
                          const parts = name.split(' - ')
                          const code = parts[0] || ''
                          const desc = parts.slice(1).join(' - ')
                          return (
                            <TableRow key={a.id} onDoubleClick={() => { setActivityEditingId(a.id); setActivityForm({ branchName: a.branchName, activityCode: a.activityCode, startDate: a.startDate, endDate: a.endDate, status: a.status }) }} className="group">
                              <TableCell>{a.branchName || '-'}</TableCell>
                              <TableCell className="font-mono whitespace-nowrap relative overflow-visible">
                                {code}
                                <div className="absolute left-0 top-full z-[1000] bg-amber-50 text-amber-950 border border-amber-200 dark:bg-amber-100/10 dark:text-amber-200 dark:border-amber-200/40 rounded-md shadow-md mt-1 max-w-[600px] p-2 whitespace-pre-wrap break-words overflow-x-auto overflow-y-auto opacity-0 group-hover:opacity-100 pointer-events-none">
                                  {desc || name}
                                </div>
                              </TableCell>
                              <TableCell>{a.startDate || '-'}</TableCell>
                              <TableCell>{a.endDate || '-'}</TableCell>
                              <TableCell>
                                {a.status === 'ACTIVE' ? (
                                  <Badge className="bg-green-100 text-green-800 border-green-300">Aktif</Badge>
                                ) : (
                                  <Badge className="bg-red-100 text-red-800 border-red-300">Pasif</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => { e.stopPropagation(); setActivityForm({ branchName: a.branchName, activityCode: a.activityCode, startDate: a.startDate, endDate: a.endDate, status: a.status }); setActivityEditingId(a.id) }}
                                    title="Düzenle"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => setActivities((prev) => prev.filter((x) => x.id !== a.id))} className="text-red-600">Sil</Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )
                    })()}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row items-start sm:items-center justify-between mt-4">
                {(() => {
                  const filtered = activities.filter(a => {
                    const q = activityFilter.toLowerCase()
                    if (!q) return true
                    const name = a.activityCode || ""
                    return (
                      (a.branchName || "").toLowerCase().includes(q) ||
                      name.toLowerCase().includes(q) ||
                      (a.startDate || "").toLowerCase().includes(q) ||
                      (a.endDate || "").toLowerCase().includes(q) ||
                      (a.status || "").toLowerCase().includes(q)
                    )
                  })
                  const total = filtered.length
                  const totalPages = Math.ceil(total / activityPageSize)
                  const start = (activityPage - 1) * activityPageSize
                  const end = Math.min(start + activityPageSize, total)
                  return (
                    <>
                      <div className="text-sm text-muted-foreground">
                        Toplam {total} kayıttan {total === 0 ? 0 : start + 1}-{end} arası gösteriliyor
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setActivityPage(p => Math.max(1, p - 1))} disabled={activityPage === 1}>Önceki</Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={activityPage === page ? "default" : "outline"}
                              size="sm"
                              className="w-8"
                              onClick={() => setActivityPage(page)}
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setActivityPage(p => Math.min(Math.max(1, totalPages), p + 1))} disabled={activityPage === Math.max(1, totalPages)}>Sonraki</Button>
                      </div>
                    </>
                  )
                })()}
              </div>
            </TabsContent>

            {/* Branches */}
            <TabsContent value="branches" className="space-y-4 mt-5 [&_[data-slot=input]]:h-8 [&_[data-slot=input]]:py-1 [&_[data-slot=select-trigger]]:h-8 [&_[data-slot=textarea]]:py-1 [&_[data-slot=textarea]]:min-h-14">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label>Şube Adı</Label>
                  <Input
                    value={branchForm.name}
                    onChange={(e) => setBranchForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Örneğin: İstanbul Şubesi"
                  />
                </div>
                <div>
                  <Label>Açılış Tarihi</Label>
                  <Input
                    type="date"
                    value={branchForm.openingDate}
                    onChange={(e) => setBranchForm(prev => ({ ...prev, openingDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Kapanış Tarihi</Label>
                  <Input
                    type="date"
                    value={branchForm.closingDate}
                    onChange={(e) => setBranchForm(prev => ({ ...prev, closingDate: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-4">
                  <Label htmlFor="branchActivityCode">Şube Faaliyet Kodu</Label>
                  <div className="flex gap-2">
                    <Textarea
                      id="branchActivityCode"
                      value={branchForm.activityCode || ""}
                      onChange={(e) => setBranchForm(prev => ({ ...prev, activityCode: e.target.value }))}
                      placeholder="62.01 - Bilgisayar programlama faaliyetleri"
                      className="flex-1 min-h-[64px]"
                      rows={3}
                    />
                    <Button type="button" variant="outline" onClick={() => { setActivityModalTarget('branch'); setIsActivityModalOpen(true) }}>
                      <Search className="h-4 w-4 mr-2" />
                      Seç
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>İl</Label>
                  <TaxOfficeCombobox
                    value={branchForm.city || ""}
                    onValueChange={(value) => setBranchForm(prev => ({ ...prev, city: value, district: "" }))}
                    taxOffices={cityOptions}
                    placeholder="İl seçin..."
                    searchPlaceholder="İl ara..."
                    emptyMessage="İl bulunamadı."
                    minCharsToSearch={0}
                    displayMode="name"
                  />
                </div>
                <div>
                  <Label>İlçe</Label>
                  <TaxOfficeCombobox
                    value={branchForm.district || ""}
                    onValueChange={(value) => setBranchForm(prev => ({ ...prev, district: value }))}
                    taxOffices={districtOptions}
                    placeholder="İlçe seçin..."
                    searchPlaceholder="İlçe ara..."
                    emptyMessage="İlçe bulunamadı."
                    displayMode="name"
                    minCharsToSearch={0}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Şube Adres</Label>
                  <Textarea
                    value={branchForm.address}
                    onChange={(e) => setBranchForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Adres"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
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
                  {branchEditingId && (
                    <Button variant="outline" onClick={() => { setBranchEditingId(null); setBranchForm({ name: "", openingDate: "", closingDate: "", activityCode: "", city: "", district: "", address: "" })}}>Temizle</Button>
                  )}
                  <Button className="bg-violet-600 hover:bg-violet-700 text-white" variant="outline" onClick={addBranch}>{branchEditingId ? "Güncelle" : "Ekle"}</Button>
                </div>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Şube Adı</TableHead>
                      <TableHead>Adres</TableHead>
                      <TableHead>İl</TableHead>
                      <TableHead>İlçe</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branchFiltered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">{branchFilter ? "Arama kriterlerine uygun sonuç bulunamadı" : "Henüz şube eklenmemiş"}</TableCell>
                      </TableRow>
                    ) : (
                      branchPaginated.map(b => (
                        <TableRow key={b.id} onClick={() => { setBranchEditingId(b.id); setBranchForm({ name: b.name || "", openingDate: b.openingDate || "", closingDate: b.closingDate || "", activityCode: b.activityCode || "", city: b.city || "", district: b.district || "", address: b.address || "" }) }} className={`${b.closingDate ? 'bg-red-50 dark:bg-red-900/10' : ''} cursor-pointer hover:bg-accent/40`}>
                          <TableCell className="font-medium">{b.name}</TableCell>
                          <TableCell>{b.address}</TableCell>
                          <TableCell>{b.city || ""}</TableCell>
                          <TableCell>{b.district || ""}</TableCell>
                          <TableCell>
                            {b.closingDate ? (
                              <Badge className="bg-amber-100 text-amber-700 border-amber-300">Pasif</Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-700 border-green-300">Aktif</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => { e.stopPropagation(); setBranchEditingId(b.id); setBranchForm({ name: b.name || "", openingDate: b.openingDate || "", closingDate: b.closingDate || "", activityCode: b.activityCode || "", city: b.city || "", district: b.district || "", address: b.address || "" }) }}
                                title="Düzenle"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:bg-red-50"
                                onClick={(e) => { e.stopPropagation(); removeBranch(b.id) }}
                                title="Sil"
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
              <div className="flex flex-col gap-3 sm:flex-row items-start sm:items-center justify-between mt-4">
                {(() => {
                  const total = branchFiltered.length
                  const start = (branchCurrentPage - 1) * branchPageSize
                  const end = Math.min(start + branchPageSize, total)
                  return (
                    <>
                      <div className="text-sm text-muted-foreground">
                        Toplam {total} kayıttan {start + 1}-{end} arası gösteriliyor
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setBranchPage(p => Math.max(1, p - 1))} disabled={branchCurrentPage === 1}>Önceki</Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: branchTotalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={branchCurrentPage === page ? "default" : "outline"}
                              size="sm"
                              className="w-8"
                              onClick={() => setBranchPage(page)}
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setBranchPage(p => Math.min(branchTotalPages, p + 1))} disabled={branchCurrentPage === branchTotalPages}>Sonraki</Button>
                      </div>
                    </>
                  )
                })()}
              </div>
              
            </TabsContent>

            {/* Authorized Persons */}
            <TabsContent value="authorized" className="space-y-4 mt-5 [&_[data-slot=input]]:h-8 [&_[data-slot=input]]:py-1 [&_[data-slot=select-trigger]]:h-8 [&_[data-slot=textarea]]:py-1 [&_[data-slot=textarea]]:min-h-14">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label>Ad Soyad</Label>
                  <Input
                    value={authorizedForm.name}
                    onChange={(e) => setAuthorizedForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ad Soyad"
                  />
                </div>
                <div>
                  <Label>TCKN</Label>
                  <Input
                    value={authorizedForm.tckn}
                    onChange={(e) => setAuthorizedForm(prev => ({ ...prev, tckn: e.target.value }))}
                    placeholder="12345678901"
                    maxLength={11}
                  />
                </div>
                <div>
                  <Label>E-posta</Label>
                  <Input
                    type="email"
                    value={authorizedForm.email}
                    onChange={(e) => setAuthorizedForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@firma.com"
                  />
                </div>
                <div>
                  <Label>Telefon</Label>
                  <PhoneInput
                    value={authorizedForm.phone}
                    onChange={(v) => setAuthorizedForm(prev => ({ ...prev, phone: v }))}
                    placeholder="(5__) ___ __ __"
                  />
                </div>
                <div>
                  <Label>Yetki Tarihi</Label>
                  <Input
                    type="date"
                    value={authorizedForm.authorizationDate}
                    onChange={(e) => setAuthorizedForm(prev => ({ ...prev, authorizationDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Yetki Süresi (Ay)</Label>
                  <Input
                    type="number"
                    value={authorizedForm.authorizationPeriod}
                    onChange={(e) => setAuthorizedForm(prev => ({ ...prev, authorizationPeriod: e.target.value }))}
                    placeholder="12"
                    min="1"
                  />
                </div>
                <div>
                  <Label>Yetki Bitiş Tarihi</Label>
                  <Input
                    type="date"
                    value={computeAuthorizationEndDate(authorizedForm.authorizationDate, authorizedForm.authorizationPeriod)}
                    readOnly
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Adres</Label>
                  <Textarea
                    value={authorizedForm.address}
                    onChange={(e) => setAuthorizedForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Adres"
                    rows={3}
                  />
                </div>
              </div>
              <hr className="my-4" />
                <div>
                  <h3 className="text-base font-medium mb-3">Yetkili Sosyal Medya Hesapları</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <Label htmlFor="authorizedFacebookUrl">Facebook</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Facebook className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="authorizedFacebookUrl"
                        value={authorizedFacebookUrl}
                        onChange={(e) => setAuthorizedFacebookUrl(e.target.value)}
                        placeholder="https://facebook.com/..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="authorizedXUrl">X (Twitter)</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Twitter className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="authorizedXUrl"
                        value={authorizedXUrl}
                        onChange={(e) => setAuthorizedXUrl(e.target.value)}
                        placeholder="https://x.com/..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="authorizedLinkedinUrl">LinkedIn</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Linkedin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="authorizedLinkedinUrl"
                        value={authorizedLinkedinUrl}
                        onChange={(e) => setAuthorizedLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="authorizedInstagramUrl">Instagram</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Instagram className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="authorizedInstagramUrl"
                        value={authorizedInstagramUrl}
                        onChange={(e) => setAuthorizedInstagramUrl(e.target.value)}
                        placeholder="https://instagram.com/..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="authorizedThreadsUrl">Nsosyal</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="authorizedThreadsUrl"
                        value={authorizedThreadsUrl}
                        onChange={(e) => setAuthorizedThreadsUrl(e.target.value)}
                        placeholder="https://threads.net/..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <hr className="my-4" />
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Label>Filtre</Label>
                  <Input value={authorizedFilter} onChange={(e) => { setAuthorizedFilter(e.target.value); setAuthorizedPage(1) }} placeholder="Ad, TCKN, e-posta veya telefon" className="w-full sm:w-64" />
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
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { setAuthorizedEditingId(null); setAuthorizedForm({ name: "", tckn: "", email: "", phone: "", address: "", authorizationDate: "", authorizationPeriod: "" }) }} disabled={!authorizedEditingId}>Temizle</Button>
                  <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={addAuthorizedPerson}>{authorizedEditingId ? "Güncelle" : "Ekle"}</Button>
                </div>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ad Soyad</TableHead>
                      <TableHead>TCKN</TableHead>
                      <TableHead>E-posta</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {authorizedPaginated.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">{authorizedFilter ? "Arama kriterlerine uygun sonuç bulunamadı" : "Henüz yetkili eklenmemiş"}</TableCell>
                      </TableRow>
                    ) : (
                      authorizedPaginated.map(p => (
                        <TableRow key={p.id} onClick={() => { setAuthorizedEditingId(p.id); setAuthorizedForm({ name: p.name || "", tckn: p.tckn || "", email: p.email || "", phone: p.phone || "", address: p.address || "", authorizationDate: p.authorizationDate || "", authorizationPeriod: p.authorizationPeriod || "" }) }} className="cursor-pointer">
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell>{p.tckn}</TableCell>
                          <TableCell>{p.email}</TableCell>
                          <TableCell>{p.phone}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => { e.stopPropagation(); setAuthorizedEditingId(p.id); setAuthorizedForm({ name: p.name || "", tckn: p.tckn || "", email: p.email || "", phone: p.phone || "", address: p.address || "", authorizationDate: p.authorizationDate || "", authorizationPeriod: p.authorizationPeriod || "" }) }}
                                title="Düzenle"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); removeAuthorizedPerson(p.id) }} title="Sil">
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
              <div className="flex items-center justify-between mt-4">
                {(() => {
                  const total = authorizedFiltered.length
                  const start = (authorizedCurrentPage - 1) * authorizedPageSize
                  const end = Math.min(start + authorizedPageSize, total)
                  const totalPages = Math.ceil(total / authorizedPageSize)
                  return (
                    <>
                      <div className="text-sm text-muted-foreground">
                        Toplam {total} kayıttan {start + 1}-{end} arası gösteriliyor
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setAuthorizedPage(p => Math.max(1, p - 1))} disabled={authorizedCurrentPage === 1}>Önceki</Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={authorizedCurrentPage === page ? "default" : "outline"}
                              size="sm"
                              className="w-8"
                              onClick={() => setAuthorizedPage(page)}
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setAuthorizedPage(p => Math.min(totalPages, p + 1))} disabled={authorizedCurrentPage === totalPages}>Sonraki</Button>
                      </div>
                    </>
                  )
                })()}
              </div>

            </TabsContent>

            

            {/* Files */}
            <TabsContent value="files" className="space-y-4 mt-5 [&_[data-slot=input]]:h-8 [&_[data-slot=input]]:py-1 [&_[data-slot=select-trigger]]:h-8 [&_[data-slot=textarea]]:py-1 [&_[data-slot=textarea]]:min-h-14">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <Label>Dosya Adı</Label>
                  <Input value={docForm.name} onChange={(e) => setDocForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Dosya adı" />
                </div>
                <div className="md:col-span-2">
                  <Label>Dosya</Label>
                  <Input type="file" accept="*/*" onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = (ev) => {
                      const result = ev.target?.result as string
                      if (result) setDocForm(prev => ({ ...prev, file: result }))
                    }
                    reader.readAsDataURL(file)
                  }} />
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Label>Filtre</Label>
                  <Input value={docFilter} onChange={(e) => { setDocFilter(e.target.value); setDocPage(1) }} placeholder="Dosya adı" className="w-full sm:w-64" />
                  <Label>Sayfa Boyutu</Label>
                  <Select value={String(docPageSize)} onValueChange={(v) => { setDocPageSize(parseInt(v)); setDocPage(1) }}>
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
                  <Button variant="outline" onClick={() => { setDocEditingId(null); setDocForm({ name: "", file: "" }) }} disabled={!docEditingId}>Temizle</Button>
                  <Button variant="outline" onClick={() => {
                    if (!docForm.name || !docForm.file) return
                    if (docEditingId) {
                      setDocuments(prev => prev.map(d => d.id === docEditingId ? { ...d, name: docForm.name, file: docForm.file } : d))
                      setDocEditingId(null)
                    } else {
                      const item = { id: `doc-${Date.now()}`, name: docForm.name, file: docForm.file, uploadDate: new Date().toISOString().split('T')[0] }
                      setDocuments(prev => [...prev, item])
                    }
                    setDocForm({ name: "", file: "" })
                  }}>{docEditingId ? "Güncelle" : "Ekle"}</Button>
                </div>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ad</TableHead>
                      <TableHead>Yükleme Tarihi</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const filtered = documents.filter(d => {
                        const q = docFilter.toLowerCase()
                        if (!q) return true
                        return (d.name || "").toLowerCase().includes(q)
                      })
                      const paginated = filtered.slice((docPage - 1) * docPageSize, (docPage - 1) * docPageSize + docPageSize)
                      return paginated.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground py-8">{docFilter ? "Arama kriterlerine uygun sonuç bulunamadı" : "Henüz dosya eklenmemiş"}</TableCell>
                        </TableRow>
                      ) : (
                        paginated.map(d => (
                          <TableRow key={d.id} onClick={() => { setDocEditingId(d.id); setDocForm({ name: d.name || "", file: d.file || "" }) }} className="cursor-pointer">
                            <TableCell className="font-medium">{d.name}</TableCell>
                            <TableCell>{d.uploadDate}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => { e.stopPropagation(); setDocEditingId(d.id); setDocForm({ name: d.name || "", file: d.file || "" }) }}
                                  title="Düzenle"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); window.open(d.file, '_blank') }} title="Görüntüle">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); setDocuments(prev => prev.filter(x => x.id !== d.id)) }} title="Sil">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )
                    })()}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row items-start sm:items-center justify-between mt-4">
                {(() => {
                  const filtered = documents.filter(d => {
                    const q = docFilter.toLowerCase()
                    if (!q) return true
                    return (d.name || "").toLowerCase().includes(q)
                  })
                  const total = filtered.length
                  const totalPages = Math.ceil(total / docPageSize)
                  const start = (docPage - 1) * docPageSize
                  const end = Math.min(start + docPageSize, total)
                  return (
                    <>
                      <div className="text-sm text-muted-foreground">
                        Toplam {total} kayıttan {start + 1}-{end} arası gösteriliyor
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setDocPage(p => Math.max(1, p - 1))} disabled={docPage === 1}>Önceki</Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={docPage === page ? "default" : "outline"}
                              size="sm"
                              className="w-8"
                              onClick={() => setDocPage(page)}
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setDocPage(p => Math.min(totalPages, p + 1))} disabled={docPage === totalPages}>Sonraki</Button>
                      </div>
                    </>
                  )
                })()}
              </div>
            </TabsContent>

            {/* Declarations */}
            <TabsContent value="declarations" className="space-y-4 mt-5 [&_[data-slot=input]]:h-8 [&_[data-slot=input]]:py-1 [&_[data-slot=select-trigger]]:h-8 [&_[data-slot=textarea]]:py-1 [&_[data-slot=textarea]]:min-h-14">
              <div className="text-center py-8 text-muted-foreground">
                Beyanname ayarları müşteri oluşturulduktan sonra yapılandırılabilir.
              </div>
            </TabsContent>

            {/* Notes */}
            <TabsContent value="notes" className="space-y-4 mt-5 [&_[data-slot=input]]:h-8 [&_[data-slot=input]]:py-1 [&_[data-slot=select-trigger]]:h-8 [&_[data-slot=textarea]]:py-1 [&_[data-slot=textarea]]:min-h-14">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <Label>Not Başlığı</Label>
                  <Input value={noteForm.title} onChange={(e) => setNoteForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Başlık" />
                </div>
                <div className="md:col-span-2">
                  <Label>Not İçeriği</Label>
                  <Textarea value={noteForm.content} onChange={(e) => setNoteForm(prev => ({ ...prev, content: e.target.value }))} placeholder="Not" rows={4} />
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
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
                <div className="flex justify-end gap-2">
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
              </div>
              <div className="rounded-md border">
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
                      <div className="text-sm text-muted-foreground">
                        Toplam {total} kayıttan {start + 1}-{end} arası gösteriliyor
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setNotePage(p => Math.max(1, p - 1))} disabled={notePage === 1}>Önceki</Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={notePage === page ? "default" : "outline"}
                              size="sm"
                              className="w-8"
                              onClick={() => setNotePage(page)}
                            >
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
            </TabsContent>
          </Tabs>

          <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
            <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-hidden p-0">
              <DialogHeader className="sticky top-0 z-10 bg-muted p-4 border-b relative">
                <DialogTitle>Faaliyet Kodu Seç</DialogTitle>
                <DialogDescription>Tablodan faaliyet kodunu seçin veya arama ile bulun.</DialogDescription>
                <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 h-8 w-8" onClick={() => setIsActivityModalOpen(false)} aria-label="Kapat">
                  <X className="h-4 w-4" />
                </Button>
              </DialogHeader>
              <div className="flex-1 overflow-x-hidden overflow-y-hidden px-4 py-3 space-y-3">
                <Input
                  id="activitySearch"
                  value={activityCodeSearch}
                  onChange={(e) => setActivityCodeSearch(e.target.value || "")}
                  placeholder="Kod veya açıklama ara"
                />
                <div className="max-h-[40vh] overflow-x-auto overflow-y-auto">
                  <Table className="w-full min-w-[700px]" containerClassName="overflow-x-visible overflow-y-visible">
                    <TableHeader className="sticky top-0 z-10 bg-muted">
                      <TableRow>
                        <TableHead className="w-[140px] whitespace-nowrap">İşlem</TableHead>
                        <TableHead className="whitespace-nowrap">Kod</TableHead>
                        <TableHead className="whitespace-nowrap">Açıklama</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activityCodeOptions
                        .filter(o => {
                          const q = activityCodeSearch.trim().toLocaleLowerCase('tr-TR')
                          if (!q) return true
                          const name = (o.name || '')
                          const parts = name.split(' - ')
                          const code = (parts[0] || '')
                          const desc = parts.slice(1).join(' - ')
                          return (
                            name.toLocaleLowerCase('tr-TR').includes(q) ||
                            code.toLocaleLowerCase('tr-TR').includes(q) ||
                            desc.toLocaleLowerCase('tr-TR').includes(q)
                          )
                        })
                        .slice(0, 500)
                        .map(o => {
                          const name = o.name || ''
                          const parts = name.split(' - ')
                          const code = parts[0] || ''
                          const desc = parts.slice(1).join(' - ')
                          return (
                            <TableRow key={o.id} className="group">
                              <TableCell>
                                <Button variant="outline" className="w-full" onClick={() => {
                                  if (activityModalTarget === 'main') {
                                    setMainActivityCode(name)
                                  } else if (activityModalTarget === 'branch') {
                                    setBranchForm(prev => ({ ...prev, activityCode: name }))
                                  } else if (activityModalTarget === 'activity') {
                                    setActivityForm(prev => ({ ...prev, activityCode: name }))
                                  }
                                  setIsActivityModalOpen(false)
                                }}>Seç</Button>
                              </TableCell>
                              <TableCell className="font-mono whitespace-nowrap">{code}</TableCell>
                              <TableCell className="whitespace-nowrap relative overflow-visible">
                                {desc || name}
                                <div className="absolute left-0 top-full z-[1000] bg-amber-50 text-amber-950 border border-amber-200 dark:bg-amber-100/10 dark:text-amber-200 dark:border-amber-200/40 rounded-md shadow-md mt-1 max-w-[600px] p-2 whitespace-pre-wrap break-words overflow-x-auto overflow-y-auto opacity-0 group-hover:opacity-100 pointer-events-none">
                                  {desc || name}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <DialogFooter className="sticky bottom-0 z-10 bg-muted p-4 border-t">
                <Button variant="outline" onClick={() => setIsActivityModalOpen(false)}>Kapat</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

            </>
          )}

          <div className="flex justify-end gap-2 mt-8">
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              İptal
            </Button>
            <Button
              onClick={handleSaveTab}
              disabled={saving || (activeTab === 'company' ? !companyName.trim() : false)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Kaydediliyor..." : "Bu Sekmeyi Kaydet"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
