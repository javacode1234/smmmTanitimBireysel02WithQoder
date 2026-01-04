"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  Home, 
  Users, 
  Info, 
  Briefcase, 
  Workflow, 
  Banknote, 
  MessageSquare, 
  UserCircle, 
  HelpCircle,
  FileText
} from "lucide-react"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

const TabSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-[200px]" />
    <Skeleton className="h-[300px] w-full rounded-xl" />
  </div>
)

const SiteSettingsTab = dynamic(() => import("@/components/admin/content-tabs/site-settings-tab").then(mod => mod.SiteSettingsTab), { loading: () => <TabSkeleton /> })
const HeroSectionTab = dynamic(() => import("@/components/admin/content-tabs/hero-section-tab").then(mod => mod.HeroSectionTab), { loading: () => <TabSkeleton /> })
const InstitutionsTab = dynamic(() => import("@/components/admin/content-tabs/institutions-tab").then(mod => mod.InstitutionsTab), { loading: () => <TabSkeleton /> })
const AboutTab = dynamic(() => import("@/components/admin/content-tabs/about-tab").then(mod => mod.AboutTab), { loading: () => <TabSkeleton /> })
const ServicesTab = dynamic(() => import("@/components/admin/content-tabs/services-tab").then(mod => mod.ServicesTab), { loading: () => <TabSkeleton /> })
const WorkflowTab = dynamic(() => import("@/components/admin/content-tabs/workflow-tab").then(mod => mod.WorkflowTab), { loading: () => <TabSkeleton /> })
const PricingTab = dynamic(() => import("@/components/admin/content-tabs/pricing-tab").then(mod => mod.PricingTab), { loading: () => <TabSkeleton /> })
const TestimonialsTab = dynamic(() => import("@/components/admin/content-tabs/testimonials-tab").then(mod => mod.TestimonialsTab), { loading: () => <TabSkeleton /> })
const TeamTab = dynamic(() => import("@/components/admin/content-tabs/team-tab").then(mod => mod.TeamTab), { loading: () => <TabSkeleton /> })
const FAQTab = dynamic(() => import("@/components/admin/content-tabs/faq-tab").then(mod => mod.FAQTab), { loading: () => <TabSkeleton /> })
const LegalDocumentsTab = dynamic(() => import("@/components/admin/content-tabs/legal-documents-tab").then(mod => mod.LegalDocumentsTab), { loading: () => <TabSkeleton /> })

export default function ContentManagementPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get("tab")
  
  const [activeTab, setActiveTab] = useState(tabFromUrl || "site-settings")
  const [isChangingTab, setIsChangingTab] = useState(false)
  
  // Sync URL with state on mount/update if needed
  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl])

  // Handle tab changes safely
  const handleTabChange = (newTab: string) => {
    if (isChangingTab) return // Prevent rapid tab switching
    
    setIsChangingTab(true)
    
    // Close all dialogs in all tabs before changing tabs
    // Dispatch a custom event to notify all tab components to close their dialogs
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('close-all-dialogs'))
    }
    
    // Use setTimeout to ensure DOM cleanup before changing tabs
    setTimeout(() => {
      setActiveTab(newTab)
      // Update URL without refreshing
      const params = new URLSearchParams(searchParams.toString())
      params.set("tab", newTab)
      window.history.replaceState(null, '', `${pathname}?${params.toString()}`)
      
      // Additional delay to ensure all cleanup is complete
      setTimeout(() => {
        setIsChangingTab(false)
      }, 10)
    }, 10)
  }

  // Wait for client-side hydration to complete
  

  // Don't render tabs until mounted to avoid hydration mismatch
  

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">İçerik Yönetimi</h1>
        <p className="text-muted-foreground mt-2">
          Anasayfa içeriklerini düzenleyin ve yönetin
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6" id="admin-content-tabs">
        <TabsList className="flex flex-wrap w-full gap-1 bg-primary p-2 rounded-lg">
          <TabsTrigger value="site-settings" className="flex flex-col gap-1 p-8">
            <Settings className="h-4 w-4" />
            <span className="text-xs">Site Ayarları</span>
          </TabsTrigger>
          <TabsTrigger value="hero" className="flex flex-col gap-1 p-8">
            <Home className="h-4 w-4" />
            <span className="text-xs">Hero</span>
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex flex-col gap-1 p-8">
            <Users className="h-4 w-4" />
            <span className="text-xs">Kurumlar</span>
          </TabsTrigger>
          <TabsTrigger value="about" className="flex flex-col gap-1 p-8">
            <Info className="h-4 w-4" />
            <span className="text-xs">Hakkımızda</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex flex-col gap-1 p-8">
            <Briefcase className="h-4 w-4" />
            <span className="text-xs">Hizmetler</span>
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex flex-col gap-1 p-8">
            <Workflow className="h-4 w-4" />
            <span className="text-xs">Süreç</span>
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex flex-col gap-1 p-8">
            <Banknote className="h-4 w-4" />
            <span className="text-xs">Fiyatlar</span>
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="flex flex-col gap-1 p-8">
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs">Yorumlar</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex flex-col gap-1 p-8">
            <UserCircle className="h-4 w-4" />
            <span className="text-xs">Ekip</span>
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex flex-col gap-1 p-8">
            <HelpCircle className="h-4 w-4" />
            <span className="text-xs">SSS</span>
          </TabsTrigger>
          <TabsTrigger value="legal" className="flex flex-col gap-1 p-8">
            <FileText className="h-4 w-4" />
            <span className="text-xs">Yasal</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="site-settings" key="site-settings">
          <SiteSettingsTab />
        </TabsContent>

        <TabsContent value="hero" key="hero">
          <HeroSectionTab />
        </TabsContent>

        <TabsContent value="clients" key="clients">
          <InstitutionsTab />
        </TabsContent>

        <TabsContent value="about" key="about">
          <AboutTab />
        </TabsContent>

        <TabsContent value="services" key="services">
          <ServicesTab />
        </TabsContent>

        <TabsContent value="workflow" key="workflow">
          <WorkflowTab />
        </TabsContent>

        <TabsContent value="pricing" key="pricing">
          <PricingTab />
        </TabsContent>

        <TabsContent value="testimonials" key="testimonials">
          <TestimonialsTab />
        </TabsContent>

        <TabsContent value="team" key="team">
          <TeamTab />
        </TabsContent>

        <TabsContent value="faq" key="faq">
          <FAQTab />
        </TabsContent>

        <TabsContent value="legal" key="legal">
          <LegalDocumentsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
