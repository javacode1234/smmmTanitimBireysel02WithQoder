"use client"

import React from "react"
import { motion } from "framer-motion"
import { useEffect, useState, useRef, useCallback } from "react"
import { ExternalLink } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselIndicators,
  CarouselErrorBoundary,
} from "@/components/ui/carousel"

// Government institutions data
const defaultInstitutions = [
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

export function InstitutionsSection() {
  const [institutions, setInstitutions] = useState(defaultInstitutions)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Track visibility to prevent animations on unmounted components
  useEffect(() => {
    setIsVisible(true)
    return () => {
      setIsVisible(false)
    }
  }, [])

  // Cleanup function
  const cleanup = useCallback(() => {
    isMountedRef.current = false
  }, [])

  // Fetch institutions from database
  useEffect(() => {
    isMountedRef.current = true
    
    const fetchInstitutions = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/content/institutions')
        if (response.ok) {
          const data = await response.json()
          // Only use database data if there are active items
          const activeItems = data.filter((item: any) => item.isActive)
          if (activeItems.length > 0 && isMountedRef.current) {
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
        } else {
          if (isMountedRef.current) {
            setError('Kurum bilgileri alınamadı')
          }
        }
      } catch (err) {
        console.error('Error fetching institutions:', err)
        if (isMountedRef.current) {
          setError('Kurum bilgileri alınırken hata oluştu')
        }
        // On error, keep default institutions
      } finally {
        if (isMountedRef.current) {
          setLoading(false)
        }
      }
    }
    
    fetchInstitutions()
    
    // Cleanup on unmount
    return () => {
      cleanup()
    }
  }, [cleanup])

  // Show loading state
  if (loading) {
    return (
      <section id="clients" className="py-12 px-4 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Resmi Kurumlar
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Resmi kurum ve kuruluşlarla entegre çalışarak işlemlerinizi hızlı ve güvenli bir şekilde yürütüyoruz
            </p>
          </div>
          <div className="hidden md:block h-48 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Kurumlar yükleniyor...</div>
          </div>
          <div className="md:hidden grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Show error state
  if (error) {
    return (
      <section id="clients" className="py-12 px-4 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Entegre Kurumlar
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Resmi kurum ve kuruluşlarla entegre çalışarak işlemlerinizi hızlı ve güvenli bir şekilde yürütüyoruz
            </p>
          </div>
          <div className="text-center text-red-500 py-8">
            {error}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="clients" className="py-12 px-4 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto">
        {isVisible && (
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
        )}

        {/* Responsive Carousel with Error Boundary */}
        <div className="w-full" ref={carouselRef}>
          <CarouselErrorBoundary fallback={
            <div className="text-center py-8">
              <p className="text-muted-foreground">Kurumlar şu anda görüntülenemiyor.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-6">
                {institutions.slice(0, 4).map((institution, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-gray-100 h-full flex flex-col items-center justify-center">
                    <div className={`h-12 w-12 md:h-16 md:w-16 rounded-full bg-gradient-to-br ${institution.bgColor} flex items-center justify-center mb-3 md:mb-4`}>
                      <span className="text-2xl md:text-3xl">{institution.logo}</span>
                    </div>
                    <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2 text-center">
                      {institution.name}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground text-center line-clamp-2">
                      {institution.fullName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          }>
            <Carousel
              itemsPerView={{ sm: 2, md: 4 }}
              autoPlay={true}
              autoPlayInterval={3000}
              continuousFlow={true}
              flowSpeed={20}
              className="relative"
            >
              <CarouselContent className="gap-4 md:gap-6">
                {institutions.map((institution, index) => (
                  <CarouselItem 
                    key={`${institution.name}-${index}`} 
                    className="pl-0"
                  >
                    <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col items-center justify-center group relative">
                      <div className={`h-12 w-12 md:h-16 md:w-16 rounded-full bg-gradient-to-br ${institution.bgColor} flex items-center justify-center mb-3 md:mb-4 shadow-lg overflow-hidden`}>
                        {(institution as any).isCustom && institution.logo.startsWith('data:') ? (
                          <img 
                            src={institution.logo} 
                            alt={institution.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              try {
                                const target = e.target as HTMLImageElement;
                                if (target && typeof target.style !== 'undefined') {
                                  target.style.display = 'none';
                                }
                              } catch (error) {
                                console.warn('Error hiding image:', error);
                              }
                            }}
                          />
                        ) : (
                          <span className="text-2xl md:text-3xl">{institution.logo}</span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2 text-center group-hover:text-blue-600 transition-colors">
                        {institution.name}
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground text-center line-clamp-2">
                        {institution.fullName}
                      </p>
                      
                      {/* Link Icon - hidden on mobile */}
                      {institution.url && institution.url !== "#" && (
                        <a
                          href={institution.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute bottom-2 right-2 md:bottom-4 md:right-4 w-6 h-6 md:w-8 md:h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            try {
                              e.preventDefault();
                              e.stopPropagation();
                              if (typeof window !== 'undefined' && window) {
                                window.open(institution.url, '_blank', 'noopener,noreferrer');
                              }
                            } catch (error) {
                              console.warn('Error opening link:', error);
                              // Fallback to simple navigation
                              if (typeof window !== 'undefined' && window) {
                                window.location.href = institution.url;
                              }
                            }
                          }}
                        >
                          <ExternalLink className="h-3 w-3 md:h-4 md:w-4" />
                        </a>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:block" />
              <CarouselNext className="hidden md:block" />
              <CarouselIndicators className="hidden md:flex" />
            </Carousel>
          </CarouselErrorBoundary>
        </div>

        {/* Mobile Grid - now hidden since we're using responsive carousel */}
        {/* Removed to prevent DOM manipulation errors during navigation */}

        {/* Additional info */}
        {isVisible && (
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
        )}
      </div>
    </section>
  )
}