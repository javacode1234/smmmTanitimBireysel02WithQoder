"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, FileText, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

interface Circular {
  id: string
  title: string
  date: string
  url: string
  summary: string
  category: string
  content: string
}

const MOCK_CIRCULARS: Circular[] = [
  {
    id: "1",
    title: "KDV Tevkifat Uygulamalarında Değişiklik",
    date: "15.11.2025",
    url: "https://www.turmob.org.tr/sirkuler/detailPdf/1",
    summary: "KDV tevkifat uygulamalarında yeni düzenlemeler ve mükellef yükümlülükleri konusunda bilgilendirme",
    category: "KDV",
    content: `KDV TEVKİFAT UYGULAMALARINDA DEĞİŞİKLİK

Sayın Meslektaşımız,

Gelir İdaresi Başkanlığı tarafından 15.11.2025 tarihinde yayımlanan tebliğ ile KDV tevkifat uygulamalarında bazı değişiklikler yapılmıştır.

1. Tevkifat Oranları
Yeni düzenleme ile bazı hizmetlerde tevkifat oranları %10'dan %15'e yükseltilmiştir. Bu değişiklik özellikle danışmanlık hizmetlerini kapsamaktadır.

2. Mükellef Yükümlülükleri
Tevkifat uygulayan mükellefler artık elektronik fatura üzerinden tevkifat bilgilerini gerçek zamanlı olarak bildirmek zorundadır.

3. Geçiş Süresi
Mevcut uygulamadan yeni uygulamaya geçiş için 3 aylık geçiş süresi tanınmıştır. Bu süre sonunda tüm mükellefler yeni sisteme geçmek zorundadır.

4. Cezai yaptırımlar
Geçiş süresi sonunda yeni sisteme geçmeyen mükelleflere %10 oranında idari para cezası uygulanacaktır.

Detaylı bilgi için resmi tebliğe başvurmanızı öneririz.`
  },
  {
    id: "2",
    title: "e-Fatura Uygulamasında Yeni Gelişmeler",
    date: "10.11.2025",
    url: "https://www.turmob.org.tr/sirkuler/detailPdf/2",
    summary: "e-Fatura uygulamasında yapılan güncellemeler ve mükelleflere yönelik rehber",
    category: "e-Fatura",
    content: `E- FATURA UYGULAMASINDA YENİ GELİŞMELER

Sayın Meslektaşımız,

e-Fatura uygulamasında 10.11.2025 tarihinden itibaren geçerli olacak yeni düzenlemeler hakkında bilgilendirme sunarız.

1. Yeni Portal Arayüzü
e-Fatura portalının kullanıcı arayüzü yenilenmiştir. Daha kullanıcı dostu ve hızlı bir deneyim sunulmaktadır.

2. Mobil Uygulama
e-Fatura mobil uygulaması iOS ve Android platformlarında yayınlanmıştır. Mükellefler artık mobil cihazlarından e-fatura işlemlerini gerçekleştirebileceklerdir.

3. Otomatik Bildirim Sistemi
Yeni sistemde mükelleflere otomatik bildirimler gönderilecektir. Fatura durum değişikliklerinde, sistem bakımlarında ve diğer önemli gelişmelerde kullanıcılar bilgilendirilecektir.

4. Güvenlik Geliştirmeleri
e-Fatura sistemine yeni güvenlik önlemleri eklenmiştir. İki faktörlü kimlik doğrulama zorunlu hale getirilmiştir.

5. Teknik Destek
Yeni destek sistemi ile 7/24 teknik destek sağlanmaktadır. Kullanıcılar artık daha hızlı çözüm bulabileceklerdir.`
  },
  {
    id: "3",
    title: "SGK Prim Bildiriminde Değişiklikler",
    date: "05.11.2025",
    url: "https://www.turmob.org.tr/sirkuler/detailPdf/3",
    summary: "SGK prim bildirimleri ve ek ödemeler konusunda yeni düzenlemeler",
    category: "SGK",
    content: `SGK PRİM BİLDİRİMİNDE DEĞİŞİKLİKLER

Sayın Meslektaşımız,

Sosyal Güvenlik Kurumu tarafından 05.11.2025 tarihinde yayımlanan genelge ile SGK prim bildirimlerinde bazı değişiklikler yapılmıştır.

1. Bildirim Süreleri
Aylık prim ve hizmet belgelerinin bildirim süresi 15 iş gününe indirilmiştir. Önceki uygulamada bu süre 20 iş günü idi.

2. Ek Ödemeler
Ek ödeme yapılan işverenler artık ek ödeme bildirimlerini ayrı bir form ile yapmak zorundadır. Önceki uygulamada ek ödemeler ana bildirime dahil edilebiliyordu.

3. Elektronik Tebligat
SGK tarafından yapılan tebligatlar artık elektronik ortamda yapılacaktır. Kağıt ortamında tebligat yapılmayacaktır.

4. Cezai Yükselmeler
Gecikmiş bildirimler için cezalar artırılmıştır. İlk ay %5, ikinci ay %10, üçüncü ay ve sonrasında %15 oranında idari para cezası uygulanacaktır.

5. İstisnalar
65 yaş üstü emekliler için prim bildirimi istisnası devam etmektedir. Ancak bu istisnadan yararlanmak için ek belge sunulması gerekmektedir.`
  },
  {
    id: "4",
    title: "Kurumlar Vergisi Beyannamesi Düzenlemeleri",
    date: "01.11.2025",
    url: "https://www.turmob.org.tr/sirkuler/detailPdf/4",
    summary: "Kurumlar vergisi beyannamesinde yapılacak değişiklikler ve dikkat edilmesi gereken hususlar",
    category: "Kurumlar Vergisi",
    content: `KURUMLAR VERGİSİ BEYANNAMESİ DÜZENLEMELERİ

Sayın Meslektaşımız,

Maliye Bakanlığı tarafından 01.11.2025 tarihinde yayımlanan tebliğ ile Kurumlar Vergisi Beyannamesi düzenlemeleri hakkında bilgilendirme sunarız.

1. Yeni Form Yapısı
Kurumlar vergisi beyannamesi formu yeniden yapılandırılmıştır. Daha sade ve anlaşılır bir form hazırlanmıştır.

2. Dipnotlar ve Açıklamalar
Beyannameye eklenmesi zorunlu dipnotlar ve açıklamalar listesi güncellenmiştir. Tüm mükellefler yeni dipnotları beyannamelerine eklemek zorundadır.

3. Elektronik Beyanname
Kurumlar vergisi beyannamesinin elektronik olarak verilmesi zorunlu hale getirilmiştir. Kağıt ortamda beyanname verilemeyecektir.

4. Geçiş Dönemi
Mevcut uygulamadan yeni uygulamaya geçiş için 2 aylık geçiş süresi tanınmıştır. Bu süre sonunda tüm mükellefler yeni formata geçmek zorundadır.

5. Denetim Artışı
Yeni dönemde kurumlar vergisi denetimlerinde artış beklenmektedir. Mükellefler beyannamelerini daha dikkatli hazırlamalıdır.`
  },
  {
    id: "5",
    title: "Yolcu Taşımacılığında KDV İstisnaları",
    date: "28.10.2025",
    url: "https://www.turmob.org.tr/sirkuler/detailPdf/5",
    summary: "Yolcu taşımacılığı sektöründe uygulanan KDV istisnaları ve yeni düzenlemeler",
    category: "KDV",
    content: `YOLCU TAŞIMACILIĞINDA KDV İSTİSNALARI

Sayın Meslektaşımız,

Gelir İdaresi Başkanlığı tarafından 28.10.2025 tarihinde yayımlanan genelge ile yolcu taşımacılığı sektöründe KDV istisnaları konusunda düzenlemeler yapılmıştır.

1. Kapsam Genişlemesi
Yeni düzenleme ile şehirlerarası otobüs taşımacılığı da KDV istisnası kapsamına alınmıştır. Önceki uygulamada sadece şehiriçi toplu taşıma istisnadan yararlanabiliyordu.

2. İstisna Oranları
Yolcu taşımacılığı hizmetlerinde KDV oranı %18'den %0'a düşürülmüştür. Bu oran tüm yolcu taşımacılığı hizmetleri için geçerlidir.

3. Kayıt Yükümlülükleri
İstisnadan yararlanan mükellefler özel defter tutmak zorundadır. Bu defterde yapılan tüm yolcu taşımacılığı hizmetleri detaylı olarak kaydedilmelidir.

4. Raporlama Yükümlülükleri
Aylık olarak istisna uygulamasından yararlanılan hizmetler hakkında rapor sunulması gerekmektedir.

5. Geçiş Süresi
Mevcut sözleşmelerde 6 aylık geçiş süresi tanınmıştır. Yeni sözleşmeler bu düzenlemeden derhal etkilenmektedir.`
  }
]

export default function CircularPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [circular, setCircular] = useState<Circular | null>(null)
  const [loading, setLoading] = useState(true)
  

  const fetchCircular = useCallback(() => {
    setLoading(true)
    try {
      setTimeout(() => {
        if (typeof params === 'object' && params !== null && 'id' in params) {
          const foundCircular = MOCK_CIRCULARS.find(c => c.id === params.id)
          if (foundCircular) {
            setCircular(foundCircular)
          } else {
            toast.error("Sirküler bulunamadı")
          }
        } else {
          Promise.resolve(params).then((resolvedParams) => {
            const foundCircular = MOCK_CIRCULARS.find(c => c.id === resolvedParams.id)
            if (foundCircular) {
              setCircular(foundCircular)
            } else {
              toast.error("Sirküler bulunamadı")
            }
          }).catch(() => {
            toast.error("Sirküler yüklenirken bir hata oluştu")
          })
        }
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error("Error fetching circular:", error)
      toast.error("Sirküler yüklenirken bir hata oluştu")
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    const t = setTimeout(() => {
      fetchCircular()
    }, 0)
    return () => clearTimeout(t)
  }, [fetchCircular])

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

  const openPdf = () => {
    if (circular?.url) {
      window.open(circular.url, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse space-y-6 w-full">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!circular) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Sirküler bulunamadı</h3>
              <p className="text-muted-foreground mb-4">
                İlgili sirküler bulunamadı. Lütfen daha sonra tekrar deneyin.
              </p>
              <Button onClick={(e) => handleNavigation("/mevzuat", e)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Geri Dön
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={(e) => handleNavigation("/mevzuat", e)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri Dön
        </Button>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">{circular.title}</CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {circular.date}
                  </span>
                  <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm">
                    {circular.category}
                  </span>
                </CardDescription>
              </div>
              <Button onClick={openPdf}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Resmi PDF&#39;i Aç
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-muted-foreground mb-6">{circular.summary}</p>
              <div className="whitespace-pre-line">
                {circular.content}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
