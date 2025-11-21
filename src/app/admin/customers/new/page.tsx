"use client";

import { useState, useEffect } from "react";
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
import Link from "next/link";
import Image from "next/image";


export default function NewCustomerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
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
  
  // Declarations
  const [declarations] = useState<string[]>([]);
  
  // Notes
  const [notes, setNotes] = useState("");
  
  // Documents
  const [documents] = useState<Array<{id: string, name: string, file: string, uploadDate: string}>>([]);
  
  // Institutional Passwords
  const [passwords] = useState<Array<{id: string, institution: string, username: string, password: string}>>([]);
  
  // Tax offices
  const [taxOffices, setTaxOffices] = useState<Array<{id: string, name: string}>>([]);
  
  // Load tax offices from API
  useEffect(() => {
    const fetchTaxOffices = async () => {
      try {
        const response = await fetch('/api/tax-offices');
        if (response.ok) {
          const data = await response.json();
          setTaxOffices(data.taxOffices || []);
        }
      } catch (error) {
        console.error('Error fetching tax offices:', error);
      }
    };

    fetchTaxOffices();
  }, []);
  
  const handleSave = async () => {
    setSaving(true);
    try {
      const customerData = {
        logo,
        companyName,
        taxNumber: companyType === "PERSONAL" ? personalTaxNumber : corporateTaxNumber,
        taxOffice,
        phone,
        email,
        address,
        facebookUrl,
        xUrl,
        linkedinUrl,
        instagramUrl,
        threadsUrl,
        ledgerType,
        hasEmployees,
        employeeCount, // Include the new field
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
      };

      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      });
      
      if (response.ok) {
        toast.success("Müşteri eklendi");
        router.push('/admin/customers');
      } else {
        toast.error("Müşteri eklenemedi");
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error("Müşteri eklenemedi");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/customers');
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

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/admin/customers" className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" id="new-customer-tabs">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="company">Şirket Bilgileri</TabsTrigger>
              <TabsTrigger value="authorized">Yetkili Bilgileri</TabsTrigger>
              <TabsTrigger value="social">Sosyal Medya</TabsTrigger>
              <TabsTrigger value="declarations">Beyannameler</TabsTrigger>
              <TabsTrigger value="notes">Notlar</TabsTrigger>
            </TabsList>

            {/* Company Information */}
            <TabsContent value="company" className="space-y-6">
              {/* Logo Upload Area and Company Info in same row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
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
                    <div>
                      <Label htmlFor="companyType">Şirket Türü</Label>
                      <Select value={companyType} onValueChange={(value: "PERSONAL" | "CAPITAL") => setCompanyType(value)}>
                        <SelectTrigger>
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
                      <Label htmlFor="taxOffice">Vergi Dairesi</Label>
                      <TaxOfficeCombobox
                        value={taxOffice}
                        onValueChange={(value) => {
                          // Find the tax office ID by name and set it
                          const selectedOffice = taxOffices.find(office => office.name === value);
                          setTaxOffice(selectedOffice ? selectedOffice.id : value);
                        }}
                        taxOffices={taxOffices}
                        placeholder="Vergi dairesi seçin..."
                        searchPlaceholder="Vergi dairesi ara..."
                        emptyMessage="Vergi dairesi bulunamadı."
                      />
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Label htmlFor="hasEmployees">Sigortalı Çalışan</Label>
                    <div className="flex gap-4 mt-2">
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
            </TabsContent>

            {/* Authorized Person */}
            <TabsContent value="authorized" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="authorizedName">Yetkili Kişi Adı Soyadı</Label>
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
                    maxLength={11}
                  />
                </div>
                <div>
                  <Label htmlFor="authorizedEmail">Yetkili E-posta</Label>
                  <Input
                    id="authorizedEmail"
                    type="email"
                    value={authorizedEmail}
                    onChange={(e) => setAuthorizedEmail(e.target.value)}
                    placeholder="ahmet.yilmaz@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="authorizedPhone">Yetkili Telefon</Label>
                  <PhoneInput
                    id="authorizedPhone"
                    value={authorizedPhone}
                    onChange={setAuthorizedPhone}
                    placeholder="(5__) ___ __ __"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="authorizedAddress">Yetkili Adres</Label>
                  <Textarea
                    id="authorizedAddress"
                    value={authorizedAddress}
                    onChange={(e) => setAuthorizedAddress(e.target.value)}
                    placeholder="Mahalle, sokak, bina no, daire no, ilçe, il"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="authorizationDate">Yetki Belgesi Tarihi</Label>
                  <Input
                    id="authorizationDate"
                    type="date"
                    value={authorizationDate}
                    onChange={(e) => setAuthorizationDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="authorizationPeriod">Yetki Belgesi Süresi (Ay)</Label>
                  <Input
                    id="authorizationPeriod"
                    type="number"
                    value={authorizationPeriod}
                    onChange={(e) => setAuthorizationPeriod(e.target.value)}
                    placeholder="12"
                    min="1"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Social Media */}
            <TabsContent value="social" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Firma Sosyal Medya Hesapları</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="threadsUrl">Threads</Label>
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
              
              <div>
                <h3 className="text-lg font-medium mb-4">Yetkili Sosyal Medya Hesapları</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="authorizedThreadsUrl">Threads</Label>
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
            </TabsContent>

            {/* Declarations */}
            <TabsContent value="declarations" className="space-y-6">
              <div className="text-center py-8 text-muted-foreground">
                Beyanname ayarları müşteri oluşturulduktan sonra yapılandırılabilir.
              </div>
            </TabsContent>

            {/* Notes */}
            <TabsContent value="notes" className="space-y-6">
              <div>
                <Label htmlFor="notes">Notlar</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Müşteri hakkında önemli notlar"
                  rows={6}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-8">
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              İptal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !companyName.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
