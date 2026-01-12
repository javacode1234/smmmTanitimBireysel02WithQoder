"use client"

import { useState, useMemo, Fragment } from "react"
// Re-trigger build
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { FileText, Download, Paperclip, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

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

export function ClientAnnouncements({ announcements }: { announcements: Announcement[] }) {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [filterText, setFilterText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const getAttachments = (json: string | null): Attachment[] => {
    if (!json) return []
    try {
      return JSON.parse(json)
    } catch {
      return []
    }
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

    return data
  }, [announcements, filterText])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  const totalPages = Math.ceil(filteredData.length / pageSize)

  if (announcements.length === 0) {
    return <p className="text-muted-foreground text-sm">Henüz duyuru bulunmuyor.</p>
  }

  return (
    <>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Duyuru ara..."
            value={filterText}
            onChange={(e) => {
              setFilterText(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-8"
          />
        </div>

        <div className="space-y-4">
          {paginatedData.length > 0 ? (
            paginatedData.map((announcement, i) => {
              const attachments = getAttachments(announcement.attachments)
              const isNew = (new Date().getTime() - new Date(announcement.createdAt).getTime()) < 1000 * 60 * 60 * 24 * 7 // 7 days

              return (
                <div 
                  key={announcement.id} 
                  className="flex items-center justify-between border-b pb-3 last:border-0 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                  onClick={() => setSelectedAnnouncement(announcement)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${isNew ? "text-primary" : ""}`}>
                        {announcement.title}
                      </p>
                      {isNew && <Badge variant="default" className="text-[10px] h-5 px-1.5">Yeni</Badge>}
                      {attachments.length > 0 && <Paperclip className="h-3 w-3 text-muted-foreground" />}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{announcement.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(announcement.createdAt).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-center text-muted-foreground py-4">Sonuç bulunamadı.</p>
          )}
        </div>

        {filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Sayfada</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    setPageSize(Number(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="h-8 w-[60px]">
                    <SelectValue placeholder={pageSize.toString()} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[5, 10, 20].map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <span>Toplam {filteredData.length}</span>
            </div>
            
            <div className="flex items-center justify-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2"
              >
                İlk
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2"
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
                        <span className="px-1 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
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
                className="px-2"
              >
                Sonraki
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2"
              >
                Son
              </Button>
            </div>
          </div>
        )}
      </div>

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
                <div className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">
                  {selectedAnnouncement.content}
                </div>
              )}
            </div>

            {selectedAnnouncement && getAttachments(selectedAnnouncement.attachments).length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Ekler
                </h4>
                <div className="grid gap-2">
                  {getAttachments(selectedAnnouncement.attachments).map((att, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
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
    </>
  )
}
