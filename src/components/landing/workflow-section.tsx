"use client"

import { motion } from "framer-motion"
import { Phone, FileText, Users, CheckCircle2, ArrowRight, Briefcase, Target, TrendingUp } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useState, useEffect } from "react"

interface WorkflowStep {
  id: string
  title: string
  description: string
  icon: string
  color: string
  isActive: boolean
  order: number
}

interface SectionData {
  title: string
  paragraph: string
}

const iconMap: Record<string, LucideIcon> = {
  'Phone': Phone,
  'FileText': FileText,
  'Users': Users,
  'CheckCircle2': CheckCircle2,
  'Briefcase': Briefcase,
  'Target': Target,
  'TrendingUp': TrendingUp
}



export function WorkflowSection() {
  const [steps, setSteps] = useState<WorkflowStep[]>([])
  const [sectionData, setSectionData] = useState<SectionData>({
    title: "Çalışma Sürecimiz",
    paragraph: "Basit ve şeffaf süreçlerimiz ile işletmenizin mali yönetimini profesyonel ellere emanet edin."
  })

  const fetchData = async () => {
    try {
      const [stepsRes, sectionRes] = await Promise.all([
        fetch('/api/content/workflow'),
        fetch('/api/content/workflow/section')
      ])

      if (stepsRes.ok) {
        const data = await stepsRes.json()
        const activeSteps = (data || []).filter((s: WorkflowStep) => s.isActive === true)
        setSteps(activeSteps)
      }

      if (sectionRes.ok) {
        const section = await sectionRes.json()
        if (section && section.id) {
          setSectionData({
            title: section.title || "Çalışma Sürecimiz",
            paragraph: section.paragraph || "Basit ve şeffaf süreçlerimiz ile işletmenizin mali yönetimini profesyonel ellere emanet edin."
          })
        }
      }
    } catch (error) {
      console.error('Error fetching workflow data:', error)
    }
  }

  useEffect(() => {
    const id = setTimeout(() => {
      fetchData()
    }, 0)
    return () => clearTimeout(id)
  }, [])

  return (
    <section id="workflow" className="py-12 px-4 bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
            {sectionData.title}
          </h2>
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
            {sectionData.paragraph}
          </p>
        </motion.div>

        <div className="hidden lg:block">
          <div className="flex items-center justify-center gap-4">
            {steps.map((step, index) => {
              const IconComponent = iconMap[step.icon] || Phone
              const colorClass = step.color || 'from-blue-500 to-blue-600'
              
              return (
              <div key={step.id} className="flex items-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative"
                >
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 w-64">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0`}>
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <h3 className="font-bold text-base mb-2 text-center text-gray-900">{step.title}</h3>
                    <p className="text-xs text-muted-foreground text-center leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
                {index < steps.length - 1 && (
                  <motion.div initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: index * 0.15 + 0.3 }} className="mx-2">
                    <ArrowRight className="h-8 w-8 text-primary" />
                  </motion.div>
                )}
              </div>
              )
            })}
          </div>
        </div>

        <div className="lg:hidden space-y-6">
          {steps.map((step, index) => {
            const IconComponent = iconMap[step.icon] || Phone
            const colorClass = step.color || 'from-blue-500 to-blue-600'
            
            return (
            <div key={step.id}>
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0`}>
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-center text-gray-900">{step.title}</h3>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
              {index < steps.length - 1 && (
                <div className="flex justify-center my-4">
                  <motion.div initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}>
                    <ArrowRight className="h-8 w-8 text-primary rotate-90" />
                  </motion.div>
                </div>
              )}
            </div>
            )
          })}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }} className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-6 rounded-2xl shadow-xl">
            <div className="text-left">
              <div className="font-bold text-xl mb-1">Hemen Başlayalım!</div>
              <div className="text-violet-100 text-sm">İlk görüşme tamamen ücretsiz</div>
            </div>
            <ArrowRight className="h-6 w-6 hidden sm:block" />
            <a href="#contact" className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary/10 transition-colors shadow-lg">İletişime Geçin</a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
