"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Profesyonel Mali Müşavirlik Hizmetleri
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            İşletmenizin mali danışmanlık ihtiyaçları için güvenilir çözüm ortağınız. 
            Modern teknoloji ile geleneksel uzmanlığı bir araya getiriyoruz.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg">
              Hemen Başlayın <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg">
              Daha Fazla Bilgi
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
