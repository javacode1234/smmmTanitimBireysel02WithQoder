import { NextResponse } from 'next/server'

// Mock data for circulars - in a real implementation, this would fetch from TÜRMOB website
const mockCirculars = [
  {
    id: "1",
    title: "KDV Tevkifat Uygulamalarında Değişiklik",
    date: "15.11.2025",
    url: "https://www.turmob.org.tr/sirkuler/detailPdf/1",
    summary: "KDV tevkifat uygulamalarında yeni düzenlemeler ve mükellef yükümlülükleri konusunda bilgilendirme",
    category: "KDV"
  },
  {
    id: "2",
    title: "e-Fatura Uygulamasında Yeni Gelişmeler",
    date: "10.11.2025",
    url: "https://www.turmob.org.tr/sirkuler/detailPdf/2",
    summary: "e-Fatura uygulamasında yapılan güncellemeler ve mükelleflere yönelik rehber",
    category: "e-Fatura"
  },
  {
    id: "3",
    title: "SGK Prim Bildiriminde Değişiklikler",
    date: "05.11.2025",
    url: "https://www.turmob.org.tr/sirkuler/detailPdf/3",
    summary: "SGK prim bildirimleri ve ek ödemeler konusunda yeni düzenlemeler",
    category: "SGK"
  },
  {
    id: "4",
    title: "Kurumlar Vergisi Beyannamesi Düzenlemeleri",
    date: "01.11.2025",
    url: "https://www.turmob.org.tr/sirkuler/detailPdf/4",
    summary: "Kurumlar vergisi beyannamesinde yapılacak değişiklikler ve dikkat edilmesi gereken hususlar",
    category: "Kurumlar Vergisi"
  },
  {
    id: "5",
    title: "Yolcu Taşımacılığında KDV İstisnaları",
    date: "28.10.2025",
    url: "https://www.turmob.org.tr/sirkuler/detailPdf/5",
    summary: "Yolcu taşımacılığı sektöründe uygulanan KDV istisnaları ve yeni düzenlemeler",
    category: "KDV"
  },
  {
    id: "6",
    title: "İşveren Sigorta Prim Teşvikleri",
    date: "25.10.2025",
    url: "https://www.turmob.org.tr/sirkuler/detailPdf/6",
    summary: "İşverenlere sağlanan sigorta prim teşvikleri ve başvuru koşulları",
    category: "SGK"
  }
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  let filteredCirculars = mockCirculars

  // Filter by category if provided
  if (category && category !== 'all') {
    filteredCirculars = filteredCirculars.filter(circular => 
      circular.category.toLowerCase() === category.toLowerCase()
    )
  }

  // Filter by search term if provided
  if (search) {
    filteredCirculars = filteredCirculars.filter(circular => 
      circular.title.toLowerCase().includes(search.toLowerCase()) ||
      circular.summary.toLowerCase().includes(search.toLowerCase())
    )
  }

  return NextResponse.json({
    circulars: filteredCirculars,
    total: filteredCirculars.length,
    categories: ['all', 'KDV', 'e-Fatura', 'SGK', 'Kurumlar Vergisi']
  })
}