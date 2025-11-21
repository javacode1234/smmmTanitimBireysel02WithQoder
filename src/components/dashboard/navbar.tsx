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
import { User, Settings, LogOut, ChevronDown, Menu, MessageSquare, FileText, Briefcase } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
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
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [newQuoteRequestsCount, setNewQuoteRequestsCount] = useState(0)
  const [newContactMessagesCount, setNewContactMessagesCount] = useState(0)
  const [newJobApplicationsCount, setNewJobApplicationsCount] = useState(0)
  interface QuoteRequestItem { id: string; name: string; company: string; serviceType: string; createdAt: string }
  interface ContactMessageItem { id: string; name: string; subject: string; email: string; phone: string; createdAt: string }
  interface JobApplicationItem { id: string; name: string; position: string; email: string; phone: string; createdAt: string }
  const [newQuoteRequests, setNewQuoteRequests] = useState<QuoteRequestItem[]>([])
  const [newContactMessages, setNewContactMessages] = useState<ContactMessageItem[]>([])
  const [newJobApplications, setNewJobApplications] = useState<JobApplicationItem[]>([])
  const [isQuoteOpen, setIsQuoteOpen] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [isJobOpen, setIsJobOpen] = useState(false)
  const mounted = true
  
  // User data state
  const [userData, setUserData] = useState({
    name: userType === "admin" ? "Admin Kullanıcı" : "Mükellef Kullanıcı",
    email: userType === "admin" ? "admin@smmm.com" : "mukellef@example.com",
    role: userType === "admin" ? "SMMM Yöneticisi" : "Mükellef",
    avatar: "",
    initials: userType === "admin" ? "AK" : "MK"
  })

  // Dropdown SSR: hydration warnings already suppressed on triggers

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile', {
          // Add cache option to suppress 404 warnings in console
          cache: 'no-store'
        }).catch(() => null)
        
        if (response && response.ok) {
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
        // Handle 501 error (Not Implemented) when user model is not available
        else if (response && response.status === 501) {
          // Silently ignore 501 errors - this is expected in simplified schema
          console.log('User model not available in current database schema')
        }
      } catch {
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
            const newQuoteList = quoteData.filter((req: { status: string }) => req.status === 'NEW')
            setNewQuoteRequestsCount(newQuoteList.length)
            setNewQuoteRequests(newQuoteList)
          }

          // Fetch contact messages count
          const contactResponse = await fetch('/api/contact-messages')
          if (contactResponse.ok) {
            const contactData = await contactResponse.json()
            const newContactList = contactData.filter((msg: { status: string }) => msg.status === 'NEW')
            setNewContactMessagesCount(newContactList.length)
            setNewContactMessages(newContactList)
          }

          // Fetch job applications count
          const jobResponse = await fetch('/api/job-applications')
          if (jobResponse.ok) {
            const jobData = await jobResponse.json()
            const newJobList = jobData.filter((app: { status: string }) => app.status === 'NEW')
            setNewJobApplicationsCount(newJobList.length)
            setNewJobApplications(newJobList)
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

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, targetPath: string) => {
    e.preventDefault()
    
    if (isNavigating || pathname === targetPath) return
    
    setIsNavigating(true)
    
    // Use Next.js router for navigation to avoid removeChild errors
    router.push(targetPath)
    
    // Reset navigation state after a short delay
    setTimeout(() => setIsNavigating(false), 100)
  }

  const handleLogout = () => {
    setIsOpen(false)
    router.push('/auth/signin')
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
            <DropdownMenu open={isQuoteOpen} onOpenChange={setIsQuoteOpen}>
              <DropdownMenuTrigger suppressHydrationWarning className="relative flex items-center gap-2 text-gray-700 hover:text-primary transition-colors cursor-pointer" title="Teklif Talepleri">
                <FileText className="h-5 w-5" />
                {newQuoteRequestsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {newQuoteRequestsCount}
                  </span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="p-3 border-b flex items-center justify-between">
                  <span className="text-sm font-semibold">Teklif Talepleri (Yeni)</span>
                  <Link href="/admin/quote-requests" prefetch={false} scroll={false} onClick={(e) => { e.preventDefault(); setIsQuoteOpen(false); handleNavigation(e, '/admin/quote-requests') }} className="text-xs text-blue-600 hover:underline">Tümünü Gör</Link>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {newQuoteRequests.length > 0 ? (
                    newQuoteRequests.slice(0, 8).map((req) => (
                      <div key={req.id} className="px-3 py-2 border-b last:border-b-0">
                        <div className="text-sm font-medium">{req.name} • {req.company}</div>
                        <div className="text-xs text-muted-foreground">{req.serviceType}</div>
                        <div className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleString()}</div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-6 text-sm text-muted-foreground">Yeni kayıt yok</div>
                  )}
                </div>
                <div className="p-3 border-t text-right">
                  <Link href="/admin/quote-requests" prefetch={false} scroll={false} onClick={(e) => { e.preventDefault(); setIsQuoteOpen(false); handleNavigation(e, '/admin/quote-requests') }} className="text-xs text-blue-600 hover:underline">Sayfaya Git</Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu open={isContactOpen} onOpenChange={setIsContactOpen}>
              <DropdownMenuTrigger suppressHydrationWarning className="relative flex items-center gap-2 text-gray-700 hover:text-primary transition-colors cursor-pointer" title="İletişim Mesajları">
                <MessageSquare className="h-5 w-5" />
                {newContactMessagesCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {newContactMessagesCount}
                  </span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="p-3 border-b flex items-center justify-between">
                  <span className="text-sm font-semibold">İletişim Mesajları (Yeni)</span>
                  <Link href="/admin/contact-messages" prefetch={false} scroll={false} onClick={(e) => { e.preventDefault(); setIsContactOpen(false); handleNavigation(e, '/admin/contact-messages') }} className="text-xs text-blue-600 hover:underline">Tümünü Gör</Link>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {newContactMessages.length > 0 ? (
                    newContactMessages.slice(0, 8).map((msg) => (
                      <div key={msg.id} className="px-3 py-2 border-b last:border-b-0">
                        <div className="text-sm font-medium">{msg.name} • {msg.subject}</div>
                        <div className="text-xs text-muted-foreground">{msg.email} • {msg.phone}</div>
                        <div className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString()}</div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-6 text-sm text-muted-foreground">Yeni kayıt yok</div>
                  )}
                </div>
                <div className="p-3 border-t text-right">
                  <Link href="/admin/contact-messages" prefetch={false} scroll={false} onClick={(e) => { e.preventDefault(); setIsContactOpen(false); handleNavigation(e, '/admin/contact-messages') }} className="text-xs text-blue-600 hover:underline">Sayfaya Git</Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu open={isJobOpen} onOpenChange={setIsJobOpen}>
              <DropdownMenuTrigger suppressHydrationWarning className="relative flex items-center gap-2 text-gray-700 hover:text-primary transition-colors cursor-pointer" title="İş Müracaatları">
                <Briefcase className="h-5 w-5" />
                {newJobApplicationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {newJobApplicationsCount}
                  </span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="p-3 border-b flex items-center justify-between">
                  <span className="text-sm font-semibold">İş Müracaatları (Yeni)</span>
                  <Link href="/admin/job-applications" prefetch={false} scroll={false} onClick={(e) => { e.preventDefault(); setIsJobOpen(false); handleNavigation(e, '/admin/job-applications') }} className="text-xs text-blue-600 hover:underline">Tümünü Gör</Link>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {newJobApplications.length > 0 ? (
                    newJobApplications.slice(0, 8).map((app) => (
                      <div key={app.id} className="px-3 py-2 border-b last:border-b-0">
                        <div className="text-sm font-medium">{app.name} • {app.position}</div>
                        <div className="text-xs text-muted-foreground">{app.email} • {app.phone}</div>
                        <div className="text-xs text-gray-500">{new Date(app.createdAt).toLocaleString()}</div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-6 text-sm text-muted-foreground">Yeni kayıt yok</div>
                  )}
                </div>
                <div className="p-3 border-t text-right">
                  <Link href="/admin/job-applications" prefetch={false} scroll={false} onClick={(e) => { e.preventDefault(); setIsJobOpen(false); handleNavigation(e, '/admin/job-applications') }} className="text-xs text-blue-600 hover:underline">Sayfaya Git</Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* User Dropdown */}
        {mounted ? (
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
              <DropdownMenuItem 
                onClick={(e) => {
                  e.preventDefault()
                  setIsOpen(false)
                  handleNavigation(e, profileLink)
                }}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.preventDefault()
                  setIsOpen(false)
                  handleNavigation(e, settingsLink)
                }}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                Ayarlar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-white text-sm">
                {userData.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-gray-900">{userData.name}</span>
              <span className="text-xs text-gray-500">{userData.role}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
