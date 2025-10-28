"use client"

import { motion } from "framer-motion"
import { Phone, FileText, Users, CheckCircle2, ArrowRight } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Phone,
    title: "İlk Görüşme",
    description: "Bizimle iletişime geçin. İhtiyaçlarınızı dinleyelim ve size özel çözümler sunalım.",
    color: "from-blue-500 to-blue-600"
  },
  {
    number: "02",
    icon: FileText,
    title: "Analiz ve Planlama",
    description: "İşletmenizin mali durumunu analiz eder, size özel bir hizmet planı oluştururuz.",
    color: "from-purple-500 to-purple-600"
  },
  {
    number: "03",
    icon: Users,
    title: "Uygulama",
    description: "Profesyonel ekibimiz, belirlenen plan doğrultusunda hizmetleri eksiksiz yerine getirir.",
    color: "from-orange-500 to-orange-600"
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Takip ve Raporlama",
    description: "Sürekli takip ve düzenli raporlama ile işinizin her zaman kontrolünde olun.",
    color: "from-green-500 to-green-600"
  }
]

export function WorkflowSection() {
  return (
    <section id="workflow" className="py-12 px-4 bg-gradient-to-b from-white to-blue-50">
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
            Çalışma Sürecimiz
          </h2>
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
            Basit ve şeffaf süreçlerimiz ile işletmenizin mali yönetimini profesyonel ellere emanet edin.
            Dört adımda sorunsuz bir iş birliği başlatın.
          </p>
        </motion.div>

        {/* Desktop - Horizontal Cards with Arrows */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-center gap-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                {/* Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative"
                >
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 w-64">
                    {/* Number and Icon - Side by Side */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0`}>
                        {step.number}
                      </div>
                      <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}>
                        <step.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h3 className="font-bold text-base mb-2 text-center text-gray-900">
                      {step.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-xs text-muted-foreground text-center leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>

                {/* Arrow between cards */}
                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.15 + 0.3 }}
                    className="mx-2"
                  >
                    <ArrowRight className="h-8 w-8 text-blue-400" />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile & Tablet - Vertical Cards */}
        <div className="lg:hidden space-y-6">
          {steps.map((step, index) => (
            <div key={index}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100">
                  {/* Number and Icon - Side by Side */}
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0`}>
                      {step.number}
                    </div>
                    <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}>
                      <step.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="font-bold text-lg mb-2 text-center text-gray-900">
                    {step.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
              
              {/* Arrow between cards (mobile) */}
              {index < steps.length - 1 && (
                <div className="flex justify-center my-4">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                  >
                    <ArrowRight className="h-8 w-8 text-blue-400 rotate-90" />
                  </motion.div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-6 rounded-2xl shadow-xl">
            <div className="text-left">
              <div className="font-bold text-xl mb-1">Hemen Başlayalım!</div>
              <div className="text-blue-100 text-sm">İlk görüşme tamamen ücretsiz</div>
            </div>
            <ArrowRight className="h-6 w-6 hidden sm:block" />
            <a
              href="#contact"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            >
              İletişime Geçin
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
