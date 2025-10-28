import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { ClientsSection } from "@/components/landing/clients-section"
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

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ClientsSection />
      <AboutSection />
      <ServicesSection />
      <WorkflowSection />
      <PricingSection />
      <TestimonialsSection />
      <TeamSection />
      <FAQSection />
      <ContactSection />
      <Footer />
      <ScrollToTop />
    </main>
  )
}
