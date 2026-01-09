"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Loader2, AlertCircle, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useDebounce } from "@/hooks/use-debounce"
import { toast } from "sonner"

interface Customer {
  id: string
  logo: string | null
  companyName: string
  email: string | null
  phone: string | null
  taxNumber: string | null
  address: string | null
  city: string | null
  ledgerType: string | null
  status: string
  createdAt: string
}

interface CustomersResponse {
  items: Customer[]
  total: number
  page: number
  pageSize: number
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10) // Default page size 10
  const [total, setTotal] = useState(0)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null)

  const debouncedSearch = useDebounce(searchTerm, 500)

  useEffect(() => {
    fetchCustomers()
  }, [page, pageSize, debouncedSearch])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      })

      if (debouncedSearch) {
        params.append("search", debouncedSearch)
      }

      const response = await fetch(`/api/customers?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Müşteriler yüklenirken hata oluştu")
      }

      const data: CustomersResponse = await response.json()
      setCustomers(data.items)
      setTotal(data.total)
    } catch (error) {
      console.error(error)
      toast.error("Müşteriler yüklenemedi")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setPage(1) // Reset to first page on search
  }

  const handleDeleteClick = (id: string) => {
    setCustomerToDelete(id)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!customerToDelete) return

    try {
      const response = await fetch(`/api/customers?id=${customerToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Silme işlemi başarısız oldu")
      }

      toast.success("Müşteri başarıyla silindi")
      setDeleteModalOpen(false)
      setCustomerToDelete(null)
      fetchCustomers() // Refresh list
      
      // Notify other components (like navbar) that customer list has changed
      window.dispatchEvent(new Event('customer:updated'))
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Silme işlemi başarısız oldu")
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getLedgerTypeLabel = (type: string | null) => {
      if (!type) return "-"
      // Basic mapping or just return the value if it's readable
      return type
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Müşteriler</h1>
          <p className="text-muted-foreground mt-1">
            Müşterilerinizi yönetin ve takip edin.
          </p>
        </div>
        <Button onClick={() => router.push("/admin/customers/new")}>
          <Plus className="mr-2 h-4 w-4" /> Yeni Müşteri
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <CardTitle>Müşteri Listesi</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Müşteri ara..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Logo</TableHead>
              <TableHead>Tip</TableHead>
              <TableHead>Unvan / Ad Soyad</TableHead>
              <TableHead>TCKN/VKN</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="w-[100px]">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Yükleniyor...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-8 w-8" />
                    <p>Kayıtlı müşteri bulunamadı.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={customer.logo || undefined} alt={customer.companyName} />
                      <AvatarFallback>{getInitials(customer.companyName)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    {customer.ledgerType || (
                        customer.taxNumber && customer.taxNumber.length === 11 ? "Şahıs" : 
                        customer.taxNumber && customer.taxNumber.length === 10 ? "Tüzel" : "-"
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {customer.companyName}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {customer.tckn && <span className="font-medium">{customer.tckn}</span>}
                      {customer.taxNumber && <span className="text-xs text-muted-foreground">{customer.taxNumber}</span>}
                      {!customer.tckn && !customer.taxNumber && "-"}
                    </div>
                  </TableCell>
                  <TableCell>{customer.phone || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={customer.status === "ACTIVE" ? "default" : "secondary"}>
                      {customer.status === "ACTIVE" ? "Aktif" : customer.status === "PASSIVE" ? "Pasif" : customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => router.push(`/admin/customers/${customer.id}`)}
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Düzenle</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteClick(customer.id)}
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Sil</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Pagination */}
      {!loading && total > 0 && (
        <CardFooter className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Sayfada</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value))
                setPage(1)
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize.toString()} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>Kayıt var. Toplam kayıt sayısı {total}.</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Önceki
            </Button>
            <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Simple pagination logic for demonstration; can be improved for many pages
                    let p = i + 1;
                    if (totalPages > 5 && page > 3) {
                         p = page - 2 + i;
                         if (p > totalPages) p = totalPages - (4 - i);
                    }
                    return p;
                }).map(p => (
                    <Button
                        key={p}
                        variant={page === p ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setPage(p)}
                    >
                        {p}
                    </Button>
                ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Sonraki
            </Button>
          </div>
        </CardFooter>
      )}
      </Card>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Müşteriyi Sil</DialogTitle>
            <DialogDescription>
              Bu müşteriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve müşteriye ait tüm veriler (belgeler, beyannameler vb.) kalıcı olarak silinecektir.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              İptal
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
