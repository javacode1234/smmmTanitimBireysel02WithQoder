"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { getSystemSettings, updateSystemSetting } from "../actions"
import { Loader2 } from "lucide-react"

export function SystemTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    auto_logout_enabled: false,
    auto_logout_minutes: "30"
  })

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      setLoading(true)
      const result = await getSystemSettings()
      if (result.success && result.data) {
        setSettings({
          auto_logout_enabled: result.data['auto_logout_enabled'] === 'true',
          auto_logout_minutes: result.data['auto_logout_minutes'] || "30"
        })
      }
    } catch (error) {
      toast.error("Ayarlar yüklenirken bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      setSaving(true)
      const res1 = await updateSystemSetting('auto_logout_enabled', String(settings.auto_logout_enabled))
      if (!res1.success) throw new Error(res1.error)

      const res2 = await updateSystemSetting('auto_logout_minutes', settings.auto_logout_minutes)
      if (!res2.success) throw new Error(res2.error)

      toast.success("Ayarlar başarıyla kaydedildi")
      // Force reload to apply settings immediately to current user without wait
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error: any) {
      toast.error(error.message || "Ayarlar kaydedilirken bir hata oluştu")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Otomatik Çıkış Ayarları</CardTitle>
        <CardDescription>
          Güvenlik nedeniyle, belirli bir süre işlem yapılmadığında oturumun otomatik olarak kapatılmasını sağlar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="auto-logout" className="flex flex-col space-y-1">
            <span>Otomatik Çıkış</span>
            <span className="font-normal text-muted-foreground">
              Etkinleştirildiğinde, belirlenen süre boyunca işlem yapılmazsa kullanıcı oturumu kapatılır.
            </span>
          </Label>
          <Switch
            id="auto-logout"
            checked={settings.auto_logout_enabled}
            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_logout_enabled: checked }))}
          />
        </div>

        {settings.auto_logout_enabled && (
          <div className="space-y-2">
            <Label htmlFor="timeout-minutes">Zaman Aşımı Süresi (Dakika)</Label>
            <Input
              id="timeout-minutes"
              type="number"
              min="1"
              max="480"
              value={settings.auto_logout_minutes}
              onChange={(e) => setSettings(prev => ({ ...prev, auto_logout_minutes: e.target.value }))}
              className="max-w-[200px]"
            />
            <p className="text-sm text-muted-foreground">
              Önerilen süre: 15-30 dakika
            </p>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kaydet
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
