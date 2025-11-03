"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin, Youtube } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { PrivacyPolicyModal } from "@/components/modals/privacy-policy-modal"
import { TermsModal } from "@/components/modals/terms-modal"
import { KVKKModal } from "@/components/modals/kvkk-modal"

interface SiteSettings {
  siteName?: string
  siteDescription?: string
  brandIcon?: string
  phone?: string
  email?: string
  address?: string
  facebookUrl?: string
  twitterUrl?: string
  linkedinUrl?: string
  instagramUrl?: string
  youtubeUrl?: string
}

// Default values
const DEFAULT_SETTINGS = {
  siteName: "SMMM Ofisi",
  siteDescription: "Profesyonel mali müşavirlik hizmetleri ile işletmenizin mali yönetiminde güvenilir çözüm ortağınız.",
  phone: "+90 (212) 123 45 67",
  email: "info@smmmofisi.com",
  address: "İstanbul, Türkiye",
  facebookUrl: "https://facebook.com",
  twitterUrl: "https://twitter.com",
  linkedinUrl: "https://linkedin.com",
  instagramUrl: "https://instagram.com",
  youtubeUrl: "https://youtube.com"
}

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [kvkkOpen, setKvkkOpen] = useState(false)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({})
  const scrollingRef = useRef(false)

  useEffect(() => {
    fetchSiteSettings()
  }, [])

  const fetchSiteSettings = async () => {
    try {
      const response = await fetch('/api/content/site-settings')
      if (response.ok) {
        const data = await response.json()
        setSiteSettings(data)
      } else {
        // Use default settings if API call fails
        setSiteSettings(DEFAULT_SETTINGS)
      }
    } catch (error) {
      console.error('Error fetching site settings:', error)
      // Use default settings if API call fails
      setSiteSettings(DEFAULT_SETTINGS)
    }
  }

  // Helper function to get value or default
  const getValue = (key: keyof typeof DEFAULT_SETTINGS) => {
    return siteSettings[key] || DEFAULT_SETTINGS[key]
  }

  // Helper function to check if social media link should be shown
  const shouldShowSocialLink = (key: keyof typeof DEFAULT_SETTINGS) => {
    return siteSettings[key] || DEFAULT_SETTINGS[key]
  }

  // Handle anchor link clicks with debounce
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith('#')) return
    
    if (scrollingRef.current) {
      e.preventDefault()
      return
    }
    
    e.preventDefault()
    scrollingRef.current = true

    const targetId = href.substring(1)
    const targetElement = document.getElementById(targetId)
    
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setTimeout(() => {
        scrollingRef.current = false
      }, 1000)
    } else {
      scrollingRef.current = false
    }
  }

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-10 w-10 rounded-lg overflow-hidden">
                {siteSettings.brandIcon ? (
                  <img
                    src={siteSettings.brandIcon}
                    alt={getValue('siteName')}
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
              <h3 className="text-white font-bold text-xl">{getValue('siteName')}</h3>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              {getValue('siteDescription')}
            </p>
            <div className="flex space-x-3">
              {shouldShowSocialLink('facebookUrl') && (
                <a href={getValue('facebookUrl')} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg bg-slate-700 hover:bg-blue-600 flex items-center justify-center transition-colors">
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {shouldShowSocialLink('twitterUrl') && (
                <a href={getValue('twitterUrl')} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg bg-slate-700 hover:bg-blue-400 flex items-center justify-center transition-colors">
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {shouldShowSocialLink('linkedinUrl') && (
                <a href={getValue('linkedinUrl')} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg bg-slate-700 hover:bg-blue-700 flex items-center justify-center transition-colors">
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {shouldShowSocialLink('instagramUrl') && (
                <a href={getValue('instagramUrl')} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg bg-slate-700 hover:bg-pink-600 flex items-center justify-center transition-colors">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {shouldShowSocialLink('youtubeUrl') && (
                <a href={getValue('youtubeUrl')} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg bg-slate-700 hover:bg-red-600 flex items-center justify-center transition-colors">
                  <Youtube className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Hızlı Erişim</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#clients" onClick={(e) => handleAnchorClick(e, '#clients')} className="hover:text-white transition-colors flex items-center gap-2">→ Kurumlar</Link></li>
              <li><Link href="#about" onClick={(e) => handleAnchorClick(e, '#about')} className="hover:text-white transition-colors flex items-center gap-2">→ Hakkımızda</Link></li>
              <li><Link href="#services" onClick={(e) => handleAnchorClick(e, '#services')} className="hover:text-white transition-colors flex items-center gap-2">→ Hizmetler</Link></li>
              <li><Link href="#workflow" onClick={(e) => handleAnchorClick(e, '#workflow')} className="hover:text-white transition-colors flex items-center gap-2">→ Çalışma Süreci</Link></li>
              <li><Link href="#pricing" onClick={(e) => handleAnchorClick(e, '#pricing')} className="hover:text-white transition-colors flex items-center gap-2">→ Fiyatlandırma</Link></li>
              <li><Link href="#team" onClick={(e) => handleAnchorClick(e, '#team')} className="hover:text-white transition-colors flex items-center gap-2">→ Ekibimiz</Link></li>
              <li><Link href="#faq" onClick={(e) => handleAnchorClick(e, '#faq')} className="hover:text-white transition-colors flex items-center gap-2">→ SSS</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Hizmetlerimiz</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#services" onClick={(e) => handleAnchorClick(e, '#services')} className="hover:text-white transition-colors flex items-center gap-2">→ Beyanname Hazırlama</Link></li>
              <li><Link href="#services" onClick={(e) => handleAnchorClick(e, '#services')} className="hover:text-white transition-colors flex items-center gap-2">→ Muhasebe Hizmetleri</Link></li>
              <li><Link href="#services" onClick={(e) => handleAnchorClick(e, '#services')} className="hover:text-white transition-colors flex items-center gap-2">→ Şirket Kuruluşu</Link></li>
              <li><Link href="#services" onClick={(e) => handleAnchorClick(e, '#services')} className="hover:text-white transition-colors flex items-center gap-2">→ Mali Danışmanlık</Link></li>
              <li><Link href="#services" onClick={(e) => handleAnchorClick(e, '#services')} className="hover:text-white transition-colors flex items-center gap-2">→ Denetim ve Revizyon</Link></li>
              <li><Link href="#services" onClick={(e) => handleAnchorClick(e, '#services')} className="hover:text-white transition-colors flex items-center gap-2">→ Bordro Hizmetleri</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">İletişim Bilgileri</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium mb-1">Adres</p>
                  <p className="leading-relaxed">
                    {getValue('address')}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium mb-1">Telefon</p>
                  <a href={`tel:${getValue('phone').replace(/\s/g, '')}`} className="hover:text-white transition-colors">
                    {getValue('phone')}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium mb-1">E-posta</p>
                  <a href={`mailto:${getValue('email')}`} className="hover:text-white transition-colors">
                    {getValue('email')}
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>&copy; {currentYear} {getValue('siteName')} - Tüm hakları saklıdır.</p>
            <div className="flex gap-6">
              <button 
                onClick={() => setPrivacyOpen(true)}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Gizlilik Politikası
              </button>
              <button 
                onClick={() => setTermsOpen(true)}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Kullanım Koşulları
              </button>
              <button 
                onClick={() => setKvkkOpen(true)}
                className="hover:text-white transition-colors cursor-pointer"
              >
                KVKK
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PrivacyPolicyModal open={privacyOpen} onOpenChange={setPrivacyOpen} />
      <TermsModal open={termsOpen} onOpenChange={setTermsOpen} />
      <KVKKModal open={kvkkOpen} onOpenChange={setKvkkOpen} />
    </footer>
  )
}
