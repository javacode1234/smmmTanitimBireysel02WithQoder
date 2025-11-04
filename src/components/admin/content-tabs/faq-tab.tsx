"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Plus, Trash2, Save, Search, Edit3, Check, X,
  RotateCcw, ArrowUp, ArrowDown, Loader2
} from "lucide-react"
import { toast } from "sonner"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"

interface FAQCategory {
  id: string; name: string; slug: string; order: number
}

interface FAQ {
  id: string; categoryId: string; question: string; answer: string; isActive: boolean; order: number; category?: FAQCategory
}

const DEFAULT_CATEGORIES: FAQCategory[] = [
  { id: "default-1", name: "Genel", slug: "genel", order: 0 },
  { id: "default-2", name: "Hizmetler", slug: "hizmetler", order: 1 },
  { id: "default-3", name: "Ücretlendirme", slug: "ucretlendirme", order: 2 },
  { id: "default-4", name: "İşlemler", slug: "islemler", order: 3 },
  { id: "default-5", name: "Teknik", slug: "teknik", order: 4 }
]

const DEFAULT_FAQS: FAQ[] = [
  { id: "default-1", categoryId: "default-1", question: "SMMM (Serbest Muhasebeci Mali Müşavir) nedir?", answer: "SMMM, işletmelerin mali işlemlerini kaydetmek, raporlamak ve vergi mevzuatına uygun şekilde beyan etmek için yetkilendirilmiş profesyonellerdir.", isActive: true, order: 0 },
  { id: "default-2", categoryId: "default-2", question: "Hangi hizmetleri sunuyorsunuz?", answer: "Muhasebe ve finansal raporlama, vergi danışmanlığı, SGK ve bordro işlemleri, şirket kuruluşu, bağımsız denetim ve mali analiz gibi geniş kapsamlı hizmetler sunuyoruz.", isActive: true, order: 0 },
  { id: "default-3", categoryId: "default-3", question: "Ücretlendirme nasıl yapılıyor?", answer: "Fiyatlarımız işletmenizin büyüklüğüne, işlem hacmine ve ihtiyaç duyulan hizmetlere göre belirlenir.", isActive: true, order: 0 },
  { id: "default-4", categoryId: "default-4", question: "Belge ve evrakları nasıl teslim edebilirim?", answer: "Belgelerinizi ofisimize fiziksel olarak getirebilir, kargo ile gönderebilir veya dijital platformumuz üzerinden güvenli şekilde yükleyebilirsiniz.", isActive: true, order: 0 },
  { id: "default-5", categoryId: "default-5", question: "Gizlilik ve güvenlik nasıl sağlanıyor?", answer: "Tüm finansal verileriniz yasal gizlilik yükümlülüğümüz altında korunur. Dijital sistemlerimiz 256-bit SSL şifreleme ile güvence altındadır.", isActive: true, order: 0 }
]

export function FAQTab() {
  const [categories, setCategories] = useState<FAQCategory[]>(DEFAULT_CATEGORIES)
  const [faqs, setFaqs] = useState<FAQ[]>(DEFAULT_FAQS)
  const [sectionData, setSectionData] = useState({ title: "Sıkça Sorulan Sorular", paragraph: "Mali müşavirlik hizmetlerimiz hakkında merak ettikleriniz." })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [faqSearchTerm, setFaqSearchTerm] = useState("")
  const [faqCurrentPage, setFaqCurrentPage] = useState(1)
  const [faqItemsPerPage, setFaqItemsPerPage] = useState(5)
  const [editingFaq, setEditingFaq] = useState<any>(null)
  const [isFaqDialogOpen, setIsFaqDialogOpen] = useState(false)
  const [faqToDelete, setFaqToDelete] = useState<FAQ | null>(null)
  const [isFaqDeleteDialogOpen, setIsFaqDeleteDialogOpen] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isSavingDefaults, setIsSavingDefaults] = useState(false)
  const [isDatabaseEmpty, setIsDatabaseEmpty] = useState(false)

  useEffect(() => {
    Promise.all([fetchCategories(), fetchFaqs(), fetchSectionData()]).finally(() => setLoading(false))
    return () => { setIsFaqDialogOpen(false); setIsFaqDeleteDialogOpen(false); setIsResetDialogOpen(false) }
  }, [])

  const fetchSectionData = async () => {
    try {
      const res = await fetch('/api/content/faq/section')
      if (res.ok) {
        const data = await res.json()
        if (data?.id) setSectionData({ title: data.title, paragraph: data.paragraph })
      }
    } catch (error) {
      console.error('Error fetching section:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/content/faq/categories')
      if (res.ok) {
        const data = await res.json()
        if (data?.length > 0) {
          setCategories(data)
          setIsDatabaseEmpty(data.every((c: any) => c.id?.startsWith('default-')))
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchFaqs = async () => {
    try {
      const res = await fetch('/api/content/faq')
      if (res.ok) {
        const data = await res.json()
        if (data?.length > 0) setFaqs(data)
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
      toast.error('Sorular yüklenirken hata oluştu')
    }
  }

  const saveAllChanges = async () => {
    setSaving(true)
    try {
      const existingCategories = await fetch('/api/content/faq/categories').then(r => r.json())
      for (const cat of existingCategories) await fetch(`/api/content/faq/categories?id=${cat.id}`, { method: 'DELETE' })
      
      const categoryIdMap = new Map()
      for (let i = 0; i < categories.length; i++) {
        const cat = categories[i]
        const res = await fetch('/api/content/faq/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: cat.name, slug: cat.slug, order: i })
        })
        const newCat = await res.json()
        categoryIdMap.set(cat.id, newCat.id)
      }

      const existingFaqs = await fetch('/api/content/faq').then(r => r.json())
      for (const faq of existingFaqs) await fetch(`/api/content/faq?id=${faq.id}`, { method: 'DELETE' })

      for (let i = 0; i < faqs.length; i++) {
        const faq = faqs[i]
        const newCategoryId = categoryIdMap.get(faq.categoryId) || faq.categoryId
        await fetch('/api/content/faq', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categoryId: newCategoryId, question: faq.question, answer: faq.answer, isActive: faq.isActive, order: i })
        })
      }

      await fetch('/api/content/faq/section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionData)
      })

      toast.success('Tüm değişiklikler başarıyla kaydedildi!')
      setIsDatabaseEmpty(false)
      await Promise.all([fetchCategories(), fetchFaqs(), fetchSectionData()])
    } catch (error) {
      console.error('Error saving:', error)
      toast.error(`Bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
    } finally {
      setSaving(false)
    }
  }

  const saveDefaultsToDatabase = async () => {
    setIsSavingDefaults(true)
    try {
      const existingCats = await fetch('/api/content/faq/categories').then(r => r.json())
      for (const cat of existingCats) await fetch(`/api/content/faq/categories?id=${cat.id}`, { method: 'DELETE' })
      
      const categoryIdMap = new Map()
      for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
        const cat = DEFAULT_CATEGORIES[i]
        const res = await fetch('/api/content/faq/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: cat.name, slug: cat.slug, order: i })
        })
        const newCat = await res.json()
        categoryIdMap.set(cat.id, newCat.id)
      }

      const existingFaqs = await fetch('/api/content/faq').then(r => r.json())
      for (const faq of existingFaqs) await fetch(`/api/content/faq?id=${faq.id}`, { method: 'DELETE' })

      for (let i = 0; i < DEFAULT_FAQS.length; i++) {
        const faq = DEFAULT_FAQS[i]
        const newCategoryId = categoryIdMap.get(faq.categoryId)
        await fetch('/api/content/faq', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categoryId: newCategoryId, question: faq.question, answer: faq.answer, isActive: faq.isActive, order: i })
        })
      }

      toast.success('Varsayılan değerler veritabanına kaydedildi!')
      setIsDatabaseEmpty(false)
      await Promise.all([fetchCategories(), fetchFaqs(), fetchSectionData()])
    } catch (error) {
      console.error('Error saving defaults:', error)
      toast.error('Varsayılan değerler kaydedilemedi')
    } finally {
      setIsSavingDefaults(false)
    }
  }

  const handleReset = () => {
    setCategories(DEFAULT_CATEGORIES)
    setFaqs(DEFAULT_FAQS)
    setSectionData({ title: "Sıkça Sorulan Sorular", paragraph: "Mali müşavirlik hizmetlerimiz hakkında merak ettikleriniz." })
    setIsDatabaseEmpty(true)
    toast.success('Varsayılan değerlere sıfırlandı')
    setIsResetDialogOpen(false)
  }

  const handleOpenFaqDialog = (faq?: FAQ) => {
    if (faq) {
      setEditingFaq({ ...faq })
    } else {
      setEditingFaq({ categoryId: categories[0]?.id || "", question: "", answer: "", isActive: true, order: faqs.length })
    }
    setIsFaqDialogOpen(true)
  }

  const handleSaveFaq = () => {
    if (!editingFaq.question || !editingFaq.answer) {
      toast.error('Soru ve cevap zorunludur')
      return
    }
    const payload = { ...editingFaq }
    if (editingFaq.id && !editingFaq.id.startsWith('default-')) {
      setFaqs(faqs.map(f => f.id === editingFaq.id ? payload : f))
      toast.success('Soru güncellendi')
    } else {
      const newFaq = { ...payload, id: `temp-${Date.now()}`, order: faqs.length }
      setFaqs([...faqs, newFaq])
      toast.success('Yeni soru eklendi')
    }
    setIsFaqDialogOpen(false)
  }

  const handleDeleteFaq = (id: string) => {
    setFaqs(faqs.filter(f => f.id !== id))
    toast.success('Soru silindi')
    setIsFaqDeleteDialogOpen(false)
    setFaqToDelete(null)
  }

  const moveFaq = (faq: FAQ, direction: 'up' | 'down') => {
    const idx = faqs.findIndex(f => f.id === faq.id)
    if (idx === -1) return
    const newIdx = direction === 'up' ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= faqs.length) return
    const newFaqs = [...faqs]
    const [moved] = newFaqs.splice(idx, 1)
    newFaqs.splice(newIdx, 0, moved)
    setFaqs(newFaqs.map((f, i) => ({ ...f, order: i })))
    toast.success('Sıralama güncellendi')
  }

  const filteredFaqs = faqs.filter(f => f.question.toLowerCase().includes(faqSearchTerm.toLowerCase()) || f.answer.toLowerCase().includes(faqSearchTerm.toLowerCase()))
  const totalPages = Math.ceil(filteredFaqs.length / faqItemsPerPage)
  const startIdx = (faqCurrentPage - 1) * faqItemsPerPage
  const paginatedFaqs = filteredFaqs.slice(startIdx, startIdx + faqItemsPerPage)

  useEffect(() => { setFaqCurrentPage(1) }, [faqSearchTerm])

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || "Bilinmeyen"
  }

  if (loading) {
    return <Card><CardContent className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></CardContent></Card>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>SSS Bölümü Ayarları</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Bölüm Başlığı</Label>
              <Input value={sectionData.title} onChange={(e) => setSectionData({ ...sectionData, title: e.target.value })} placeholder="Sıkça Sorulan Sorular" />
            </div>
            <div>
              <Label>Açıklama</Label>
              <Textarea value={sectionData.paragraph || ""} onChange={(e) => setSectionData({ ...sectionData, paragraph: e.target.value })} placeholder="Bölüm açıklaması" rows={2} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Sorular Tablosu</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Soru ara..." value={faqSearchTerm} onChange={(e) => setFaqSearchTerm(e.target.value)} className="pl-10 w-64" />
              </div>
              <Select value={faqItemsPerPage.toString()} onValueChange={(v) => setFaqItemsPerPage(Number(v))}>
                <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => handleOpenFaqDialog()}><Plus className="h-4 w-4 mr-2" />Yeni Soru Ekle</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kategori</TableHead>
                <TableHead>Soru</TableHead>
                <TableHead className="w-[100px]">Durum</TableHead>
                <TableHead className="w-[200px] text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedFaqs.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">{faqSearchTerm ? "Arama sonucu bulunamadı" : "Henüz soru eklenmemiş"}</TableCell></TableRow>
              ) : (
                paginatedFaqs.map((faq) => {
                  const actualIndex = faqs.findIndex(f => f.id === faq.id)
                  return (
                    <TableRow key={faq.id}>
                      <TableCell><Badge className="bg-blue-100 text-blue-700 border-blue-300">{getCategoryName(faq.categoryId)}</Badge></TableCell>
                      <TableCell>
                        <div className="font-medium">{faq.question}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{faq.answer}</div>
                      </TableCell>
                      <TableCell>
                        {faq.isActive ? (
                          <Badge variant="default">Aktif</Badge>
                        ) : (
                          <Badge variant="secondary">Pasif</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveFaq(faq, 'up')} disabled={actualIndex === 0}><ArrowUp className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveFaq(faq, 'down')} disabled={actualIndex === faqs.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenFaqDialog(faq)}><Edit3 className="h-4 w-4" /></Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => { setFaqToDelete(faq); setIsFaqDeleteDialogOpen(true) }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {filteredFaqs.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">Toplam {filteredFaqs.length} kayıttan {startIdx + 1}-{Math.min(startIdx + faqItemsPerPage, filteredFaqs.length)} arası gösteriliyor</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setFaqCurrentPage(faqCurrentPage - 1)} disabled={faqCurrentPage === 1}>Önceki</Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button key={page} variant={faqCurrentPage === page ? "default" : "outline"} size="sm" className="w-8" onClick={() => setFaqCurrentPage(page)}>{page}</Button>
                ))}
                <Button variant="outline" size="sm" onClick={() => setFaqCurrentPage(faqCurrentPage + 1)} disabled={faqCurrentPage === totalPages}>Sonraki</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button onClick={() => setIsResetDialogOpen(true)} variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-50"><RotateCcw className="h-4 w-4 mr-2" />Varsayılan Değerlere Sıfırla</Button>
          <Button onClick={saveDefaultsToDatabase} disabled={!isDatabaseEmpty || isSavingDefaults} variant="default" className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50">{isSavingDefaults ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Kaydediliyor...</> : <><Save className="h-4 w-4 mr-2" />Varsayılan Değerleri Veritabanına Kaydet</>}</Button>
        </div>
        <Button onClick={saveAllChanges} disabled={saving} size="lg" className="bg-green-600 hover:bg-green-700">{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Kaydediliyor...</> : <><Save className="mr-2 h-4 w-4" />Tüm Değişiklikleri Kaydet</>}</Button>
      </div>

      <Dialog open={isFaqDialogOpen} onOpenChange={(open) => { setIsFaqDialogOpen(open); if (!open) setEditingFaq(null) }}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader><DialogTitle>{editingFaq?.id ? 'Soru Düzenle' : 'Yeni Soru Ekle'}</DialogTitle></DialogHeader>
          {editingFaq && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <Label>Kategori *</Label>
                <Select value={editingFaq.categoryId} onValueChange={(value) => setEditingFaq({ ...editingFaq, categoryId: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Soru *</Label>
                <Input value={editingFaq.question} onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })} placeholder="Sorunuzu yazın" />
              </div>
              <div>
                <Label>Cevap *</Label>
                <Textarea value={editingFaq.answer} onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })} placeholder="Cevabı yazın" rows={5} />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="faqActive"
                  checked={editingFaq.isActive}
                  onCheckedChange={(checked) => setEditingFaq({ ...editingFaq, isActive: checked === true })}
                />
                <Label htmlFor="faqActive" className="cursor-pointer">Soru aktif</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFaqDialogOpen(false)}><X className="h-4 w-4 mr-2" />İptal</Button>
            <Button onClick={handleSaveFaq} className="bg-blue-600 hover:bg-blue-700"><Check className="h-4 w-4 mr-2" />{editingFaq?.id ? 'Güncelle' : 'Kaydet'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog isOpen={isFaqDeleteDialogOpen} onClose={() => { setIsFaqDeleteDialogOpen(false); setFaqToDelete(null) }} onConfirm={() => faqToDelete && handleDeleteFaq(faqToDelete.id)} title="Soru Sil" description={faqToDelete ? `"${faqToDelete.question}" sorusunu silmek istediğinizden emin misiniz?` : undefined} />
      <DeleteConfirmationDialog isOpen={isResetDialogOpen} onClose={() => setIsResetDialogOpen(false)} onConfirm={handleReset} title="Varsayılan Değerlere Sıfırla" description="Tüm SSS verilerini silmek ve varsayılan değerlere sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz." />
    </div>
  )
}
