"use client"

import React from "react"
import { motion } from "framer-motion"
import { useEffect, useState, useRef, useCallback } from "react"
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { Button } from "@/components/ui/button"
import Image from "next/image"

type InstitutionItem = {
  id?: string
  name: string
  description?: string
  url?: string
  logo?: string
  isActive?: boolean
  order?: number
}

type Institution = {
  name: string
  fullName: string
  logo: string
  url: string
  bgColor: string
  isCustom?: boolean
}

const defaultInstitutions: Institution[] = [
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
  const [institutions, setInstitutions] = useState<Institution[]>(defaultInstitutions)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)
  const [isVisible, setIsVisible] = useState(false)

  // Embla Carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'start',
      skipSnaps: false,
      dragFree: false,
    },
    [Autoplay({ delay: 2500, stopOnInteraction: false })]
  )

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setPrevBtnDisabled(!emblaApi.canScrollPrev())
    setNextBtnDisabled(!emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

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
          const data: InstitutionItem[] = await response.json()
          const activeItems: InstitutionItem[] = (data || []).filter((item: InstitutionItem) => item.isActive)
          if (activeItems.length > 0 && isMountedRef.current) {
            const dbInstitutions: Institution[] = activeItems.map((item: InstitutionItem) => ({
              name: item.name,
              fullName: item.description || item.name,
              logo: item.logo || "",
              url: item.url || "#",
              bgColor: "from-gray-100 to-gray-200",
              isCustom: !!item.logo
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
    <section id="clients" className="py-16 px-4 bg-gradient-to-b from-white via-blue-50/30 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>
      
      <div className="container mx-auto relative z-10">
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-xs font-semibold mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Resmi Kurumlarımız
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Entegre Çalıştığımız Kurumlar
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Resmi kurum ve kuruluşlarla entegre çalışarak işlemlerinizi hızlı, güvenli ve kesintisiz bir şekilde yürütüyoruz
            </p>
          </motion.div>
        )}

        {/* Responsive Carousel - Embla */}
        <div className="w-full relative" ref={emblaRef}>
          <div className="flex gap-6">
            {institutions.map((institution, index) => (
              <div
                key={`${institution.name}-${index}`}
                className="flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_25%] min-w-0"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="h-full px-3"
                >
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-blue-200 h-full flex flex-col items-center justify-center group relative overflow-hidden">
                    {/* Hover effect background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Content */}
                    <div className="relative z-10 w-full flex flex-col items-center">
                      <div className={`h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-gradient-to-br ${institution.bgColor} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl overflow-hidden transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                        {institution.isCustom && institution.logo.startsWith('data:') ? (
                          <Image
                            src={institution.logo}
                            alt={institution.name}
                            width={96}
                            height={96}
                            unoptimized
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl md:text-5xl transform group-hover:scale-110 transition-transform duration-300">{institution.logo}</span>
                        )}
                      </div>
                      <h3 className="font-bold text-base md:text-lg mb-2 text-center text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                        {institution.name}
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground text-center line-clamp-2 leading-relaxed">
                        {institution.fullName}
                      </p>
                      
                      {/* Link Icon */}
                      {institution.url && institution.url !== "#" && (
                        <a
                          href={institution.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                          onClick={(e) => {
                            try {
                              e.preventDefault();
                              e.stopPropagation();
                              if (typeof window !== 'undefined' && window) {
                                window.open(institution.url, '_blank', 'noopener,noreferrer');
                              }
                            } catch (error) {
                              console.warn('Error opening link:', error);
                              if (typeof window !== 'undefined' && window) {
                                window.location.href = institution.url;
                              }
                            }
                          }}
                        >
                          <span>Web Sitesi</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <Button
            onClick={scrollPrev}
            disabled={prevBtnDisabled}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white shadow-xl border-2 border-blue-100 hover:bg-blue-50 hover:border-blue-300 hidden md:flex items-center justify-center"
            variant="outline"
            size="icon"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            onClick={scrollNext}
            disabled={nextBtnDisabled}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white shadow-xl border-2 border-blue-100 hover:bg-blue-50 hover:border-blue-300 hidden md:flex items-center justify-center"
            variant="outline"
            size="icon"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
          
          {/* Drag hint - mobile */}
          <div className="md:hidden flex items-center justify-center gap-2 mt-6 text-xs text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            <span>Kaydırmak için sürükleyin</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>

        {/* Stats Section */}
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            <div className="text-center p-6 bg-white rounded-2xl shadow-md border border-gray-100">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">100%</div>
              <p className="text-sm text-muted-foreground">Güvenli Entegrasyon</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-2xl shadow-md border border-gray-100">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">7/24</div>
              <p className="text-sm text-muted-foreground">Kesintisiz Hizmet</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-2xl shadow-md border border-gray-100">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">Hızlı</div>
              <p className="text-sm text-muted-foreground">İşlem Süreci</p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
