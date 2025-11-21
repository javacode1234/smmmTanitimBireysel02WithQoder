"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselIndicators,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"

type ClientLogo = {
  id: string
  name: string
  description: string | null
  logo: string
  url: string | null
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export function InstitutionLogoCarousel() {
  const [logos, setLogos] = useState<ClientLogo[]>([])
  const [loading, setLoading] = useState(true)
  const isMountedRef = useRef(true)

  // Cleanup function
  const cleanup = useCallback(() => {
    isMountedRef.current = false
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    
    const fetchClientLogos = async () => {
      try {
        const response = await fetch('/api/content/institutions')
        if (response.ok) {
          const data = await response.json()
          // Filter only active logos
          const activeLogos = data.filter((logo: ClientLogo) => logo.isActive)
          if (isMountedRef.current) {
            setLogos(activeLogos)
          }
        }
      } catch (error) {
        console.error('Error fetching institution logos:', error)
      } finally {
        if (isMountedRef.current) {
          setLoading(false)
        }
      }
    }

    fetchClientLogos()
    
    // Cleanup on unmount
    return () => {
      cleanup()
    }
  }, [cleanup])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (logos.length === 0) {
    return null
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">İş Birliklerimiz</h2>
      {/* Desktop Carousel */}
      <div className="hidden md:block">
        <Carousel
          itemsPerView={4}
          autoPlay={true}
          autoPlayInterval={4000}
          className="relative"
        >
          <CarouselContent className="gap-4">
            {logos.map((logo) => (
              <CarouselItem 
                key={logo.id} 
                className="basis-1/4 pl-0"
              >
                <Card className="h-full flex items-center justify-center p-6 border-0 shadow-none">
                  <CardContent className="p-0 flex items-center justify-center">
                    {logo.logo.startsWith('data:') ? (
                      <Image
                        src={logo.logo}
                        alt={logo.name}
                        width={64}
                        height={64}
                        className="h-16 w-16 object-contain"
                        unoptimized
                        onError={(e) => {
                          try {
                            const target = e.target as HTMLImageElement
                            if (target && typeof target.style !== 'undefined') {
                              target.style.display = 'none'
                            }
                          } catch {}
                        }}
                      />
                    ) : (
                      <div className="h-16 w-16 flex items-center justify-center text-2xl">
                        {logo.logo}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
          <CarouselIndicators />
        </Carousel>
      </div>
      
      {/* Mobile Grid */}
      <div className="md:hidden grid grid-cols-2 gap-4">
        {logos.map((logo) => (
          <Card key={logo.id} className="h-full flex items-center justify-center p-4 border-0 shadow-none">
            <CardContent className="p-0 flex items-center justify-center">
              {logo.logo.startsWith('data:') ? (
                <Image
                  src={logo.logo}
                  alt={logo.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain"
                  unoptimized
                  onError={(e) => {
                    try {
                      const target = e.target as HTMLImageElement
                      if (target && typeof target.style !== 'undefined') {
                        target.style.display = 'none'
                      }
                    } catch {}
                  }}
                />
              ) : (
                <div className="h-12 w-12 flex items-center justify-center text-xl">
                  {logo.logo}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
