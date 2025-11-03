"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, HelpCircle, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

type FAQCategory = "Tümü" | "Genel" | "Hizmetler" | "Ücretlendirme" | "İşlemler" | "Teknik"
type DateFilter = "Tümü" | "Son 7 Gün" | "Son 30 Gün" | "Son 3 Ay" | "Son 6 Ay"

const faqs = [
  {
    category: "Genel" as const,
    question: "SMMM (Serbest Muhasebeci Mali Müşavir) nedir?",
    answer: "SMMM, işletmelerin mali işlemlerini kaydetmek, raporlamak ve vergi mevzuatına uygun şekilde beyan etmek için yetkilendirilmiş profesyonellerdir. Meslek odalarına bağlı, sertifikalı ve deneyimli uzmanlarız.",
    date: new Date('2024-10-15')
  },
  {
    category: "Hizmetler" as const,
    question: "Hangi hizmetleri sunuyorsunuz?",
    answer: "Muhasebe ve finansal raporlama, vergi danışmanlığı ve planlaması, SGK ve bordro işlemleri, şirket kuruluşu, bağımsız denetim ve mali analiz gibi geniş kapsamlı hizmetler sunuyoruz.",
    date: new Date('2024-10-18')
  },
  {
    category: "Ücretlendirme" as const,
    question: "Ücretlendirme nasıl yapılıyor?",
    answer: "Fiyatlarımız işletmenizin büyüklüğüne, işlem hacmine ve ihtiyaç duyulan hizmetlere göre belirlenir. Başlangıç, Profesyonel ve Kurumsal olmak üzere 3 farklı paketimiz bulunmaktadır. Detaylı teklif için bizimle iletişime geçebilirsiniz.",
    date: new Date('2024-10-20')
  },
  {
    category: "İşlemler" as const,
    question: "Belge ve evrakları nasıl teslim edebilirim?",
    answer: "Belgelerinizi ofisimize fiziksel olarak getirebilir, kargo ile gönderebilir veya dijital platformumuz üzerinden güvenli şekilde yükleyebilirsiniz. E-dönüşüm entegrasyonumuz sayesinde birçok belge otomatik olarak sisteme aktarılır.",
    date: new Date('2024-10-21')
  },
  {
    category: "İşlemler" as const,
    question: "Ne kadar sürede işlemler tamamlanır?",
    answer: "Rutin muhasebe işlemleri ayda bir kez düzenli olarak yapılır. Vergi beyannameleri yasal sürelere uygun şekilde zamanında teslim edilir. Acil işlemler için aynı gün hizmet sağlayabiliyoruz.",
    date: new Date('2024-10-22')
  },
  {
    category: "Teknik" as const,
    question: "Gizlilik ve güvenlik nasıl sağlanıyor?",
    answer: "Tüm finansal verileriniz yasal gizlilik yükümlülüğümüz altında korunur. Dijital sistemlerimiz 256-bit SSL şifreleme ile güvence altındadır. KVKK ve veri koruma yasalarına tam uyum sağlıyoruz.",
    date: new Date('2024-10-23')
  },
  {
    category: "Teknik" as const,
    question: "Hangi kurumlarla entegrasyonunuz var?",
    answer: "GİB (Gelir İdaresi Başkanlığı), SGK, Ticaret Sicil, Gümrük ve diğer tüm resmi kurumlarla doğrudan entegrasyonumuz bulunmaktadır. E-fatura, e-defter, e-arşiv gibi tüm dijital platformları kullanıyoruz.",
    date: new Date('2024-10-24')
  },
  {
    category: "Hizmetler" as const,
    question: "Şirket kuruluşunda yardımcı olabiliir misiniz?",
    answer: "Evet, A'dan Z'ye şirket kuruluş sürecinde yanınızdayız. Şirket türü seçimi, ticaret sicil işlemleri, vergi kaydı, SGK bildirimleri ve tüm yasal prosedürler için profesyonel destek sağlıyoruz.",
    date: new Date('2024-10-25')
  },
  {
    category: "Genel" as const,
    question: "Destek hizmeti nasıl alınır?",
    answer: "Telefon, e-posta, WhatsApp veya ofisimize gelerek 7/24 bize ulaşabilirsiniz. Acil durumlar için özel destek hattımız mevcuttur. Danışman mali müşaviriniz size tahsis edilir ve her zaman ulaşılabilir olur.",
    date: new Date('2024-10-26')
  },
  {
    category: "Ücretlendirme" as const,
    question: "Sözleşme süresi ve iptal koşulları nelerdir?",
    answer: "Sözleşmelerimiz genellikle 1 yıllık olup, otomatik yenilenir. 30 gün önceden bildirimle istediğiniz zaman sözleşmeyi sonlandırabilirsiniz. Herhangi bir ceza veya ek ücret yoktur.",
    date: new Date('2024-10-28')
  }
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory>("Tümü")
  const [startDate, setStartDate] = useState<string>("")
  const [isVisible, setIsVisible] = useState(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    setIsVisible(true)

    return () => {
      isMountedRef.current = false
      setIsVisible(false)
    }
  }, [])

  const categories: FAQCategory[] = ["Tümü", "Genel", "Hizmetler", "Ücretlendirme", "İşlemler", "Teknik"]

  const filterByDate = (faq: typeof faqs[0]) => {
    if (!startDate) return true
    
    const selectedDate = new Date(startDate)
    const faqDate = faq.date
    
    // Başlangıç tarihinden bugüne kadar
    return faqDate >= selectedDate
  }

  const filteredFAQs = faqs
    .filter(faq => selectedCategory === "Tümü" || faq.category === selectedCategory)
    .filter(filterByDate)
    .sort((a, b) => b.date.getTime() - a.date.getTime()) // Yeniden eskiye sırala

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-12 px-4 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <HelpCircle className="h-8 w-8 text-blue-600" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Sıkça Sorulan Sorular
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Mali müşavirlik hizmetlerimiz hakkında merak ettikleriniz. 
            Sorunuzun cevabını bulamadıysanız, bize ulaşın.
          </p>
        </motion.div>
        )}

        {/* Category Filter */}
        {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-4 border-2 border-blue-100"
        >
          <h3 className="text-center text-sm font-semibold text-gray-700 mb-4">Kategori Seçin:</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => {
                  setSelectedCategory(category)
                  setOpenIndex(null)
                }}
                variant={selectedCategory === category ? "default" : "outline"}
                size="lg"
                className={`rounded-full transition-all font-medium px-6 ${
                  selectedCategory === category 
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg scale-105" 
                    : "hover:border-blue-400 hover:bg-blue-50"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </motion.div>
        )}

        {/* Date Filter */}
        {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 mb-8 border-2 border-green-200"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-green-600" />
            <h3 className="text-center text-sm font-semibold text-gray-700">Başlangıç Tarihi Seçin:</h3>
          </div>
          <div className="flex flex-col items-center gap-3">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                setOpenIndex(null)
              }}
              className="px-4 py-3 rounded-xl border-2 border-green-300 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all text-sm font-medium w-full max-w-xs"
              max={new Date().toISOString().split('T')[0]}
            />
            {startDate && (
              <Button
                onClick={() => {
                  setStartDate("")
                  setOpenIndex(null)
                }}
                variant="outline"
                size="sm"
                className="rounded-full border-green-400 text-green-700 hover:bg-green-50"
              >
                Filtreyi Temizle
              </Button>
            )}
            {startDate && (
              <p className="text-xs text-green-700 font-medium">
                {new Date(startDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })} 
                {' '} tarihinden bugüne kadar ({filteredFAQs.length} sonuç)
              </p>
            )}
          </div>
        </motion.div>
        )}

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <Card 
                className="overflow-hidden border-2 hover:border-blue-200 transition-all duration-300 cursor-pointer"
                onClick={() => toggleFAQ(index)}
              >
                <CardContent className="p-0">
                  {/* Question */}
                  <div className="flex items-center justify-between p-4 hover:bg-blue-50/50 transition-colors">
                    <div className="flex-1 pr-4">
                      <h3 className="font-semibold text-sm text-gray-900">
                        {faq.question}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Calendar className="h-3.5 w-3.5 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">
                          {faq.date.toLocaleDateString('tr-TR', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className={`h-5 w-5 ${openIndex === index ? 'text-blue-600' : 'text-gray-400'}`} />
                    </motion.div>
                  </div>

                  {/* Answer */}
                  {openIndex === index && isMountedRef.current && (
                    <div className="overflow-hidden">
                      <div className="px-4 pb-4 pt-0 border-t bg-blue-50/30">
                        <p className="text-xs text-gray-700 leading-relaxed pt-3">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 text-center bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white"
        >
          <h3 className="text-lg font-bold mb-2">
            Başka Sorularınız mı Var?
          </h3>
          <p className="text-blue-100 mb-4 text-sm">
            Uzman ekibimiz tüm sorularınızı yanıtlamak için hazır. 
            Hemen bizimle iletişime geçin.
          </p>
          <a
            href="#contact"
            className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg text-sm"
          >
            İletişime Geç
          </a>
        </motion.div>
        )}
      </div>
    </section>
  )
}
