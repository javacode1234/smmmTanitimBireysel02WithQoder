"use client"

"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Star, Zap, Crown, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { QuoteRequestModal } from "@/components/modals/quote-request-modal"

interface PricingPlan {
  id: string
  name: string
  icon: string
  price: string
  period: string
  description: string
  color: string
  features: string[]
  isPopular: boolean
  isActive: boolean
  order: number
}

interface AdditionalService {
  id: string
  text: string
  isActive: boolean
  order: number
}

interface SectionData {
  title: string
  paragraph: string
  additionalTitle?: string
  additionalParagraph?: string
  footerText?: string
}

const iconMap: Record<string, LucideIcon> = {
  'Star': Star,
  'Zap': Zap,
  'Crown': Crown,
  'Sparkles': Sparkles
}



export function PricingSection() {
  const [quoteModalOpen, setQuoteModalOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState("")
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([])
  const [sectionData, setSectionData] = useState<SectionData>({
    title: "Fiyatlandırma",
    paragraph: "İşletmenizin büyüklüğüne ve ihtiyaçlarına göre esnek paketler. Tüm paketlerde şeffaf fiyatlandırma, gizli ücret yok.",
    additionalTitle: "Ek Hizmetler",
    additionalParagraph: "Tüm paketlere eklenebilecek özel hizmetler",
    footerText: "* Tüm fiyatlar KDV hariçtir. Özel ihtiyaçlarınız için size özel paket oluşturabiliriz. İlk ay ücretsiz danışmanlık hizmeti ile başlayabilirsiniz."
  })

  const fetchData = async () => {
    try {
      const [plansRes, servicesRes, sectionRes] = await Promise.all([
        fetch('/api/content/pricing'),
        fetch('/api/content/pricing/additional-services'),
        fetch('/api/content/pricing/section')
      ])

      if (plansRes.ok) {
        const data = await plansRes.json()
        // Only show active pricing plans
        const activePlans = (data || []).filter((p: PricingPlan) => p.isActive === true)
        // Parse features from JSON string or array
        type FeatureInput = string | { text: string; isIncluded?: boolean }[]
        const parsedPlans = activePlans.map((plan: PricingPlan | (PricingPlan & { features: FeatureInput })) => {
          const raw: FeatureInput = (plan as { features: FeatureInput }).features
          let featuresArr: string[] = []

          if (typeof raw === 'string') {
            try {
              const parsed = JSON.parse(raw) as string[] | { text: string; isIncluded?: boolean }[]
              if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
                featuresArr = (parsed as { text: string; isIncluded?: boolean }[])
                  .filter((f) => f.isIncluded !== false)
                  .map((f) => f.text)
              } else if (Array.isArray(parsed)) {
                featuresArr = parsed as string[]
              }
            } catch {
              featuresArr = []
            }
          } else if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'object') {
            featuresArr = (raw as { text: string; isIncluded?: boolean }[])
              .filter((f) => f.isIncluded !== false)
              .map((f) => f.text)
          } else if (Array.isArray(raw)) {
            featuresArr = raw as unknown as string[]
          }

          return { ...plan, features: featuresArr }
        })
        setPlans(parsedPlans)
      }

      if (servicesRes.ok) {
        const data = await servicesRes.json()
        // Only show active additional services
        const activeServices = (data || []).filter((s: AdditionalService) => s.isActive === true)
        setAdditionalServices(activeServices)
      }

      if (sectionRes.ok) {
        const section = await sectionRes.json()
        if (section && section.id) {
          setSectionData({
            title: section.title || "Fiyatlandırma",
            paragraph: section.paragraph || "İşletmenizin büyüklüğüne ve ihtiyaçlarına göre esnek paketler.",
            additionalTitle: section.additionalTitle || "Ek Hizmetler",
            additionalParagraph: section.additionalParagraph || "Tüm paketlere eklenebilecek özel hizmetler",
            footerText: section.footerText || "* Tüm fiyatlar KDV hariçtir."
          })
        }
      }
    } catch (error) {
      console.error('Error fetching pricing data:', error)
    }
  }

  useEffect(() => {
    const id = setTimeout(() => {
      fetchData()
    }, 0)
    return () => clearTimeout(id)
  }, [])

  const handleQuoteRequest = (packageName: string) => {
    setSelectedPackage(packageName)
    setQuoteModalOpen(true)
  }

  return (
    <section id="pricing" className="py-12 px-4 bg-gradient-to-b from-amber-50 via-white to-orange-50">
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
            {sectionData.title}
          </h2>
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
            {sectionData.paragraph}
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const IconComponent = iconMap[plan.icon] || Star
            const colorClass = plan.color || 'from-blue-500 to-blue-600'
            
            return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    En Popüler
                  </span>
                </div>
              )}
              
              <Card className={`h-full ${plan.isPopular ? 'border-2 border-purple-500 shadow-2xl scale-105' : 'hover:shadow-xl'} transition-all duration-300`}>
                <CardHeader className="text-center pb-8">
                  <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-xs">{plan.description}</CardDescription>
                  <div className="mt-6">
                    <div className="flex items-baseline justify-center">
                      {!plan.price.includes('Özel') && !plan.price.includes('Fiyat') ? (
                        <>
                          <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                          <span className="text-gray-500 ml-1">{plan.period}</span>
                        </>
                      ) : (
                        <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                      )}
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
                    className={`w-full ${plan.isPopular ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800' : ''}`}
                    size="lg"
                    onClick={() => handleQuoteRequest(plan.name)}
                  >
                    Teklif Al
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            )
          })}
        </div>

        {/* Additional Services */}
        {additionalServices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                {sectionData.additionalTitle || "Ek Hizmetler"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {sectionData.additionalParagraph || "T\u00fcm paketlere eklenebilecek \u00f6zel hizmetler"}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {additionalServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <Check className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{service.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            {sectionData.footerText || "* Tüm fiyatlar KDV hariçtir. Özel ihtiyaçlarınız için size özel paket oluşturabiliriz. İlk ay ücretsiz danışmanlık hizmeti ile başlayabilirsiniz."}
          </p>
          <div className="mt-6">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2"
              onClick={() => handleQuoteRequest("Genel")}
            >
              Detaylı Fiyat Bilgisi Al
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Quote Request Modal */}
      <QuoteRequestModal 
        open={quoteModalOpen} 
        onOpenChange={setQuoteModalOpen}
        packageType={selectedPackage}
      />
    </section>
  )
}
