"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Plus,
  Trash2,
  Save,
  Search,
  Edit3,
  Check,
  X as XIcon,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Loader2,
  Mail,
  Phone,
  Linkedin,
  Facebook,
  Instagram
} from "lucide-react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

// Color gradients
const COLOR_GRADIENTS = [
  { value: "from-blue-600 to-cyan-600", label: "Mavi-Camgöbeği", preview: "bg-gradient-to-r from-blue-600 to-cyan-600" },
  { value: "from-purple-600 to-purple-700", label: "Mor", preview: "bg-gradient-to-r from-purple-600 to-purple-700" },
  { value: "from-green-600 to-green-700", label: "Yeşil", preview: "bg-gradient-to-r from-green-600 to-green-700" },
  { value: "from-orange-600 to-orange-700", label: "Turuncu", preview: "bg-gradient-to-r from-orange-600 to-orange-700" },
  { value: "from-red-600 to-red-700", label: "Kırmızı", preview: "bg-gradient-to-r from-red-600 to-red-700" },
  { value: "from-cyan-600 to-cyan-700", label: "Camgöbeği", preview: "bg-gradient-to-r from-cyan-600 to-cyan-700" },
]

interface TeamMember {
  id: string
  name: string
  position: string
  bio: string
  avatar: string
  initials: string
  color: string
  email: string
  phone: string
  linkedinUrl: string
  xUrl: string
  facebookUrl: string
  instagramUrl: string
  threadsUrl: string
  isActive: boolean
  order: number
}

const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "default-1",
    name: "Muammer Uzun",
    position: "Kurucu Ortak & Baş Mali Müşavir",
    bio: "20 yıllık deneyimi ile ekibimize liderlik ediyor. TÜRMOB üyesi, YMM.",
    avatar: "",
    initials: "MU",
    color: "from-blue-600 to-cyan-600",
    email: "muammer@smmm.com",
    phone: "+90 532 123 45 67",
    linkedinUrl: "#",
    xUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    threadsUrl: "",
    isActive: true,
    order: 0
  },
  {
    id: "default-2",
    name: "Ayşe Demir",
    position: "Kıdemli Mali Müşavir",
    bio: "Kurumsal şirketler ve holding muhasebesi konusunda uzman. 15 yıl deneyim.",
    avatar: "",
    initials: "AD",
    color: "from-purple-600 to-purple-700",
    email: "ayse@smmm.com",
    phone: "+90 532 234 56 78",
    linkedinUrl: "#",
    xUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    threadsUrl: "",
    isActive: true,
    order: 1
  },
  {
    id: "default-3",
    name: "Mehmet Yılmaz",
    position: "Vergi Uzmanı",
    bio: "Vergi danışmanlığı ve optimizasyon konularında uzman. 12 yıl deneyim.",
    avatar: "",
    initials: "MY",
    color: "from-green-600 to-green-700",
    email: "mehmet@smmm.com",
    phone: "+90 532 345 67 89",
    linkedinUrl: "#",
    xUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    threadsUrl: "",
    isActive: true,
    order: 2
  },
  {
    id: "default-4",
    name: "Zeynep Kaya",
    position: "Denetim Müdürü",
    bio: "Bağımsız denetim ve iç kontrol sistemleri konusunda uzman. 10 yıl deneyim.",
    avatar: "",
    initials: "ZK",
    color: "from-orange-600 to-orange-700",
    email: "zeynep@smmm.com",
    phone: "+90 532 456 78 90",
    linkedinUrl: "#",
    xUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    threadsUrl: "",
    isActive: true,
    order: 3
  },
  {
    id: "default-5",
    name: "Can Öztürk",
    position: "Bordro ve SGK Uzmanı",
    bio: "İnsan kaynakları ve SGK işlemleri konusunda uzman. 8 yıl deneyim.",
    avatar: "",
    initials: "CÖ",
    color: "from-red-600 to-red-700",
    email: "can@smmm.com",
    phone: "+90 532 567 89 01",
    linkedinUrl: "#",
    xUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    threadsUrl: "",
    isActive: true,
    order: 4
  },
  {
    id: "default-6",
    name: "Elif Şahin",
    position: "Dijital Dönüşüm Uzmanı",
    bio: "E-dönüşüm ve dijital muhasebe sistemleri konusunda uzman. 6 yıl deneyim.",
    avatar: "",
    initials: "EŞ",
    color: "from-cyan-600 to-cyan-700",
    email: "elif@smmm.com",
    phone: "+90 532 678 90 12",
    linkedinUrl: "#",
    xUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    threadsUrl: "",
    isActive: true,
    order: 5
  }
]

const DEFAULT_SECTION_DATA = {
  title: "Uzman Ekibimiz",
  paragraph: "Alanında uzman, deneyimli ve sertifikalı mali müşavirlerimiz ile işletmenizin mali süreçlerini güvenle yönetiyoruz."
}

export function TeamTab() {
  const [members, setMembers] = useState<TeamMember[]>(DEFAULT_TEAM_MEMBERS)
  const [sectionData, setSectionData] = useState(DEFAULT_SECTION_DATA)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [editingMember, setEditingMember] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isSavingDefaults, setIsSavingDefaults] = useState(false)
  const [isDatabaseEmpty, setIsDatabaseEmpty] = useState(false)

  useEffect(() => {
    fetchMembers()
    fetchSectionData()
    
    return () => {
      setIsDialogOpen(false)
      setIsDeleteDialogOpen(false)
      setIsResetDialogOpen(false)
    }
  }, [])

  const fetchSectionData = async () => {
    try {
      const response = await fetch('/api/content/team/section')
      if (response.ok) {
        const data = await response.json()
        if (data && data.id) {
          setSectionData({
            title: data.title || DEFAULT_SECTION_DATA.title,
            paragraph: data.paragraph || DEFAULT_SECTION_DATA.paragraph
          })
        } else {
          setSectionData(DEFAULT_SECTION_DATA)
        }
      } else {
        setSectionData(DEFAULT_SECTION_DATA)
      }
    } catch (error) {
      console.error('Error fetching section data:', error)
      setSectionData(DEFAULT_SECTION_DATA)
    }
  }

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/content/team')
      if (response.ok) {
        const data = await response.json()
        
        if (data && data.length > 0) {
          const allDefaults = data.every((m: any) => m.id?.startsWith('default-'))
          setMembers(data)
          setIsDatabaseEmpty(allDefaults)
        } else {
          setMembers(DEFAULT_TEAM_MEMBERS)
          setIsDatabaseEmpty(true)
        }
      } else {
        setMembers(DEFAULT_TEAM_MEMBERS)
        setIsDatabaseEmpty(true)
      }
    } catch (error) {
      console.error('Error fetching team members:', error)
      toast.error('Ekip üyeleri yüklenirken hata oluştu')
      setMembers(DEFAULT_TEAM_MEMBERS)
      setIsDatabaseEmpty(true)
    } finally {
      setLoading(false)
    }
  }

  const saveAllChanges = async () => {
    setSaving(true)
    try {
      // 1. Delete all existing members
      const existingMembers = await fetch('/api/content/team')
      if (existingMembers.ok) {
        const existingData = await existingMembers.json()
        for (const member of existingData) {
          await fetch(`/api/content/team?id=${member.id}`, { method: 'DELETE' })
        }
      }

      // 2. Create all members
      for (let i = 0; i < members.length; i++) {
        const member = members[i]
        const payload = {
          name: member.name,
          position: member.position,
          bio: member.bio,
          avatar: member.avatar,
          initials: member.initials,
          color: member.color,
          email: member.email,
          phone: member.phone,
          linkedinUrl: member.linkedinUrl,
          xUrl: member.xUrl,
          facebookUrl: member.facebookUrl,
          instagramUrl: member.instagramUrl,
          threadsUrl: member.threadsUrl,
          isActive: member.isActive,
          order: i
        }

        const response = await fetch('/api/content/team', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          throw new Error('Ekip üyesi oluşturulamadı')
        }
      }

      // 3. Save section data
      const sectionResponse = await fetch('/api/content/team/section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionData)
      })

      if (sectionResponse.ok) {
        toast.success('Tüm değişiklikler başarıyla kaydedildi!')
        setIsDatabaseEmpty(false)
        await fetchMembers()
        await fetchSectionData()
      } else {
        toast.error('Bölüm bilgileri kaydedilemedi')
      }
    } catch (error) {
      console.error('Error saving changes:', error)
      toast.error(`Bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
    } finally {
      setSaving(false)
    }
  }

  const saveDefaultsToDatabase = async () => {
    setIsSavingDefaults(true)
    try {
      const response = await fetch('/api/content/team')
      if (response.ok) {
        const existingData = await response.json()
        for (const member of existingData) {
          await fetch(`/api/content/team?id=${member.id}`, { method: 'DELETE' })
        }
      }

      for (let i = 0; i < DEFAULT_TEAM_MEMBERS.length; i++) {
        const member = DEFAULT_TEAM_MEMBERS[i]
        await fetch('/api/content/team', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...member, order: i })
        })
      }

      await fetch('/api/content/team/section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(DEFAULT_SECTION_DATA)
      })

      toast.success('Varsayılan değerler veritabanına kaydedildi!')
      setIsDatabaseEmpty(false)
      await fetchMembers()
      await fetchSectionData()
    } catch (error) {
      console.error('Error saving defaults:', error)
      toast.error('Varsayılan değerler kaydedilemedi')
    } finally {
      setIsSavingDefaults(false)
    }
  }

  const handleReset = () => {
    setMembers(DEFAULT_TEAM_MEMBERS)
    setSectionData(DEFAULT_SECTION_DATA)
    setIsDatabaseEmpty(true)
    toast.success('Varsayılan değerlere sıfırlandı (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
    setIsResetDialogOpen(false)
  }

  const handleOpenDialog = (member?: TeamMember) => {
    if (member) {
      setEditingMember({ ...member })
    } else {
      setEditingMember({
        name: "",
        position: "",
        bio: "",
        avatar: "",
        initials: "??",
        color: "from-blue-600 to-cyan-600",
        email: "",
        phone: "",
        linkedinUrl: "",
        xUrl: "",
        facebookUrl: "",
        instagramUrl: "",
        threadsUrl: "",
        isActive: true,
        order: members.length
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!editingMember.name || !editingMember.position) {
      toast.error('İsim ve pozisyon zorunludur')
      return
    }

    const payload = { ...editingMember }

    if (editingMember.id && !editingMember.id.startsWith('default-')) {
      setMembers(members.map(m => m.id === editingMember.id ? payload : m))
      toast.success('Ekip üyesi güncellendi (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
    } else {
      const newMember = { ...payload, id: `temp-${Date.now()}`, order: members.length }
      setMembers([...members, newMember])
      toast.success('Yeni ekip üyesi eklendi (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
    }
    
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setMembers(members.filter(m => m.id !== id))
    toast.success('Ekip üyesi silindi (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
    setIsDeleteDialogOpen(false)
    setMemberToDelete(null)
  }

  const moveMember = (member: TeamMember, direction: 'up' | 'down') => {
    const currentIndex = members.findIndex(m => m.id === member.id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= members.length) return

    const newMembers = [...members]
    const [movedMember] = newMembers.splice(currentIndex, 1)
    newMembers.splice(newIndex, 0, movedMember)

    setMembers(newMembers.map((m, index) => ({ ...m, order: index })))
    toast.success('Sıralama güncellendi (Kaydetmek için "Tüm Değişiklikleri Kaydet" butonuna basın)')
  }

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.bio.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Ekip Bölümü Ayarları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Bölüm Başlığı</Label>
              <Input
                value={sectionData.title}
                onChange={(e) => setSectionData({ ...sectionData, title: e.target.value })}
                placeholder="Uzman Ekibimiz"
              />
            </div>
            <div>
              <Label>Açıklama</Label>
              <Textarea
                value={sectionData.paragraph || ""}
                onChange={(e) => setSectionData({ ...sectionData, paragraph: e.target.value })}
                placeholder="Bölüm açıklaması"
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ekip Üyeleri Tablosu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Ekip üyesi ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Ekip Üyesi Ekle
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Avatar</TableHead>
                <TableHead>İsim</TableHead>
                <TableHead>Pozisyon</TableHead>
                <TableHead>İletişim</TableHead>
                <TableHead className="w-[100px]">Durum</TableHead>
                <TableHead className="w-[200px] text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {searchTerm ? "Arama sonucu bulunamadı" : "Henüz ekip üyesi eklenmemiş"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMembers.map((member) => {
                  const actualIndex = members.findIndex(m => m.id === member.id)
                  
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className={`bg-gradient-to-br ${member.color} text-white font-semibold text-lg`}>
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">{member.position}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{member.bio}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {member.email && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[150px]">{member.email}</span>
                            </div>
                          )}
                          {member.phone && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.isActive ? (
                          <Badge className="bg-green-100 text-green-700 border-green-300">Aktif</Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-300">Pasif</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveMember(member, 'up')}
                            disabled={actualIndex === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveMember(member, 'down')}
                            disabled={actualIndex === members.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenDialog(member)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setMemberToDelete(member)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {filteredMembers.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Toplam {filteredMembers.length} kayıttan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredMembers.length)} arası gösteriliyor
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                  Önceki
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className="w-8"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button onClick={() => setIsResetDialogOpen(true)} variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-50">
            <RotateCcw className="h-4 w-4 mr-2" />
            Varsayılan Değerlere Sıfırla
          </Button>
          
          <Button onClick={saveDefaultsToDatabase} disabled={!isDatabaseEmpty || isSavingDefaults} variant="default" className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
            {isSavingDefaults ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Varsayılan Değerleri Veritabanına Kaydet
              </>
            )}
          </Button>
        </div>
        
        <Button onClick={saveAllChanges} disabled={saving} size="lg" className="bg-green-600 hover:bg-green-700">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Tüm Değişiklikleri Kaydet
            </>
          )}
        </Button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) setEditingMember(null)
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingMember?.id ? 'Ekip Üyesi Düzenle' : 'Yeni Ekip Üyesi Ekle'}</DialogTitle>
          </DialogHeader>
          
          {editingMember && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>İsim *</Label>
                  <Input
                    value={editingMember.name || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    placeholder="Ahmet Yılmaz"
                  />
                </div>
                
                <div>
                  <Label>Pozisyon *</Label>
                  <Input
                    value={editingMember.position || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, position: e.target.value })}
                    placeholder="Mali Müşavir"
                  />
                </div>
              </div>
              
              <div>
                <Label>Biyografi</Label>
                <Textarea
                  value={editingMember.bio || ""}
                  onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                  placeholder="Kısa biyografi ve deneyim bilgisi..."
                  rows={3}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>İlk Harfler</Label>
                  <Input
                    value={editingMember.initials || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, initials: e.target.value.toUpperCase() })}
                    placeholder="AY"
                    maxLength={2}
                  />
                </div>
                
                <div>
                  <Label>Renk</Label>
                  <Select value={editingMember.color} onValueChange={(value) => setEditingMember({ ...editingMember, color: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_GRADIENTS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`h-4 w-8 rounded ${color.preview}`}></div>
                            <span>{color.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>E-posta</Label>
                  <Input
                    type="email"
                    value={editingMember.email || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                    placeholder="ornek@smmm.com"
                  />
                </div>
                
                <div>
                  <Label>Telefon</Label>
                  <Input
                    value={editingMember.phone || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                    placeholder="+90 532 123 45 67"
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>LinkedIn URL</Label>
                  <Input
                    value={editingMember.linkedinUrl || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                
                <div>
                  <Label>X (Twitter) URL</Label>
                  <Input
                    value={editingMember.xUrl || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, xUrl: e.target.value })}
                    placeholder="https://x.com/..."
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Facebook URL</Label>
                  <Input
                    value={editingMember.facebookUrl || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, facebookUrl: e.target.value })}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                
                <div>
                  <Label>Instagram URL</Label>
                  <Input
                    value={editingMember.instagramUrl || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </div>
              
              <div>
                <Label>Threads (N sosyal) URL</Label>
                <Input
                  value={editingMember.threadsUrl || ""}
                  onChange={(e) => setEditingMember({ ...editingMember, threadsUrl: e.target.value })}
                  placeholder="https://threads.net/@..."
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="memberActive"
                  checked={editingMember.isActive}
                  onCheckedChange={(checked) => setEditingMember({ ...editingMember, isActive: checked === true })}
                />
                <Label htmlFor="memberActive" className="cursor-pointer">Ekip üyesi aktif</Label>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <XIcon className="h-4 w-4 mr-2" />
              İptal
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Check className="h-4 w-4 mr-2" />
              {editingMember?.id ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setMemberToDelete(null)
        }}
        onConfirm={() => memberToDelete && handleDelete(memberToDelete.id)}
        title="Ekip Üyesi Sil"
        description={memberToDelete ? `"${memberToDelete.name}" ekip üyesini silmek istediğinizden emin misiniz?` : undefined}
      />

      <DeleteConfirmationDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={handleReset}
        title="Varsayılan Değerlere Sıfırla"
        description="Tüm ekip verilerini silmek ve varsayılan değerlere sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz."
      />
    </div>
  )
}
