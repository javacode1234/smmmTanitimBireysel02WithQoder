"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"

interface SiteSettings {
  siteName?: string
  brandIcon?: string
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({})
  const [isNavigating, setIsNavigating] = useState(false)
  const scrollingRef = useRef(false)

  useEffect(() => {
    fetchSiteSettings()
  }, [])

  const fetchSiteSettings = async () => {
    try {
      const response = await fetch('/api/content/site-settings')
      if (response.ok) {
        const data = await response.json()
        setSiteSettings(data || {})
      }
    } catch (error) {
      console.error('Error fetching site settings:', error)
    }
  }

  // Handle navigation to signin page
  const handleSignInClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/auth/signin" || isNavigating) {
      e.preventDefault()
      return
    }
    
    e.preventDefault()
    setIsNavigating(true)
    setIsOpen(false)
    
    // Add delay to ensure any animations complete
    setTimeout(() => {
      router.push('/auth/signin')
    }, 100)
  }

  // Smooth scroll handler with debounce to prevent animation conflicts
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith('#')) return
    
    // If already scrolling, prevent additional clicks
    if (scrollingRef.current) {
      e.preventDefault()
      return
    }
    
    e.preventDefault()
    scrollingRef.current = true
    setIsOpen(false)

    const targetId = href.substring(1)
    const targetElement = document.getElementById(targetId)
    
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      
      // Reset scrolling flag after animation completes
      setTimeout(() => {
        scrollingRef.current = false
      }, 1000) // Smooth scroll typically takes ~500-800ms, add buffer
    } else {
      scrollingRef.current = false
    }
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            prefetch={false}
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault()
                setIsOpen(false)
                if (typeof window !== "undefined") {
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }
              }
            }}
            className="flex items-center space-x-2 group"
          >
            <div className="h-10 w-10 rounded-lg overflow-hidden transform group-hover:scale-105 transition-transform">
              {siteSettings.brandIcon ? (
                <img
                  src={siteSettings.brandIcon}
                  alt={siteSettings.siteName || "SMMM"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src="/smmm-icon.png"
                  alt="SMMM"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              )}
            </div>
            <div className="font-bold text-xl text-primary">{siteSettings.siteName || "SMMM"}</div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              prefetch={false}
              onClick={(e) => {
                if (pathname === "/") {
                  e.preventDefault()
                  setIsOpen(false)
                  if (typeof window !== "undefined") {
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                }
              }}
              className="text-sm font-medium hover:text-primary transition-all duration-300 relative group"
            >
              <span>Anasayfa</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="#clients" 
              className="text-sm font-medium hover:text-primary transition-all duration-300 relative group"
              onClick={(e) => handleAnchorClick(e, '#clients')}
            >
              <span>Kurumlar</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="#about" 
              className="text-sm font-medium hover:text-primary transition-all duration-300 relative group"
              onClick={(e) => handleAnchorClick(e, '#about')}
            >
              <span>Hakkımızda</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="#services" 
              className="text-sm font-medium hover:text-primary transition-all duration-300 relative group"
              onClick={(e) => handleAnchorClick(e, '#services')}
            >
              <span>Hizmetler</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="#workflow" 
              className="text-sm font-medium hover:text-primary transition-all duration-300 relative group"
              onClick={(e) => handleAnchorClick(e, '#workflow')}
            >
              <span>Süreç</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="#pricing" 
              className="text-sm font-medium hover:text-primary transition-all duration-300 relative group"
              onClick={(e) => handleAnchorClick(e, '#pricing')}
            >
              <span>Fiyatlandırma</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="#testimonials" 
              className="text-sm font-medium hover:text-primary transition-all duration-300 relative group"
              onClick={(e) => handleAnchorClick(e, '#testimonials')}
            >
              <span>Referanslarımız</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="#team" 
              className="text-sm font-medium hover:text-primary transition-all duration-300 relative group"
              onClick={(e) => handleAnchorClick(e, '#team')}
            >
              <span>Ekibimiz</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="#faq" 
              className="text-sm font-medium hover:text-primary transition-all duration-300 relative group"
              onClick={(e) => handleAnchorClick(e, '#faq')}
            >
              <span>SSS</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="#contact" 
              className="text-sm font-medium hover:text-primary transition-all duration-300 relative group"
              onClick={(e) => handleAnchorClick(e, '#contact')}
            >
              <span>İletişim</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Button asChild>
              <Link 
                href="/auth/signin"
                onClick={handleSignInClick}
              >
                Giriş Yap
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link 
              href="/" 
              prefetch={false}
              className="block text-sm font-medium hover:text-primary transition-colors" 
              onClick={(e) => {
                if (pathname === "/") {
                  e.preventDefault()
                  setIsOpen(false)
                  if (typeof window !== "undefined") {
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                } else {
                  setIsOpen(false)
                }
              }}
            >
              Anasayfa
            </Link>
            <Link 
              href="#clients" 
              className="block text-sm font-medium hover:text-primary transition-colors" 
              onClick={(e) => handleAnchorClick(e, '#clients')}
            >
              Kurumlar
            </Link>
            <Link 
              href="#about" 
              className="block text-sm font-medium hover:text-primary transition-colors" 
              onClick={(e) => handleAnchorClick(e, '#about')}
            >
              Hakkımızda
            </Link>
            <Link 
              href="#services" 
              className="block text-sm font-medium hover:text-primary transition-colors" 
              onClick={(e) => handleAnchorClick(e, '#services')}
            >
              Hizmetler
            </Link>
            <Link 
              href="#workflow" 
              className="block text-sm font-medium hover:text-primary transition-colors" 
              onClick={(e) => handleAnchorClick(e, '#workflow')}
            >
              Süreç
            </Link>
            <Link 
              href="#pricing" 
              className="block text-sm font-medium hover:text-primary transition-colors" 
              onClick={(e) => handleAnchorClick(e, '#pricing')}
            >
              Fiyatlandırma
            </Link>
            <Link 
              href="#testimonials" 
              className="block text-sm font-medium hover:text-primary transition-colors" 
              onClick={(e) => handleAnchorClick(e, '#testimonials')}
            >
              Referanslarımız
            </Link>
            <Link 
              href="#team" 
              className="block text-sm font-medium hover:text-primary transition-colors" 
              onClick={(e) => handleAnchorClick(e, '#team')}
            >
              Ekibimiz
            </Link>
            <Link 
              href="#faq" 
              className="block text-sm font-medium hover:text-primary transition-colors" 
              onClick={(e) => handleAnchorClick(e, '#faq')}
            >
              SSS
            </Link>
            <Link 
              href="#contact" 
              className="block text-sm font-medium hover:text-primary transition-colors" 
              onClick={(e) => handleAnchorClick(e, '#contact')}
            >
              İletişim
            </Link>
            <Button className="w-full" asChild>
              <Link 
                href="/auth/signin" 
                onClick={handleSignInClick}
              >
                Giriş Yap
              </Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}