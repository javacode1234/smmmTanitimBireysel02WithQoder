"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { FolderOpen, Download, Trash2, Plus, ChevronLeft, ChevronRight, Edit, Upload as UploadIcon, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

interface Document {
  id: string
  name: string
  uploadDate: string
  file: string
  type: 'incoming' | 'outgoing' // incoming = müşteri yükler, outgoing = biz yükleriz
  isRead: boolean // Evrak okundu mu?
}

interface DocumentsTableProps {
  documents: Document[]
  customerId: string
  onUpdate: (documents: Document[]) => void
}

export function DocumentsTable({ documents, customerId, onUpdate }: DocumentsTableProps) {
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming')
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [newDocName, setNewDocName] = useState("")
  const [newDocFile, setNewDocFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  // Filter documents by type and search
  const filteredDocuments = documents
    .filter(doc => doc.type === activeTab)
    .filter(doc => doc.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage
  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / itemsPerPage))
  const paginatedDocuments = filteredDocuments.slice(startIndex, startIndex + itemsPerPage)

  const handleAddDocument = () => {
    if (!newDocName.trim()) {
      toast.error("Dosya adı gereklidir")
      return
    }

    if (!newDocFile) {
      toast.error("Lütfen bir dosya seçin")
      return
    }

    // In a real app, you would upload the file to a server here
    // For now, we'll create a fake URL
    const fileUrl = URL.createObjectURL(newDocFile)

    const newDoc: Document = {
      id: Date.now().toString(),
      name: newDocName,
      uploadDate: new Date().toISOString(),
      file: fileUrl,
      type: 'outgoing', // Admin yüklemesi = giden evrak
      isRead: false,
    }

    const updatedDocuments = [...documents, newDoc]
    onUpdate(updatedDocuments)
    toast.success("Evrak eklendi")
    setIsAddModalOpen(false)
    setNewDocName("")
    setNewDocFile(null)
  }

  const handleEditDocument = () => {
    if (!selectedDocument || !newDocName.trim()) {
      toast.error("Dosya adı gereklidir")
      return
    }

    let fileUrl = selectedDocument.file
    if (newDocFile) {
      fileUrl = URL.createObjectURL(newDocFile)
    }

    const updatedDocuments = documents.map(doc =>
      doc.id === selectedDocument.id
        ? { ...doc, name: newDocName, file: fileUrl }
        : doc
    )

    onUpdate(updatedDocuments)
    toast.success("Evrak güncellendi")
    setIsEditModalOpen(false)
    setSelectedDocument(null)
    setNewDocName("")
    setNewDocFile(null)
  }

  const handleDeleteDocument = (docId: string) => {
    const updatedDocuments = documents.filter(doc => doc.id !== docId)
    onUpdate(updatedDocuments)
    toast.success("Evrak silindi")
  }

  const openEditModal = (doc: Document) => {
    setSelectedDocument(doc)
    setNewDocName(doc.name)
    setNewDocFile(null)
    setIsEditModalOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewDocFile(file)
    }
  }

  const toggleReadStatus = (docId: string) => {
    const updatedDocuments = documents.map(doc =>
      doc.id === docId ? { ...doc, isRead: !doc.isRead } : doc
    )
    onUpdate(updatedDocuments)
    toast.success("Okundu durumu güncellendi")
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => {
        setActiveTab(v as 'incoming' | 'outgoing')
        setCurrentPage(1)
        setSearchQuery("")
      }}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="incoming">Gelen Evrak</TabsTrigger>
          <TabsTrigger value="outgoing">Giden Evrak</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {/* Search, Page Size and Add */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Evrak ara..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="max-w-sm"
              />
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Sayfa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {activeTab === 'outgoing' && (
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Evrak Ekle
              </Button>
            )}
          </div>

          {/* Table */}
          {paginatedDocuments.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dosya Adı</TableHead>
                      <TableHead>Yüklenme Tarihi</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4 text-primary" />
                            <span className={`font-medium ${!doc.isRead ? 'font-bold' : ''}`}>{doc.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(doc.uploadDate).toLocaleDateString("tr-TR")}
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded ${
                            doc.isRead 
                              ? "bg-gray-100 text-gray-600" 
                              : "bg-blue-100 text-blue-800 font-semibold"
                          }`}>
                            {doc.isRead ? "Okundu" : "Okunmadı"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => toggleReadStatus(doc.id)}
                              title={doc.isRead ? "Okunmadı olarak işaretle" : "Okundu olarak işaretle"}
                            >
                              {doc.isRead ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                            {activeTab === 'outgoing' && (
                              <Button variant="outline" size="sm" onClick={() => openEditModal(doc)}>
                                <Edit className="h-3 w-3 mr-1" />
                                Düzenle
                              </Button>
                            )}
                            <Button variant="outline" size="sm" asChild>
                              <a href={doc.file} download={doc.name}>
                                <Download className="h-3 w-3 mr-1" />
                                İndir
                              </a>
                            </Button>
                            {activeTab === 'outgoing' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteDocument(doc.id)}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Toplam {filteredDocuments.length} evraktan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredDocuments.length)} arası gösteriliyor
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Önceki
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8"
                        >
                          {page}
                        </Button>
                      ))}
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
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              {searchQuery ? "Eşleşen evrak bulunamadı" : activeTab === 'incoming' ? "Henüz müşteri evrak yüklememiş" : "Henüz evrak yüklenmemiş"}
            </p>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Yeni Evrak Ekle</DialogTitle>
            <DialogDescription>Yeni evrak bilgilerini girin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-6 py-4">
            <div>
              <Label htmlFor="docName">Dosya Adı *</Label>
              <Input
                id="docName"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                placeholder="Evrak adı"
              />
            </div>
            <div>
              <Label htmlFor="docFile">Dosya Seç *</Label>
              <input
                ref={fileInputRef}
                id="docFile"
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadIcon className="h-4 w-4 mr-2" />
                {newDocFile ? newDocFile.name : "Dosya Seç..."}
              </Button>
            </div>
          </div>
          <DialogFooter className="px-6 pb-6">
            <Button variant="outline" onClick={() => {
              setIsAddModalOpen(false)
              setNewDocName("")
              setNewDocFile(null)
            }}>
              İptal
            </Button>
            <Button onClick={handleAddDocument} className="bg-green-600 hover:bg-green-700">
              Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Evrak Düzenle</DialogTitle>
            <DialogDescription>Evrak bilgilerini güncelleyin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-6 py-4">
            <div>
              <Label htmlFor="editDocName">Dosya Adı *</Label>
              <Input
                id="editDocName"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                placeholder="Evrak adı"
              />
            </div>
            <div>
              <Label htmlFor="editDocFile">Yeni Dosya Seç (Opsiyonel)</Label>
              <input
                ref={editFileInputRef}
                id="editDocFile"
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => editFileInputRef.current?.click()}
              >
                <UploadIcon className="h-4 w-4 mr-2" />
                {newDocFile ? newDocFile.name : "Yeni dosya seç (mevcut dosyayı değiştirmek için)"}
              </Button>
            </div>
          </div>
          <DialogFooter className="px-6 pb-6">
            <Button variant="outline" onClick={() => {
              setIsEditModalOpen(false)
              setSelectedDocument(null)
              setNewDocName("")
              setNewDocFile(null)
            }}>
              İptal
            </Button>
            <Button onClick={handleEditDocument} className="bg-green-600 hover:bg-green-700">
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
