"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { KVKKModal } from "./kvkk-modal"

interface CareerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CareerModal({ open, onOpenChange }: CareerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [kvkkModalOpen, setKvkkModalOpen] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Dosya boyutu en fazla 5MB olabilir")
        return
      }
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        toast.error("Sadece PDF veya Word dosyaları yüklenebilir")
        return
      }
      setCvFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!cvFile) {
      toast.error("Lütfen CV dosyanızı yükleyin")
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.append('cv', cvFile)

      const response = await fetch('/api/job-applications', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Başvuru gönderilemedi')
      }

      toast.success("Başvurunuz başarıyla gönderildi! En kısa sürede size dönüş yapacağız.")
      onOpenChange(false)
      
      // Reset form safely
      const form = e.currentTarget
      if (form) {
        form.reset()
      }
      setCvFile(null)
    } catch {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Kariyer Fırsatları
          </DialogTitle>
          <DialogDescription>
            Ekibimize katılmak için formu doldurun ve CV&apos;nizi yükleyin
          </DialogDescription>
        </DialogHeader>

        <form id="career-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-sm font-medium">
                Ad <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="firstName" 
                name="firstName" 
                required 
                className="mt-1"
                placeholder="Adınız"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-sm font-medium">
                Soyad <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="lastName" 
                name="lastName" 
                required 
                className="mt-1"
                placeholder="Soyadınız"
              />
            </div>
          </div>

          {/* Contact Fields */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                E-posta <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                required 
                className="mt-1"
                placeholder="ornek@email.com"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm font-medium">
                Telefon <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="phone" 
                name="phone" 
                type="tel" 
                required 
                className="mt-1"
                placeholder="+90 5XX XXX XX XX"
              />
            </div>
          </div>

          {/* Position */}
          <div className="mt-4">
            <Label htmlFor="position" className="text-sm font-medium">
              Başvurmak İstediğiniz Pozisyon <span className="text-red-500">*</span>
            </Label>
            <Select name="position" required>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Pozisyon seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mali Müşavir Yardımcısı">Mali Müşavir Yardımcısı</SelectItem>
                <SelectItem value="Muhasebe Elemanı">Muhasebe Elemanı</SelectItem>
                <SelectItem value="Stajyer">Stajyer</SelectItem>
                <SelectItem value="Mali Müşavir">Mali Müşavir</SelectItem>
                <SelectItem value="Diğer">Diğer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Experience and Education */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="experience" className="text-sm font-medium">
                Deneyim <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="experience" 
                name="experience" 
                required 
                className="mt-1"
                placeholder="Örn: 3 yıl, Yeni Mezun"
              />
            </div>
            <div>
              <Label htmlFor="education" className="text-sm font-medium">
                Eğitim <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="education" 
                name="education" 
                required 
                className="mt-1"
                placeholder="Örn: İktisat Fakültesi"
              />
            </div>
          </div>

          {/* CV Upload */}
          <div className="mt-4">
            <Label htmlFor="cv" className="text-sm font-medium">
              CV Yükle <span className="text-red-500">*</span>
            </Label>
            <div className="mt-1">
              <label 
                htmlFor="cv" 
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors bg-gray-50 hover:bg-blue-50"
              >
                <div className="text-center">
                  {cvFile ? (
                    <>
                      <FileText className="h-10 w-10 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">{cvFile.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-blue-600">Dosya seçin</span> veya sürükleyin
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF veya Word (Max 5MB)
                      </p>
                    </>
                  )}
                </div>
                <input
                  id="cv"
                  name="cv"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="mt-4">
            <Label htmlFor="coverLetter" className="text-sm font-medium">
              Ön Yazı (Opsiyonel)
            </Label>
            <Textarea 
              id="coverLetter" 
              name="coverLetter" 
              rows={4} 
              className="mt-1"
              placeholder="Kendinizi ve neden bu pozisyona uygun olduğunuzu kısaca anlatın..."
            />
          </div>

          {/* KVKK Consent */}
          <div className="flex items-start space-x-2 bg-blue-50 p-4 rounded-lg mt-4">
            <input
              id="kvkkConsent"
              type="checkbox"
              required
              className="mt-1"
            />
            <label htmlFor="kvkkConsent" className="text-xs text-gray-700 leading-relaxed">
              Kişisel verilerimin, başvuru sürecinin yürütülmesi amacıyla işlenmesine ve 
              saklanmasına{" "}
              <button
                type="button"
                onClick={() => setKvkkModalOpen(true)}
                className="text-blue-600 hover:underline font-medium"
              >
                KVKK Aydınlatma Metni
              </button>{" "}
              kapsamında onay veriyorum.
            </label>
          </div>
        </form>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            İptal
          </Button>
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-blue-600 to-cyan-600"
            disabled={isSubmitting}
            form="career-form"
          >
            {isSubmitting ? "Gönderiliyor..." : "Başvuruyu Gönder"}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* KVKK Modal */}
      <KVKKModal open={kvkkModalOpen} onOpenChange={setKvkkModalOpen} />
    </Dialog>
  )
}
