"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, RotateCcw, Loader2, FileText, Shield, Scale } from "lucide-react"
import { toast } from "sonner"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"

interface LegalDocument {
  id?: string
  type: 'PRIVACY_POLICY' | 'TERMS_OF_USE' | 'KVKK'
  title: string
  content: string
  lastUpdated: string
}

const DOCUMENT_TYPES = {
  PRIVACY_POLICY: {
    label: "Gizlilik Politikası",
    icon: Shield,
    description: "Web sitesi gizlilik politikasını yönetin"
  },
  TERMS_OF_USE: {
    label: "Kullanım Koşulları",
    icon: FileText,
    description: "Hizmet kullanım koşullarını yönetin"
  },
  KVKK: {
    label: "KVKK Aydınlatma Metni",
    icon: Scale,
    description: "Kişisel verilerin korunması metnini yönetin"
  }
}

export function LegalDocumentsTab() {
  const [documents, setDocuments] = useState<Record<string, LegalDocument>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('PRIVACY_POLICY')
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [resetType, setResetType] = useState<string | null>(null)

  useEffect(() => {
    fetchDocuments()
    
    return () => {
      setIsResetDialogOpen(false)
    }
  }, [])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/content/legal-documents')
      if (response.ok) {
        const data = await response.json()
        const docsMap: Record<string, LegalDocument> = {}
        data.forEach((doc: LegalDocument) => {
          docsMap[doc.type] = doc
        })
        setDocuments(docsMap)
      } else {
        toast.error('Dökümanlar yüklenemedi')
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Dökümanlar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (type: string) => {
    setSaving(type)
    try {
      const document = documents[type]
      if (!document) {
        toast.error('Döküman bulunamadı')
        return
      }

      const response = await fetch('/api/content/legal-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: document.type,
          title: document.title,
          content: document.content
        })
      })

      if (response.ok) {
        toast.success('Döküman başarıyla kaydedildi!')
        await fetchDocuments()
      } else {
        toast.error('Döküman kaydedilemedi')
      }
    } catch (error) {
      console.error('Error saving document:', error)
      toast.error('Bir hata oluştu')
    } finally {
      setSaving(null)
    }
  }

  const handleReset = async () => {
    if (!resetType) return

    try {
      // Delete from database to force default
      const response = await fetch(`/api/content/legal-documents?type=${resetType}`, {
        method: 'DELETE'
      })

      if (response.ok || response.status === 404) {
        toast.success('Döküman varsayılan değerlere sıfırlandı!')
        await fetchDocuments()
      } else {
        toast.error('Sıfırlama işlemi başarısız')
      }
    } catch (error) {
      console.error('Error resetting document:', error)
      toast.error('Bir hata oluştu')
    } finally {
      setIsResetDialogOpen(false)
      setResetType(null)
    }
  }

  const updateDocument = (type: string, field: 'title' | 'content', value: string) => {
    setDocuments(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        type: type as 'PRIVACY_POLICY' | 'TERMS_OF_USE' | 'KVKK',
        title: field === 'title' ? value : prev[type]?.title || '',
        content: field === 'content' ? value : prev[type]?.content || '',
        lastUpdated: prev[type]?.lastUpdated || new Date().toISOString()
      }
    }))
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Yasal Dökümanlar</CardTitle>
          <CardDescription>
            Gizlilik Politikası, Kullanım Koşulları ve KVKK aydınlatma metinlerini yönetin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              {Object.entries(DOCUMENT_TYPES).map(([key, config]) => {
                const Icon = config.icon
                return (
                  <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{config.label}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {Object.entries(DOCUMENT_TYPES).map(([key, config]) => {
              const document = documents[key]
              
              // Skip rendering if document is not loaded yet
              if (!document) {
                return (
                  <TabsContent key={key} value={key} className="space-y-4 mt-6">
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  </TabsContent>
                )
              }

              return (
                <TabsContent key={key} value={key} className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{config.label}</h3>
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="border-amber-600 text-amber-600 hover:bg-amber-50"
                        onClick={() => {
                          setResetType(key)
                          setIsResetDialogOpen(true)
                        }}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Sıfırla
                      </Button>
                      <Button
                        onClick={() => handleSave(key)}
                        disabled={saving === key}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {saving === key ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Kaydediliyor...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Kaydet
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`${key}-title`}>Başlık</Label>
                      <Input
                        id={`${key}-title`}
                        value={document.title}
                        onChange={(e) => updateDocument(key, 'title', e.target.value)}
                        placeholder="Döküman başlığı"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`${key}-content`}>İçerik</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        HTML formatında içerik girebilirsiniz. Başlıklar için &lt;h2&gt;, paragraflar için &lt;p&gt;, listeler için &lt;ul&gt; ve &lt;li&gt; kullanın.
                      </p>
                      <Textarea
                        id={`${key}-content`}
                        value={document.content}
                        onChange={(e) => updateDocument(key, 'content', e.target.value)}
                        placeholder="Döküman içeriği (HTML formatında)"
                        rows={20}
                        className="font-mono text-sm resize-none overflow-y-auto"
                      />
                    </div>

                    {document.lastUpdated && (
                      <p className="text-xs text-muted-foreground">
                        Son güncelleme: {new Date(document.lastUpdated).toLocaleString('tr-TR')}
                      </p>
                    )}
                  </div>

                  <div className="border rounded-lg p-4 bg-gray-50 max-h-[500px] overflow-y-auto">
                    <h4 className="text-sm font-semibold mb-2">Önizleme</h4>
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: document.content }}
                    />
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        isOpen={isResetDialogOpen}
        onClose={() => {
          setIsResetDialogOpen(false)
          setResetType(null)
        }}
        onConfirm={handleReset}
        title="Varsayılan Değerlere Sıfırla"
        description={`${resetType && DOCUMENT_TYPES[resetType as keyof typeof DOCUMENT_TYPES]?.label} dökümanını varsayılan değerlere sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
      />
    </div>
  )
}
