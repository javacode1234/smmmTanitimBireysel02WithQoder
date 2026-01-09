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
import { getTaxOffices, upsertTaxOffice, deleteTaxOffice, getCities, deleteAllTaxOffices } from "../actions"
import { makeSnapshot, downloadCSV } from "../utils"
import { LocationCombobox } from "@/components/ui/location-combobox"

export function TaxOfficesTab() {
  const [data, setData] = useState<any[]>([])
  const [cities, setCities] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [search, setSearch] = useState("")
  const [sortColumn, setSortColumn] = useState<string>("code")
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>("asc")

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<{ id: string; code?: string; name: string; cityId?: number; city?: { name: string }; district?: string } | null>(null)
  const [formData, setFormData] = useState({ id: "", code: "", name: "", cityId: 0, cityName: "", district: "" })
  const [saving, setSaving] = useState(false)

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)

  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Fetch cities for lookup
  useEffect(() => {
    getCities({ page: 1, pageSize: 100 }).then(res => {
      if (res.success && res.data) {
        setCities(res.data)
      }
    })
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getTaxOffices({ page, pageSize, search, sortColumn, sortDirection })
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
    setFormData({ id: "", code: "", name: "", cityId: 0, cityName: "", district: "" })
    setIsDialogOpen(true)
  }

  const openEditDialog = (item: any) => {
    setEditingItem(item)
    setFormData({ 
      id: item.id, 
      code: item.code || "",
      name: item.name, 
      cityId: item.cityId || 0,
      cityName: item.city?.name || "", 
      district: item.district || "" 
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name) {
      toast.error("Vergi dairesi adı zorunlu")
      return
    }
    setSaving(true)
    try {
      const res = await upsertTaxOffice({ 
        id: formData.id || undefined, 
        code: formData.code || undefined,
        name: formData.name,
        cityId: formData.cityId || undefined,
        district: formData.district
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
      const res = await deleteTaxOffice(deletingId)
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
      const res = await deleteAllTaxOffices()
      if (res.success) {
        toast.success("Tüm vergi daireleri silindi")
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
      const res = await fetch("/api/import/tax-offices", { method: "POST", body: fd })
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
          <p className="text-sm text-muted-foreground">CSV: say_kodu, il_id, ilce, vergi_dairesi</p>
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
          <Button variant="outline" size="icon" onClick={() => downloadCSV('vergi_daireleri.csv', ['say_kodu','il_id','ilce','vergi_dairesi'], [['034253','34','Kadıköy','Kadıköy VDB']], ';')}>
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
                className="cursor-pointer hover:bg-muted/50" 
                onClick={() => handleSort('code')}
              >
                <div className="flex items-center gap-2">
                  Kod
                  {sortColumn === 'code' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                  ) : (
                    <ArrowUpDown className="w-4 h-4 opacity-50" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('city')}
              >
                <div className="flex items-center gap-2">
                  İl (Kod - Ad)
                  {sortColumn === 'city' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                  ) : (
                    <ArrowUpDown className="w-4 h-4 opacity-50" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('district')}
              >
                <div className="flex items-center gap-2">
                  İlçe
                  {sortColumn === 'district' ? (
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
                  Vergi Dairesi
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
                <TableCell colSpan={5} className="h-24 text-center">Yükleniyor...</TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Kayıt bulunamadı.</TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">{item.code}</TableCell>
                  <TableCell>{item.city?.id ? `${item.city.id} - ${item.city.name}` : item.city?.name}</TableCell>
                  <TableCell>{item.district}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
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
            <DialogTitle>{editingItem ? 'Vergi Dairesi Düzenle' : 'Yeni Vergi Dairesi Ekle'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-1">
                <Label>Kod</Label>
                <Input 
                  value={formData.code} 
                  onChange={(e) => setFormData({...formData, code: e.target.value})} 
                  placeholder="034253"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Vergi Dairesi Adı</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>İl</Label>
                <LocationCombobox 
                  type="city" 
                  value={formData.cityName} 
                  onValueChange={(val) => {
                    const city = cities.find(c => c.name === val)
                    setFormData(prev => ({ 
                      ...prev, 
                      cityName: val, 
                      cityId: city?.id || 0,
                      district: '' 
                    }))
                  }} 
                />
              </div>
              <div className="space-y-2">
                <Label>İlçe</Label>
                <LocationCombobox 
                  type="district" 
                  parentValue={formData.cityName}
                  value={formData.district} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, district: val }))} 
                />
              </div>
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
        title="Vergi Dairesini Sil"
        description="Bu vergi dairesini silmek istediğinize emin misiniz?"
      />

      <DeleteConfirmationDialog 
        isOpen={isResetDialogOpen} 
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={handleReset}
        title="Tüm Vergi Dairelerini Sil"
        description="DİKKAT: Tüm vergi dairelerini silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
      />
    </div>
  )
}
