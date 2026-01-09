"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import { GeneralInfoTab } from "@/components/admin/customers/new-customer-tabs/general-info-tab"
import { CompanyConstitutionTab } from "@/components/admin/customers/new-customer-tabs/company-constitution-tab"
import { PartnersTab } from "@/components/admin/customers/new-customer-tabs/partners-tab"
import { CapitalInfoTab } from "@/components/admin/customers/new-customer-tabs/capital-info-tab"
import { BranchesTab } from "@/components/admin/customers/new-customer-tabs/branches-tab"
import { ActivityInfoTab } from "@/components/admin/customers/new-customer-tabs/activity-info-tab"
import { ChamberInfoTab } from "@/components/admin/customers/new-customer-tabs/chamber-info-tab"
import { DeclarationsTab } from "@/components/admin/customers/new-customer-tabs/declarations-tab"
import { CorporateCredentialsTab } from "@/components/admin/customers/new-customer-tabs/corporate-credentials-tab"
import { DocumentsTab } from "@/components/admin/customers/new-customer-tabs/documents-tab"
import { FeeInfoTab } from "@/components/admin/customers/new-customer-tabs/fee-info-tab"
import { AccountsTab } from "@/components/admin/customers/new-customer-tabs/accounts-tab"

const STEPS = [
  { id: "general", title: "Genel Bilgiler", description: "Temel müşteri bilgileri" },
  { id: "partners", title: "Ortaklar", description: "Ortaklık yapısı" },
  { id: "capital", title: "Sermaye", description: "Sermaye detayları" },
  { id: "branches", title: "Şubeler", description: "Şube bilgileri" },
  { id: "activity", title: "Faaliyet", description: "Faaliyet alanları" },
  { id: "chamber-info", title: "Oda Bilgileri", description: "Oda kayıt bilgileri" },
  { id: "declarations", title: "Beyannameler", description: "Vergi beyannameleri" },
  { id: "corporate-credentials", title: "Kurum Şifreleri", description: "Vergi ve SGK şifreleri" },
  { id: "documents", title: "Evraklar", description: "Gerekli evraklar" },
  { id: "fees", title: "Ücretler", description: "Hizmet ücretleri" },
  { id: "accounts", title: "Hesaplar", description: "Banka ve kasa" },
  { id: "company-constitution", title: "Ana Sözleşme", description: "Şirket ana sözleşmesi" },
]

export default function NewCustomerPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("general")
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  const currentStepIndex = STEPS.findIndex(s => s.id === activeTab)

  const handleStepChange = (stepId: string) => {
    // Prevent jumping to future steps if current flow is not completed
    // Allow going back to any previous step
    // Allow going to next step only if we have customerId (for steps after general)
    
    const targetIndex = STEPS.findIndex(s => s.id === stepId)
    
    if (targetIndex > currentStepIndex) {
      // Trying to go forward
      if (!customerId && activeTab === "general") {
        toast.warning("Lütfen önce genel bilgileri kaydedin.")
        return
      }
      
      // Strict linear progression check (optional, but good for "Wizard")
      // If we want to allow jumping to any step as long as customerId exists:
      if (!customerId) {
        toast.warning("Lütfen önce genel bilgileri kaydedin.")
        return
      }
    }

    setActiveTab(stepId)
  }

  const markStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId])
    }
  }

  const handleGeneralInfoSuccess = (id: string, companyName?: string, shouldNavigate: boolean = true) => {
    setCustomerId(id)
    markStepComplete("general")
    if (shouldNavigate) {
      setActiveTab("partners")
    }
  }

  const handleNext = (currentStepId: string, nextStepId: string) => {
    markStepComplete(currentStepId)
    setActiveTab(nextStepId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = (prevStepId: string) => {
    setActiveTab(prevStepId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Yeni Müşteri Ekle</h1>
          <p className="text-muted-foreground">
            Adım adım müşteri kayıt sihirbazı
          </p>
        </div>
      </div>

      {/* Stepper Indicator */}
      <div className="relative">
        <div className="absolute top-4 left-0 w-full h-0.5 bg-muted -z-10" />
        <div 
          className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-300 -z-10" 
          style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
        />
        
        <div className="flex justify-between items-start overflow-x-auto pb-4 gap-2 no-scrollbar">
          {STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id) || index < currentStepIndex
            const isCurrent = step.id === activeTab
            const isClickable = index <= currentStepIndex || (customerId && index <= completedSteps.length + 1)

            return (
              <div 
                key={step.id} 
                className={cn(
                  "flex flex-col items-center gap-2 min-w-[80px] cursor-pointer group",
                  !isClickable && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => isClickable && handleStepChange(step.id)}
              >
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-200 bg-background",
                    isCompleted ? "bg-primary border-primary text-primary-foreground" :
                    isCurrent ? "border-primary text-primary" : "border-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <span>{index + 1}</span>}
                </div>
                <div className="text-center">
                  <p className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    isCurrent ? "text-primary" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-6 border rounded-lg p-6 bg-card shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">{STEPS[currentStepIndex].title}</h2>
          <p className="text-sm text-muted-foreground">{STEPS[currentStepIndex].description}</p>
        </div>

        {activeTab === "general" && (
          <GeneralInfoTab onSuccess={handleGeneralInfoSuccess} customerId={customerId} />
        )}

        {activeTab === "partners" && (
          <PartnersTab 
            customerId={customerId} 
            onNext={() => handleNext("partners", "capital")} 
            onBack={() => handleBack("general")}
          />
        )}
        {activeTab === "capital" && (
          <CapitalInfoTab 
            customerId={customerId}
            onNext={() => handleNext("capital", "branches")}
            onBack={() => handleBack("partners")}
          />
        )}
        {activeTab === "branches" && (
          <BranchesTab 
            customerId={customerId}
            onNext={() => handleNext("branches", "activity")}
            onBack={() => handleBack("capital")}
          />
        )}
        {activeTab === "activity" && (
          <ActivityInfoTab 
            customerId={customerId}
            onNext={() => handleNext("activity", "chamber-info")}
            onBack={() => handleBack("branches")}
          />
        )}
        {activeTab === "chamber-info" && (
          <ChamberInfoTab 
            customerId={customerId}
            onNext={() => handleNext("chamber-info", "declarations")}
            onBack={() => handleBack("activity")}
          />
        )}
        {activeTab === "declarations" && (
          <DeclarationsTab 
            customerId={customerId}
            onNext={() => handleNext("declarations", "corporate-credentials")}
            onBack={() => handleBack("chamber-info")}
          />
        )}
        {activeTab === "corporate-credentials" && (
          <CorporateCredentialsTab 
            customerId={customerId}
            onNext={() => handleNext("corporate-credentials", "documents")}
            onBack={() => handleBack("declarations")}
          />
        )}
        {activeTab === "documents" && (
          <DocumentsTab 
            customerId={customerId}
            onNext={() => handleNext("documents", "fees")}
            onBack={() => handleBack("corporate-credentials")}
          />
        )}
        {activeTab === "fees" && (
          <FeeInfoTab 
            customerId={customerId}
            onNext={() => handleNext("fees", "accounts")}
            onBack={() => handleBack("documents")}
          />
        )}
        {activeTab === "accounts" && (
          <AccountsTab 
            customerId={customerId}
            onBack={() => handleBack("fees")}
            onFinish={() => handleNext("accounts", "company-constitution")}
          />
        )}
        {activeTab === "company-constitution" && (
          <CompanyConstitutionTab 
            customerId={customerId} 
            onSuccess={() => {
              markStepComplete("company-constitution")
              toast.success("Müşteri kurulumu tamamlandı")
              router.push("/admin/customers")
            }} 
            onBack={() => handleBack("accounts")}
          />
        )}
      </div>
    </div>
  )
}
