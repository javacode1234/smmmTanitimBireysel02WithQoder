"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Star, Zap, Crown } from "lucide-react"

const plans = [
  {
    name: "Başlangıç",
    icon: Star,
    price: "2.500",
    period: "/ay",
    description: "Küçük işletmeler için ideal paket",
    popular: false,
    features: [
      "Aylık beyanname hazırlama",
      "Temel muhasebe kayıtları",
      "E-posta desteği",
      "Aylık mali raporlama",
      "Vergi takvimi takibi"
    ],
    color: "from-blue-500 to-blue-600"
  },
  {
    name: "Profesyonel",
    icon: Zap,
    price: "4.500",
    period: "/ay",
    description: "Orta ölçekli işletmeler için",
    popular: true,
    features: [
      "Tüm Başlangıç özellikleri",
      "Tam muhasebe hizmeti",
      "SGK ve bordro işlemleri",
      "7/24 telefon desteği",
      "Haftalık mali raporlama",
      "Stratejik mali danışmanlık",
      "Vergi optimizasyonu"
    ],
    color: "from-purple-500 to-purple-600"
  },
  {
    name: "Kurumsal",
    icon: Crown,
    price: "Özel Fiyat",
    period: "",
    description: "Büyük işletmeler için özel çözüm",
    popular: false,
    features: [
      "Tüm Profesyonel özellikleri",
      "Özel hesap yöneticisi",
      "Denetim ve revizyon",
      "Gelişmiş finansal analiz",
      "Yatırım danışmanlığı",
      "İç kontrol sistemleri",
      "Özel eğitim programları",
      "Sınırsız danışmanlık"
    ],
    color: "from-orange-500 to-orange-600"
  }
]

const additionalServices = [
  "Şirket kuruluş işlemleri (2.500₺ - 5.000₺)",
  "E-Dönüşüm danışmanlığı (1.500₺/ay)",
  "Özel proje bazlı finansal analiz",
  "Vergi incelemesi desteği"
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-12 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Fiyatlandırma
          </h2>
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
            İşletmenizin büyüklüğüne ve ihtiyaçlarına göre esnek paketler. 
            Tüm paketlerde şeffaf fiyatlandırma, gizli ücret yok.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    En Popüler
                  </span>
                </div>
              )}
              
              <Card className={`h-full ${plan.popular ? 'border-2 border-purple-500 shadow-2xl scale-105' : 'hover:shadow-xl'} transition-all duration-300`}>
                <CardHeader className="text-center pb-8">
                  <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <plan.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-xs">{plan.description}</CardDescription>
                  <div className="mt-6">
                    <div className="flex items-baseline justify-center">
                      {plan.price !== "Özel Fiyat" && (
                        <span className="text-4xl font-bold text-gray-900">{plan.price}₺</span>
                      )}
                      {plan.price === "Özel Fiyat" && (
                        <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                      )}
                      <span className="text-gray-500 ml-1">{plan.period}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-[11px] text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800' : ''}`}
                    size="lg"
                  >
                    {plan.price === "Özel Fiyat" ? "Teklif Al" : "Hemen Başla"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-blue-50 rounded-2xl p-8 border border-blue-100"
        >
          <h3 className="text-2xl font-bold mb-4 text-center text-gray-900">
            Ek Hizmetler
          </h3>
          <p className="text-center text-muted-foreground mb-6">
            Tüm paketlere eklenebilecek özel hizmetler
          </p>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {additionalServices.map((service, index) => (
              <div key={index} className="flex items-start gap-3 bg-white p-4 rounded-lg">
                <Check className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{service}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            * Tüm fiyatlar KDV hariçtir. Özel ihtiyaçlarınız için size özel paket oluşturabiliriz. 
            İlk ay ücretsiz danışmanlık hizmeti ile başlayabilirsiniz.
          </p>
          <div className="mt-6">
            <Button size="lg" variant="outline" className="border-2">
              Detaylı Fiyat Bilgisi Al
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
