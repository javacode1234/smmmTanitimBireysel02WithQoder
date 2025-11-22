"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { ArrowRight, TrendingUp } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface HeroData {
  id: string
  title: string
  subtitle: string
  description?: string
  buttonText?: string
  buttonUrl?: string
  image?: string
}

export function HeroSection() {
  const [heroData, setHeroData] = useState<HeroData | null>(null)
  const scrollingRef = useRef(false)
  

  

  async function fetchHeroData() {
    try {
      const response = await fetch('/api/content/hero')
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0 && data[0].isActive) {
          setHeroData(data[0])
        }
      }
    } catch (error) {
      console.error('Error fetching hero data:', error)
    }
  }

  useEffect(() => {
    const id = setTimeout(() => {
      fetchHeroData()
    }, 0)
    return () => clearTimeout(id)
  }, [])
  

  // Default values
  const title = heroData?.title || "Profesyonel Mali Müşavirlik Hizmetleri"
  const subtitle = heroData?.subtitle || "İşletmenizin mali danışmanlık ihtiyaçları için güvenilir çözüm ortağınız. Modern teknoloji ile geleneksel uzmanlığı bir araya getiriyoruz."
  const buttonText = heroData?.buttonText || "Hemen Başlayın"
  const buttonUrl = heroData?.buttonUrl || "#services"
  const imageUrl = heroData?.image || "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1200&auto=format&fit=crop"

  // Handle button click ONLY for anchor links (not page navigation)
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    // Only handle anchor links
    if (!url.startsWith('#')) {
      return // Let Link handle page navigation
    }
    
    if (scrollingRef.current) {
      e.preventDefault()
      return
    }
    
    e.preventDefault()
    scrollingRef.current = true

    const targetId = url.substring(1)
    const targetElement = document.getElementById(targetId)
    
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      
      // Use requestAnimationFrame instead of setTimeout
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollingRef.current = false
        })
      })
    } else {
      scrollingRef.current = false
    }
  }

  return (
    <section className="pt-24 pb-12 px-4 bg-gradient-to-b from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-6 items-center">
          {/* Left Side - Text and Buttons */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full mb-4 text-xs font-medium">
              <TrendingUp className="h-3 w-3" />
              Güvenilir Mali Danışmanlık
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
              {title}
            </h1>
            <p className="text-base text-muted-foreground mb-5 leading-relaxed">
              {subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Link 
                href={buttonUrl}
                prefetch={false}
                onClick={(e) => handleAnchorClick(e, buttonUrl)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto"
              >
                {buttonText} <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
              <Link 
                href="#contact"
                onClick={(e) => handleAnchorClick(e, '#contact')}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full sm:w-auto"
              >
                Daha Fazla Bilgi
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-8 pt-5 border-t">
              <div>
                <div className="text-xl font-bold text-blue-600">500+</div>
                <div className="text-[10px] text-muted-foreground">Mutlu Müşteri</div>
              </div>
              <div>
                <div className="text-xl font-bold text-blue-600">15+</div>
                <div className="text-[10px] text-muted-foreground">Yıl Tecrübe</div>
              </div>
              <div>
                <div className="text-xl font-bold text-blue-600">99%</div>
                <div className="text-[10px] text-muted-foreground">Memnuniyet</div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              y: [0, -10, 0]
            }}
            transition={{ 
              duration: 0.6, 
              delay: 0.2,
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            className="relative h-[350px] lg:h-[420px]"
          >
            <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl">
              {heroData?.image ? (
                <Image
                  src={heroData.image}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <Image
                  src={imageUrl}
                  alt="Muhasebe ve Mali Müşavirlik Ofisi"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  className="object-cover"
                  priority
                />
              )}
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent" />
            </div>
            
            {/* Floating card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="absolute -bottom-3 -left-3 bg-white p-3 rounded-lg shadow-xl border border-blue-100"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">%100</div>
                  <div className="text-[10px] text-muted-foreground">Dijital Çözüm</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
