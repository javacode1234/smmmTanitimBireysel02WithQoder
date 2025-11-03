"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { Fragment, useState } from "react"

interface BreadcrumbProps {
  userType: "admin" | "client"
}

export function Breadcrumb({ userType }: BreadcrumbProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  
  // Create breadcrumb items from pathname
  const pathSegments = pathname.split("/").filter(Boolean)
  
  // Route name mappings
  const routeNames: Record<string, string> = {
    admin: "Admin",
    client: "Müşteri",
    dashboard: "Dashboard",
    content: "İçerik Yönetimi",
    clients: "Müşteriler",
    declarations: "Beyannameler",
    announcements: "Duyurular",
    collections: "Tahsilat",
    settings: "Ayarlar",
    profile: "Profil",
    account: "Hesap Özeti",
    messages: "İletişim",
    "quote-requests": "Teklif Talepleri",
    "contact-messages": "İletişim Mesajları",
    "job-applications": "İş Müracaatları",
  }

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join("/")}`
    const name = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    const isLast = index === pathSegments.length - 1

    return {
      name,
      path,
      isLast
    }
  })

  const homeLink = userType === "admin" ? "/admin" : "/client"

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, targetPath: string) => {
    e.preventDefault()
    
    if (isNavigating || pathname === targetPath) return
    
    setIsNavigating(true)
    
    // Use window.location.href for consistent navigation
    window.location.href = targetPath
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-600 mb-6">
      <Link 
        href={homeLink}
        prefetch={false}
        scroll={false}
        onClick={(e) => handleNavigation(e, homeLink)}
        className="flex items-center hover:text-primary transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbItems.map((item, index) => (
        <Fragment key={item.path}>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {item.isLast ? (
            <span className="font-medium text-gray-900">{item.name}</span>
          ) : (
            <Link 
              href={item.path}
              prefetch={false}
              scroll={false}
              onClick={(e) => handleNavigation(e, item.path)}
              className="hover:text-primary transition-colors"
            >
              {item.name}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
