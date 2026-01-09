'use client'

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { CustomPagination } from "@/components/ui/custom-pagination"
import { toast } from "sonner"
import { Plus, Pencil, Trash, Upload, Download, Search, ChevronLeft, ChevronRight, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { getCities, upsertCity, deleteCity, deleteAllCities } from "../actions"
import { makeSnapshot, downloadCSV } from "../utils"

export function CitiesTab() {
  // Data State
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [search, setSearch] = useState("")
  const [sortColumn, setSortColumn] = useState<string>("id")
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>("asc")

  // Edit/Add State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<{ id: number; name: string } | null>(null)
  const [formData, setFormData] = useState({ id: "", name: "" })
  const [saving, setSaving] = useState(false)

  // Delete State
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)

  // Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getCities({ page, pageSize, search, sortColumn, sortDirection })
      if (res.success && res.data) {
        setData(res.data)
        setTotal(res.total || 0)
        setPageCount(res.pageCount || 0)
      } else {
        toast.error(res.error || "Veriler yüklenemedi")
      }
    } catch (e) {
      toast.error("Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, sortColumn, sortDirection])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchData() // Triggered by effect via search state, but if called directly need to handle carefully
    // Actually, setting search will trigger effect if included in dependency array
  }

  // Effect for search debounce or just manual enter? 
  // For simplicity, let's use a form submit or debounce. 
  // Here I used `search` state in dependency array of fetchData. 
  // If I type, it will trigger. Better to debounce or use enter.
  // I'll remove `search` from dependency and add a manual trigger.
  // Correction: `fetchData` depends on `search`. So setting search triggers it.

  const openAddDialog = () => {
    setEditingItem(null)
    setFormData({ id: "", name: "" })
    setIsDialogOpen(true)
  }

  const openEditDialog = (item: any) => {
    setEditingItem(item)
    setFormData({ id: String(item.id), name: item.name })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.id || !formData.name) {
      toast.error("Tüm alanları doldurun")
      return
    }
    setSaving(true)
    try {
      const res = await upsertCity({ id: parseInt(formData.id), name: formData.name })
      if (res.success) {
        toast.success(editingItem ? "Güncellendi" : "Eklendi")
        setIsDialogOpen(false)
        fetchData()
      } else {
        toast.error(res.error)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (deletingId === null) return
    try {
      const res = await deleteCity(deletingId)
      if (res.success) {
        toast.success("Silindi")
        setIsDeleteDialogOpen(false)
        fetchData()
      } else {
        toast.error(res.error)
      }
    } catch (e) {
      toast.error("Silinemedi")
    }
  }

  const handleReset = async () => {
    try {
      const res = await deleteAllCities()
      if (res.success) {
        toast.success("Tüm iller silindi")
        setIsResetDialogOpen(false)
        fetchData()
      } else {
        toast.error(res.error)
      }
    } catch (e) {
      toast.error("Sıfırlama işlemi başarısız")
    }
  }

  const handleUpload = async () => {
    if (!uploadFile) {
      toast.error("Dosya seçin")
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      const snap = await makeSnapshot(uploadFile)
      fd.append("file", snap)
      const res = await fetch("/api/import/cities", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Yükleme başarısız")
      toast.success(data.message)
      fetchData()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border p-4 rounded-lg bg-background/50">
        <div className="space-y-1">
          <h3 className="font-medium">Toplu Yükleme</h3>
          <p className="text-sm text-muted-foreground">CSV: id (plaka), il</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input 
            type="file" 
            accept=".csv,.xls,.xlsx" 
            className="w-full sm:w-[250px]"
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
          />
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            Yükle
          </Button>
          <Button variant="outline" size="icon" onClick={() => downloadCSV('iller.csv', ['id','il'], [['34','İSTANBUL'],['06','ANKARA']], ';')}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Table Actions */}
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Input 
            placeholder="Ara..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
          <Button size="sm" variant="ghost" onClick={fetchData}>
             <Search className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="destructive" size="sm" onClick={() => setIsResetDialogOpen(true)}>
            <Trash className="w-4 h-4 mr-2" />
            Listeyi Temizle
          </Button>
          <Button onClick={openAddDialog} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Ekle
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="w-[100px] cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center gap-2">
                  Kod (Plaka)
                  {sortColumn === 'id' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                  ) : (
                    <ArrowUpDown className="w-4 h-4 opacity-50" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  İl Adı
                  {sortColumn === 'name' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                  ) : (
                    <ArrowUpDown className="w-4 h-4 opacity-50" />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[100px] text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">Yükleniyor...</TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">Kayıt bulunamadı.</TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(item)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                        setDeletingId(item.id)
                        setIsDeleteDialogOpen(true)
                      }}>
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <CustomPagination
        currentPage={page}
        pageCount={pageCount}
        onPageChange={setPage}
        disabled={loading}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        totalCount={total}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'İl Düzenle' : 'Yeni İl Ekle'}</DialogTitle>
            <DialogDescription>
              İl bilgilerini aşağıdan düzenleyebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Plaka Kodu</Label>
              <Input 
                value={formData.id} 
                onChange={(e) => setFormData({...formData, id: e.target.value})} 
                disabled={!!editingItem} // Disable ID edit on update
                type="number"
              />
            </div>
            <div className="space-y-2">
              <Label>İl Adı</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>İptal</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmationDialog 
        isOpen={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="İli Sil"
        description="Bu ili silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
      />

      <DeleteConfirmationDialog 
        isOpen={isResetDialogOpen} 
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={handleReset}
        title="Tüm İlleri Sil"
        description="DİKKAT: Tüm illeri silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve bağlı verileri etkileyebilir."
      />
    </div>
  )
}
