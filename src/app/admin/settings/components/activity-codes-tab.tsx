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
import { getActivityCodes, upsertActivityCode, deleteActivityCode, deleteAllActivityCodes } from "../actions"
import { makeSnapshot, downloadCSV } from "../utils"

export function ActivityCodesTab() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [search, setSearch] = useState("")
  const [sortColumn, setSortColumn] = useState<string>("code")
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>("asc")

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<{ id: string; code: string; name: string } | null>(null)
  const [formData, setFormData] = useState({ id: "", code: "", name: "" })
  const [saving, setSaving] = useState(false)

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)

  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getActivityCodes({ page, pageSize, search, sortColumn, sortDirection })
      if (res.success && res.data) {
        setData(res.data)
        setTotal(res.total || 0)
        setPageCount(res.pageCount || 0)
      } else {
        toast.error(res.error)
      }
    } catch (e) {
      toast.error("Hata oluştu")
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, sortColumn, sortDirection])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const openAddDialog = () => {
    setEditingItem(null)
    setFormData({ id: "", code: "", name: "" })
    setIsDialogOpen(true)
  }

  const openEditDialog = (item: any) => {
    setEditingItem(item)
    setFormData({ id: item.id, code: item.code, name: item.name })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.code || !formData.name) {
      toast.error("Tüm alanları doldurun")
      return
    }
    setSaving(true)
    try {
      const res = await upsertActivityCode({ 
        id: formData.id || undefined, 
        code: formData.code,
        name: formData.name
      })
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
      const res = await deleteActivityCode(deletingId)
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
      const res = await deleteAllActivityCodes()
      if (res.success) {
        toast.success("Tüm NACE kodları silindi")
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
      const res = await fetch("/api/import/activity-codes", { method: "POST", body: fd })
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
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border p-4 rounded-lg bg-background/50">
        <div className="space-y-1">
          <h3 className="font-medium">Toplu Yükleme</h3>
          <p className="text-sm text-muted-foreground">CSV: code, name</p>
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
          <Button variant="outline" size="icon" onClick={() => downloadCSV('nace_kodlari.csv', ['code','name'], [['62.01','Yazılım']], ';')}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

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

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="w-[150px] cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('code')}
              >
                <div className="flex items-center gap-2">
                  NACE Kodu
                  {sortColumn === 'code' ? (
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
                  Faaliyet Adı
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
                  <TableCell className="font-medium">{item.code}</TableCell>
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

      <CustomPagination
        currentPage={page}
        pageCount={pageCount}
        onPageChange={setPage}
        disabled={loading}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        totalCount={total}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'NACE Kodu Düzenle' : 'Yeni NACE Kodu Ekle'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>NACE Kodu</Label>
              <Input 
                value={formData.code} 
                onChange={(e) => setFormData({...formData, code: e.target.value})} 
                disabled={!!editingItem} // Code is unique identifier usually, but maybe editable? Let's disable for safety if ID exists
              />
            </div>
            <div className="space-y-2">
              <Label>Faaliyet Adı</Label>
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

      <DeleteConfirmationDialog 
        isOpen={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="NACE Kodunu Sil"
        description="Bu NACE kodunu silmek istediğinize emin misiniz?"
      />

      <DeleteConfirmationDialog 
        isOpen={isResetDialogOpen} 
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={handleReset}
        title="Tüm NACE Kodlarını Sil"
        description="DİKKAT: Tüm NACE kodlarını silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
      />
    </div>
  )
}
