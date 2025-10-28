"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Calculator, Building2, TrendingUp, Shield, Users, ArrowRight, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

const services = [
  {
    icon: FileText,
    title: "Beyanname Hazırlama",
    description: "Tüm vergi beyannamelerinizi zamanında ve eksiksiz hazırlıyoruz.",
    features: [
      "Gelir vergisi beyannameleri",
      "KDV beyannameleri",
      "Muhtasar beyannameler",
      "Yıllık gelir beyannameleri"
    ],
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: Calculator,
    title: "Muhasebe Hizmetleri",
    description: "Günlük muhasebe işlemlerinizi profesyonel ekibimizle yönetiyoruz.",
    features: [
      "Günlük muhasebe kayıtları",
      "Defter tutma işlemleri",
      "Mali tablo hazırlama",
      "Envanter çalışmaları"
    ],
    color: "from-green-500 to-green-600"
  },
  {
    icon: Building2,
    title: "Şirket Kuruluşu",
    description: "Şirket kuruluş süreçlerinizde baştan sona yanınızdayız.",
    features: [
      "Limited/Anonim şirket kuruluşu",
      "Ticaret sicil işlemleri",
      "Vergi dairesi işlemleri",
      "SGK işveren kayıt işlemleri"
    ],
    color: "from-purple-500 to-purple-600"
  },
  {
    icon: TrendingUp,
    title: "Mali Danışmanlık",
    description: "İşletmenizin büyümesi için stratejik mali danışmanlık sunuyoruz.",
    features: [
      "Finansal analiz ve raporlama",
      "Bütçe ve planlama",
      "Yatırım danışmanlığı",
      "Maliyet optimizasyonu"
    ],
    color: "from-orange-500 to-orange-600"
  },
  {
    icon: Shield,
    title: "Denetim ve Revizyon",
    description: "Mali tablolarınızın doğruluğunu garanti altına alıyoruz.",
    features: [
      "Mali tablo denetimi",
      "Bağımsız denetim hizmetleri",
      "İç kontrol sistemleri",
      "Risk analizi ve değerlendirme"
    ],
    color: "from-red-500 to-red-600"
  },
  {
    icon: Users,
    title: "Bordro Hizmetleri",
    description: "Personel bordro ve SGK işlemlerinizi eksiksiz yönetiyoruz.",
    features: [
      "Aylık bordro hesaplama",
      "SGK prim bildirgeleri",
      "Personel giriş/çıkış işlemleri",
      "İzin ve ücret hesaplamaları"
    ],
    color: "from-cyan-500 to-cyan-600"
  }
]

export function ServicesSection() {
  return (
    <section id="services" className="py-12 px-4 bg-gradient-to-b from-gray-50 to-white">
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
            Hizmetlerimiz
          </h2>
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
            İşletmenizin tüm mali ihtiyaçları için kapsamlı ve profesyonel çözümler sunuyoruz. 
            Uzman kadromuz ile işinizi güvenle büyütün.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-200 transform hover:-translate-y-1">
                <CardHeader>
                  <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <service.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-base">{service.title}</CardTitle>
                  <CardDescription className="text-xs">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[11px] text-gray-600">
                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-12 text-white"
        >
          <h3 className="text-3xl font-bold mb-4">
            İşletmeniz İçin En Uygun Çözümü Bulalım
          </h3>
          <p className="text-lg mb-6 text-blue-50 max-w-2xl mx-auto">
            Ücretsiz danışmanlık görüşmesi için bizimle iletişime geçin. 
            Size özel çözümler sunmaktan mutluluk duyarız.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-base">
              Ücretsiz Danışmanlık <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <a href="#pricing">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-base border-2 bg-white text-blue-600 hover:bg-blue-600 hover:text-white hover:border-white transition-all duration-300"
              >
                Fiyat Bilgisi Al
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
