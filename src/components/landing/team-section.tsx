"use client"

"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Linkedin, Mail, Phone, Facebook, Twitter, Instagram, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { CareerModal } from "@/components/modals/career-modal"

const team = [
  {
    name: "Muammer Uzun",
    role: "Kurucu Ortak & Baş Mali Müşavir",
    image: "",
    initials: "MU",
    description: "20 yıllık deneyimi ile ekibimize liderlik ediyor. TÜRMOB üyesi, YMM.",
    email: "muammer@smmm.com",
    phone: "+90 532 123 45 67",
    linkedin: "#",
    twitter: "#",
    facebook: "#",
    instagram: "#",
    color: "from-blue-600 to-cyan-600"
  },
  {
    name: "Ayşe Demir",
    role: "Kıdemli Mali Müşavir",
    image: "",
    initials: "AD",
    description: "Kurumsal şirketler ve holding muhasebesi konusunda uzman. 15 yıl deneyim.",
    email: "ayse@smmm.com",
    phone: "+90 532 234 56 78",
    linkedin: "#",
    twitter: "#",
    facebook: "#",
    instagram: "#",
    color: "from-purple-600 to-purple-700"
  },
  {
    name: "Mehmet Yılmaz",
    role: "Vergi Uzmanı",
    image: "",
    initials: "MY",
    description: "Vergi danışmanlığı ve optimizasyon konularında uzman. 12 yıl deneyim.",
    email: "mehmet@smmm.com",
    phone: "+90 532 345 67 89",
    linkedin: "#",
    twitter: "#",
    facebook: "#",
    instagram: "#",
    color: "from-green-600 to-green-700"
  },
  {
    name: "Zeynep Kaya",
    role: "Denetim Müdürü",
    image: "",
    initials: "ZK",
    description: "Bağımsız denetim ve iç kontrol sistemleri konusunda uzman. 10 yıl deneyim.",
    email: "zeynep@smmm.com",
    phone: "+90 532 456 78 90",
    linkedin: "#",
    twitter: "#",
    facebook: "#",
    instagram: "#",
    color: "from-orange-600 to-orange-700"
  },
  {
    name: "Can Öztürk",
    role: "Bordro ve SGK Uzmanı",
    image: "",
    initials: "CÖ",
    description: "İnsan kaynakları ve SGK işlemleri konusunda uzman. 8 yıl deneyim.",
    email: "can@smmm.com",
    phone: "+90 532 567 89 01",
    linkedin: "#",
    twitter: "#",
    facebook: "#",
    instagram: "#",
    color: "from-red-600 to-red-700"
  },
  {
    name: "Elif Şahin",
    role: "Dijital Dönüşüm Uzmanı",
    image: "",
    initials: "EŞ",
    description: "E-dönüşüm ve dijital muhasebe sistemleri konusunda uzman. 6 yıl deneyim.",
    email: "elif@smmm.com",
    phone: "+90 532 678 90 12",
    linkedin: "#",
    twitter: "#",
    facebook: "#",
    instagram: "#",
    color: "from-cyan-600 to-cyan-700"
  }
]

export function TeamSection() {
  const [careerModalOpen, setCareerModalOpen] = useState(false)

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
            Uzman Ekibimiz
          </h2>
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
            Alanında uzman, deneyimli ve sertifikalı mali müşavirlerimiz ile işletmenizin 
            mali süreçlerini güvenle yönetiyoruz.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {team.map((member, index) => (
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
                      <AvatarImage src={member.image} />
                      <AvatarFallback className={`bg-gradient-to-br ${member.color} text-white text-2xl font-bold`}>
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Name and Role */}
                  <h3 className="font-bold text-base mb-1 text-gray-900">{member.name}</h3>
                  <p className="text-[11px] text-blue-600 font-medium mb-3">{member.role}</p>
                  
                  {/* Description */}
                  <p className="text-[11px] text-muted-foreground mb-6 leading-relaxed">
                    {member.description}
                  </p>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <a 
                      href={`mailto:${member.email}`}
                      className="flex items-center justify-center gap-2 text-[11px] text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Mail className="h-3 w-3" />
                      <span>{member.email}</span>
                    </a>
                    <a 
                      href={`tel:${member.phone}`}
                      className="flex items-center justify-center gap-2 text-[11px] text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Phone className="h-3 w-3" />
                      <span>{member.phone}</span>
                    </a>
                  </div>

                  {/* Social Links */}
                  <div className="flex justify-center gap-2 pt-4 border-t">
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 w-9 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors"
                    >
                      <Linkedin className="h-4 w-4 text-blue-600" />
                    </a>
                    <a
                      href={member.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 w-9 rounded-lg bg-sky-50 hover:bg-sky-100 flex items-center justify-center transition-colors"
                    >
                      <Twitter className="h-4 w-4 text-sky-600" />
                    </a>
                    <a
                      href={member.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 w-9 rounded-lg bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center transition-colors"
                    >
                      <Facebook className="h-4 w-4 text-indigo-600" />
                    </a>
                    <a
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 w-9 rounded-lg bg-pink-50 hover:bg-pink-100 flex items-center justify-center transition-colors"
                    >
                      <Instagram className="h-4 w-4 text-pink-600" />
                    </a>
                  </div>
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
