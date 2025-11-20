"use client"

import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { InstitutionsSection } from "@/components/landing/institutions-section"
import { AboutSection } from "@/components/landing/about-section"
import { ServicesSection } from "@/components/landing/services-section"
import { WorkflowSection } from "@/components/landing/workflow-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { TeamSection } from "@/components/landing/team-section"
import { FAQSection } from "@/components/landing/faq-section"
import { ContactSection } from "@/components/landing/contact-section"
import { Footer } from "@/components/landing/footer"
import { ScrollToTop } from "@/components/scroll-to-top"
import { MevzuatSection } from "@/components/landing/mevzuat-section"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="bg-white">
        <HeroSection />
      </div>
      <div className="bg-gray-50">
        <InstitutionsSection />
      </div>
      <div className="bg-white">
        <AboutSection />
      </div>
      <div className="bg-gray-50">
        <ServicesSection />
      </div>
      <div className="bg-white">
        <WorkflowSection />
      </div>
      <div className="bg-gray-50">
        <PricingSection />
      </div>
      <div className="bg-white">
        <TestimonialsSection />
      </div>
      <div className="bg-gray-50">
        <TeamSection />
      </div>
      <div className="bg-white">
        <FAQSection />
      </div>
      <div className="bg-gray-50">
        <MevzuatSection />
      </div>
      <div className="bg-white">
        <ContactSection />
      </div>
      <Footer />
      <ScrollToTop />
    </main>
  )
}