"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Pencil, Trash2, Plus, Search, FileText, X, Paperclip } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"

const formSchema = z.object({
  title: z.string().min(1, "Başlık zorunludur"),
  description: z.string().min(1, "Açıklama zorunludur"),
  content: z.string().optional(),
  isActive: z.boolean().default(true),
})

type FormValues = z.infer<typeof formSchema>

interface Attachment {
  name: string
  type: string
  url: string
}

interface Announcement {
  id: string
  title: string
  description: string
  content: string | null
  attachments: string | null // JSON string of Attachment[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  
  // modal + edit state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingItem, setDeletingItem] = useState<Announcement | null>(null)
  
  // Attachments state
  const [currentAttachments, setCurrentAttachments] = useState<Attachment[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // filter + pagination
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage = 10

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      isActive: true,
    }
  })

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/announcements")
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      } else {
        toast.error("Duyurular yüklenemedi")
      }
    } catch (e) {
      console.error(e)
      toast.error("Duyurular yüklenemedi")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true)
      const newAttachments: Attachment[] = []
      
      try {
        for (let i = 0; i < e.target.files.length; i++) {
          const file = e.target.files[i]
          
          // Max size check (e.g. 5MB)
          if (file.size > 5 * 1024 * 1024) {
            toast.error(`${file.name} çok büyük (max 5MB)`)
            continue
          }

          const reader = new FileReader()
          const promise = new Promise<void>((resolve, reject) => {
            reader.onload = (e) => {
              if (e.target?.result) {
                newAttachments.push({
                  name: file.name,
                  type: file.type,
                  url: e.target.result as string
                })
                resolve()
              }
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
          
          await promise
        }
        
        setCurrentAttachments(prev => [...prev, ...newAttachments])
      } catch (error) {
        console.error(error)
        toast.error("Dosya yüklenirken hata oluştu")
      } finally {
        setIsUploading(false)
        // Reset input
        e.target.value = ''
      }
    }
  }

  const removeAttachment = (index: number) => {
    setCurrentAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: FormValues) => {
    try {
      const formData = {
        ...data,
        attachments: currentAttachments
      }

      if (editingId) {
        const res = await fetch("/api/announcements", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            ...formData
          })
        })
        if (!res.ok) throw new Error("Güncellenemedi")
        toast.success("Duyuru güncellendi")
      } else {
        const res = await fetch("/api/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        })
        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(errorText || "Kaydedilemedi")
        }
        toast.success("Duyuru eklendi")
      }
      setIsModalOpen(false)
      resetForm()
      fetchItems()
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || "İşlem başarısız")
    }
  }

  const resetForm = () => {
    form.reset({
      title: "",
      description: "",
      content: "",
      isActive: true,
    })
    setCurrentAttachments([])
    setEditingId(null)
  }

  const handleEdit = (item: Announcement) => {
    setEditingId(item.id)
    form.reset({
      title: item.title,
      description: item.description,
      content: item.content || "",
      isActive: item.isActive,
    })
    
    try {
      if (item.attachments) {
        const parsed = JSON.parse(item.attachments)
        setCurrentAttachments(parsed)
      } else {
        setCurrentAttachments([])
      }
    } catch {
      setCurrentAttachments([])
    }
    
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingItem) return
    try {
      const res = await fetch(`/api/announcements?id=${deletingItem.id}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("Silinemedi")
      toast.success("Duyuru silindi")
      setDeletingItem(null)
      fetchItems()
    } catch (e) {
      toast.error("Silme işlemi başarısız")
    }
  }

  // Filter items
  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  )

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Duyurular</h1>
          <p className="text-muted-foreground mt-2">
            Müşterileriniz için duyuruları buradan yönetebilirsiniz.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Duyuru
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Duyuru ara..."
              className="pl-9 max-w-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Ekler</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Duyuru bulunamadı.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((item) => {
                    let attachmentsCount = 0
                    try {
                      if (item.attachments) {
                        attachmentsCount = JSON.parse(item.attachments).length
                      }
                    } catch {}

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell className="max-w-[300px] truncate">{item.description}</TableCell>
                        <TableCell>
                          {attachmentsCount > 0 ? (
                            <Badge variant="secondary" className="gap-1">
                              <Paperclip className="h-3 w-3" />
                              {attachmentsCount}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.isActive ? "default" : "secondary"}>
                            {item.isActive ? "Aktif" : "Pasif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(item.createdAt).toLocaleDateString("tr-TR")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setDeletingItem(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Önceki
              </Button>
              <div className="text-sm text-muted-foreground">
                Sayfa {currentPage} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Sonraki
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Duyuruyu Düzenle" : "Yeni Duyuru Ekle"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Başlık</FormLabel>
                    <FormControl>
                      <Input placeholder="Duyuru başlığı" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kısa Açıklama</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Listede görünecek kısa açıklama" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detaylı İçerik (Opsiyonel)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Duyurunun detaylı içeriği" 
                        className="min-h-[150px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Ekler (Resim, PDF, Doc)</FormLabel>
                <div className="grid gap-4">
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    disabled={isUploading}
                    className="cursor-pointer"
                  />
                  {currentAttachments.length > 0 && (
                    <div className="grid gap-2">
                      {currentAttachments.map((att, i) => (
                        <div key={i} className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="h-4 w-4 flex-shrink-0" />
                            <span className="text-sm truncate">{att.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(i)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Aktif Durum</FormLabel>
                      <FormDescription>
                        Duyuru müşterilere görünsün mü?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  İptal
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {editingId ? "Güncelle" : "Oluştur"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Duyuruyu Sil"
        description="Bu duyuruyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
      />
    </div>
  )
}
