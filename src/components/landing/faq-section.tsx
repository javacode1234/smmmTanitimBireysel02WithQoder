"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, HelpCircle, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FAQCategory {
  id: string
  name: string
  slug: string
  order: number
}

interface FAQ {
  id: string
  categoryId: string
  question: string
  answer: string
  isActive: boolean
  order: number
  createdAt: string
  category?: FAQCategory
}

interface SectionData {
  title: string
  paragraph: string
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all")
  const [startDate, setStartDate] = useState<string>("")
  const [categories, setCategories] = useState<FAQCategory[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [sectionData, setSectionData] = useState<SectionData>({
    title: "Sıkça Sorulan Sorular",
    paragraph: "Mali müşavirlik hizmetlerimiz hakkında merak ettikleriniz. Sorunuzun cevabını bulamadıysanız, bize ulaşın."
  })
  const [isVisible, setIsVisible] = useState(false)
  const isMountedRef = useRef(true)

  const fetchData = async () => {
    try {
      // Fetch categories, FAQs, and section data in parallel
      const [categoriesRes, faqsRes, sectionRes] = await Promise.all([
        fetch('/api/content/faq/categories'),
        fetch('/api/content/faq'),
        fetch('/api/content/faq/section')
      ])

      if (categoriesRes.ok) {
        const cats = await categoriesRes.json()
        setCategories(cats || [])
      }

      if (faqsRes.ok) {
        const faqsData = await faqsRes.json()
        // Only show active FAQs
        const activeFaqs = (faqsData || []).filter((f: FAQ) => f.isActive === true)
        setFaqs(activeFaqs)
      }

      if (sectionRes.ok) {
        const section = await sectionRes.json()
        if (section && section.id) {
          setSectionData({
            title: section.title || "Sıkça Sorulan Sorular",
            paragraph: section.paragraph || "Mali müşavirlik hizmetlerimiz hakkında merak ettikleriniz."
          })
        }
      }
    } catch (error) {
      console.error('Error fetching FAQ data:', error)
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    const visId = setTimeout(() => {
      setIsVisible(true)
    }, 0)
    const id = setTimeout(() => {
      fetchData()
    }, 0)

    return () => {
      isMountedRef.current = false
      setIsVisible(false)
      clearTimeout(id)
      clearTimeout(visId)
    }
  }, [])

  const filterByDate = (faq: FAQ) => {
    if (!startDate) return true
    
    const selectedDate = new Date(startDate)
    const faqDate = new Date(faq.createdAt)
    
    // Başlangıç tarihinden bugüne kadar
    return faqDate >= selectedDate
  }

  const filteredFAQs = faqs
    .filter(faq => selectedCategoryId === "all" || faq.categoryId === selectedCategoryId)
    .filter(filterByDate)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Yeniden eskiye sırala

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-12 px-4 bg-gradient-to-b from-rose-50 via-white to-pink-50">
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
            <HelpCircle className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
              {sectionData.title}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            {sectionData.paragraph}
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
          className="bg-white rounded-2xl shadow-lg p-6 mb-4 border-2 border-primary/20"
        >
          <h3 className="text-center text-sm font-semibold text-gray-700 mb-4">Kategori Seçin:</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              key="all"
              onClick={() => {
                setSelectedCategoryId("all")
                setOpenIndex(null)
              }}
              variant={selectedCategoryId === "all" ? "default" : "outline"}
              size="lg"
              className={`rounded-full transition-all font-medium px-6 ${
                selectedCategoryId === "all" 
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg scale-105" 
                  : "hover:border-primary hover:bg-primary/10"
              }`}
            >
              Tümü
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => {
                  setSelectedCategoryId(category.id)
                  setOpenIndex(null)
                }}
                variant={selectedCategoryId === category.id ? "default" : "outline"}
                size="lg"
                className={`rounded-full transition-all font-medium px-6 ${
                  selectedCategoryId === category.id 
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg scale-105" 
                    : "hover:border-primary hover:bg-primary/10"
                }`}
              >
                {category.name}
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
          className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl shadow-lg p-6 mb-8 border-2 border-violet-200"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
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
              className="px-4 py-3 rounded-xl border-2 border-violet-300 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 transition-all text-sm font-medium w-full max-w-xs"
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
                className="rounded-full border-violet-400 text-violet-700 hover:bg-violet-50"
              >
                Filtreyi Temizle
              </Button>
            )}
            {startDate && (
              <p className="text-xs text-violet-700 font-medium">
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
                className="overflow-hidden border-2 hover:border-primary/30 transition-all duration-300 cursor-pointer"
                onClick={() => toggleFAQ(index)}
              >
                <CardContent className="p-0">
                  {/* Question */}
                  <div className="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors">
                    <div className="flex-1 pr-4">
                      <h3 className="font-semibold text-sm text-gray-900">
                        {faq.question}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs text-primary font-medium">
                          {new Date(faq.createdAt).toLocaleDateString('tr-TR', { 
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
                      <ChevronDown className={`h-5 w-5 ${openIndex === index ? 'text-primary' : 'text-gray-400'}`} />
                    </motion.div>
                  </div>

                  {/* Answer */}
                  {openIndex === index && (
                    <div className="overflow-hidden">
                      <div className="px-4 pb-4 pt-0 border-t bg-primary/5">
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
          className="mt-10 text-center bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-6 text-white"
        >
          <h3 className="text-lg font-bold mb-2">
            Başka Sorularınız mı Var?
          </h3>
          <p className="text-violet-100 mb-4 text-sm">
            Uzman ekibimiz tüm sorularınızı yanıtlamak için hazır. 
            Hemen bizimle iletişime geçin.
          </p>
          <a
            href="#contact"
            className="inline-block bg-white text-primary px-6 py-2 rounded-lg font-semibold hover:bg-primary/10 transition-colors shadow-lg text-sm"
          >
            İletişime Geç
          </a>
        </motion.div>
        )}
      </div>
    </section>
  )
}
