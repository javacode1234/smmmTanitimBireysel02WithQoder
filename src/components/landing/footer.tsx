import Link from "next/link"
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white font-bold text-xl mb-4">SMMM Sistemi</h3>
            <p className="text-sm">
              Profesyonel mali müşavirlik hizmetleri ile işletmenizin yanındayız.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Hızlı Bağlantılar</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#about" className="hover:text-white transition-colors">Hakkımızda</Link></li>
              <li><Link href="#services" className="hover:text-white transition-colors">Hizmetler</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">Fiyatlandırma</Link></li>
              <li><Link href="#team" className="hover:text-white transition-colors">Ekibimiz</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Hizmetler</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Muhasebe</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Mali Danışmanlık</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Bordro</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Denetim</Link></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="text-white font-semibold mb-4">İletişim</h4>
            <ul className="space-y-2 text-sm mb-4">
              <li>Telefon: +90 (216) 555 0000</li>
              <li>E-posta: info@smmm.com.tr</li>
              <li>Adres: İstanbul, Türkiye</li>
            </ul>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} SMMM Yönetim Sistemi. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}
