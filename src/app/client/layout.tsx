"use client"
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DashboardNavbar } from "@/components/dashboard/navbar"
import { Breadcrumb } from "@/components/dashboard/breadcrumb"
import Image from "next/image"
import { 
  LayoutDashboard, 
  FileText, 
  Bell, 
  User,
  CreditCard,
  MessageSquare,
  LogOut
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/client", icon: LayoutDashboard },
  { name: "Profilim", href: "/client/profile", icon: User },
  { name: "Beyannamelerim", href: "/client/declarations", icon: FileText },
  { name: "Hesap Özeti", href: "/client/account", icon: CreditCard },
  { name: "Duyurular", href: "/client/announcements", icon: Bell },
  { name: "İletişim", href: "/client/messages", icon: MessageSquare },
]

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarState, setSidebarState] = useState<"open" | "collapsed" | "hidden">("open")

  const handleToggleSidebar = () => {
    if (sidebarState === "open") {
      setSidebarState("collapsed")
    } else if (sidebarState === "collapsed") {
      setSidebarState("hidden")
    } else {
      setSidebarState("open")
    }
  }

  const handleLogout = () => {
    try {
      // Use a small delay to ensure any animations complete before navigation
      setTimeout(() => {
        // Use window.location.href for a full page reload to avoid React DOM reconciliation issues
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/signin'
        }
      }, 100)
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback to direct navigation
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin'
      }
    }
  }

  const sidebarWidth = sidebarState === "open" ? "w-64" : sidebarState === "collapsed" ? "w-20" : "w-0"
  const sidebarWidthPx = sidebarState === "open" ? "256px" : sidebarState === "collapsed" ? "80px" : "0px"
  const mainMargin = sidebarState === "open" ? "pl-64" : sidebarState === "collapsed" ? "pl-20" : "pl-0"

  return (
    <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 h-screen ${sidebarWidth} bg-white border-r transition-all duration-300 overflow-hidden`}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6 gap-3">
            <Image
              src="/smmm-icon.png"
              alt="SMMM"
              width={32}
              height={32}
              className="object-contain flex-shrink-0"
            />
            {sidebarState === "open" && (
              <h1 className="text-xl font-bold text-primary whitespace-nowrap">SMMM Portal</h1>
            )}
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
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
      <main className={`${mainMargin} transition-all duration-300`}>
        <DashboardNavbar userType="client" sidebarState={sidebarState} onToggleSidebar={handleToggleSidebar} sidebarWidth={sidebarWidthPx} />
        <div className="p-8 mt-16">
          <Breadcrumb userType="client" />
          {children}
        </div>
      </main>
    </div>
  )
}
