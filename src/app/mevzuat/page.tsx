"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Search, FileText, Calendar, BookOpen, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

interface Circular {
  id: string
  title: string
  date: string
  url: string
  summary: string
  category: string
}

export default function MevzuatPage() {
  const router = useRouter()
  const [circulars, setCirculars] = useState<Circular[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>(['all'])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchCirculars = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }
      if (searchTerm) {
        params.append('search', searchTerm)
      }
      const response = await fetch(`/api/mevzuat?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setCirculars(data.circulars)
        setCategories(data.categories)
      } else {
        toast.error("Mevzuat bilgileri yüklenirken bir hata oluştu")
      }
    } catch (error) {
      console.error("Error fetching circulars:", error)
      toast.error("Mevzuat bilgileri yüklenirken bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, searchTerm])

  useEffect(() => {
    fetchCirculars()
  }, [fetchCirculars])

  

  // Handle navigation with proper cleanup to prevent DOM errors
  const handleNavigation = (href: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
    }
    // Dispatch event to close any open dialogs across the app
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('close-all-dialogs'))
    }
    
    // Use setTimeout to ensure DOM cleanup before navigation
    setTimeout(() => {
      router.push(href)
    }, 80)
  }

  const openPdf = (url: string) => {
    window.open(url, '_blank')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCirculars()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => handleNavigation("/", e)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Ana Sayfaya Dön
          </Button>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Muhasebe ve Vergi Mevzuatı</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            TÜRMOB tarafından yayınlanan güncel sirküler ve mevzuat bilgileri
          </p>
        </div>

        <Card className="max-w-6xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Filtrele ve Ara
            </CardTitle>
            <CardDescription>
              Kategoriye göre filtreleyin veya anahtar kelime ile arama yapın
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Sirküler veya açıklama ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'Tüm Kategoriler' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full md:w-auto">
                <Search className="mr-2 h-4 w-4" />
                Ara
              </Button>
            </form>
          </CardContent>
        </Card>

        {loading ? (
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse space-y-6 w-full">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-gray-200"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            {circulars.length > 0 ? (
              circulars.map((circular) => (
                <Card 
                  key={circular.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openPdf(circular.url)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <FileText className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <h3 className="font-semibold text-lg">{circular.title}</h3>
                          <Badge variant="secondary" className="w-fit">
                            {circular.category}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mt-2">{circular.summary}</p>
                        <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{circular.date}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          PDF Aç
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Sonuç bulunamadı</h3>
                  <p className="text-muted-foreground">
                    Aramanızla eşleşen bir sirküler bulunamadı. Farklı bir kelime deneyin.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
