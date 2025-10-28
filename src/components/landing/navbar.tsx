"use client"

import Link from "next/link"
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
          <Link href="/" className="flex items-center space-x-2">
            <div className="font-bold text-2xl text-primary">SMMM</div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#about" className="text-sm font-medium hover:text-primary transition-colors">
              Hakkımızda
            </Link>
            <Link href="#services" className="text-sm font-medium hover:text-primary transition-colors">
              Hizmetler
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Fiyatlandırma
            </Link>
            <Link href="#team" className="text-sm font-medium hover:text-primary transition-colors">
              Ekibimiz
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
            <Link href="#about" className="block text-sm font-medium hover:text-primary transition-colors">
              Hakkımızda
            </Link>
            <Link href="#services" className="block text-sm font-medium hover:text-primary transition-colors">
              Hizmetler
            </Link>
            <Link href="#pricing" className="block text-sm font-medium hover:text-primary transition-colors">
              Fiyatlandırma
            </Link>
            <Link href="#team" className="block text-sm font-medium hover:text-primary transition-colors">
              Ekibimiz
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
