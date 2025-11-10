"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, ChevronLeft, ChevronRight, Edit, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

interface Password {
  id: string
  institution: string
  username: string
  password: string
}

interface PasswordsTableProps {
  passwords: Password[]
  customerId: string
  onUpdate: (passwords: Password[]) => void
}

export function PasswordsTable({ passwords, customerId, onUpdate }: PasswordsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedPassword, setSelectedPassword] = useState<Password | null>(null)
  const [newInstitution, setNewInstitution] = useState("")
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())

  // Filter passwords based on search
  const filteredPasswords = passwords.filter(pwd =>
    pwd.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pwd.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage
  const totalPages = Math.max(1, Math.ceil(filteredPasswords.length / itemsPerPage))
  const paginatedPasswords = filteredPasswords.slice(startIndex, startIndex + itemsPerPage)

  const togglePasswordVisibility = (id: string) => {
    const newVisible = new Set(visiblePasswords)
    if (newVisible.has(id)) {
      newVisible.delete(id)
    } else {
      newVisible.add(id)
    }
    setVisiblePasswords(newVisible)
  }

  const handleAddPassword = () => {
    if (!newInstitution.trim() || !newUsername.trim() || !newPassword.trim()) {
      toast.error("Tüm alanlar gereklidir")
      return
    }

    const newPwd: Password = {
      id: Date.now().toString(),
      institution: newInstitution,
      username: newUsername,
      password: newPassword,
    }

    const updatedPasswords = [...passwords, newPwd]
    onUpdate(updatedPasswords)
    toast.success("Şifre eklendi")
    setIsAddModalOpen(false)
    setNewInstitution("")
    setNewUsername("")
    setNewPassword("")
  }

  const handleEditPassword = () => {
    if (!selectedPassword || !newInstitution.trim() || !newUsername.trim() || !newPassword.trim()) {
      toast.error("Tüm alanlar gereklidir")
      return
    }

    const updatedPasswords = passwords.map(pwd =>
      pwd.id === selectedPassword.id
        ? { ...pwd, institution: newInstitution, username: newUsername, password: newPassword }
        : pwd
    )

    onUpdate(updatedPasswords)
    toast.success("Şifre güncellendi")
    setIsEditModalOpen(false)
    setSelectedPassword(null)
    setNewInstitution("")
    setNewUsername("")
    setNewPassword("")
  }

  const handleDeletePassword = (pwdId: string) => {
    const updatedPasswords = passwords.filter(pwd => pwd.id !== pwdId)
    onUpdate(updatedPasswords)
    toast.success("Şifre silindi")
  }

  const openEditModal = (pwd: Password) => {
    setSelectedPassword(pwd)
    setNewInstitution(pwd.institution)
    setNewUsername(pwd.username)
    setNewPassword(pwd.password)
    setIsEditModalOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Search, Page Size and Add */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Kurum veya kullanıcı ara..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="max-w-sm"
          />
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Sayfa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Şifre Ekle
        </Button>
      </div>

      {/* Table */}
      {paginatedPasswords.length > 0 ? (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kurum</TableHead>
                  <TableHead>Kullanıcı Adı</TableHead>
                  <TableHead>Şifre</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPasswords.map((pwd) => (
                  <TableRow key={pwd.id}>
                    <TableCell className="font-medium">{pwd.institution}</TableCell>
                    <TableCell>{pwd.username}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm">
                          {visiblePasswords.has(pwd.id) ? pwd.password : '•'.repeat(pwd.password.length)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePasswordVisibility(pwd.id)}
                        >
                          {visiblePasswords.has(pwd.id) ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(pwd)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Düzenle
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePassword(pwd.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Toplam {filteredPasswords.length} şifr eden {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredPasswords.length)} arası gösteriliyor
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Önceki
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          {searchQuery ? "Eşleşen şifre bulunamadı" : "Henüz şifre eklenmemiş"}
        </p>
      )}

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Yeni Şifre Ekle</DialogTitle>
            <DialogDescription>Kurum şifre bilgilerini girin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-6 py-4">
            <div>
              <Label htmlFor="institution">Kurum *</Label>
              <Input
                id="institution"
                value={newInstitution}
                onChange={(e) => setNewInstitution(e.target.value)}
                placeholder="e-Beyanname, SGK, vs."
              />
            </div>
            <div>
              <Label htmlFor="username">Kullanıcı Adı *</Label>
              <Input
                id="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="kullanici@ornek.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Şifre *</Label>
              <Input
                id="password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          <DialogFooter className="px-6 pb-6">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleAddPassword} className="bg-green-600 hover:bg-green-700">
              Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Şifre Düzenle</DialogTitle>
            <DialogDescription>Şifre bilgilerini güncelleyin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-6 py-4">
            <div>
              <Label htmlFor="editInstitution">Kurum *</Label>
              <Input
                id="editInstitution"
                value={newInstitution}
                onChange={(e) => setNewInstitution(e.target.value)}
                placeholder="e-Beyanname, SGK, vs."
              />
            </div>
            <div>
              <Label htmlFor="editUsername">Kullanıcı Adı *</Label>
              <Input
                id="editUsername"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="kullanici@ornek.com"
              />
            </div>
            <div>
              <Label htmlFor="editPassword">Şifre *</Label>
              <Input
                id="editPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          <DialogFooter className="px-6 pb-6">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleEditPassword} className="bg-green-600 hover:bg-green-700">
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
