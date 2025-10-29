"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface QuoteRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  packageType: string
}

export function QuoteRequestModal({ open, onOpenChange, packageType }: QuoteRequestModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const form = e.currentTarget

    try {
      const formData = new FormData(form)
      const data = {
        name: `${formData.get('firstName')} ${formData.get('lastName')}`,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        company: formData.get('companyName') as string || 'Belirtilmemiş',
        serviceType: packageType,
        message: formData.get('message') as string,
      }

      const response = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Teklif isteğiniz başarıyla gönderildi! En kısa sürede size dönüş yapacağız.')
        onOpenChange(false)
        if (form) {
          form.reset()
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Teklif isteği gönderilemedi')
      }
    } catch (error) {
      console.error('Error sending quote request:', error)
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Teklif Talebi - {packageType} Paket
          </DialogTitle>
          <DialogDescription>
            Seçtiğiniz paket için detaylı teklif almak üzere bilgilerinizi paylaşın
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
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
          <div className="grid grid-cols-2 gap-4">
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

          {/* Company Name */}
          <div>
            <Label htmlFor="companyName" className="text-sm font-medium">
              Şirket Adı
            </Label>
            <Input 
              id="companyName" 
              name="companyName" 
              className="mt-1"
              placeholder="Şirket adınız (opsiyonel)"
            />
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message" className="text-sm font-medium">
              Mesajınız
            </Label>
            <Textarea 
              id="message" 
              name="message" 
              rows={4} 
              className="mt-1"
              placeholder="Özel talepleriniz veya sorularınız varsa belirtebilirsiniz..."
            />
          </div>

          {/* Package Info */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Seçilen Paket: {packageType}</span>
            </div>
            <p className="text-sm text-blue-700">
              Size özel fiyatlandırma ve detaylı bilgi için en kısa sürede iletişime geçeceğiz.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Gönderiliyor..." : "Teklif Talebi Gönder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
