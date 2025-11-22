"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, BookOpen } from "lucide-react"

export function MevzuatSection() {
  const openTURMOB = () => {
    window.open("https://www.turmob.org.tr/sirkuler", "_blank")
  }

  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 to-gray-100" id="mevzuat">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Muhasebe ve Vergi Mevzuatı</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            TÜRMOB tarafından yayınlanan güncel sirküler ve mevzuat bilgileri
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Bilgilendirme
              </CardTitle>
              <CardDescription>
                Muhasebe ve vergi mevzuatı konusunda güncel bilgiler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Türkiye Serbest Muhasebeci Mali Müşavirler Odası (TÜRMOB) tarafından yayınlanan sirküler ve mevzuat bilgilerine erişmek için aşağıdaki butona tıklayabilirsiniz. Yeni sekmede açılacak olan sayfada güncel vergi, muhasebe ve diğer ilgili mevzuat bilgilerini bulabilirsiniz.
                </p>
                <div className="pt-4">
                  <Button 
                    className="w-full sm:w-auto" 
                    onClick={openTURMOB}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    TÜRMOB Sirküler Sayfasını Aç
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
