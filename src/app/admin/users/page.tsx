"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Edit, Trash2, Shield, User as UserIcon } from "lucide-react"
import { toast } from "sonner"

type User = {
  id: string
  name: string | null
  email: string
  role: "ADMIN" | "CLIENT"
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CLIENT" as "ADMIN" | "CLIENT"
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      } else {
        toast.error("Kullanıcılar yüklenemedi")
      }
    } catch {
      toast.error("Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingUser(null)
    setFormData({ name: "", email: "", password: "", role: "CLIENT" })
    setIsModalOpen(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name || "",
      email: user.email,
      password: "",
      role: user.role
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.email) {
      toast.error("Email zorunludur")
      return
    }

    if (!editingUser && !formData.password) {
      toast.error("Yeni kullanıcı için şifre zorunludur")
      return
    }

    try {
      const url = editingUser ? `/api/users?id=${editingUser.id}` : '/api/users'
      const method = editingUser ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast.success(editingUser ? "Kullanıcı güncellendi" : "Kullanıcı eklendi")
        setIsModalOpen(false)
        fetchUsers()
      } else {
        const error = await res.json()
        toast.error(error.error || "İşlem başarısız")
      }
    } catch {
      toast.error("Bir hata oluştu")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) return

    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success("Kullanıcı silindi")
        fetchUsers()
      } else {
        toast.error("Silme işlemi başarısız")
      }
    } catch {
      toast.error("Bir hata oluştu")
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
          <p className="text-muted-foreground mt-2">
            Sistem kullanıcılarını yönetin
          </p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700" onClick={handleAdd}>
          <UserPlus className="h-4 w-4 mr-2" />
          Yeni Kullanıcı
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kullanıcılar ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad Soyad</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Kayıt Tarihi</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Kullanıcı bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || "—"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                        {user.role === "ADMIN" ? (
                          <><Shield className="h-3 w-3 mr-1" /> Admin</>
                        ) : (
                          <><UserIcon className="h-3 w-3 mr-1" /> Müşteri</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Düzenle
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(user.id)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Sil
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? "Kullanıcı Düzenle" : "Yeni Kullanıcı"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 px-6">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: Ahmet Yılmaz"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ornek@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre {!editingUser && "*"}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingUser ? "Boş bırakılırsa değişmez" : "Şifre"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol *</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as "ADMIN" | "CLIENT" })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Sadece admin kullanıcıları için. Müşteri kullanıcıları müşteri detay sayfasından tanımlanır.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>İptal</Button>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
