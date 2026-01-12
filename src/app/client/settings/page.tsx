"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { getSystemSettings } from "@/app/admin/settings/actions"
import { Loader2, Save, Settings as SettingsIcon } from "lucide-react"

export default function ClientSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [useSystemDefault, setUseSystemDefault] = useState(true)
  
  const [settings, setSettings] = useState({
    enabled: false,
    minutes: "30"
  })

  // System defaults to show what they are overriding
  const [systemDefaults, setSystemDefaults] = useState({
    enabled: false,
    minutes: "30"
  })

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      setLoading(true)
      
      // Load System Settings first
      const sysResult = await getSystemSettings()
      let sysDefaults = { enabled: false, minutes: "30" }
      
      if (sysResult.success && sysResult.data) {
        sysDefaults = {
          enabled: sysResult.data['auto_logout_enabled'] === 'true',
          minutes: sysResult.data['auto_logout_minutes'] || "30"
        }
        setSystemDefaults(sysDefaults)
      }

      // Load Local Settings
      const local = localStorage.getItem('client_auto_logout_settings')
      if (local) {
        const parsed = JSON.parse(local)
        setSettings({
          enabled: parsed.enabled,
          minutes: parsed.minutes || "30"
        })
        setUseSystemDefault(false)
      } else {
        // If no local settings, use system defaults
        setSettings(sysDefaults)
        setUseSystemDefault(true)
      }

    } catch (error) {
      toast.error("Ayarlar yüklenirken bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    try {
      setSaving(true)
      
      if (useSystemDefault) {
        localStorage.removeItem('client_auto_logout_settings')
        setSettings(systemDefaults)
      } else {
        localStorage.setItem('client_auto_logout_settings', JSON.stringify(settings))
      }
      
      // Dispatch event for AutoLogoutHandler
      window.dispatchEvent(new Event('client_settings_updated'))
      
      toast.success("Ayarlar başarıyla kaydedildi")
    } catch (error) {
      toast.error("Ayarlar kaydedilemedi")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Ayarlar</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Otomatik Çıkış Ayarları
          </CardTitle>
          <CardDescription>
            Güvenliğiniz için belirli bir süre işlem yapılmadığında oturumunuz otomatik olarak kapatılır.
            Bu ayarları buradan kişiselleştirebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg border">
             <Switch 
               id="use-default" 
               checked={useSystemDefault}
               onCheckedChange={(checked) => {
                 setUseSystemDefault(checked)
                 if (checked) {
                   setSettings(systemDefaults)
                 }
               }}
             />
             <div className="flex flex-col">
               <Label htmlFor="use-default" className="font-medium cursor-pointer">Sistem Varsayılanlarını Kullan</Label>
               <span className="text-sm text-muted-foreground">
                 Sistem yöneticisi tarafından belirlenen ayarları kullan ({systemDefaults.enabled ? `${systemDefaults.minutes} dakika` : 'Devre Dışı'})
               </span>
             </div>
          </div>

          <div className={`space-y-6 p-4 border rounded-lg transition-opacity ${useSystemDefault ? 'opacity-50 pointer-events-none bg-muted/20' : ''}`}>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="auto-logout" className="flex flex-col space-y-1 cursor-pointer">
                <span>Otomatik Çıkış</span>
                <span className="font-normal text-sm text-muted-foreground">Aktif edilirse süre sonunda oturum kapatılır</span>
              </Label>
              <Switch
                id="auto-logout"
                checked={settings.enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="timeout">Zaman Aşımı Süresi (Dakika)</Label>
              <Input
                id="timeout"
                type="number"
                min="1"
                max="480"
                value={settings.minutes}
                onChange={(e) => setSettings({ ...settings, minutes: e.target.value })}
                placeholder="Örn: 30"
                className="max-w-[200px]"
              />
              <p className="text-sm text-muted-foreground">
                Son işlemden kaç dakika sonra oturumun kapatılacağını belirleyin.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Kaydet
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
