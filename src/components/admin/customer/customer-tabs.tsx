"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Save, Upload, X, Facebook, Twitter, Linkedin, Instagram, MessageSquare, Image as ImageIcon } from "lucide-react";

type Option = { id: string; name: string }

export type CustomerTabsProps = {
  mode: "new" | "edit"
  title: string
  subtitle: string
  activeTab: string
  setActiveTab: (v: string) => void
  saving: boolean
  onSaveTab: () => void
  onCancel: () => void
  mounted?: boolean

  // company
  logo: string
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  removeLogo: () => void
  companyType: "PERSONAL" | "CAPITAL"
  setCompanyType: (v: "PERSONAL" | "CAPITAL") => void
  companyName: string
  setCompanyName: (v: string) => void
  personalTaxNumber: string
  setPersonalTaxNumber: (v: string) => void
  corporateTaxNumber: string
  setCorporateTaxNumber: (v: string) => void
  taxOffice: string
  setTaxOffice: (v: string) => void
  phone: string
  setPhone: (v: string) => void
  email: string
  setEmail: (v: string) => void
  address: string
  setAddress: (v: string) => void
  ledgerType: string
  setLedgerType: (v: string) => void
  hasEmployees: boolean
  setHasEmployees: (v: boolean) => void
  employeeCount: number | null
  setEmployeeCount: (v: number | null) => void
  subscriptionFee: string
  setSubscriptionFee: (v: string) => void
  establishmentDate: string
  setEstablishmentDate: (v: string) => void
  mainActivityCode: string
  setMainActivityCode: (v: string) => void
  status: string
  setStatus: (v: string) => void
  onboardingStage: string
  setOnboardingStage: (v: string) => void
  taxOffices: Option[]
  activityCodeOptions: Option[]
  cityOptions: Option[]
  districtOptions: Option[]

  // company social
  facebookUrl: string
  setFacebookUrl: (v: string) => void
  xUrl: string
  setXUrl: (v: string) => void
  linkedinUrl: string
  setLinkedinUrl: (v: string) => void
  instagramUrl: string
  setInstagramUrl: (v: string) => void
  threadsUrl: string
  setThreadsUrl: (v: string) => void

  // branches
  branches: Array<{ id: string; name: string; openingDate?: string; closingDate?: string; activityCode?: string; city?: string; district?: string; address: string }>
  branchForm: { name: string; openingDate?: string; closingDate?: string; activityCode?: string; city?: string; district?: string; address: string }
  setBranchForm: (updater: any) => void
  branchEditingId: string | null
  setBranchEditingId: (v: string | null) => void
  branchFilter: string
  setBranchFilter: (v: string) => void
  branchPage: number
  setBranchPage: (updater: any) => void
  branchPageSize: number
  setBranchPageSize: (v: number) => void
  setBranches: (updater: any) => void

  // authorized persons
  authorizedPersons: Array<{ id: string; name: string; tckn: string; email: string; phone: string; address: string; authorizationDate: string; authorizationPeriod: string }>
  authorizedForm: { name: string; tckn: string; email: string; phone: string; address: string; authorizationDate: string; authorizationPeriod: string }
  setAuthorizedForm: (updater: any) => void
  authorizedEditingId: string | null
  setAuthorizedEditingId: (v: string | null) => void
  setAuthorizedPersons: (updater: any) => void
  authorizedFacebookUrl: string
  setAuthorizedFacebookUrl: (v: string) => void
  authorizedXUrl: string
  setAuthorizedXUrl: (v: string) => void
  authorizedLinkedinUrl: string
  setAuthorizedLinkedinUrl: (v: string) => void
  authorizedInstagramUrl: string
  setAuthorizedInstagramUrl: (v: string) => void
  authorizedThreadsUrl: string
  setAuthorizedThreadsUrl: (v: string) => void

  // files
  documents: Array<{id: string, name: string, file: string, uploadDate: string}>
  setDocuments: (updater: any) => void
  docForm: { name: string; file: string }
  setDocForm: (updater: any) => void
  docEditingId: string | null
  setDocEditingId: (v: string | null) => void
  docFilter: string
  setDocFilter: (v: string) => void
  docPage: number
  setDocPage: (updater: any) => void
  docPageSize: number
  setDocPageSize: (v: number) => void

  // notes
  notes: Array<{ id: string; title: string; content: string; date: string }>
  setNotes: (updater: any) => void
  noteForm: { title: string; content: string }
  setNoteForm: (updater: any) => void
  noteEditingId: string | null
  setNoteEditingId: (v: string | null) => void
  noteFilter: string
  setNoteFilter: (v: string) => void
  notePage: number
  setNotePage: (updater: any) => void
  notePageSize: number
  setNotePageSize: (v: number) => void
}

export function CustomerTabs(props: CustomerTabsProps) {
  const mounted = props.mode === "new" ? props.mounted : true

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/admin/customers" className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Müşteri Listesine Dön
        </Link>
        <h1 className="text-3xl font-bold">{props.title}</h1>
        <p className="text-muted-foreground mt-2">
          {props.subtitle}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Müşteri Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          {mounted && (
          <Tabs value={props.activeTab} onValueChange={props.setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="company">Şirket Bilgileri</TabsTrigger>
              <TabsTrigger value="branches">Şube Bilgileri</TabsTrigger>
              <TabsTrigger value="authorized">Yetkili Bilgileri</TabsTrigger>
              <TabsTrigger value="files">Dosyalar</TabsTrigger>
              <TabsTrigger value="declarations">Beyannameler</TabsTrigger>
              <TabsTrigger value="notes">Notlar</TabsTrigger>
            </TabsList>

            <TabsContent value="company" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                  <Label>Logo Yükle</Label>
                  <div className="mt-2">
                    {props.logo ? (
                      <div className="relative">
                        <div className="relative w-full aspect-square border rounded overflow-hidden">
                          <Image 
                            src={props.logo} 
                            alt="Company Logo" 
                            fill 
                            className="object-contain p-1" 
                          />
                        </div>
                        <Button type="button" variant="ghost" size="sm" className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 text-white rounded-full" onClick={props.removeLogo}>
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
                      <Input type="file" accept="image/*" onChange={props.onLogoUpload} />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="companyType">Şirket Türü</Label>
                      <Select value={props.companyType} onValueChange={props.setCompanyType}>
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
                      <Input id="companyName" value={props.companyName} onChange={(e) => props.setCompanyName(e.target.value)} placeholder="ABC Ltd. Şti." required />
                    </div>
                    {props.companyType === "PERSONAL" && (
                      <div>
                        <Label htmlFor="personalTaxNumber">TCKN</Label>
                        <Input id="personalTaxNumber" value={props.personalTaxNumber} onChange={(e) => props.setPersonalTaxNumber(e.target.value)} placeholder="12345678901" maxLength={11} />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="corporateTaxNumber">VKN</Label>
                      <Input id="corporateTaxNumber" value={props.corporateTaxNumber} onChange={(e) => props.setCorporateTaxNumber(e.target.value)} placeholder="1234567890" maxLength={10} />
                    </div>
                    <div>
                      <Label htmlFor="taxOffice">Vergi Dairesi</Label>
                      <Select value={props.taxOffice} onValueChange={props.setTaxOffice}>
                        <SelectTrigger id="taxOffice">
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          {props.taxOffices.map(o => (<SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefon</Label>
                      <PhoneInput id="phone" value={props.phone} onChange={props.setPhone} placeholder="(5__) ___ __ __" />
                    </div>
                    <div>
                      <Label htmlFor="email">E-posta</Label>
                      <Input id="email" type="email" value={props.email} onChange={(e) => props.setEmail(e.target.value)} placeholder="info@firma.com" />
                    </div>
                    <div>
                      <Label htmlFor="ledgerType">Defter Tipi</Label>
                      <Select value={props.ledgerType} onValueChange={props.setLedgerType}>
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
                  <div className="mt-6">
                    <Label htmlFor="address">Adres</Label>
                    <Textarea id="address" value={props.address} onChange={(e) => props.setAddress(e.target.value)} placeholder="Mahalle, sokak, bina no, daire no, ilçe, il" rows={3} className="min-h-[80px]" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="subscriptionFee">Aidat</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">₺</span>
                    <Input id="subscriptionFee" value={props.subscriptionFee} onChange={(e) => props.setSubscriptionFee(e.target.value)} placeholder="5.000" className="pl-8" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="establishmentDate">Şirket Kuruluş Tarihi</Label>
                  <Input id="establishmentDate" type="date" value={props.establishmentDate} onChange={(e) => props.setEstablishmentDate(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="mainActivityCode">Ana Faaliyet Kodu</Label>
                  <Select value={props.mainActivityCode} onValueChange={props.setMainActivityCode}>
                    <SelectTrigger id="mainActivityCode"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {props.activityCodeOptions.map(o => (<SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Label htmlFor="hasEmployees">Sigortalı Çalışan</Label>
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <input type="radio" id="hasEmployeesYes" name="hasEmployees" checked={props.hasEmployees === true} onChange={() => props.setHasEmployees(true)} className="h-4 w-4 text-blue-600" />
                        <Label htmlFor="hasEmployeesYes" className="cursor-pointer">Var</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="radio" id="hasEmployeesNo" name="hasEmployees" checked={props.hasEmployees === false} onChange={() => props.setHasEmployees(false)} className="h-4 w-4 text-blue-600" />
                        <Label htmlFor="hasEmployeesNo" className="cursor-pointer">Yok</Label>
                      </div>
                    </div>
                  </div>
                  {props.hasEmployees && (
                    <div className="flex-1">
                      <Label htmlFor="employeeCount">Sigortalı Sayısı</Label>
                      <Input id="employeeCount" type="number" value={props.employeeCount || ""} onChange={(e) => props.setEmployeeCount(e.target.value ? parseInt(e.target.value) : null)} placeholder="0" min="0" />
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="status">Durum</Label>
                  <Select value={props.status} onValueChange={props.setStatus}>
                    <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Aktif</SelectItem>
                      <SelectItem value="INACTIVE">Pasif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="onboardingStage">Müşteri Aşaması</Label>
                  <Select value={props.onboardingStage} onValueChange={props.setOnboardingStage}>
                    <SelectTrigger id="onboardingStage"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LEAD">Aday</SelectItem>
                      <SelectItem value="PROSPECT">Potansiyel</SelectItem>
                      <SelectItem value="CUSTOMER">Müşteri</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Firma Sosyal Medya Hesapları</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="facebookUrl">Facebook</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Facebook className="h-4 w-4 text-muted-foreground" /></div>
                      <Input id="facebookUrl" value={props.facebookUrl} onChange={(e) => props.setFacebookUrl(e.target.value)} placeholder="https://facebook.com/..." className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="xUrl">X (Twitter)</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Twitter className="h-4 w-4 text-muted-foreground" /></div>
                      <Input id="xUrl" value={props.xUrl} onChange={(e) => props.setXUrl(e.target.value)} placeholder="https://x.com/..." className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="linkedinUrl">LinkedIn</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Linkedin className="h-4 w-4 text-muted-foreground" /></div>
                      <Input id="linkedinUrl" value={props.linkedinUrl} onChange={(e) => props.setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/..." className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="instagramUrl">Instagram</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Instagram className="h-4 w-4 text-muted-foreground" /></div>
                      <Input id="instagramUrl" value={props.instagramUrl} onChange={(e) => props.setInstagramUrl(e.target.value)} placeholder="https://instagram.com/..." className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="threadsUrl">Threads</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MessageSquare className="h-4 w-4 text-muted-foreground" /></div>
                      <Input id="threadsUrl" value={props.threadsUrl} onChange={(e) => props.setThreadsUrl(e.target.value)} placeholder="https://threads.net/..." className="pl-10" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="branches" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <Label>Şube Adı</Label>
                  <Input value={props.branchForm.name} onChange={(e) => props.setBranchForm((prev: any) => ({ ...prev, name: e.target.value }))} placeholder="Örneğin: İstanbul Şubesi" />
                </div>
                <div>
                  <Label>Açılış Tarihi</Label>
                  <Input type="date" value={props.branchForm.openingDate} onChange={(e) => props.setBranchForm((prev: any) => ({ ...prev, openingDate: e.target.value }))} />
                </div>
                <div>
                  <Label>Kapanış Tarihi</Label>
                  <Input type="date" value={props.branchForm.closingDate} onChange={(e) => props.setBranchForm((prev: any) => ({ ...prev, closingDate: e.target.value }))} />
                </div>
                <div>
                  <Label>Şube Faaliyet Kodu</Label>
                  <Select value={props.branchForm.activityCode || ""} onValueChange={(value) => props.setBranchForm((prev: any) => ({ ...prev, activityCode: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {props.activityCodeOptions.map(o => (<SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>İl</Label>
                  <Select value={props.branchForm.city || ""} onValueChange={(value) => props.setBranchForm((prev: any) => ({ ...prev, city: value, district: "" }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {props.cityOptions.map(o => (<SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>İlçe</Label>
                  <Select value={props.branchForm.district || ""} onValueChange={(value) => props.setBranchForm((prev: any) => ({ ...prev, district: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {props.districtOptions.map(o => (<SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-4">
                  <Label>Adres</Label>
                  <Textarea value={props.branchForm.address} onChange={(e) => props.setBranchForm((prev: any) => ({ ...prev, address: e.target.value }))} placeholder="Adres" rows={3} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { props.setBranchEditingId(null); props.setBranchForm({ name: "", openingDate: "", closingDate: "", activityCode: "", city: "", district: "", address: "" }) }} disabled={!props.branchEditingId}>Temizle</Button>
                <Button variant="outline" onClick={() => {
                  if (!props.branchForm.name || !props.branchForm.address) return
                  if (props.branchEditingId) {
                    props.setBranches((prev: any) => prev.map((b: any) => b.id === props.branchEditingId ? { ...b, ...props.branchForm } : b))
                    props.setBranchEditingId(null)
                  } else {
                    const newBranch = { id: `temp-${Date.now()}`, ...props.branchForm };
                    props.setBranches((prev: any) => [...prev, newBranch]);
                  }
                  props.setBranchForm({ name: "", openingDate: "", closingDate: "", activityCode: "", city: "", district: "", address: "" });
                }}>{props.branchEditingId ? "Güncelle" : "Ekle"}</Button>
              </div>
              <div className="rounded-md border">
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
                    {props.branches.map(b => (
                      <TableRow key={b.id} onClick={() => { props.setBranchEditingId(b.id); props.setBranchForm({ name: b.name || "", openingDate: b.openingDate || "", closingDate: b.closingDate || "", activityCode: b.activityCode || "", city: b.city || "", district: b.district || "", address: b.address || "" }) }} className="cursor-pointer">
                        <TableCell className="font-medium">{b.name}</TableCell>
                        <TableCell>{b.address}</TableCell>
                        <TableCell>{b.city || ""}</TableCell>
                        <TableCell>{b.district || ""}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); props.setBranches((prev: any) => prev.filter((x: any) => x.id !== b.id)) }}>Sil</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="authorized" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <Label>Ad Soyad</Label>
                  <Input value={props.authorizedForm.name} onChange={(e) => props.setAuthorizedForm((prev: any) => ({ ...prev, name: e.target.value }))} placeholder="Ad Soyad" />
                </div>
                <div>
                  <Label>TCKN</Label>
                  <Input value={props.authorizedForm.tckn} onChange={(e) => props.setAuthorizedForm((prev: any) => ({ ...prev, tckn: e.target.value }))} placeholder="12345678901" maxLength={11} />
                </div>
                <div>
                  <Label>E-posta</Label>
                  <Input value={props.authorizedForm.email} onChange={(e) => props.setAuthorizedForm((prev: any) => ({ ...prev, email: e.target.value }))} type="email" placeholder="yetkili@firma.com" />
                </div>
                <div>
                  <Label>Telefon</Label>
                  <PhoneInput id="authorizedPhone" value={props.authorizedForm.phone} onChange={(v) => props.setAuthorizedForm((prev: any) => ({ ...prev, phone: v }))} placeholder="(5__) ___ __ __" />
                </div>
                <div className="md:col-span-2">
                  <Label>Adres</Label>
                  <Textarea value={props.authorizedForm.address} onChange={(e) => props.setAuthorizedForm((prev: any) => ({ ...prev, address: e.target.value }))} placeholder="Adres" rows={3} />
                </div>
                <div>
                  <Label>Yetki Tarihi</Label>
                  <Input type="date" value={props.authorizedForm.authorizationDate} onChange={(e) => props.setAuthorizedForm((prev: any) => ({ ...prev, authorizationDate: e.target.value }))} />
                </div>
                <div>
                  <Label>Yetki Süresi (Ay)</Label>
                  <Input type="number" value={props.authorizedForm.authorizationPeriod} onChange={(e) => props.setAuthorizedForm((prev: any) => ({ ...prev, authorizationPeriod: e.target.value }))} placeholder="" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { props.setAuthorizedEditingId(null); props.setAuthorizedForm({ name: "", tckn: "", email: "", phone: "", address: "", authorizationDate: "", authorizationPeriod: "" }) }} disabled={!props.authorizedEditingId}>Temizle</Button>
                <Button variant="outline" onClick={() => {
                  if (!props.authorizedForm.name || !props.authorizedForm.tckn || !props.authorizedForm.email || !props.authorizedForm.phone) return
                  if (props.authorizedEditingId) {
                    props.setAuthorizedPersons((prev: any) => prev.map((p: any) => p.id === props.authorizedEditingId ? { ...p, ...props.authorizedForm } : p))
                    props.setAuthorizedEditingId(null)
                  } else {
                    const newItem = { id: `auth-${Date.now()}`, ...props.authorizedForm }
                    props.setAuthorizedPersons((prev: any) => [...prev, newItem])
                  }
                  props.setAuthorizedForm({ name: "", tckn: "", email: "", phone: "", address: "", authorizationDate: "", authorizationPeriod: "" })
                }}>{props.authorizedEditingId ? "Güncelle" : "Ekle"}</Button>
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
                    {props.authorizedPersons.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">Kayıt yok</TableCell>
                      </TableRow>
                    ) : (
                      props.authorizedPersons.map(p => (
                        <TableRow key={p.id} onClick={() => { props.setAuthorizedEditingId(p.id); props.setAuthorizedForm({ name: p.name || "", tckn: p.tckn || "", email: p.email || "", phone: p.phone || "", address: p.address || "", authorizationDate: p.authorizationDate || "", authorizationPeriod: p.authorizationPeriod || "" }) }} className="cursor-pointer">
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell>{p.tckn}</TableCell>
                          <TableCell>{p.email}</TableCell>
                          <TableCell>{p.phone}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); props.setAuthorizedPersons((prev: any) => prev.filter((x: any) => x.id !== p.id)) }}>Sil</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Facebook</Label>
                  <Input value={props.authorizedFacebookUrl} onChange={(e) => props.setAuthorizedFacebookUrl(e.target.value)} />
                </div>
                <div>
                  <Label>X</Label>
                  <Input value={props.authorizedXUrl} onChange={(e) => props.setAuthorizedXUrl(e.target.value)} />
                </div>
                <div>
                  <Label>LinkedIn</Label>
                  <Input value={props.authorizedLinkedinUrl} onChange={(e) => props.setAuthorizedLinkedinUrl(e.target.value)} />
                </div>
                <div>
                  <Label>Instagram</Label>
                  <Input value={props.authorizedInstagramUrl} onChange={(e) => props.setAuthorizedInstagramUrl(e.target.value)} />
                </div>
                <div>
                  <Label>Threads</Label>
                  <Input value={props.authorizedThreadsUrl} onChange={(e) => props.setAuthorizedThreadsUrl(e.target.value)} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="files" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label>Dosya Adı</Label>
                  <Input value={props.docForm.name} onChange={(e) => props.setDocForm((prev: any) => ({ ...prev, name: e.target.value }))} placeholder="Dosya adı" />
                </div>
                <div className="md:col-span-2">
                  <Label>Dosya</Label>
                  <Input type="file" accept="*/*" onChange={(e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = (ev) => {
                      const result = (ev.target as FileReader).result as string
                      if (result) props.setDocForm((prev: any) => ({ ...prev, file: result }))
                    }
                    reader.readAsDataURL(file)
                  }} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { props.setDocEditingId(null); props.setDocForm({ name: "", file: "" }) }} disabled={!props.docEditingId}>Temizle</Button>
                <Button variant="outline" onClick={() => {
                  if (!props.docForm.name || !props.docForm.file) return
                  if (props.docEditingId) {
                    props.setDocuments((prev: any) => prev.map((d: any) => d.id === props.docEditingId ? { ...d, name: props.docForm.name, file: props.docForm.file } : d))
                    props.setDocEditingId(null)
                  } else {
                    const item = { id: `doc-${Date.now()}`, name: props.docForm.name, file: props.docForm.file, uploadDate: new Date().toISOString().split('T')[0] }
                    props.setDocuments((prev: any) => [...prev, item])
                  }
                  props.setDocForm({ name: "", file: "" })
                }}>{props.docEditingId ? "Güncelle" : "Ekle"}</Button>
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
                    {props.documents.map(d => (
                      <TableRow key={d.id} onClick={() => { props.setDocEditingId(d.id); props.setDocForm({ name: d.name || "", file: d.file || "" }) }} className="cursor-pointer">
                        <TableCell className="font-medium">{d.name}</TableCell>
                        <TableCell>{d.uploadDate}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); window.open(d.file, '_blank') }}>Görüntüle</Button>
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); props.setDocuments((prev: any) => prev.filter((x: any) => x.id !== d.id)) }}>Sil</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="declarations" className="space-y-6">
              <div className="text-center py-8 text-muted-foreground">Beyanname ayarları müşteri oluşturulduktan sonra yapılandırılabilir.</div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label>Not Başlığı</Label>
                  <Input value={props.noteForm.title} onChange={(e) => props.setNoteForm((prev: any) => ({ ...prev, title: e.target.value }))} placeholder="Başlık" />
                </div>
                <div className="md:col-span-2">
                  <Label>Not İçeriği</Label>
                  <Textarea value={props.noteForm.content} onChange={(e) => props.setNoteForm((prev: any) => ({ ...prev, content: e.target.value }))} placeholder="Not" rows={4} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { props.setNoteEditingId(null); props.setNoteForm({ title: "", content: "" }) }} disabled={!props.noteEditingId}>Temizle</Button>
                <Button variant="outline" onClick={() => {
                  if (!props.noteForm.title || !props.noteForm.content) return
                  if (props.noteEditingId) {
                    props.setNotes((prev: any) => prev.map((n: any) => n.id === props.noteEditingId ? { ...n, title: props.noteForm.title, content: props.noteForm.content } : n))
                    props.setNoteEditingId(null)
                  } else {
                    const item = { id: `note-${Date.now()}`, title: props.noteForm.title, content: props.noteForm.content, date: new Date().toISOString().split('T')[0] }
                    props.setNotes((prev: any) => [...prev, item])
                  }
                  props.setNoteForm({ title: "", content: "" })
                }}>{props.noteEditingId ? "Güncelle" : "Ekle"}</Button>
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
                    {props.notes.map(n => (
                      <TableRow key={n.id} onClick={() => { props.setNoteEditingId(n.id); props.setNoteForm({ title: n.title || "", content: n.content || "" }) }} className="cursor-pointer">
                        <TableCell className="font-medium">{n.title}</TableCell>
                        <TableCell>{n.date}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); props.setNotes((prev: any) => prev.filter((x: any) => x.id !== n.id)) }}>Sil</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
          )}

          <div className="flex justify-end gap-2 mt-8">
            <Button variant="outline" onClick={props.onCancel} disabled={props.saving}>İptal</Button>
            <Button onClick={props.onSaveTab} disabled={props.saving || (props.activeTab === 'company' ? !props.companyName.trim() : false)} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              {props.saving ? "Kaydediliyor..." : "Bu Sekmeyi Kaydet"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

