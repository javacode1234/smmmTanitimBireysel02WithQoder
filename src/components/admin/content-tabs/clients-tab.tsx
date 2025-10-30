"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Camera, Edit, Trash2, Plus, Loader2, ArrowUp, ArrowDown, X } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface ClientLogo {
  id: string
  name: string
  description?: string
  url?: string
  logo: string
  isActive: boolean
  order: number
}

export function ClientsTab() {
  const [items, setItems] = useState<ClientLogo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ClientLogo | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingItem, setEditingItem] = useState<ClientLogo | null>(null)
  const [formData, setFormData] = useState<Partial<ClientLogo>>({
    name: "",
    description: "",
    url: "",
    logo: "",
    isActive: true,
    order: 0,
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/content/clients')
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Error fetching client logos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen geçerli bir resim dosyası seçin')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Resim boyutu en fazla 2MB olabilir')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, logo: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handleOpenModal = (item?: ClientLogo) => {
    if (item) {
      setEditingItem(item)
      setFormData(item)
    } else {
      setEditingItem(null)
      setFormData({
        name: "",
        description: "",
        url: "",
        logo: "",
        isActive: true,
        order: items.length,
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.logo) {
      toast.error('Kurum adı ve logo zorunludur')
      return
    }

    setIsSaving(true)
    try {
      const url = editingItem ? `/api/content/clients?id=${editingItem.id}` : '/api/content/clients'
      const method = editingItem ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingItem ? 'Kurum güncellendi!' : 'Kurum eklendi!')
        setIsModalOpen(false)
        fetchItems()
      } else {
        toast.error('İşlem sırasında bir hata oluştu')
      }
    } catch (error) {
      console.error('Error saving client logo:', error)
      toast.error('İşlem sırasında bir hata oluştu')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/content/clients?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setItems(prev => prev.filter(item => item.id !== id))
        setIsDeleteDialogOpen(false)
        setItemToDelete(null)
        toast.success('Kurum logosu silindi!')
      } else {
        toast.error('Silme işlemi başarısız oldu')
      }
    } catch (error) {
      console.error('Error deleting client logo:', error)
      toast.error('Silme işlemi başarısız oldu')
    } finally {
      setIsDeleting(false)
    }
  }

  const confirmDelete = (item: ClientLogo) => {
    setItemToDelete(item)
    setIsDeleteDialogOpen(true)
  }

  const handleToggleActive = async (item: ClientLogo) => {
    try {
      const response = await fetch(`/api/content/clients?id=${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      })

      if (response.ok) {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, isActive: !i.isActive } : i))
        toast.success(item.isActive ? 'Logo gizlendi' : 'Logo görünür yapıldı')
      }
    } catch (error) {
      console.error('Error toggling active:', error)
      toast.error('Durum değiştirilemedi')
    }
  }

  const handleReorder = async (item: ClientLogo, direction: 'up' | 'down') => {
    const currentIndex = items.findIndex(i => i.id === item.id)
    if (direction === 'up' && currentIndex === 0) return
    if (direction === 'down' && currentIndex === items.length - 1) return

    const newItems = [...items]
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    ;[newItems[currentIndex], newItems[swapIndex]] = [newItems[swapIndex], newItems[currentIndex]]

    setItems(newItems)

    try {
      await fetch('/api/content/clients/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: newItems.map((i, idx) => ({ id: i.id, order: idx })) }),
      })
      toast.success('Sıralama güncellendi')
    } catch (error) {
      console.error('Error reordering:', error)
      toast.error('Sıralama güncellenemedi')
      fetchItems()
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kurumlar Bölümü</CardTitle>
              <CardDescription>Ana sayfada görüntülenecek kurum logolarını yönetin</CardDescription>
            </div>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Logo</TableHead>
                <TableHead>Kurum Adı</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>Web Sitesi</TableHead>
                <TableHead className="w-[100px]">Durum</TableHead>
                <TableHead className="w-[150px] text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Henüz kurum logosu eklenmemiş
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow key={item.id} className={!item.isActive ? 'opacity-50' : ''}>
                    <TableCell>
                      <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center p-2 border">
                        {item.logo && (
                          <img
                            src={item.logo}
                            alt={item.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      {item.description ? (
                        <span className="text-sm text-muted-foreground line-clamp-2" title={item.description}>
                          {item.description}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.url ? (
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {new URL(item.url).hostname}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={item.isActive ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => handleToggleActive(item)}
                      >
                        {item.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleReorder(item, 'up')}
                          disabled={index === 0}
                          title="Yukarı taşı"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleReorder(item, 'down')}
                          disabled={index === items.length - 1}
                          title="Aşağı taşı"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenModal(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => confirmDelete(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit/Add Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Kurum Düzenle' : 'Yeni Kurum Ekle'}</DialogTitle>
            <DialogDescription>
              Kurum bilgilerini girin ve logo yükleyin
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto flex-1 px-6 py-4">
            <div className="space-y-6">
              {/* Logo Upload Section - Modern Design */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Kurum Logosu *</Label>
                <div className="relative">
                  {formData.logo ? (
                    <div className="group relative">
                      <div className="relative w-full h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center p-8">
                        <img
                          src={formData.logo}
                          alt="Logo Preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => document.getElementById('logo-upload')?.click()}
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Değiştir
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, logo: "" }))}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Kaldır
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="w-full h-64 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-4"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                    >
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Camera className="h-8 w-8 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">Logo yüklemek için tıklayın</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG veya SVG (maks. 2MB)</p>
                      </div>
                    </div>
                  )}
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Önerilen: Şeffaf arka planlı PNG formatında logo
                </p>
              </div>

              {/* Form Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name" className="text-sm font-medium">Kurum Adı *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="örn: ABC Muhasebe Ltd. Şti."
                    className="h-11"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description" className="text-sm font-medium">Açıklama</Label>
                  <Input
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="örn: Profesyonel muhasebe ve danışmanlık hizmetleri"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="url" className="text-sm font-medium">Web Sitesi</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com"
                    className="h-11"
                  />
                </div>
              </div>

              {/* Active/Inactive Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                    Anasayfada Göster
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {formData.isActive ? 'Logo anasayfada görünür olacak' : 'Logo anasayfada gizlenecek'}
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.logo || !formData.name}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingItem ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setItemToDelete(null)
        }}
        onConfirm={() => itemToDelete && handleDelete(itemToDelete.id)}
        title="Kurum Logosu Sil"
        description={itemToDelete ? `"${itemToDelete.name}" kurumunu silmek istediğinizden emin misiniz?` : undefined}
        isDeleting={isDeleting}
      />
    </div>
  )
}
