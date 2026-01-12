"use client"

import { useState, useMemo, Fragment } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  ArrowUpDown, 
  Paperclip, 
  FileText, 
  Download,
  Eye
} from "lucide-react"

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
  attachments: string | null
  isActive: boolean
  createdAt: string | Date
  updatedAt: string | Date
}

export function AnnouncementsTable({ announcements }: { announcements: Announcement[] }) {
  const [filterText, setFilterText] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: keyof Announcement; direction: 'asc' | 'desc' } | null>({ key: 'createdAt', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)

  const getAttachments = (json: string | null): Attachment[] => {
    if (!json) return []
    try {
      return JSON.parse(json)
    } catch {
      return []
    }
  }

  const handleSort = (key: keyof Announcement) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const handleDownload = (att: Attachment) => {
    const link = document.createElement('a')
    link.href = att.url
    link.download = att.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredData = useMemo(() => {
    let data = [...announcements]

    if (filterText) {
      const lowerFilter = filterText.toLowerCase()
      data = data.filter(item => 
        item.title.toLowerCase().includes(lowerFilter) || 
        item.description.toLowerCase().includes(lowerFilter)
      )
    }

    if (sortConfig) {
      data.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        
        if (aValue === bValue) return 0
        
        // Handle dates
        if (sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
            const dateA = new Date(aValue as string | Date).getTime()
            const dateB = new Date(bValue as string | Date).getTime()
            return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA
        }

        // Handle strings
        if (typeof aValue === 'string' && typeof bValue === 'string') {
             return sortConfig.direction === 'asc' 
                ? aValue.localeCompare(bValue) 
                : bValue.localeCompare(aValue)
        }
        
        return 0
      })
    }

    return data
  }, [announcements, filterText, sortConfig])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  const totalPages = Math.ceil(filteredData.length / pageSize)

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Duyurularda ara..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <Button variant="ghost" onClick={() => handleSort('title')} className="h-8 -ml-3 font-semibold">
                  Başlık
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[300px]">Açıklama</TableHead>
              <TableHead className="w-[150px]">
                <Button variant="ghost" onClick={() => handleSort('createdAt')} className="h-8 -ml-3 font-semibold">
                  Tarih
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[100px] text-center">Ekler</TableHead>
              <TableHead className="w-[100px] text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((announcement) => {
                const attachments = getAttachments(announcement.attachments)
                const isNew = (new Date().getTime() - new Date(announcement.createdAt).getTime()) < 1000 * 60 * 60 * 24 * 7 // 7 days

                return (
                  <TableRow key={announcement.id} className="group">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {announcement.title}
                        {isNew && <Badge variant="default" className="text-[10px] h-5 px-1.5">Yeni</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-muted-foreground">
                      {announcement.description}
                    </TableCell>
                    <TableCell>
                      {new Date(announcement.createdAt).toLocaleDateString("tr-TR")}
                    </TableCell>
                    <TableCell className="text-center">
                        {attachments.length > 0 ? (
                            <Badge variant="secondary" className="gap-1">
                                <Paperclip className="h-3 w-3" />
                                {attachments.length}
                            </Badge>
                        ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                        )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedAnnouncement(announcement)}>
                        <Eye className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Sonuç bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Sayfada</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize.toString()} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>Kayıt var. Toplam kayıt sayısı {filteredData.length}.</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              İlk
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Önceki
            </Button>
            
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  if (page === 1 || page === totalPages) return true
                  if (Math.abs(page - currentPage) <= 1) return true
                  return false
                })
                .map((page, idx, arr) => (
                  <Fragment key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                      <span key={`ellipsis-${page}`} className="px-2 text-muted-foreground">...</span>
                    )}
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-9"
                    >
                      {page}
                    </Button>
                  </Fragment>
                ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Sonraki
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Son
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAnnouncement?.title}</DialogTitle>
            <DialogDescription>
              {selectedAnnouncement && new Date(selectedAnnouncement.createdAt).toLocaleDateString("tr-TR")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="prose max-w-none">
              <p className="text-lg font-medium">{selectedAnnouncement?.description}</p>
              {selectedAnnouncement?.content && (
                <div className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground p-4 bg-muted rounded-md">
                  {selectedAnnouncement.content}
                </div>
              )}
            </div>

            {selectedAnnouncement && getAttachments(selectedAnnouncement.attachments).length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Ekler ({getAttachments(selectedAnnouncement.attachments).length})
                </h4>
                <div className="grid gap-2">
                  {getAttachments(selectedAnnouncement.attachments).map((att, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">{att.name}</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleDownload(att)}>
                        <Download className="h-4 w-4 mr-2" />
                        İndir
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}