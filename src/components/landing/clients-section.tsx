"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

// Government institutions data
const institutions = [
  {
    name: "GİB",
    fullName: "Gelir İdaresi Başkanlığı",
    logo: "🏛️",
    url: "https://www.gib.gov.tr",
    bgColor: "from-blue-500 to-blue-600"
  },
  {
    name: "SGK",
    fullName: "Sosyal Güvenlik Kurumu",
    logo: "🛡️",
    url: "https://www.sgk.gov.tr",
    bgColor: "from-green-500 to-green-600"
  },
  {
    name: "e-Devlet",
    fullName: "Türkiye Cumhuriyeti e-Devlet Kapısı",
    logo: "🇹🇷",
    url: "https://www.turkiye.gov.tr",
    bgColor: "from-red-500 to-red-600"
  },
  {
    name: "TÜRMOB",
    fullName: "Türkiye Serbest Muhasebeci Mali Müşavirler ve YMM Odaları Birliği",
    logo: "📊",
    url: "https://www.turmob.org.tr",
    bgColor: "from-purple-500 to-purple-600"
  },
  {
    name: "Ticaret Bakanlığı",
    fullName: "T.C. Ticaret Bakanlığı",
    logo: "🏢",
    url: "https://www.ticaret.gov.tr",
    bgColor: "from-orange-500 to-orange-600"
  },
  {
    name: "Merkez Bankası",
    fullName: "Türkiye Cumhuriyet Merkez Bankası",
    logo: "🏦",
    url: "https://www.tcmb.gov.tr",
    bgColor: "from-indigo-500 to-indigo-600"
  },
  {
    name: "Maliye Bakanlığı",
    fullName: "T.C. Hazine ve Maliye Bakanlığı",
    logo: "💼",
    url: "https://www.hmb.gov.tr",
    bgColor: "from-teal-500 to-teal-600"
  },
  {
    name: "Ticaret Sicili",
    fullName: "Ticaret Sicil Müdürlüğü",
    logo: "📋",
    url: "https://www.ticaretsicil.gov.tr",
    bgColor: "from-cyan-500 to-cyan-600"
  }
]

export function ClientsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [institutions, setInstitutions] = useState([
    {
      name: "GİB",
      fullName: "Gelir İdaresi Başkanlığı",
      logo: "🏛️",
      url: "https://www.gib.gov.tr",
      bgColor: "from-blue-500 to-blue-600"
    },
    {
      name: "SGK",
      fullName: "Sosyal Güvenlik Kurumu",
      logo: "🛡️",
      url: "https://www.sgk.gov.tr",
      bgColor: "from-green-500 to-green-600"
    },
    {
      name: "e-Devlet",
      fullName: "Türkiye Cumhuriyeti e-Devlet Kapısı",
      logo: "🇹🇷",
      url: "https://www.turkiye.gov.tr",
      bgColor: "from-red-500 to-red-600"
    },
    {
      name: "TÜRMOB",
      fullName: "Türkiye Serbest Muhasebeci Mali Müşavirler ve YMM Odaları Birliği",
      logo: "📊",
      url: "https://www.turmob.org.tr",
      bgColor: "from-purple-500 to-purple-600"
    },
    {
      name: "Ticaret Bakanlığı",
      fullName: "T.C. Ticaret Bakanlığı",
      logo: "🏢",
      url: "https://www.ticaret.gov.tr",
      bgColor: "from-orange-500 to-orange-600"
    },
    {
      name: "Merkez Bankası",
      fullName: "Türkiye Cumhuriyet Merkez Bankası",
      logo: "🏦",
      url: "https://www.tcmb.gov.tr",
      bgColor: "from-indigo-500 to-indigo-600"
    },
    {
      name: "Maliye Bakanlığı",
      fullName: "T.C. Hazine ve Maliye Bakanlığı",
      logo: "💼",
      url: "https://www.hmb.gov.tr",
      bgColor: "from-teal-500 to-teal-600"
    },
    {
      name: "Ticaret Sicili",
      fullName: "Ticaret Sicil Müdürlüğü",
      logo: "📋",
      url: "https://www.ticaretsicil.gov.tr",
      bgColor: "from-cyan-500 to-cyan-600"
    }
  ])
  const itemsPerView = 4

  // Fetch institutions from database
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await fetch('/api/content/clients')
        if (response.ok) {
          const data = await response.json()
          // Only use database data if there are active items
          const activeItems = data.filter((item: any) => item.isActive)
          if (activeItems.length > 0) {
            const dbInstitutions = activeItems.map((item: any) => ({
              name: item.name,
              fullName: item.description || item.name,
              logo: item.logo, // Base64 image
              url: item.url || "#",
              bgColor: "from-gray-100 to-gray-200", // Neutral for custom logos
              isCustom: true // Flag for rendering
            }))
            setInstitutions(dbInstitutions)
          }
          // If no data or no active items, keep default institutions
        }
      } catch (error) {
        console.error('Error fetching institutions:', error)
        // On error, keep default institutions
      }
    }
    fetchInstitutions()
  }, [])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % institutions.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + institutions.length) % institutions.length)
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: any) => {
    const threshold = 50
    if (info.offset.x > threshold) {
      prevSlide()
    } else if (info.offset.x < -threshold) {
      nextSlide()
    }
  }

  useEffect(() => {
    if (isPaused) return
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % institutions.length)
    }, 5000) // 5 seconds

    return () => clearInterval(timer)
  }, [isPaused])

  const getVisibleInstitutions = () => {
    const visible = []
    for (let i = 0; i < itemsPerView; i++) {
      visible.push(institutions[(currentIndex + i) % institutions.length])
    }
    return visible
  }

  return (
    <section id="clients" className="py-12 px-4 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Entegre Kurumlar
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Resmi kurum ve kuruluşlarla entegre çalışarak işlemlerinizi hızlı ve güvenli bir şekilde yürütüyoruz
          </p>
        </motion.div>

        {/* Desktop Carousel */}
        <div className="hidden md:block relative overflow-hidden">
          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full hover:bg-blue-50 hover:border-blue-300"
            onClick={prevSlide}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <ChevronLeft className="h-6 w-6 text-blue-600" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full hover:bg-blue-50 hover:border-blue-300"
            onClick={nextSlide}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <ChevronRight className="h-6 w-6 text-blue-600" />
          </Button>
          
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="cursor-grab active:cursor-grabbing"
          >
            <div className="flex gap-6 justify-center px-16 transition-transform duration-[3000ms] ease-in-out" style={{ transform: `translateX(-${(currentIndex * 100) / institutions.length}%)` }}>
            {institutions.map((institution, index) => (
              <motion.div
                key={`${institution.name}-${index}`}
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                className="group flex-shrink-0 w-[250px] relative"
              >
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full flex flex-col items-center justify-center transform group-hover:-translate-y-2">
                  <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${institution.bgColor} flex items-center justify-center mb-4 shadow-lg overflow-hidden`}>
                    {(institution as any).isCustom && institution.logo.startsWith('data:') ? (
                      <img src={institution.logo} alt={institution.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">{institution.logo}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-center group-hover:text-blue-600 transition-colors">
                    {institution.name}
                  </h3>
                  <p className="text-sm text-muted-foreground text-center line-clamp-2">
                    {institution.fullName}
                  </p>
                  
                  {/* Link Icon */}
                  {institution.url && institution.url !== "#" && (
                    <a
                      href={institution.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-4 right-4 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          </motion.div>

          {/* Progress indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {institutions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Mobile Grid */}
        <div className="md:hidden grid grid-cols-2 gap-4">
          {institutions.map((institution, index) => (
            <motion.div
              key={institution.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col items-center justify-center">
                <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${institution.bgColor} flex items-center justify-center mb-3 shadow-lg overflow-hidden`}>
                  {(institution as any).isCustom && institution.logo.startsWith('data:') ? (
                    <img src={institution.logo} alt={institution.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">{institution.logo}</span>
                  )}
                </div>
                <h3 className="font-bold text-sm mb-1 text-center group-hover:text-blue-600 transition-colors">
                  {institution.name}
                </h3>
                <p className="text-xs text-muted-foreground text-center line-clamp-2">
                  {institution.fullName}
                </p>
                
                {/* Link Icon */}
                {institution.url && institution.url !== "#" && (
                  <a
                    href={institution.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-6 py-3 rounded-full text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Tüm resmi işlemleriniz güvenli şekilde yönetilir
          </div>
        </motion.div>
      </div>
    </section>
  )
}
