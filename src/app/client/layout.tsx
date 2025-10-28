"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <h1 className="text-xl font-bold text-primary">SMMM Portal</h1>
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
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="border-t p-4">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/auth/signin">
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
              </Link>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
