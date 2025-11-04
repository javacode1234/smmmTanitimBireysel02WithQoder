import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Default legal document contents
const DEFAULT_DOCUMENTS = {
  PRIVACY_POLICY: {
    title: "Gizlilik Politikası",
    content: `<h2>1. Giriş</h2>
<p>Bu Gizlilik Politikası, SMMM Mali Müşavirlik Hizmetleri ("Biz", "Bizim") olarak, müşterilerimizin ve web sitemizi ziyaret edenlerin kişisel verilerinin nasıl toplandığını, kullanıldığını, saklandığını ve korunduğunu açıklamaktadır.</p>

<h2>2. Toplanan Bilgiler</h2>
<ul>
<li>Kimlik bilgileri (ad, soyad, T.C. kimlik numarası)</li>
<li>İletişim bilgileri (e-posta adresi, telefon numarası, adres)</li>
<li>Finansal bilgiler (banka hesap bilgileri, vergi numarası)</li>
<li>Şirket bilgileri (unvan, faaliyet konusu, vergi dairesi)</li>
</ul>

<h2>3. Bilgilerin Kullanım Amaçları</h2>
<p>Topladığımız kişisel verilerinizi mali müşavirlik hizmetlerinin sağlanması, muhasebe ve vergi işlemlerinin yürütülmesi için kullanırız.</p>

<h2>4. Veri Güvenliği</h2>
<p>Kişisel verilerinizin güvenliğini sağlamak için endüstri standardı güvenlik önlemleri kullanıyoruz.</p>

<h2>5. İletişim</h2>
<p>E-posta: info@smmm.com<br>Telefon: +90 (212) 123 45 67</p>`
  },
  TERMS_OF_USE: {
    title: "Kullanım Koşulları",
    content: `<h2>1. Hizmet Kapsamı</h2>
<p>SMMM ofisimiz, mali müşavirlik, vergi danışmanlığı ve muhasebe hizmetleri sunmaktadır.</p>

<h2>2. Kullanıcı Yükümlülükleri</h2>
<ul>
<li>Doğru ve güncel bilgi sağlamak</li>
<li>Yasal düzenlemelere uymak</li>
<li>Ödeme yükümlülüklerini zamanında yerine getirmek</li>
</ul>

<h2>3. Hizmet Şartları</h2>
<p>Hizmetlerimiz, imzalanan sözleşme kapsamında sunulmaktadır. Sözleşme şartları her iki taraf için bağlayıcıdır.</p>

<h2>4. Sorumluluk Sınırlamaları</h2>
<p>Müşteri tarafından sağlanan bilgilerin doğruluğu müşterinin sorumluluğundadır.</p>

<h2>5. Fiyatlandırma</h2>
<p>Hizmet ücretleri sözleşmede belirtilen şekilde tahsil edilir.</p>`
  },
  KVKK: {
    title: "KVKK Aydınlatma Metni",
    content: `<h2>Kişisel Verilerin Korunması Hakkında Aydınlatma Metni</h2>

<h3>Veri Sorumlusu</h3>
<p>SMMM Mali Müşavirlik Hizmetleri olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca veri sorumlusuyuz.</p>

<h3>Kişisel Verilerin İşlenme Amacı</h3>
<ul>
<li>Mali müşavirlik hizmetlerinin sunulması</li>
<li>Yasal yükümlülüklerin yerine getirilmesi</li>
<li>Müşteri ilişkilerinin yönetimi</li>
</ul>

<h3>Kişisel Verilerin Aktarılması</h3>
<p>Kişisel verileriniz, yasal zorunluluklar çerçevesinde (Gelir İdaresi Başkanlığı, SGK vb.) resmi kurumlara aktarılabilir.</p>

<h3>Veri Saklama Süresi</h3>
<p>Verileriniz, Vergi Usul Kanunu gereği 10 yıl süreyle saklanır.</p>

<h3>Haklarınız</h3>
<p>KVKK'nın 11. maddesi kapsamında:</p>
<ul>
<li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
<li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
<li>Kişisel verilerinizin düzeltilmesini isteme</li>
<li>Kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
</ul>

<h3>Başvuru Yöntemi</h3>
<p>Haklarınızı kullanmak için info@smmm.com adresine yazılı başvuruda bulunabilirsiniz.</p>`
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'PRIVACY_POLICY' | 'TERMS_OF_USE' | 'KVKK' | null

    if (type) {
      // Get specific document
      const document = await prisma.legalDocument.findUnique({
        where: { type }
      })

      if (!document) {
        // Return default if not found
        const defaultDoc = DEFAULT_DOCUMENTS[type]
        return NextResponse.json({
          type,
          title: defaultDoc.title,
          content: defaultDoc.content,
          lastUpdated: new Date().toISOString()
        })
      }

      return NextResponse.json(document)
    } else {
      // Get all documents
      const documents = await prisma.legalDocument.findMany()
      
      // Create a map of existing documents
      const existingDocs: Record<string, any> = {}
      documents.forEach(doc => {
        existingDocs[doc.type] = doc
      })

      // Ensure all 3 document types are returned (existing or default)
      const allDocuments = [
        existingDocs['PRIVACY_POLICY'] || { type: 'PRIVACY_POLICY', ...DEFAULT_DOCUMENTS.PRIVACY_POLICY, lastUpdated: new Date() },
        existingDocs['TERMS_OF_USE'] || { type: 'TERMS_OF_USE', ...DEFAULT_DOCUMENTS.TERMS_OF_USE, lastUpdated: new Date() },
        existingDocs['KVKK'] || { type: 'KVKK', ...DEFAULT_DOCUMENTS.KVKK, lastUpdated: new Date() }
      ]

      return NextResponse.json(allDocuments)
    }
  } catch (error) {
    console.error('Error fetching legal documents:', error)
    return NextResponse.json(
      { error: 'Dökümanlar yüklenemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { type, title, content } = data

    if (!type || !title || !content) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      )
    }

    // Upsert document
    const document = await prisma.legalDocument.upsert({
      where: { type },
      update: {
        title,
        content,
        lastUpdated: new Date()
      },
      create: {
        type,
        title,
        content,
        lastUpdated: new Date()
      }
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error saving legal document:', error)
    return NextResponse.json(
      { error: 'Döküman kaydedilemedi' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'PRIVACY_POLICY' | 'TERMS_OF_USE' | 'KVKK'

    if (!type) {
      return NextResponse.json(
        { error: 'Döküman tipi gerekli' },
        { status: 400 }
      )
    }

    await prisma.legalDocument.delete({
      where: { type }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting legal document:', error)
    return NextResponse.json(
      { error: 'Döküman silinemedi' },
      { status: 500 }
    )
  }
}
