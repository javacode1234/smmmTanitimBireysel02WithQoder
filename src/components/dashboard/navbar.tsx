"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, ChevronDown, Menu, MessageSquare, FileText, Bell, Briefcase } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface DashboardNavbarProps {
  userType: "admin" | "client"
  sidebarState: "open" | "collapsed" | "hidden"
  onToggleSidebar: () => void
  sidebarWidth: string
}

export function DashboardNavbar({ userType, sidebarState, onToggleSidebar, sidebarWidth }: DashboardNavbarProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [newQuoteRequestsCount, setNewQuoteRequestsCount] = useState(0)
  const [newContactMessagesCount, setNewContactMessagesCount] = useState(0)
  const [newJobApplicationsCount, setNewJobApplicationsCount] = useState(0)
  
  // User data state
  const [userData, setUserData] = useState({
    name: userType === "admin" ? "Admin Kullanıcı" : "Mükellef Kullanıcı",
    email: userType === "admin" ? "admin@smmm.com" : "mukellef@example.com",
    role: userType === "admin" ? "SMMM Yöneticisi" : "Mükellef",
    avatar: "",
    initials: userType === "admin" ? "AK" : "MK"
  })

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          setUserData({
            name: data.name || (userType === "admin" ? "Admin Kullanıcı" : "Mükellef Kullanıcı"),
            email: data.email || (userType === "admin" ? "admin@smmm.com" : "mukellef@example.com"),
            role: userType === "admin" ? "SMMM Yöneticisi" : "Mükellef",
            avatar: data.image || "",
            initials: data.name 
              ? data.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
              : (userType === "admin" ? "AK" : "MK")
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    fetchProfile()
  }, [userType])

  // Fetch counts for admin
  useEffect(() => {
    if (userType === "admin") {
      const fetchCounts = async () => {
        try {
          // Fetch quote requests count
          const quoteResponse = await fetch('/api/quote-requests')
          if (quoteResponse.ok) {
            const quoteData = await quoteResponse.json()
            const newQuoteCount = quoteData.filter((req: any) => req.status === 'NEW').length
            setNewQuoteRequestsCount(newQuoteCount)
          }

          // Fetch contact messages count
          const contactResponse = await fetch('/api/contact-messages')
          if (contactResponse.ok) {
            const contactData = await contactResponse.json()
            const newContactCount = contactData.filter((msg: any) => msg.status === 'NEW').length
            setNewContactMessagesCount(newContactCount)
          }

          // Fetch job applications count
          const jobResponse = await fetch('/api/job-applications')
          if (jobResponse.ok) {
            const jobData = await jobResponse.json()
            const newJobCount = jobData.filter((app: any) => app.status === 'NEW').length
            setNewJobApplicationsCount(newJobCount)
          }
        } catch (error) {
          console.error('Error fetching counts:', error)
        }
      }

      fetchCounts()
      // Refresh counts every 30 seconds
      const interval = setInterval(fetchCounts, 30000)
      return () => clearInterval(interval)
    }
  }, [userType])

  const handleLogout = () => {
    // TODO: Implement actual logout logic
    router.push("/auth/signin")
  }

  const profileLink = userType === "admin" ? "/admin/profile" : "/client/profile"
  const settingsLink = userType === "admin" ? "/admin/settings" : "/client/settings"

  return (
    <div 
      className={`h-16 border-b bg-white flex items-center justify-between px-8 fixed top-0 right-0 z-20 transition-all duration-300`}
      style={{ left: sidebarWidth }}
    >
      <div className="flex items-center gap-4">
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="hover:bg-gray-100"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* SMMM Icon - Show when sidebar is hidden */}
        {sidebarState === "hidden" && (
          <Image
            src="/smmm-icon.png"
            alt="SMMM"
            width={32}
            height={32}
            className="object-contain"
          />
        )}

        <h2 className="text-lg font-semibold text-gray-800">
          {userType === "admin" ? "Admin Paneli" : "Müşteri Paneli"}
        </h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Quick Links for Admin */}
        {userType === "admin" && (
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/quote-requests" 
              className="relative flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
              title="Teklif Talepleri"
            >
              <FileText className="h-5 w-5" />
              {newQuoteRequestsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {newQuoteRequestsCount}
                </span>
              )}
            </Link>
            <Link 
              href="/admin/contact-messages" 
              className="relative flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
              title="İletişim Mesajları"
            >
              <MessageSquare className="h-5 w-5" />
              {newContactMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {newContactMessagesCount}
                </span>
              )}
            </Link>
            <Link 
              href="/admin/job-applications" 
              className="relative flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
              title="İş Müracaatları"
            >
              <Briefcase className="h-5 w-5" />
              {newJobApplicationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {newJobApplicationsCount}
                </span>
              )}
            </Link>
          </div>
        )}

        {/* User Dropdown */}
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors cursor-pointer outline-none">
            <Avatar className="h-9 w-9">
              <AvatarImage src={userData.avatar} alt={userData.name} />
              <AvatarFallback className="bg-primary text-white text-sm">
                {userData.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-gray-900">{userData.name}</span>
              <span className="text-xs text-gray-500">{userData.role}</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{userData.name}</p>
                <p className="text-xs text-muted-foreground">{userData.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={profileLink} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={settingsLink} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Ayarlar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
