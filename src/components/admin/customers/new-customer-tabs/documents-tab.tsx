"use client"

import { useState, useEffect } from "react"
import { Save, ArrowRight, Upload, X, FileText, Trash2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

interface DocumentsTabProps {
  customerId: string | null
  onNext: () => void
  onBack: () => void
}

interface Document {
  id: string
  name: string
  file: string | null // URL or Base64
  type: string
  uploadDate: string
  description: string
}

const ESTABLISHMENT_DOC_TYPES = [
  "Kuruluş Gazetesi",
  "İmza Sirküleri",
  "Vergi Levhası",
  "Oda Kayıt Belgesi",
  "Faaliyet Belgesi",
  "Kira Kontratı",
  "Yoklama Fişi",
  "Diğer Kuruluş Belgeleri"
]

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export function DocumentsTab({ customerId, onNext, onBack }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!customerId) return
      
      try {
        setIsLoading(true)
        const res = await fetch(`/api/customers?id=${customerId}`)
        if (!res.ok) throw new Error("Müşteri bilgileri alınamadı")
        
        const data = await res.json()
        
        if (data.documents) {
          try {
            const parsedDocs = JSON.parse(data.documents);
            if (Array.isArray(parsedDocs)) {
                 const mappedDocs: Document[] = parsedDocs.map((file: any) => ({
                id: file.id,
                name: file.name || "Dosya",
                file: file.file || null, // URL
                type: file.category || file.type || "Diğer",
                uploadDate: file.uploadDate || new Date().toISOString().split('T')[0],
                description: file.description || ""
              }))
              setDocuments(mappedDocs)
            }
          } catch (e) {
            console.error("Error parsing documents JSON:", e);
          }
        } else if (data.customerfile && Array.isArray(data.customerfile)) {
             // Fallback for old data if any
             const mappedDocs: Document[] = data.customerfile.map((file: any) => ({
            id: file.id,
            name: file.originalName || file.filename || "Dosya",
            file: null, 
            type: file.type || "Diğer",
            uploadDate: file.createdAt ? new Date(file.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            description: file.description || ""
          }))
          setDocuments(mappedDocs)
        }
      } catch (error) {
        console.error("Error fetching documents:", error)
        toast.error("Belgeler yüklenemedi")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
  }, [customerId])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      if (file.size > 4 * 1024 * 1024) {
        toast.error("Dosya boyutu 4MB'dan küçük olmalı")
        e.target.value = ""
        return
      }

      try {
        const base64 = await fileToBase64(file);
        const newDoc: Document = {
          id: crypto.randomUUID(),
          name: file.name,
          file: base64,
          type: type,
          uploadDate: new Date().toISOString().split('T')[0],
          description: ""
        }
        setDocuments(prev => [...prev, newDoc])
        e.target.value = "" // Reset input
      } catch (err) {
        console.error("File reading error", err);
        toast.error("Dosya okunamadı");
      }
    }
  }

  const handleDocumentUpdate = (id: string, field: keyof Document, value: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, [field]: value } : doc
    ))
  }

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id))
  }

  const handleSave = async (shouldNavigate: boolean = false) => {
    if (!customerId) {
      toast.error("Müşteri ID bulunamadı")
      return
    }

    try {
      setIsSaving(true)
      
      const payload = {
        documents: documents.map(doc => ({
            id: doc.id,
            name: doc.name,
            file: doc.file,
            category: doc.type, 
            uploadDate: doc.uploadDate,
            description: doc.description
        }))
      }

      // Check payload size
      const payloadString = JSON.stringify(payload);
      const sizeInBytes = new Blob([payloadString]).size;
      console.log(`Payload size: ${sizeInBytes} bytes`);
      
      if (sizeInBytes > 4 * 1024 * 1024) { // 4MB limit to be safe
          throw new Error(`Toplam dosya boyutu çok yüksek (${(sizeInBytes / (1024*1024)).toFixed(2)} MB). Lütfen daha küçük dosyalar yükleyin.`)
      }

      const res = await fetch(`/api/customers?id=${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: payloadString
      })

      if (!res.ok) {
        if (res.status === 413) {
          throw new Error("Toplam dosya boyutu çok yüksek. Lütfen daha az veya daha küçük dosyalar yükleyin.")
        }

        let errorMessage = "Kaydetme başarısız";
        try {
            const errorData = await res.json();
            console.error("Save error details (JSON):", errorData);
            if (errorData?.error) {
                errorMessage = errorData.error;
            } else {
                errorMessage = `Bilinmeyen hata: ${JSON.stringify(errorData)}`;
            }
        } catch (e) {
            console.error("JSON parse error:", e);
            try {
                const errorText = await res.text();
                console.error("Save error details (Text):", errorText);
                errorMessage = `Sunucu hatası (${res.status}): ${errorText.substring(0, 100)}`;
            } catch (textError) {
                 errorMessage = `Sunucu hatası: ${res.status} ${res.statusText}`;
            }
        }
        throw new Error(errorMessage)
      }
      
      toast.success("Belgeler kaydedildi")
      if (shouldNavigate) onNext()
    } catch (error) {
      console.error(error)
      toast.error("Kaydetme sırasında hata oluştu")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kuruluş Belgeleri</CardTitle>
        <CardDescription>
          Müşteri açılış işlemleri için gerekli belgeleri buradan yükleyebilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ESTABLISHMENT_DOC_TYPES.map((type) => (
            <div key={type} className="flex items-center gap-2 p-3 border rounded-lg bg-muted/20">
              <div className="flex-1">
                <Label className="text-sm font-medium">{type}</Label>
              </div>
              <div className="flex-none">
                <Input 
                  type="file" 
                  className="hidden" 
                  id={`file-${type}`} 
                  onChange={(e) => handleFileChange(e, type)}
                />
                <Button asChild variant="outline" size="sm" className="cursor-pointer">
                  <label htmlFor={`file-${type}`}>
                    <Upload className="w-4 h-4 mr-2" />
                    Yükle
                  </label>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-md border mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Belge Türü</TableHead>
                <TableHead>Dosya Adı</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Henüz belge yüklenmedi.
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.type}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        {doc.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="date" 
                        value={doc.uploadDate} 
                        onChange={(e) => handleDocumentUpdate(doc.id, 'uploadDate', e.target.value)}
                        className="w-36"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="text" 
                        value={doc.description} 
                        onChange={(e) => handleDocumentUpdate(doc.id, 'description', e.target.value)}
                        placeholder="Açıklama giriniz..."
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between pt-4 border-t mt-4">
           <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
            disabled={isSaving}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={isSaving}
            >
              Kaydet
            </Button>
            <Button 
              type="button" 
              onClick={() => handleSave(true)}
              disabled={isSaving}
            >
              İleri
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
