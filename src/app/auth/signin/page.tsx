"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Lock, Eye, EyeOff } from "lucide-react"

// Random landscape images from around the world
const backgroundImages = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070", // Mountains Norway
  "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?q=80&w=2070", // Beach Thailand
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2074", // Forest
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070", // Northern Lights
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070", // Sunset Mountains
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070", // Desert
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070", // Mountain Lake
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2070", // Ocean Sunset
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071", // Green Forest
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2074", // Lake Mountains
]

type UserType = "admin" | "client"

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState("")
  const [activeTab, setActiveTab] = useState<UserType>("admin")
  const [isChangingTab, setIsChangingTab] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const router = useRouter()

  const handleGoHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isNavigating) {
      e.preventDefault()
      return
    }
    
    e.preventDefault()
    setIsNavigating(true)
    
    // Add delay to ensure any Tabs animations complete
    setTimeout(() => {
      router.push('/')
    }, 100)
  }

  const handleTabChange = (value: string) => {
    if (isChangingTab) return
    
    setIsChangingTab(true)
    setShowPassword(false) // Reset password visibility when switching tabs
    
    setTimeout(() => {
      setActiveTab(value as UserType)
      setTimeout(() => {
        setIsChangingTab(false)
      }, 50)
    }, 50)
  }

  // Set random background image on component mount
  useEffect(() => {
    const randomImage = backgroundImages[Math.floor(Math.random() * backgroundImages.length)]
    setBackgroundImage(randomImage)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, userType: UserType) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      // TODO: Implement actual sign in logic with NextAuth
      // For now, simulate login
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success("Giriş başarılı!")
      
      // Add small delay before navigation to allow toast to show
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Mock login based on user type using Next.js router for consistent navigation
      if (userType === "admin") {
        router.push("/admin")
      } else {
        router.push("/client")
      }
    } catch (error) {
      toast.error("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.")
      setIsLoading(false)
    }
  }

  const renderLoginForm = (userType: UserType) => {
    const credentials = userType === "admin" 
      ? { email: "admin@smmm.com", password: "admin123" }
      : { email: "mukellef@example.com", password: "mukellef123" }

    return (
      <form onSubmit={(e) => handleSubmit(e, userType)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`email-${userType}`} className="text-white font-semibold">
            E-posta
          </Label>
          <Input
            id={`email-${userType}`}
            name="email"
            type="email"
            placeholder="ornek@mail.com"
            required
            disabled={isLoading}
            className="bg-white/5 border-white/30 text-white placeholder:text-white/60 backdrop-blur-sm focus:bg-white/15"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`password-${userType}`} className="text-white font-semibold">
            Şifre
          </Label>
          <div className="relative">
            <Input
              id={`password-${userType}`}
              name="password"
              type={showPassword ? "text" : "password"}
              required
              disabled={isLoading}
              className="bg-white/5 border-white/30 text-white placeholder:text-white/60 backdrop-blur-sm focus:bg-white/15 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              toast.info("Şifre sıfırlama özelliği yakında eklenecek")
            }}
            className="text-sm text-white/90 hover:text-white hover:underline"
          >
            Şifremi unuttum
          </button>
        </div>
        <Button type="submit" className="w-full bg-white text-primary hover:bg-white/90" disabled={isLoading}>
          {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Button>
        
        {/* Development Credentials */}
        <div className="mt-4 p-3 bg-black/30 rounded-lg border border-white/20">
          <p className="text-xs text-white/80 font-semibold mb-2">🔧 Geliştirme Bilgileri:</p>
          <div className="space-y-1 text-xs text-white/90">
            <p><span className="font-semibold">E-posta:</span> {credentials.email}</p>
            <p><span className="font-semibold">Şifre:</span> {credentials.password}</p>
          </div>
        </div>
      </form>
    )
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      
      <Card className="w-full max-w-md relative z-10 bg-gradient-to-br from-primary/25 to-primary/15 backdrop-blur-md border-white/20 shadow-2xl">
        <CardHeader className="space-y-4 pb-4">
          {/* Lock Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">SMMM Sistemi</h1>
            <p className="text-white/90 text-sm mt-1">Hesabınıza giriş yapın</p>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5 backdrop-blur-sm">
              <TabsTrigger 
                value="admin" 
                className="data-[state=active]:bg-white data-[state=active]:text-primary text-white font-semibold"
              >
                SMMM Girişi
              </TabsTrigger>
              <TabsTrigger 
                value="client"
                className="data-[state=active]:bg-white data-[state=active]:text-primary text-white font-semibold"
              >
                Mükellef Girişi
              </TabsTrigger>
            </TabsList>
            <TabsContent value="admin">
              {renderLoginForm("admin")}
            </TabsContent>
            <TabsContent value="client">
              {renderLoginForm("client")}
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm">
            <Link 
              href="/" 
              onClick={handleGoHome}
              className="text-white/90 hover:text-white hover:underline inline-flex items-center gap-1"
            >
              ← Ana sayfaya dön
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}