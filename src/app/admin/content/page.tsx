"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Settings, 
  Home, 
  Users, 
  Info, 
  Briefcase, 
  Workflow, 
  DollarSign, 
  MessageSquare, 
  UserCircle, 
  HelpCircle 
} from "lucide-react"
import { SiteSettingsTab } from "@/components/admin/content-tabs/site-settings-tab"
import { HeroSectionTab } from "@/components/admin/content-tabs/hero-section-tab"
import { ClientsTab } from "@/components/admin/content-tabs/clients-tab"
import { AboutTab } from "@/components/admin/content-tabs/about-tab"
import { ServicesTab } from "@/components/admin/content-tabs/services-tab"
import { WorkflowTab } from "@/components/admin/content-tabs/workflow-tab"
import { PricingTab } from "@/components/admin/content-tabs/pricing-tab"
import { TestimonialsTab } from "@/components/admin/content-tabs/testimonials-tab"
import { TeamTab } from "@/components/admin/content-tabs/team-tab"
import { FAQTab } from "@/components/admin/content-tabs/faq-tab"

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState("site-settings")

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">İçerik Yönetimi</h1>
        <p className="text-muted-foreground mt-2">
          Anasayfa içeriklerini düzenleyin ve yönetin
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 h-auto">
          <TabsTrigger value="site-settings" className="flex flex-col gap-1 py-3">
            <Settings className="h-4 w-4" />
            <span className="text-xs">Site Ayarları</span>
          </TabsTrigger>
          <TabsTrigger value="hero" className="flex flex-col gap-1 py-3">
            <Home className="h-4 w-4" />
            <span className="text-xs">Hero</span>
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex flex-col gap-1 py-3">
            <Users className="h-4 w-4" />
            <span className="text-xs">Kurumlar</span>
          </TabsTrigger>
          <TabsTrigger value="about" className="flex flex-col gap-1 py-3">
            <Info className="h-4 w-4" />
            <span className="text-xs">Hakkımızda</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex flex-col gap-1 py-3">
            <Briefcase className="h-4 w-4" />
            <span className="text-xs">Hizmetler</span>
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex flex-col gap-1 py-3">
            <Workflow className="h-4 w-4" />
            <span className="text-xs">Süreç</span>
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex flex-col gap-1 py-3">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs">Fiyatlar</span>
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="flex flex-col gap-1 py-3">
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs">Yorumlar</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex flex-col gap-1 py-3">
            <UserCircle className="h-4 w-4" />
            <span className="text-xs">Ekip</span>
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex flex-col gap-1 py-3">
            <HelpCircle className="h-4 w-4" />
            <span className="text-xs">SSS</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="site-settings">
          <SiteSettingsTab />
        </TabsContent>

        <TabsContent value="hero">
          <HeroSectionTab />
        </TabsContent>

        <TabsContent value="clients">
          <ClientsTab />
        </TabsContent>

        <TabsContent value="about">
          <AboutTab />
        </TabsContent>

        <TabsContent value="services">
          <ServicesTab />
        </TabsContent>

        <TabsContent value="workflow">
          <WorkflowTab />
        </TabsContent>

        <TabsContent value="pricing">
          <PricingTab />
        </TabsContent>

        <TabsContent value="testimonials">
          <TestimonialsTab />
        </TabsContent>

        <TabsContent value="team">
          <TeamTab />
        </TabsContent>

        <TabsContent value="faq">
          <FAQTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
