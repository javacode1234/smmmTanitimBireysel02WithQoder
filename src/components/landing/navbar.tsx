"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="h-10 w-10 rounded-lg overflow-hidden transform group-hover:scale-105 transition-transform">
              <Image
                src="/smmm-icon.png"
                alt="SMMM"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div className="font-bold text-xl text-primary">SMMM</div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Anasayfa
            </Link>
            <Link href="#clients" className="text-sm font-medium hover:text-primary transition-colors">
              Kurumlar
            </Link>
            <Link href="#about" className="text-sm font-medium hover:text-primary transition-colors">
              Hakkımızda
            </Link>
            <Link href="#services" className="text-sm font-medium hover:text-primary transition-colors">
              Hizmetler
            </Link>
            <Link href="#workflow" className="text-sm font-medium hover:text-primary transition-colors">
              Süreç
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Fiyatlandırma
            </Link>
            <Link href="#team" className="text-sm font-medium hover:text-primary transition-colors">
              Ekibimiz
            </Link>
            <Link href="#faq" className="text-sm font-medium hover:text-primary transition-colors">
              SSS
            </Link>
            <Link href="#contact" className="text-sm font-medium hover:text-primary transition-colors">
              İletişim
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
