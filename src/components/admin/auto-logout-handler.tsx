"use client"

import { useEffect, useRef, useState } from "react"
import { getSystemSettings } from "@/app/admin/settings/actions"
import { toast } from "sonner"
import { signOut } from "next-auth/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

export function AutoLogoutHandler() {
  const [timeoutMinutes, setTimeoutMinutes] = useState<number>(0)
  const [isWarning, setIsWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())
  const isLoggingOutRef = useRef(false)

  useEffect(() => {
    // Fetch settings
    const fetchSettings = async () => {
      // 1. Try local storage first (Client overrides)
      try {
        const localSettings = localStorage.getItem('client_auto_logout_settings')
        if (localSettings) {
          const parsed = JSON.parse(localSettings)
          if (parsed && typeof parsed.enabled === 'boolean') {
             const minutes = parseInt(parsed.minutes || '30', 10)
             if (parsed.enabled && minutes > 0) {
               setTimeoutMinutes(minutes)
             } else {
               setTimeoutMinutes(0)
             }
             return // Stop here if local settings exist
          }
        }
      } catch (e) {
        console.error("Error reading local settings:", e)
      }

      // 2. Fallback to System Settings
      const result = await getSystemSettings()
      if (result.success && result.data) {
        const enabled = result.data['auto_logout_enabled'] === 'true'
        const minutes = parseInt(result.data['auto_logout_minutes'] || '30', 10)
        
        if (enabled && minutes > 0) {
          setTimeoutMinutes(minutes)
        } else {
          setTimeoutMinutes(0)
        }
      }
    }

    fetchSettings()

    // Listen for local storage changes to update immediately
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'client_auto_logout_settings') {
        fetchSettings()
      }
    }
    
    // Also listen for custom event for same-tab updates
    const handleLocalUpdate = () => {
        fetchSettings()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('client_settings_updated', handleLocalUpdate)
    
    return () => {
        window.removeEventListener('storage', handleStorageChange)
        window.removeEventListener('client_settings_updated', handleLocalUpdate)
    }
  }, [])

  useEffect(() => {
    if (timeoutMinutes <= 0) return

    const checkInactivity = () => {
      if (isLoggingOutRef.current) return

      const now = Date.now()
      const elapsed = now - lastActivityRef.current
      const timeoutMs = timeoutMinutes * 60 * 1000
      const warningMs = 30 * 1000 // 30 seconds warning

      const remaining = timeoutMs - elapsed

      if (remaining <= 0) {
        logout()
      } else if (remaining <= warningMs) {
        setIsWarning(true)
        setTimeLeft(Math.ceil(remaining / 1000))
      } else {
        if (isWarning) setIsWarning(false)
      }
    }

    const handleActivity = () => {
      // If warning is active, do NOT reset automatically on simple mouse movements
      // User must explicitly click "Continue Session" or click outside the modal (handled by onOpenChange)
      if (isWarning) return

      lastActivityRef.current = Date.now()
    }

    const logout = async () => {
      if (isLoggingOutRef.current) return
      isLoggingOutRef.current = true
      
      if (timerRef.current) clearInterval(timerRef.current)
      setIsWarning(false)
      toast.info("Oturumunuz zaman aşımına uğradı. Giriş sayfasına yönlendiriliyorsunuz.")
      
      // Force redirect after a short delay
      setTimeout(async () => {
        try {
          // Use window.location.origin to ensure we redirect to the current domain/port
          // regardless of server configuration
          const callbackUrl = `${window.location.origin}/auth/signin`
          await signOut({ callbackUrl, redirect: true })
        } catch (e) {
          // Fallback if signOut fails or takes too long
          window.location.href = '/auth/signin'
        }
      }, 1500)
    }

    // Check every 1 second to support countdown
    timerRef.current = setInterval(checkInactivity, 1000)

    // Listeners
    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('click', handleActivity)
    window.addEventListener('scroll', handleActivity)
    // Touch events for mobile
    window.addEventListener('touchstart', handleActivity)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('click', handleActivity)
      window.removeEventListener('scroll', handleActivity)
      window.removeEventListener('touchstart', handleActivity)
    }
  }, [timeoutMinutes, isWarning])

  const handleContinueSession = () => {
    lastActivityRef.current = Date.now()
    setIsWarning(false)
  }

  if (!isWarning) return null

  return (
    <Dialog open={isWarning} onOpenChange={(open) => !open && handleContinueSession()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-warning">
            <Clock className="h-5 w-5 text-orange-500" />
            Otomatik Çıkış Uyarısı
          </DialogTitle>
          <DialogDescription>
            Uzun süredir işlem yapmadığınız tespit edildi. Güvenliğiniz için oturumunuz kapatılacak.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <div className="text-4xl font-bold text-orange-600 tabular-nums">
            {timeLeft}
          </div>
          <p className="text-sm text-muted-foreground">
            saniye içinde çıkış yapılacak
          </p>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button variant="default" onClick={handleContinueSession} className="w-full sm:w-auto">
            Oturumu Devam Ettir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
