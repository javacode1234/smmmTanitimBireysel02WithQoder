"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Linkedin, Mail, Phone, Briefcase, Facebook, Instagram } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { CareerModal } from "@/components/modals/career-modal"

interface TeamMember {
  id: string
  name: string
  position: string
  bio: string | null
  avatar: string | null
  initials: string
  color: string
  email: string | null
  phone: string | null
  linkedinUrl: string | null
  xUrl: string | null
  facebookUrl: string | null
  instagramUrl: string | null
  threadsUrl: string | null
  isActive: boolean
  order: number
}

interface SectionData {
  title: string
  paragraph: string
}

export function TeamSection() {
  const [careerModalOpen, setCareerModalOpen] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [sectionData, setSectionData] = useState<SectionData>({
    title: "Uzman Ekibimiz",
    paragraph: "Alanında uzman, deneyimli ve sertifikalı mali müşavirlerimiz ile işletmenizin mali süreçlerini güvenle yönetiyoruz."
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [membersRes, sectionRes] = await Promise.all([
        fetch('/api/content/team'),
        fetch('/api/content/team/section')
      ])

      if (membersRes.ok) {
        const members = await membersRes.json()
        // Only show active team members
        const activeMembers = (members || []).filter((m: TeamMember) => m.isActive === true)
        setTeamMembers(activeMembers)
      }

      if (sectionRes.ok) {
        const section = await sectionRes.json()
        if (section && section.id) {
          setSectionData({
            title: section.title || "Uzman Ekibimiz",
            paragraph: section.paragraph || "Alanında uzman, deneyimli ve sertifikalı mali müşavirlerimiz ile işletmenizin mali süreçlerini güvenle yönetiyoruz."
          })
        }
      }
    } catch (error) {
      console.error('Error fetching team data:', error)
    }
  }

  return (
    <section id="team" className="py-12 px-4 bg-gradient-to-b from-gray-50 to-white">
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

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 group">
                <CardContent className="pt-6 text-center">
                  {/* Avatar */}
                  <div className="mb-4 flex justify-center">
                    <Avatar className="h-24 w-24 ring-4 ring-gray-100 group-hover:ring-blue-200 transition-all">
                      {member.avatar ? (
                        <AvatarImage src={member.avatar} />
                      ) : null}
                      <AvatarFallback className={`bg-gradient-to-br ${member.color} text-white text-2xl font-bold`}>
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Name and Role */}
                  <h3 className="font-bold text-base mb-1 text-gray-900">{member.name}</h3>
                  <p className="text-[11px] text-blue-600 font-medium mb-3">{member.position}</p>
                  
                  {/* Description */}
                  {member.bio && (
                    <p className="text-[11px] text-muted-foreground mb-6 leading-relaxed">
                      {member.bio}
                    </p>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {member.email && (
                      <a 
                        href={`mailto:${member.email}`}
                        className="flex items-center justify-center gap-2 text-[11px] text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Mail className="h-3 w-3" />
                        <span>{member.email}</span>
                      </a>
                    )}
                    {member.phone && (
                      <a 
                        href={`tel:${member.phone}`}
                        className="flex items-center justify-center gap-2 text-[11px] text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Phone className="h-3 w-3" />
                        <span>{member.phone}</span>
                      </a>
                    )}
                  </div>

                  {/* Social Links */}
                  {(member.linkedinUrl || member.xUrl || member.facebookUrl || member.instagramUrl || member.threadsUrl) && (
                    <div className="flex justify-center gap-2 pt-4 border-t">
                      {member.linkedinUrl && (
                        <a
                          href={member.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-9 w-9 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors"
                        >
                          <Linkedin className="h-4 w-4 text-blue-600" />
                        </a>
                      )}
                      {member.xUrl && (
                        <a
                          href={member.xUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-9 w-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <svg className="h-4 w-4 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        </a>
                      )}
                      {member.facebookUrl && (
                        <a
                          href={member.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-9 w-9 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors"
                        >
                          <Facebook className="h-4 w-4 text-blue-700" />
                        </a>
                      )}
                      {member.instagramUrl && (
                        <a
                          href={member.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-9 w-9 rounded-lg bg-pink-50 hover:bg-pink-100 flex items-center justify-center transition-colors"
                        >
                          <Instagram className="h-4 w-4 text-pink-600" />
                        </a>
                      )}
                      {member.threadsUrl && (
                        <a
                          href={member.threadsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-9 w-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <Image src="/nsosyal.png" alt="Threads" width={16} height={16} className="object-contain" />
                        </a>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white"
        >
          <Briefcase className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-3">
            Ekibimize Katılmak İster misiniz?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Büyüyen ekibimize yeni yetenekler arıyoruz. Alanında uzman, 
            gelişime açık profesyoneller için kapımız her zaman açık.
          </p>
          <Button 
            size="lg"
            onClick={() => setCareerModalOpen(true)}
            className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg font-semibold"
          >
            <Briefcase className="mr-2 h-5 w-5" />
            Kariyer Fırsatlarını İncele
          </Button>
        </motion.div>
      </div>

      {/* Career Modal */}
      <CareerModal open={careerModalOpen} onOpenChange={setCareerModalOpen} />
    </section>
  )
}
