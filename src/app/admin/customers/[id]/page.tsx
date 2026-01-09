"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { useBreadcrumb } from "@/contexts/breadcrumb-context"

import { GeneralInfoTab } from "@/components/admin/customers/new-customer-tabs/general-info-tab"
import { CompanyConstitutionTab } from "@/components/admin/customers/new-customer-tabs/company-constitution-tab"
import { PartnersTab } from "@/components/admin/customers/new-customer-tabs/partners-tab"
import { CapitalInfoTab } from "@/components/admin/customers/new-customer-tabs/capital-info-tab"
import { BranchesTab } from "@/components/admin/customers/new-customer-tabs/branches-tab"
import { ActivityInfoTab } from "@/components/admin/customers/new-customer-tabs/activity-info-tab"
import { ChamberInfoTab } from "@/components/admin/customers/new-customer-tabs/chamber-info-tab"
import { DeclarationsTab } from "@/components/admin/customers/new-customer-tabs/declarations-tab"
import { DocumentsTab } from "@/components/admin/customers/new-customer-tabs/documents-tab"
import { FeeInfoTab } from "@/components/admin/customers/new-customer-tabs/fee-info-tab"
import { AccountsTab } from "@/components/admin/customers/new-customer-tabs/accounts-tab"
import { CorporateCredentialsTab } from "@/components/admin/customers/new-customer-tabs/corporate-credentials-tab"

export default function EditCustomerPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  
  const [activeTab, setActiveTab] = useState("general")
  const [customerId, setCustomerId] = useState<string | null>(null)
  const { setCustomLabel } = useBreadcrumb()

  useEffect(() => {
    if (id) {
      setCustomerId(id)

      // Fetch customer name for breadcrumb
      fetch(`/api/customers?id=${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.companyName) {
            setCustomLabel(data.companyName)
          }
        })
        .catch(err => console.error("Failed to fetch customer name", err))
    }

    return () => {
      setCustomLabel(null)
    }
  }, [id, setCustomLabel])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleGeneralInfoSuccess = (savedId: string, companyName?: string, shouldNavigate: boolean = true) => {
    // In edit mode, ID shouldn't change, but good to keep consistent
    if (!customerId) setCustomerId(savedId)
    if (companyName) setCustomLabel(companyName)
    if (shouldNavigate) {
      setActiveTab("partners")
    }
  }

  if (!customerId) {
    return <div>Yükleniyor...</div>
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Müşteri Detayları ve Düzenleme</h1>
          <p className="text-muted-foreground">
            Müşteri bilgilerini görüntüleyin ve düzenleyin.
          </p>
        </div>
      </div>

      <Tabs id="customer-detail-tabs" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full justify-start h-auto flex-wrap gap-2 bg-transparent p-0">
          <TabsTrigger 
            value="general"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background"
          >
            Genel Bilgiler
          </TabsTrigger>

          <TabsTrigger 
            value="partners"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background"
          >
            Ortak Bilgileri
          </TabsTrigger>
          <TabsTrigger 
            value="capital"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background"
          >
            Sermaye Bilgileri
          </TabsTrigger>
          <TabsTrigger 
            value="branches"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background"
          >
            Şube Bilgileri
          </TabsTrigger>
          <TabsTrigger 
            value="activity"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background"
          >
            Faaliyet Bilgileri
          </TabsTrigger>
          <TabsTrigger 
            value="chamber-info"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background"
          >
            Oda Bilgileri
          </TabsTrigger>
          <TabsTrigger 
            value="declarations"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background"
          >
            Beyanname Bilgileri
          </TabsTrigger>
          <TabsTrigger 
            value="corporate-credentials"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background"
          >
            Kurum Şifreleri
          </TabsTrigger>
          <TabsTrigger 
            value="documents"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background"
          >
            Evraklar
          </TabsTrigger>
          <TabsTrigger 
            value="fees"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background"
          >
            Ücret Bilgileri
          </TabsTrigger>
          <TabsTrigger 
            value="accounts"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background"
          >
            Hesap Bilgileri
          </TabsTrigger>
          <TabsTrigger 
            value="company-constitution"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background"
          >
            Şirket Ana Sözleşmesi
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="general" className="mt-0">
            {/* GeneralInfoTab will need to accept customerId prop */}
            <GeneralInfoTab onSuccess={handleGeneralInfoSuccess} customerId={customerId} />
          </TabsContent>

          <TabsContent value="partners" className="mt-0">
            <PartnersTab 
              customerId={customerId} 
              onNext={() => setActiveTab("capital")} 
              onBack={() => setActiveTab("general")}
            />
          </TabsContent>
          <TabsContent value="capital" className="mt-0">
            <CapitalInfoTab 
              customerId={customerId}
              onNext={() => setActiveTab("branches")}
              onBack={() => setActiveTab("partners")}
            />
          </TabsContent>
          <TabsContent value="branches" className="mt-0">
            <BranchesTab 
              customerId={customerId}
              onNext={() => setActiveTab("activity")}
              onBack={() => setActiveTab("capital")}
            />
          </TabsContent>
          <TabsContent value="activity" className="mt-0">
            <ActivityInfoTab 
              customerId={customerId}
              onNext={() => setActiveTab("chamber-info")}
              onBack={() => setActiveTab("branches")}
            />
          </TabsContent>
          <TabsContent value="chamber-info" className="mt-0">
            <ChamberInfoTab 
              customerId={customerId}
              onNext={() => setActiveTab("declarations")}
              onBack={() => setActiveTab("activity")}
            />
          </TabsContent>
          <TabsContent value="declarations" className="mt-0">
            <DeclarationsTab 
              customerId={customerId}
              onNext={() => setActiveTab("corporate-credentials")}
              onBack={() => setActiveTab("chamber-info")}
            />
          </TabsContent>
          <TabsContent value="corporate-credentials" className="mt-0">
            <CorporateCredentialsTab 
              customerId={customerId}
              onNext={() => setActiveTab("documents")}
              onBack={() => setActiveTab("declarations")}
            />
          </TabsContent>
          <TabsContent value="documents" className="mt-0">
            <DocumentsTab 
              customerId={customerId}
              onNext={() => setActiveTab("fees")}
              onBack={() => setActiveTab("corporate-credentials")}
            />
          </TabsContent>
          <TabsContent value="fees" className="mt-0">
            <FeeInfoTab 
              customerId={customerId}
              onNext={() => setActiveTab("accounts")}
              onBack={() => setActiveTab("documents")}
            />
          </TabsContent>
          <TabsContent value="accounts" className="mt-0">
            <AccountsTab 
              customerId={customerId}
              onBack={() => setActiveTab("fees")}
              onFinish={() => setActiveTab("company-constitution")}
            />
          </TabsContent>
          <TabsContent value="company-constitution" className="mt-0">
            <CompanyConstitutionTab 
              customerId={customerId} 
              onSuccess={() => {
                toast.success("Müşteri bilgileri güncellendi")
                router.push("/admin/customers")
              }} 
              onBack={() => setActiveTab("accounts")}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
