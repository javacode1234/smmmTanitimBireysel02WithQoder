"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DashboardNavbar } from "@/components/dashboard/navbar"
import { Breadcrumb } from "@/components/dashboard/breadcrumb"
import { BreadcrumbProvider } from "@/contexts/breadcrumb-context"
import Image from "next/image"
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Bell, 
  Settings,
  CreditCard,
  FileEdit,
  LogOut,
  UserCog,
  FileSearch
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "İçerik Yönetimi", href: "/admin/content", icon: FileEdit },
  { name: "Müşteriler", href: "/admin/customers", icon: Users },
  { name: "Beyanname Takibi", href: "/admin/tax-returns", icon: FileSearch },
  { name: "Beyannameler", href: "/admin/declarations", icon: FileText },
  { name: "Duyurular", href: "/admin/announcements", icon: Bell },
  { name: "Tahsilat", href: "/admin/collections", icon: CreditCard },
  { name: "Kullanıcılar", href: "/admin/users", icon: UserCog },
  { name: "Ayarlar", href: "/admin/settings", icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarState, setSidebarState] = useState<"open" | "collapsed" | "hidden">("open")
  const [isNavigating, setIsNavigating] = useState(false)

  const handleToggleSidebar = () => {
    if (sidebarState === "open") {
      setSidebarState("collapsed")
    } else if (sidebarState === "collapsed") {
      setSidebarState("hidden")
    } else {
      setSidebarState("open")
    }
  }

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, targetPath: string) => {
    e.preventDefault()

    if (isNavigating || pathname === targetPath) return

    setIsNavigating(true)

    // Dispatch close event before navigation
    if (typeof window !== 'undefined') {
      // Use a more robust approach to close dialogs
      const closeEvent = new CustomEvent('close-all-dialogs')
      window.dispatchEvent(closeEvent)
    }

    // Simple navigation without complex requestAnimationFrame nesting
    router.push(targetPath)
    
    // Reset navigation state after a short delay
    setTimeout(() => {
      setIsNavigating(false)
    }, 100)
  }

  const handleLogout = () => {
    router.push('/auth/signin')
  }

  const sidebarWidth = sidebarState === "open" ? "w-64" : sidebarState === "collapsed" ? "w-20" : "w-0"
  const sidebarWidthPx = sidebarState === "open" ? "256px" : sidebarState === "collapsed" ? "80px" : "0px"
  const mainMargin = sidebarState === "open" ? "pl-64" : sidebarState === "collapsed" ? "pl-20" : "pl-0"

  // Ensure proper cleanup on unmount
  useEffect(() => {
    let isComponentMounted = true;
    
    // Listen for close-all-dialogs event
    const handleCloseAllDialogs = () => {
      if (!isComponentMounted) return;
      // This is just a placeholder - individual components will handle their own dialog closing
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('close-all-dialogs', handleCloseAllDialogs);
    }
    
    return () => {
      isComponentMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('close-all-dialogs', handleCloseAllDialogs);
      }
    };
  }, []);

  return (
    <BreadcrumbProvider>
      <div className="min-h-screen bg-gray-100" suppressHydrationWarning>
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 z-40 h-screen ${sidebarWidth} bg-gray-50 border-r border-slate-200 transition-all duration-300 overflow-hidden`}
        style={{ transitionProperty: 'width, transform' }}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6 gap-3">
            <Image
              src="/smmm-icon.png"
              alt="SMMM"
              width={32}
              height={32}
              className="object-contain flex-shrink-0"
              priority={true}
            />
            {sidebarState === "open" && (
              <h1 className="text-xl font-bold text-primary whitespace-nowrap">SMMM Admin</h1>
            )}
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={false}
                  scroll={false}
                  onClick={(e) => handleNavigation(e, item.href)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-slate-700 hover:bg-primary/10 hover:text-primary"
                  }`}
                  title={sidebarState !== "open" ? item.name : ""}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarState === "open" && <span className="whitespace-nowrap">{item.name}</span>}
                </Link>
              )
            })}
          </nav>
          <div className="border-t p-4">
            {sidebarState === "open" ? (
              <Button variant="outline" className="w-full" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
              </Button>
            ) : (
              <Button variant="outline" size="icon" className="w-full" onClick={handleLogout} title="Çıkış Yap">
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`${mainMargin} transition-all duration-300`} style={{ transitionProperty: 'padding-left' }} suppressHydrationWarning>
        <DashboardNavbar userType="admin" sidebarState={sidebarState} onToggleSidebar={handleToggleSidebar} sidebarWidth={sidebarWidthPx} />
        <div className="p-8 mt-16" suppressHydrationWarning>
          <Breadcrumb userType="admin" />
          {children}
        </div>
      </main>
      </div>
    </BreadcrumbProvider>
  )
}
