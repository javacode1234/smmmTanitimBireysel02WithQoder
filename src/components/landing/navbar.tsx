"use client"

import Link from "next/link"
import Image from "next/image"
import { Menu } from "lucide-react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

interface SiteSettings {
  siteName?: string
  brandIcon?: string
}

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({})
  const [isNavigating, setIsNavigating] = useState(false)

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

  useEffect(() => {
    const id = setTimeout(() => {
      fetchSiteSettings()
    }, 0)
    return () => clearTimeout(id)
  }, [])

  // Handle signin navigation with cleanup - FINAL FIX for removeChild error
  const handleSignIn = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    
    if (isNavigating) return
    
    setIsNavigating(true)
    setIsOpen(false)
    
    // Use window.location instead of router.push to avoid React Fiber conflicts
    // This forces a full page reload and avoids DOM cleanup race conditions
    requestAnimationFrame(() => {
      window.location.href = '/auth/signin'
    })
  }

  // Smooth scroll handler - simple version without setTimeout
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith('#')) return
    
    e.preventDefault()
    setIsOpen(false)

    const targetId = href.substring(1)
    const targetElement = document.getElementById(targetId)
    
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-blue-500/50 backdrop-blur-md border-b-2 border-orange-200">
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
                <Image
                  src={siteSettings.brandIcon}
                  alt={siteSettings.siteName || "SMMM"}
                  width={40}
                  height={40}
                  unoptimized
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
              href="#mevzuat" 
              className="text-sm font-medium hover:text-primary transition-all duration-300 relative group"
              onClick={(e) => handleAnchorClick(e, '#mevzuat')}
            >
              <span>Mevzuat</span>
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
            <Link 
              href="/auth/signin"
              prefetch={false}
              scroll={false}
              onClick={handleSignIn}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Giriş Yap
            </Link>
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
              href="#mevzuat" 
              className="block text-sm font-medium hover:text-primary transition-colors" 
              onClick={(e) => handleAnchorClick(e, '#mevzuat')}
            >
              Mevzuat
            </Link>
            <Link 
              href="#contact" 
              className="block text-sm font-medium hover:text-primary transition-colors" 
              onClick={(e) => handleAnchorClick(e, '#contact')}
            >
              İletişim
            </Link>
            <Link 
              href="/auth/signin"
              prefetch={false}
              scroll={false}
              onClick={handleSignIn}
              className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Giriş Yap
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
