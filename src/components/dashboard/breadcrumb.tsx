"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { Fragment, useState } from "react"
import { useBreadcrumb } from "@/contexts/breadcrumb-context"

interface BreadcrumbProps {
  userType: "admin" | "client"
}

export function Breadcrumb({ userType }: BreadcrumbProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const { customLabel } = useBreadcrumb()
  
  // Create breadcrumb items from pathname
  const pathSegments = pathname.split("/").filter(Boolean)
  
  // Route name mappings
  const routeNames: Record<string, string> = {
    admin: "Admin",
    client: "Müşteri",
    dashboard: "Dashboard",
    content: "İçerik Yönetimi",
    clients: "Müşteriler",
    customers: "Müşteriler",
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
    let name = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    
    // Use custom label for last segment if it's an ID (UUID or CUID) and we have a custom label
    const isLast = index === pathSegments.length - 1
    if (isLast && customLabel && (segment.match(/^[a-f0-9-]{36}$/i) || segment.match(/^c[a-z0-9]{24}$/i))) {
      name = customLabel
    }

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
