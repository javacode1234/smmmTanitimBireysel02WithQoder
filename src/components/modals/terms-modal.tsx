"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface TermsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TermsModal({ open, onOpenChange }: TermsModalProps) {
  const [content, setContent] = useState<string>("")
  const [title, setTitle] = useState<string>("Kullanım Koşulları")
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      fetchContent()
    }
  }, [open])

  const fetchContent = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/content/legal-documents?type=TERMS_OF_USE')
      if (response.ok) {
        const data = await response.json()
        setTitle(data.title || "Kullanım Koşulları")
        setContent(data.content || "")
        setLastUpdated(data.lastUpdated ? new Date(data.lastUpdated).toLocaleDateString('tr-TR') : "")
      }
    } catch (error) {
      console.error('Error fetching terms:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
            {title}
          </DialogTitle>
          {lastUpdated ? (
            <DialogDescription>
              Son Güncelleme: {lastUpdated}
            </DialogDescription>
          ) : (
            <DialogDescription>
              Kullanım koşulları içeriğini aşağıda görüntüleyebilirsiniz.
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Kapat</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
