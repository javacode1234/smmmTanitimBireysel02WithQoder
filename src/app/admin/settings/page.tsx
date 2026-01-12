"use client"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CitiesTab } from "./components/cities-tab"
import { DistrictsTab } from "./components/districts-tab"
import { TaxOfficesTab } from "./components/tax-offices-tab"
import { ActivityCodesTab } from "./components/activity-codes-tab"
import { UsersTab } from "./components/users-tab"
import { SystemTab } from "./components/system-tab"

export default function SettingsPage() {
  return (
    <div className="container mx-auto w-full max-w-[1600px] py-6 space-y-6" suppressHydrationWarning>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Ayarlar</h2>
      </div>
      
      <Tabs defaultValue="import" className="space-y-4">
        <TabsList>
          <TabsTrigger value="import">Veri İçe Aktarma</TabsTrigger>
          <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
          <TabsTrigger value="system">Sistem Ayarları</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Veri Yönetimi</CardTitle>
              <CardDescription>
                Sistem verilerini (İller, İlçeler, Vergi Daireleri, NACE Kodları) buradan yönetebilir ve güncelleyebilirsiniz.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="cities" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="cities">İller</TabsTrigger>
                  <TabsTrigger value="districts">İlçeler</TabsTrigger>
                  <TabsTrigger value="tax-offices">Vergi Daireleri</TabsTrigger>
                  <TabsTrigger value="activity-codes">NACE Kodları</TabsTrigger>
                </TabsList>
                
                <TabsContent value="cities" className="space-y-4">
                  <CitiesTab />
                </TabsContent>
                
                <TabsContent value="districts" className="space-y-4">
                  <DistrictsTab />
                </TabsContent>
                
                <TabsContent value="tax-offices" className="space-y-4">
                  <TaxOfficesTab />
                </TabsContent>
                
                <TabsContent value="activity-codes" className="space-y-4">
                  <ActivityCodesTab />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UsersTab />
        </TabsContent>
        
        <TabsContent value="system" className="space-y-4">
          <SystemTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
