"use client"

import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
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
  TrendingUp: TrendingUp,
  Star: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
  Heart: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
  Lightbulb: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6m-3-11a6 6 0 1 1 0 12H9a6 6 0 1 1 0-12Z"></path><path d="M12 7v1"></path><path d="M10 15h.01"></path><path d="M14 15h.01"></path><path d="M10 11h.01"></path><path d="M14 11h.01"></path></svg>,
  Target: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>,
  Globe: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
  Clock: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
}

const defaultValues = {
  title: "Hakkımızda",
  subtitle: "Serbest Muhasebeci Mali Müşavir olarak, işletmelerin finansal süreçlerini en verimli şekilde yönetmelerine yardımcı oluyoruz.",
  description: "Profesyonel kadromuz ve modern teknoloji altyapımız ile sektörde fark yaratıyoruz.",
  valuesTitle: "Hizmet Değerlerimiz",
  footerText: "Profesyonel kadromuz ve modern teknoloji altyapımız ile sektörde fark yaratıyoruz.",
  footerSignature: "SMMM Ekibi",
  values: [
    "Müşteri memnuniyeti odaklı hizmet anlayışı",
    "Şeffaf ve dürüst iş yapış biçimi",
    "Zamanında ve eksiksiz bildirim süreçleri",
    "7/24 danışmanlık desteği",
    "Dijital dönüşüm ve otomasyon"
  ],
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
  ],
  values: [
    "Müşteri memnuniyeti odaklı hizmet anlayışı",
    "Şeffaf ve dürüst iş yapış biçimi",
    "Zamanında ve eksiksiz bildirim süreçleri",
    "7/24 danışmanlık desteği",
    "Dijital dönüşüm ve otomasyon"
  ]
}

export function AboutSection() {
  const [aboutData, setAboutData] = useState<any>(defaultValues)
  const [servicesData, setServicesData] = useState<any>({
    valuesTitle: "Hizmet Değerlerimiz",
    footerText: "Profesyonel kadromuz ve modern teknoloji altyapımız ile sektörde fark yaratıyoruz.",
    footerSignature: "SMMM Ekibi",
    values: [
      "Müşteri memnuniyeti odaklı hizmet anlayışı",
      "Şeffaf ve dürüst iş yapış biçimi",
      "Zamanında ve eksiksiz bildirim süreçleri",
      "7/24 danışmanlık desteği",
      "Dijital dönüşüm ve otomasyon"
    ]
  })
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    setIsVisible(true)

    const fetchAboutData = async () => {
      try {
        const response = await fetch('/api/content/about')
        if (response.ok && isMountedRef.current) {
          const data = await response.json()
          // API'den veri geldi mi kontrol et
          if (data && data.title) {
            setAboutData(data)
          } else {
            // API'den veri gelmediyse default kullan
            setAboutData(defaultValues)
          }
        } else {
          // API hatası varsa default kullan
          setAboutData(defaultValues)
        }
      } catch (error) {
        console.error('Error fetching about data:', error)
        // Hata varsa default kullan
        setAboutData(defaultValues)
      } finally {
        if (isMountedRef.current) {
          setLoading(false)
        }
      }
    }

    const fetchServicesData = async () => {
      try {
        const response = await fetch('/api/content/services/section')
        if (response.ok && isMountedRef.current) {
          const data = await response.json()
          if (data && data.valuesTitle) {
            // API'den gelen values'i string array'e çevir
            const valuesArray = (data.values || []).map((v: any) => 
              typeof v === 'object' ? v.text : v
            ).filter((v: any) => v)
            
            setServicesData({
              valuesTitle: data.valuesTitle,
              footerText: data.footerText || defaultValues.footerText,
              footerSignature: data.footerSignature || defaultValues.footerSignature,
              values: valuesArray
            })
          }
        }
      } catch (error) {
        console.error('Error fetching services data:', error)
      }
    }

    fetchAboutData()
    fetchServicesData()

    return () => {
      isMountedRef.current = false
      setIsVisible(false)
    }
  }, [])

  // Database'den gelen veriyi mi yoksa default değerleri mi kullanacağımızı belirle
  const hasCustomData = () => {
    // Eğer aboutData default values ile aynı değilse özel veri var demektir
    return aboutData && aboutData.id // Database'den gelen verinin id'si olur
  }

  // Aktif özellikleri getir
  const getDisplayFeatures = () => {
    if (!aboutData || !aboutData.features || aboutData.features.length === 0) {
      return defaultValues.features;
    }
    
    // Sadece aktif olan özellikleri filtrele
    const activeFeatures = aboutData.features.filter((feature: any) => feature.isActive !== false);
    
    // Aktif özellik yoksa default göster
    if (activeFeatures.length === 0) {
      return defaultValues.features;
    }
    
    return activeFeatures;
  };

  // Aktif değerleri getir
  const getDisplayValues = () => {
    if (!servicesData || !servicesData.values || servicesData.values.length === 0) {
      return defaultValues.values || [];
    }
    
    return servicesData.values;
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
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {aboutData?.title || defaultValues.title}
          </h2>
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
            {aboutData?.subtitle || defaultValues.subtitle}
          </p>
        </motion.div>
        )}

        {/* Features Grid */}
        {isVisible && (
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
        )}

        {/* Two Column Layout */}
        {isVisible && (
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
              {servicesData?.valuesTitle || defaultValues.valuesTitle}
            </h3>
            <div className="space-y-4">
              {getDisplayValues().map((value: string, index: number) => (
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
                "{servicesData?.footerText || defaultValues.footerText}"
              </p>
              <div className="mt-4 font-semibold text-blue-600">
                - {servicesData?.footerSignature || defaultValues.footerSignature}
              </div>
            </motion.div>
          </motion.div>
        </div>
        )}
      </div>
    </section>
  )
}