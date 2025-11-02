"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { 
  Award, 
  Shield, 
  Users, 
  TrendingUp, 
  CheckCircle2,
  Users as UsersIcon,
  Award as AwardIcon,
  TrendingUp as TrendingUpIcon
} from "lucide-react"

// Map icon names to actual components
const iconMap: any = {
  Award: Award,
  Shield: Shield,
  Users: Users,
  TrendingUp: TrendingUp
}

const defaultValues = {
  title: "Hakkımızda",
  subtitle: "Serbest Muhasebeci Mali Müşavir olarak, işletmelerin finansal süreçlerini en verimli şekilde yönetmelerine yardımcı oluyoruz.",
  description: "Profesyonel kadromuz ve modern teknoloji altyapımız ile sektörde fark yaratıyoruz.",
  features: [
    {
      icon: "Award",
      title: "Profesyonel Deneyim",
      description: "15 yılı aşkın sektör tecrübesi ile işletmenize en iyi hizmeti sunuyoruz.",
      isActive: true
    },
    {
      icon: "Shield",
      title: "Güvenilir Hizmet",
      description: "Tüm finansal işlemleriniz gizlilik ve güvenlik garantisi altında.",
      isActive: true
    },
    {
      icon: "Users",
      title: "Uzman Kadro",
      description: "Alanında uzman, sertifikalı mali müşavirler ile çalışıyoruz.",
      isActive: true
    },
    {
      icon: "TrendingUp",
      title: "Sürekli Gelişim",
      description: "Güncel mevzuat ve teknoloji takibi ile hizmet kalitemizi artırıyoruz.",
      isActive: true
    }
  ]
}

const values = [
  "Müşteri memnuniyeti odaklı hizmet anlayışı",
  "Şeffaf ve dürüst iş yapış biçimi",
  "Zamanında ve eksiksiz bildirim süreçleri",
  "7/24 danışmanlık desteği",
  "Dijital dönüşüm ve otomasyon"
]

export function AboutSection() {
  const [aboutData, setAboutData] = useState<any>(defaultValues)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await fetch('/api/content/about')
        if (response.ok) {
          const data = await response.json()
          setAboutData(data)
        } else {
          // Use default values if API call fails
          setAboutData(defaultValues)
        }
      } catch (error) {
        console.error('Error fetching about data:', error)
        // Use default values if API call fails
        setAboutData(defaultValues)
      } finally {
        setLoading(false)
      }
    }

    fetchAboutData()
  }, [])

  // Check if we should show default values
  const shouldShowDefaults = () => {
    if (!aboutData || !aboutData.features) return true;
    
    // Check if there are no features or all features are inactive
    const activeFeatures = aboutData.features.filter((feature: any) => feature.isActive !== false);
    return activeFeatures.length === 0;
  };

  const getDisplayFeatures = () => {
    if (shouldShowDefaults()) {
      return defaultValues.features;
    }
    
    return aboutData.features.filter((feature: any) => feature.isActive !== false);
  };

  if (loading) {
    return (
      <section id="about" className="py-12 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-40 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="about" className="py-12 px-4 bg-white">
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
            {shouldShowDefaults() ? defaultValues.title : aboutData.title}
          </h2>
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
            {shouldShowDefaults() ? defaultValues.subtitle : aboutData.subtitle}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {getDisplayFeatures().map((feature: any, index: number) => {
            const IconComponent = iconMap[feature.icon] || Award
            return (
              <motion.div
                key={feature.title || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 h-full border border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-sm mb-2 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Image/Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Rakamlarla Biz</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                      <UsersIcon className="h-8 w-8" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">500+</div>
                      <div className="text-blue-100">Aktif Müşteri</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                      <AwardIcon className="h-8 w-8" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">15+</div>
                      <div className="text-blue-100">Yıllık Deneyim</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                      <TrendingUpIcon className="h-8 w-8" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">%99</div>
                      <div className="text-blue-100">Müşteri Memnuniyeti</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Values */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold mb-6 text-gray-900">
              Hizmet Değerlerimiz
            </h3>
            <div className="space-y-4">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="mt-1">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-gray-700">{value}</p>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100"
            >
              <p className="text-gray-700 italic">
                "{shouldShowDefaults() ? defaultValues.description : aboutData.description}"
              </p>
              <div className="mt-4 font-semibold text-blue-600">
                - SMMM Ekibi
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}