"use client"

"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

interface Testimonial {
  id: string
  name: string
  position: string
  company: string | null
  content: string
  avatar: string | null
  initials: string
  color: string
  rating: number
  isActive: boolean
  order: number
}

interface SectionData {
  title: string
  paragraph: string
}

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [sectionData, setSectionData] = useState<SectionData>({
    title: "Müşterilerimiz Ne Diyor?",
    paragraph: "500'den fazla mutlu müşterimizin deneyimleri. Güven ve memnuniyet odaklı hizmet anlayışımızın en büyük kanıtı."
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [testimonialsRes, sectionRes] = await Promise.all([
        fetch('/api/content/testimonials'),
        fetch('/api/content/testimonials/section')
      ])

      if (testimonialsRes.ok) {
        const data = await testimonialsRes.json()
        // Only show active testimonials
        const activeTestimonials = (data || []).filter((t: Testimonial) => t.isActive === true)
        setTestimonials(activeTestimonials)
      }

      if (sectionRes.ok) {
        const section = await sectionRes.json()
        if (section && section.id) {
          setSectionData({
            title: section.title || "Müşterilerimiz Ne Diyor?",
            paragraph: section.paragraph || "500'den fazla mutlu müşterimizin deneyimleri."
          })
        }
      }
    } catch (error) {
      console.error('Error fetching testimonials data:', error)
    }
  }

  useEffect(() => {
    if (isPaused || testimonials.length === 0) return

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isPaused, testimonials.length])

  const goToSlide = (index: number) => {
    setActiveIndex(index)
  }

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: any) => {
    const threshold = 50
    if (info.offset.x > threshold) {
      prevSlide()
    } else if (info.offset.x < -threshold) {
      nextSlide()
    }
  }

  if (testimonials.length === 0) {
    return null // Don't show section if no active testimonials
  }

  return (
    <section id="testimonials" className="py-12 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {sectionData.title}
          </h2>
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
            {sectionData.paragraph}
          </p>
        </motion.div>

        {/* Carousel - Single Card with Navigation */}
        <div className="relative max-w-3xl mx-auto mb-8">
          {/* Left Arrow */}
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-16 z-20 h-12 w-12 rounded-full bg-red-600 border-2 border-red-600 shadow-xl hover:bg-red-700 hover:border-red-700 hover:scale-110 transition-all duration-300"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </Button>

          {/* Right Arrow */}
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-16 z-20 h-12 w-12 rounded-full bg-red-600 border-2 border-red-600 shadow-xl hover:bg-red-700 hover:border-red-700 hover:scale-110 transition-all duration-300"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </Button>

          {/* Sliding Cards Container */}
          <div className="overflow-hidden">
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="cursor-grab active:cursor-grabbing"
            >
              <div 
                className="flex transition-transform duration-[3000ms] ease-in-out"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
            {testimonials.map((testimonial, index) => (
              <div key={index} className="w-full flex-shrink-0">
                <Card className="hover:shadow-2xl transition-all duration-300 border-2 rounded-full overflow-hidden">
                  <CardContent className="pt-8 pb-8 px-12 text-center">
                    {/* Quote Icon */}
                    <div className="mb-4 flex justify-center">
                      <Quote className="h-10 w-10 text-blue-600 opacity-20" />
                    </div>

                    {/* Rating */}
                    <div className="flex gap-1 mb-4 justify-center">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-gray-700 mb-6 leading-relaxed italic text-base">
                      "{testimonial.content}"
                    </p>

                    {/* Author Info */}
                    <div className="flex items-center gap-4 justify-center">
                      <Avatar className="h-14 w-14">
                        {testimonial.avatar ? (
                          <AvatarImage src={testimonial.avatar} />
                        ) : null}
                        <AvatarFallback className={`bg-gradient-to-br ${testimonial.color} text-white font-semibold`}>
                          {testimonial.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.position}</div>
                        {testimonial.company && (
                          <div className="text-sm text-blue-600">{testimonial.company}</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
            </motion.div>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeIndex ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-sm text-muted-foreground">Mutlu Müşteri</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">%99</div>
            <div className="text-sm text-muted-foreground">Memnuniyet Oranı</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">15+</div>
            <div className="text-sm text-muted-foreground">Yıllık Deneyim</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Destek Hizmeti</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
