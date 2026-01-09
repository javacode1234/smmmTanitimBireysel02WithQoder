"use client"

import { 
  Building2, Phone, Users, Wallet, MapPin, Briefcase, Award, 
  FileCheck, FileText, Banknote, History, ShieldCheck, Shield,
  Download, Lock, Facebook, Twitter, Instagram, Linkedin, Send, AtSign,
  Calendar, User
} from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts'
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PdfExportButton } from "@/components/client/company-profile/pdf-export-button"
import { PasswordList } from "@/components/client/company-profile/password-list"

// Helper types
interface SectionProps {
  data: any
  customer?: any
}

export function GeneralInfoSection({ customer, activityCodeData }: { customer: any, activityCodeData?: any }) {
  return (
    <AccordionItem value="general" className="border rounded-lg bg-card">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <span className="text-xl font-semibold">Genel Bilgiler</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {customer.logo && (
            <div className="col-span-full mb-2">
              <span className="text-sm text-muted-foreground block mb-2">Logo</span>
              <img src={customer.logo} alt="Logo" className="h-24 w-auto object-contain border rounded-md p-2 bg-white" />
            </div>
          )}
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Şirket Ünvanı</span>
            <p className="font-medium">{customer.companyName}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Vergi No / TCKN</span>
            <p className="font-medium">{customer.taxNumber || customer.tckn || "-"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">İl</span>
            <p className="font-medium">{customer.city || "-"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">İlçe</span>
            <p className="font-medium">{customer.district || "-"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Vergi Dairesi</span>
            <p className="font-medium">{customer.taxOffice?.name || "-"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Şirket Türü</span>
            <p className="font-medium">{customer.companyType === "ISLETME" ? "Şahıs İşletmesi" : customer.companyType === "SERMAYE" ? "Sermaye Şirketi" : customer.companyType || "-"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Şirket Sınıfı</span>
            <p className="font-medium">
              {customer.companyClass === "SINIF_1" ? "1. Sınıf" : customer.companyClass === "SINIF_2" ? "2. Sınıf" : customer.companyClass || "-"}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Kuruluş Tarihi</span>
            <p className="font-medium">
              {customer.establishmentDate ? new Date(customer.establishmentDate).toLocaleDateString('tr-TR') : "-"}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Şirket Süresi</span>
            <p className="font-medium">{customer.companyDuration || "-"}</p>
          </div>
          {customer.companyDuration === "Süreli" && customer.companyEndDate && (
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Bitiş Tarihi</span>
              <p className="font-medium">
                {new Date(customer.companyEndDate).toLocaleDateString('tr-TR')}
              </p>
            </div>
          )}
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Çalışan Sayısı</span>
            <p className="font-medium">{customer.employeeCount || "0"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">KEP Adresi</span>
            <p className="font-medium">{customer.kepAddress || "-"}</p>
          </div>

          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Ana Faaliyet Kodu</span>
            <p className="font-medium">
              {activityCodeData 
                ? `${activityCodeData.code} - ${activityCodeData.name}` 
                : (customer.mainActivityCode || "-")}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Telefon</span>
            <p className="font-medium">{customer.phone || "-"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">E-posta</span>
            <p className="font-medium">{customer.email || "-"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Web Sitesi</span>
            <p className="font-medium">
              {customer.website ? (
                <a 
                  href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary hover:underline"
                >
                  {customer.website}
                </a>
              ) : "-"}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Merkez Adresi</span>
            <p className="font-medium">{customer.address || "-"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Adres Kodu</span>
            <p className="font-medium">{customer.addressCode || "-"}</p>
          </div>
          
          <div className="col-span-full border-t pt-4 mt-2">
            <h4 className="font-semibold mb-4">Yetkili Kişi Bilgileri</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Ad Soyad</span>
                <p className="font-medium">{customer.authorizedName || "-"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">TCKN</span>
                <p className="font-medium">{customer.authorizedTCKN || "-"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Telefon</span>
                <p className="font-medium">{customer.authorizedPhone || "-"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">E-posta</span>
                <p className="font-medium">{customer.authorizedEmail || "-"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Adres</span>
                <p className="font-medium">{customer.authorizedAddress || "-"}</p>
              </div>
            </div>
          </div>


        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export function ContactInfoSection({ customer }: { customer: any }) {
  return (
    <AccordionItem value="contact" className="border rounded-lg bg-card">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          <span className="text-xl font-semibold">İletişim Bilgileri</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Adres</span>
            <p className="font-medium">
              {[customer.address, customer.district, customer.city].filter(Boolean).join(' / ')}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Telefon</span>
            <p className="font-medium">{customer.phone || "-"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">E-posta</span>
            <p className="font-medium">{customer.email || "-"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Web Sitesi</span>
            <p className="font-medium">{customer.website || "-"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">KEP Adresi</span>
            <p className="font-medium">{customer.kepAddress || "-"}</p>
          </div>
          
          <div className="col-span-full border-t pt-4 mt-2">
            <h4 className="font-semibold mb-4">Sosyal Medya</h4>
            <div className="flex flex-wrap gap-4">
              {customer.facebookUrl && (
                <a href={customer.facebookUrl} target="_blank" rel="noopener noreferrer" className="p-2 border rounded-full hover:bg-muted transition-colors text-blue-600" title="Facebook">
                  <Facebook className="h-6 w-6" />
                </a>
              )}
              {customer.xUrl && (
                <a href={customer.xUrl} target="_blank" rel="noopener noreferrer" className="p-2 border rounded-full hover:bg-muted transition-colors text-black" title="X (Twitter)">
                  <Twitter className="h-6 w-6" />
                </a>
              )}
              {customer.instagramUrl && (
                <a href={customer.instagramUrl} target="_blank" rel="noopener noreferrer" className="p-2 border rounded-full hover:bg-muted transition-colors text-pink-600" title="Instagram">
                  <Instagram className="h-6 w-6" />
                </a>
              )}
              {customer.linkedinUrl && (
                <a href={customer.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-2 border rounded-full hover:bg-muted transition-colors text-blue-700" title="LinkedIn">
                  <Linkedin className="h-6 w-6" />
                </a>
              )}
              {customer.telegramUrl && (
                 <a href={customer.telegramUrl} target="_blank" rel="noopener noreferrer" className="p-2 border rounded-full hover:bg-muted transition-colors text-blue-500" title="Telegram">
                  <Send className="h-6 w-6" />
                </a>
              )}
              {customer.threadsUrl && (
                 <a href={customer.threadsUrl} target="_blank" rel="noopener noreferrer" className="p-2 border rounded-full hover:bg-muted transition-colors text-black" title="Threads / Nsosyal">
                  <AtSign className="h-6 w-6" />
                </a>
              )}
              {!customer.facebookUrl && !customer.xUrl && !customer.instagramUrl && !customer.linkedinUrl && !customer.telegramUrl && !customer.threadsUrl && (
                <p className="text-sm text-muted-foreground">Kayıtlı sosyal medya hesabı bulunmamaktadır.</p>
              )}
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export function PartnersSection({ partners }: { partners: any[] }) {
  return (
    <AccordionItem value="partners" className="border rounded-lg bg-card">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <span className="text-xl font-semibold">Ortaklar ({partners.length})</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 pt-0">
        {partners.length > 0 ? (
          <div className="rounded-md border mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad Soyad / Ünvan</TableHead>
                  <TableHead>TCKN / VKN</TableHead>
                  <TableHead>Hisse Bilgileri</TableHead>
                  <TableHead>İletişim</TableHead>
                  <TableHead className="w-[300px]">Yetki Durumu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((partner: any, i: number) => {
                  let progressData = null;
                  if (partner.isAuthorized && partner.authorizationEndDate) {
                    const end = new Date(partner.authorizationEndDate);
                    const start = partner.authorizationStartDate ? new Date(partner.authorizationStartDate) : new Date(partner.startDate || new Date().setFullYear(new Date().getFullYear() - 1));
                    const now = new Date();
                    const total = end.getTime() - start.getTime();
                    const elapsed = now.getTime() - start.getTime();
                    let percent = (elapsed / total) * 100;
                    if (percent < 0) percent = 0;
                    if (percent > 100) percent = 100;
                    
                    const diff = end.getTime() - now.getTime();
                    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
                    let text = "";
                    
                    if (diff < 0) {
                       text = "Süresi Doldu";
                    } else {
                       const years = Math.floor(daysLeft / 365);
                       const months = Math.floor((daysLeft % 365) / 30);
                       const days = (daysLeft % 365) % 30;
                       
                       if (years > 0) text += `${years} Yıl `;
                       if (months > 0) text += `${months} Ay `;
                       if (years === 0 && months === 0) text += `${days} Gün `;
                       text += "kaldı";
                    }
                    progressData = { percent, text };
                  }

                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="text-base">{partner.fullName || partner.name || "-"}</span>
                          {partner.isManager && <span className="text-xs text-muted-foreground">Şirket Müdürü</span>}
                        </div>
                      </TableCell>
                      <TableCell>{partner.tckn || "-"}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex justify-between w-32">
                             <span className="text-muted-foreground">Tutar:</span>
                             <span>{partner.shareAmount ? `${partner.shareAmount} TL` : "-"}</span>
                          </div>
                          <div className="flex justify-between w-32">
                             <span className="text-muted-foreground">Oran:</span>
                             <span>{partner.shareRatio ? `%${partner.shareRatio}` : "-"}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                            {(partner.phone) && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                    <span>{partner.phone}</span>
                                </div>
                            )}
                            {(partner.email) && (
                                <div className="flex items-center gap-2">
                                    <AtSign className="h-3 w-3 text-muted-foreground" />
                                    <span>{partner.email}</span>
                                </div>
                            )}
                            {(!partner.phone && !partner.email) && "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {partner.isAuthorized ? (
                           <div className="space-y-3">
                              <Badge variant="default" className="bg-green-600 hover:bg-green-700 w-fit">
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                Yetkili
                              </Badge>
                              
                              {partner.authorizationEndDate && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                      <span>Bitiş: {new Date(partner.authorizationEndDate).toLocaleDateString('tr-TR')}</span>
                                      <span className={progressData?.text === "Süresi Doldu" ? "text-destructive font-bold" : "text-muted-foreground"}>
                                          {progressData?.text}
                                      </span>
                                  </div>
                                  <Progress value={progressData?.percent || 0} className="h-2" />
                                </div>
                              )}
                           </div>
                        ) : (
                          <Badge variant="outline">Ortak</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed mt-4">
             <div className="bg-muted p-3 rounded-full mb-3">
                <Users className="h-6 w-6 opacity-50" />
             </div>
             <p className="font-medium">Kayıtlı ortak bilgisi bulunmamaktadır.</p>
           </div>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}

export function CapitalSection({ capitalInfo, partners }: { capitalInfo: any, partners: any[] }) {
  const capitals = Array.isArray(capitalInfo) ? capitalInfo : []
  const activeCapitals = capitals.filter((c: any) => c.status === 'active' || !c.status)
  
  const chartData = activeCapitals.map((cap: any) => {
    const partner = partners?.find(p => p.id === cap.partnerId)
    let amount = 0
    if (cap.partnerShareCount && cap.sharePrice) {
       amount = parseFloat(cap.partnerShareCount) * parseFloat(cap.sharePrice)
    } else if (cap.totalCapital && cap.capitalRatio) {
       amount = parseFloat(cap.totalCapital) * (parseFloat(cap.capitalRatio) / 100)
    }
    
    return {
      name: partner ? (partner.fullName || partner.name) : 'Bilinmeyen Ortak',
      value: amount,
      ratio: cap.capitalRatio
    }
  }).filter((d: any) => d.value > 0)

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']
  const totalCapital = activeCapitals.length > 0 ? activeCapitals[0].totalCapital : "0"

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return num.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TL'
  }

  return (
    <AccordionItem value="capital" className="border rounded-lg bg-card">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          <span className="text-xl font-semibold">Sermaye Bilgileri</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg border">
                <span className="text-sm text-muted-foreground font-medium">Toplam Sermaye</span>
                <p className="text-3xl font-bold text-primary mt-1">{formatCurrency(totalCapital)}</p>
            </div>
            
             <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ortak</TableHead>
                      <TableHead className="text-right">Pay Oranı</TableHead>
                      <TableHead className="text-right">Pay Tutarı</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeCapitals.length > 0 ? (
                        activeCapitals.map((cap: any, i: number) => {
                             const partner = partners?.find(p => p.id === cap.partnerId)
                             const amount = (cap.partnerShareCount && cap.sharePrice) 
                                ? parseFloat(cap.partnerShareCount) * parseFloat(cap.sharePrice)
                                : (parseFloat(cap.totalCapital) * (parseFloat(cap.capitalRatio) / 100))
                             
                             return (
                              <TableRow key={i}>
                                <TableCell className="font-medium">{partner ? (partner.fullName || partner.name) : '-'}</TableCell>
                                <TableCell className="text-right">%{cap.capitalRatio}</TableCell>
                                <TableCell className="text-right">{formatCurrency(amount)}</TableCell>
                              </TableRow>
                             )
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                                Sermaye bilgisi bulunmamaktadır.
                            </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
             </div>
          </div>

          <div className="h-[300px] w-full min-h-[300px] flex items-center justify-center bg-muted/10 rounded-lg border p-4">
             {chartData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                 </PieChart>
               </ResponsiveContainer>
             ) : (
                <div className="text-muted-foreground flex flex-col items-center gap-2">
                    <Wallet className="h-8 w-8 opacity-20" />
                    <span className="text-sm">Grafik için veri yok</span>
                </div>
             )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export function BranchesSection({ branches, activityCodes = [] }: { branches: any[], activityCodes?: any[] }) {
  return (
    <AccordionItem value="branches" className="border rounded-lg bg-card">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <span className="text-xl font-semibold">Şube Bilgileri ({branches.length})</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 pt-0">
        {branches.length > 0 ? (
          <div className="rounded-md border mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Şube Adı</TableHead>
                  <TableHead>Adres No</TableHead>
                  <TableHead>Adres</TableHead>
                  <TableHead>Faaliyet Kodu</TableHead>
                  <TableHead>Açılış Tarihi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((branch: any, i: number) => {
                  const activity = activityCodes?.find(ac => ac.id === branch.activityCode)
                  const activityText = activity ? `${activity.code} - ${activity.name}` : (branch.activityCode || "-")

                  return (
                  <TableRow key={i}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {branch.name || "İsimsiz Şube"}
                      {branch.isCentral && <Badge variant="secondary" className="ml-2 text-xs">Merkez</Badge>}
                    </TableCell>
                    <TableCell>{branch.addressNo || "-"}</TableCell>
                    <TableCell>
                      <div className="relative group max-w-[200px]">
                         <div className="truncate cursor-help">{branch.address || "-"}</div>
                         {branch.address && (
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-popover text-popover-foreground text-xs p-2 rounded border shadow-md z-50 w-[300px] whitespace-normal">
                              {branch.address}
                            </div>
                         )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="relative group max-w-[150px]">
                         <div className="truncate cursor-help">{activityText}</div>
                         {activityText !== "-" && (
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-popover text-popover-foreground text-xs p-2 rounded border shadow-md z-50 w-[250px] whitespace-normal">
                              {activityText}
                            </div>
                         )}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {branch.startDate 
                        ? new Date(branch.startDate).toLocaleDateString('tr-TR') 
                        : "-"}
                    </TableCell>
                  </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
           <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
             <div className="bg-muted p-4 rounded-full mb-4">
                <MapPin className="h-8 w-8 opacity-50" />
             </div>
             <p className="font-medium">Kayıtlı şube bilgisi bulunmamaktadır.</p>
           </div>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}

export function ActivitiesSection({ 
  activities, 
  mainActivityCode,
  mainActivityData,
  additionalActivityCodes = []
}: { 
  activities: any[], 
  mainActivityCode: string | null,
  mainActivityData?: any,
  additionalActivityCodes?: any[]
}) {
  return (
    <AccordionItem value="activities" className="border rounded-lg bg-card">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <span className="text-xl font-semibold">Faaliyet Bilgileri ({activities.length})</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 pt-0">
         <div className="space-y-4 mt-4">
           <div className="space-y-1">
             <span className="text-sm text-muted-foreground">Ana Faaliyet Kodu (NACE)</span>
             <p className="font-medium">
               {mainActivityData 
                 ? `${mainActivityData.code} - ${mainActivityData.name}` 
                 : (mainActivityCode || "-")}
             </p>
           </div>
           
           {activities.length > 0 && (
             <div className="rounded-md border">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Faaliyet Kodu</TableHead>
                     <TableHead>Açıklama</TableHead>
                     <TableHead>Başlangıç Tarihi</TableHead>
                     <TableHead>Durum</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {activities.map((activity: any, i: number) => {
                     const codeData = additionalActivityCodes?.find(ac => ac.id === activity.activityCode)
                     const codeText = codeData ? `${codeData.code} - ${codeData.name}` : (activity.code || activity.activityCode || "-")

                     return (
                     <TableRow key={i}>
                       <TableCell className="font-medium">
                          <div className="relative group max-w-[250px]">
                             <div className="truncate cursor-help">{codeText}</div>
                             {codeText !== "-" && (
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-popover text-popover-foreground text-xs p-2 rounded border shadow-md z-50 w-[300px] whitespace-normal">
                                  {codeText}
                                </div>
                             )}
                          </div>
                       </TableCell>
                       <TableCell>{activity.description || "-"}</TableCell>
                       <TableCell>{activity.startDate ? new Date(activity.startDate).toLocaleDateString('tr-TR') : "-"}</TableCell>
                       <TableCell>
                         <Badge variant={activity.status === 'PASSIVE' ? "secondary" : "default"}>
                           {activity.status === 'PASSIVE' ? 'Pasif' : 'Aktif'}
                         </Badge>
                       </TableCell>
                     </TableRow>
                     )
                   })}
                 </TableBody>
               </Table>
             </div>
           )}
         </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export function ChambersSection({ chambers }: { chambers: any[] }) {
  return (
    <AccordionItem value="chambers" className="border rounded-lg bg-card">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <span className="text-xl font-semibold">Oda Bilgileri ({chambers.length})</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 pt-0">
        {chambers.length > 0 ? (
          <div className="rounded-md border mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Oda Türü</TableHead>
                  <TableHead>Oda Adı</TableHead>
                  <TableHead>Ticaret/Esnaf Sicil No</TableHead>
                  <TableHead>Oda Sicil No</TableHead>
                  <TableHead>Kayıt Tarihi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chambers.map((chamber: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Badge variant="outline">
                        {chamber.type === 'COMMERCE' ? 'Ticaret Odası' : 
                         chamber.type === 'TRADESMAN' ? 'Esnaf Odası' : 
                         (chamber.type || 'Diğer')}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{chamber.chamberName || chamber.chamber || "-"}</TableCell>
                    <TableCell>{chamber.registryNo || "-"}</TableCell>
                    <TableCell>{chamber.chamberRegistryNo || "-"}</TableCell>
                    <TableCell>
                      {(chamber.registerDate || chamber.membershipDate)
                        ? new Date(chamber.registerDate || chamber.membershipDate).toLocaleDateString('tr-TR') 
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed mt-4">
             <div className="bg-muted p-3 rounded-full mb-3">
                <Building2 className="h-6 w-6 opacity-50" />
             </div>
             <p className="font-medium">Kayıtlı oda bilgisi bulunmamaktadır.</p>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}

export function AuthorizedPersonsSection({ authorizedPersons, customer, partners = [] }: { authorizedPersons: any[], customer: any, partners?: any[] }) {
  // Sadece ortaklar tablosundan yetkili olanları al
  const displayPersons = (partners || []).filter(p => p.isAuthorized).map(p => ({
    name: p.fullName || p.name,
    tckn: p.tckn,
    title: "Şirket Ortağı / Yetkili",
    phone: p.phone || "",
    email: p.email || "",
    startDate: p.startDate,
    authorizationDuration: p.authorizationDuration,
    authorizationStartDate: p.authorizationStartDate,
    authorizationEndDate: p.authorizationEndDate,
    isFromPartners: true
  }));

  return (
    <AccordionItem value="authorized" className="border rounded-lg bg-card">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <span className="text-xl font-semibold">Yetkili Kişiler ({displayPersons.length})</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 pt-0">
         {displayPersons.length > 0 ? (
           <div className="rounded-md border mt-4">
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Ad Soyad</TableHead>
                   <TableHead>TCKN</TableHead>
                   <TableHead>Ünvan / Görev</TableHead>
                   <TableHead>İletişim</TableHead>
                   <TableHead className="w-[300px]">Yetki Süresi</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {displayPersons.map((person: any, i: number) => {
                   let progressData = null;
                   if (person.authorizationEndDate) {
                     const end = new Date(person.authorizationEndDate);
                     const start = person.authorizationStartDate ? new Date(person.authorizationStartDate) : new Date(person.startDate || new Date().setFullYear(new Date().getFullYear() - 1));
                     const now = new Date();
                     const total = end.getTime() - start.getTime();
                     const elapsed = now.getTime() - start.getTime();
                     let percent = (elapsed / total) * 100;
                     if (percent < 0) percent = 0;
                     if (percent > 100) percent = 100;
                     
                     const diff = end.getTime() - now.getTime();
                     const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
                     let text = "";
                     
                     if (diff < 0) {
                        text = "Süresi Doldu";
                     } else {
                        const years = Math.floor(daysLeft / 365);
                        const months = Math.floor((daysLeft % 365) / 30);
                        const days = (daysLeft % 365) % 30;
                        
                        if (years > 0) text += `${years} Yıl `;
                        if (months > 0) text += `${months} Ay `;
                        if (years === 0 && months === 0) text += `${days} Gün `;
                        text += "kaldı";
                     }
                     progressData = { percent, text };
                   }

                   return (
                   <TableRow key={i}>
                     <TableCell className="font-medium">
                        <div className="flex flex-col">
                            <span>{person.name || "-"}</span>
                        </div>
                     </TableCell>
                     <TableCell>{person.tckn || "-"}</TableCell>
                     <TableCell>
                        <Badge variant="secondary" className="font-normal">
                            {person.title || "Yetkili"}
                        </Badge>
                     </TableCell>
                     <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                            {person.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                    <span>{person.phone}</span>
                                </div>
                            )}
                            {person.email && (
                                <div className="flex items-center gap-2">
                                    <AtSign className="h-3 w-3 text-muted-foreground" />
                                    <span>{person.email}</span>
                                </div>
                            )}
                            {(!person.phone && !person.email) && "-"}
                        </div>
                     </TableCell>
                     <TableCell>
                        {person.authorizationEndDate ? (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span>{new Date(person.authorizationEndDate).toLocaleDateString('tr-TR')}</span>
                                <span className={progressData?.text === "Süresi Doldu" ? "text-destructive font-bold" : "text-muted-foreground"}>
                                    {progressData?.text}
                                </span>
                            </div>
                            <Progress value={progressData?.percent || 0} className="h-2" />
                          </div>
                        ) : (
                          <span>{person.authorizationDuration ? `${person.authorizationDuration} Yıl` : "-"}</span>
                        )}
                     </TableCell>
                   </TableRow>
                   )
                 })}
               </TableBody>
             </Table>
           </div>
         ) : (
           <div className="flex flex-col items-center justify-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed mt-4">
             <div className="bg-muted p-3 rounded-full mb-3">
                <Award className="h-6 w-6 opacity-50" />
             </div>
             <p className="font-medium">Yetkili ortak bilgisi bulunmamaktadır.</p>
           </div>
         )}
      </AccordionContent>
    </AccordionItem>
  )
}

export function DeclarationsSection() {
  return (
    <AccordionItem value="declarations" className="border rounded-lg bg-card">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" />
          <span className="text-xl font-semibold">Beyanname Bilgileri</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 pt-0">
         <div className="mt-4">
           <p className="text-sm text-muted-foreground mb-4">
             Beyanname yükümlülükleriniz ve dönemleri aşağıda listelenmiştir. Detaylı beyanname takibi için "Beyannamelerim" sayfasını kullanabilirsiniz.
           </p>
           <div className="flex flex-wrap gap-2">
             <Badge variant="outline">KDV (Aylık)</Badge>
             <Badge variant="outline">Muhtasar (3 Aylık)</Badge>
             <Badge variant="outline">Geçici Vergi (3 Aylık)</Badge>
             <Badge variant="outline">Kurumlar Vergisi (Yıllık)</Badge>
           </div>
         </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export function DocumentsSection({ documents }: { documents: any[] }) {
  return (
    <AccordionItem value="documents" className="border rounded-lg bg-card">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <span className="text-xl font-semibold">Evraklar ({documents.length})</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 pt-0">
        {documents.length > 0 ? (
          <div className="rounded-md border mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evrak Adı</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Yükleme Tarihi</TableHead>
                  <TableHead className="text-right">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{doc.name || "-"}</TableCell>
                    <TableCell>{doc.category || "-"}</TableCell>
                    <TableCell>{doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString('tr-TR') : "-"}</TableCell>
                    <TableCell className="text-right">
                      {doc.file && (
                        <div className="flex justify-end">
                           <Button variant="ghost" size="sm" asChild>
                            <a href={doc.file} target="_blank" rel="noopener noreferrer" className="flex items-center">
                              <Download className="w-4 h-4 mr-2" />
                              İndir
                            </a>
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-muted-foreground text-sm mt-2">Kayıtlı evrak bulunmamaktadır.</div>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}

export function PasswordsSection({ passwords }: { passwords: any }) {
  return (
    <AccordionItem value="passwords" className="border rounded-lg bg-card">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <span className="text-xl font-semibold">Şifre Bilgileri</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 pt-0">
         <PasswordList passwords={passwords} />
      </AccordionContent>
    </AccordionItem>
  )
}

export function FeesSection({ customer }: { customer: any }) {
  return (
    <AccordionItem value="fees" className="border rounded-lg bg-card">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <Banknote className="h-5 w-5 text-primary" />
          <span className="text-xl font-semibold">Ücret Bilgileri</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
           <div className="space-y-1">
             <span className="text-sm text-muted-foreground">Aylık Muhasebe Ücreti</span>
             <p className="font-medium">{customer.subscriptionFee ? `${customer.subscriptionFee} TL` : "-"}</p>
           </div>
           <div className="space-y-1">
             <span className="text-sm text-muted-foreground">Tahakkuk Günü</span>
             <p className="font-medium">Her ayın {customer.feeAccrualDay || 1}. günü</p>
           </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export function TransactionsSection({ transactionsWithBalance }: { transactionsWithBalance: any[] }) {
  return (
    <AccordionItem value="transactions" className="border rounded-lg bg-card">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <span className="text-xl font-semibold">Cari Hesap Hareketleri</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 pt-0">
         <div className="flex justify-end mt-4 mb-2">
           <PdfExportButton type="account" data={transactionsWithBalance} title="Cari Hesap Hareketleri" fileName="cari-hesap" />
         </div>
         {transactionsWithBalance.length > 0 ? (
           <div className="rounded-md border">
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Tarih</TableHead>
                   <TableHead>Açıklama</TableHead>
                   <TableHead className="text-right">Borç</TableHead>
                   <TableHead className="text-right">Alacak</TableHead>
                   <TableHead className="text-right">Bakiye</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {transactionsWithBalance.map((t: any, i: number) => (
                   <TableRow key={i}>
                     <TableCell>{t.date ? new Date(t.date).toLocaleDateString('tr-TR') : "-"}</TableCell>
                     <TableCell>{t.description}</TableCell>
                     <TableCell className="text-right text-red-600">
                       {t.debit > 0 ? `${t.debit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL` : "-"}
                     </TableCell>
                     <TableCell className="text-right text-green-600">
                       {t.credit > 0 ? `${t.credit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL` : "-"}
                     </TableCell>
                     <TableCell className="text-right font-medium">
                       {t.balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           </div>
         ) : (
           <div className="text-muted-foreground text-sm mt-4">Henüz hesap hareketi bulunmamaktadır.</div>
         )}
      </AccordionContent>
    </AccordionItem>
  )
}

export function ConstitutionSection({ constitution }: { constitution: any }) {
  return (
    <AccordionItem value="constitution" className="border rounded-lg bg-card">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <span className="text-xl font-semibold">Şirket Ana Sözleşmesi</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 pt-0">
        <div className="flex justify-end mt-4 mb-2">
          <PdfExportButton type="constitution" data={constitution} title="Şirket Ana Sözleşmesi" fileName="ana-sozlesme" />
        </div>
        <div className="mt-4 p-4 border rounded-md bg-muted/20 min-h-[200px] text-sm whitespace-pre-wrap">
          {typeof constitution === 'string' 
            ? constitution.replace(/<[^>]*>?/gm, '') 
            : "Ana sözleşme bilgisi bulunmamaktadır."}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
