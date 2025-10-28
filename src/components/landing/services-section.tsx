"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Calculator, Building2, TrendingUp, Shield, Users } from "lucide-react"
import { motion } from "framer-motion"

const services = [
  {
    icon: FileText,
    title: "Beyanname Hazırlama",
    description: "Tüm vergi beyannamelerinizi zamanında ve eksiksiz hazırlıyoruz."
  },
  {
    icon: Calculator,
    title: "Muhasebe Hizmetleri",
    description: "Günlük muhasebe işlemlerinizi profesyonel ekibimizle yönetiyoruz."
  },
  {
    icon: Building2,
    title: "Şirket Kuruluşu",
    description: "Şirket kuruluş süreçlerinizde baştan sona yanınızdayız."
  },
  {
    icon: TrendingUp,
    title: "Mali Danışmanlık",
    description: "İşletmenizin büyümesi için stratejik mali danışmanlık sunuyoruz."
  },
  {
    icon: Shield,
    title: "Denetim ve Revizyon",
    description: "Mali tablolarınızın doğruluğunu garanti altına alıyoruz."
  },
  {
    icon: Users,
    title: "Bordro Hizmetleri",
    description: "Personel bordro ve SGK işlemlerinizi eksiksiz yönetiyoruz."
  }
]

export function ServicesSection() {
  return (
    <section id="services" className="py-20 px-4 bg-muted/50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Hizmetlerimiz</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            İşletmenizin tüm mali ihtiyaçları için kapsamlı çözümler sunuyoruz
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <service.icon className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
