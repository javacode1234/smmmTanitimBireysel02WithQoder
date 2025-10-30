"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useState, useEffect } from "react"

interface SiteSettings {
  siteName?: string
  brandIcon?: string
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({})

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

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
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
            <Link href="/" className="text-sm font-medium hover:text-primary transition-all duration-300 relative group">
              <span>Anasayfa</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="#clients" className="text-sm font-medium hover:text-primary transition-all duration-300 relative group">
              <span>Kurumlar</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="#about" className="text-sm font-medium hover:text-primary transition-all duration-300 relative group">
              <span>Hakkımızda</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="#services" className="text-sm font-medium hover:text-primary transition-all duration-300 relative group">
              <span>Hizmetler</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="#workflow" className="text-sm font-medium hover:text-primary transition-all duration-300 relative group">
              <span>Süreç</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-all duration-300 relative group">
              <span>Fiyatlandırma</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-primary transition-all duration-300 relative group">
              <span>Referanslarımız</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="#team" className="text-sm font-medium hover:text-primary transition-all duration-300 relative group">
              <span>Ekibimiz</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="#faq" className="text-sm font-medium hover:text-primary transition-all duration-300 relative group">
              <span>SSS</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="#contact" className="text-sm font-medium hover:text-primary transition-all duration-300 relative group">
              <span>İletişim</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/auth/signin">
              <Button>Giriş Yap</Button>
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
            <Link href="/" className="block text-sm font-medium hover:text-primary transition-colors">
              Anasayfa
            </Link>
            <Link href="#clients" className="block text-sm font-medium hover:text-primary transition-colors">
              Kurumlar
            </Link>
            <Link href="#about" className="block text-sm font-medium hover:text-primary transition-colors">
              Hakkımızda
            </Link>
            <Link href="#services" className="block text-sm font-medium hover:text-primary transition-colors">
              Hizmetler
            </Link>
            <Link href="#workflow" className="block text-sm font-medium hover:text-primary transition-colors">
              Süreç
            </Link>
            <Link href="#pricing" className="block text-sm font-medium hover:text-primary transition-colors">
              Fiyatlandırma
            </Link>
            <Link href="#testimonials" className="block text-sm font-medium hover:text-primary transition-colors">
              Referanslarımız
            </Link>
            <Link href="#team" className="block text-sm font-medium hover:text-primary transition-colors">
              Ekibimiz
            </Link>
            <Link href="#faq" className="block text-sm font-medium hover:text-primary transition-colors">
              SSS
            </Link>
            <Link href="#contact" className="block text-sm font-medium hover:text-primary transition-colors">
              İletişim
            </Link>
            <Link href="/auth/signin">
              <Button className="w-full">Giriş Yap</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
