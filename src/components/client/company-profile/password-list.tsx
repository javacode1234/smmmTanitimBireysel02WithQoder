"use client"

import { useState } from "react"
import { Eye, EyeOff, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface PasswordListProps {
  passwords: Record<string, any> | null
  customerUsername?: string | null
}

export function PasswordList({ passwords, customerUsername }: PasswordListProps) {
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({})
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (!passwords || (Object.keys(passwords).length === 0)) {
    return <div className="text-muted-foreground text-sm mt-2">Kayıtlı şifre bilgisi bulunmamaktadır.</div>
  }

  const toggleVisibility = (key: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const copyToClipboard = (text: string, fieldId: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedField(fieldId)
    toast.success("Kopyalandı")
    setTimeout(() => setCopiedField(null), 2000)
  }

  const renderPasswordCell = (value: string, key: string) => {
    const isVisible = visiblePasswords[key]
    const uniqueKey = key

    return (
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm">
          {isVisible ? value || "-" : (value ? "••••••" : "-")}
        </span>
        {value && (
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => toggleVisibility(uniqueKey)}
              title={isVisible ? "Gizle" : "Göster"}
            >
              {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => copyToClipboard(value, uniqueKey)}
              title="Kopyala"
            >
              {copiedField === uniqueKey ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        )}
      </div>
    )
  }

  const renderCopyableCell = (value: string | null | undefined, key: string) => {
    if (!value) return "-"
    
    return (
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm">{value}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => copyToClipboard(value, key)}
          title="Kopyala"
        >
          {copiedField === key ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
    )
  }

  const tax = passwords.digitalTaxOffice
  const sgk = passwords.sgk

  return (
    <div className="space-y-6 mt-4">
      {/* Vergi Dairesi Şifreleri */}
      {tax && (
        <div className="rounded-md border bg-card overflow-hidden">
          <div className="p-3 border-b bg-muted/30">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Dijital Vergi Dairesi</Badge>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kullanıcı Kodu</TableHead>
                  <TableHead>Parola</TableHead>
                  <TableHead>Şifre</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{renderCopyableCell(tax.username, 'tax_username')}</TableCell>
                  <TableCell>{renderPasswordCell(tax.password, 'tax_password')}</TableCell>
                  <TableCell>{renderPasswordCell(tax.secret, 'tax_secret')}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* SGK Şifreleri */}
      {sgk && (
        <div className="rounded-md border bg-card overflow-hidden">
          <div className="p-3 border-b bg-muted/30">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">SGK</Badge>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İşyeri Sicil No</TableHead>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>İşyeri Kodu</TableHead>
                  <TableHead>Sistem Şifresi</TableHead>
                  <TableHead>İşyeri Şifresi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">{renderCopyableCell(sgk.registrationNumber, 'sgk_reg_no')}</TableCell>
                  <TableCell>{renderCopyableCell(sgk.username, 'sgk_username')}</TableCell>
                  <TableCell>{renderCopyableCell(sgk.workplaceCode, 'sgk_workplace_code')}</TableCell>
                  <TableCell>{renderPasswordCell(sgk.systemPassword, 'sgk_system')}</TableCell>
                  <TableCell>{renderPasswordCell(sgk.workplacePassword, 'sgk_workplace')}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Diğer Şifreler (Varsa ve yapıya uymuyorsa) */}
      {Object.entries(passwords).filter(([key]) => key !== 'digitalTaxOffice' && key !== 'sgk').length > 0 && (
         <div className="rounded-md border bg-card overflow-hidden">
           <div className="p-3 border-b bg-muted/30">
             <h3 className="font-semibold text-sm">Diğer Şifreler</h3>
           </div>
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Platform</TableHead>
                 <TableHead>Kullanıcı Adı</TableHead>
                 <TableHead>Şifre</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {Object.entries(passwords)
                 .filter(([key]) => key !== 'digitalTaxOffice' && key !== 'sgk')
                 .map(([key, value]: [string, any], i) => (
                   <TableRow key={i}>
                     <TableCell className="font-medium capitalize">
                       {key === 'customerLogin' ? 'Müşteri Giriş' : key.replace(/([A-Z])/g, ' $1').trim()}
                     </TableCell>
                     <TableCell>
                      {renderCopyableCell(
                        key === 'customerLogin' 
                          ? (value.username || customerUsername)
                          : value.username, 
                        `other_username_${key}`
                      )}
                    </TableCell>
                     <TableCell>{renderPasswordCell(value.password, `other_${key}`)}</TableCell>
                   </TableRow>
                 ))}
             </TableBody>
           </Table>
         </div>
      )}
      
      <p className="text-xs text-muted-foreground px-1">
        * Şifreleriniz uçtan uca şifrelenerek saklanmaktadır. Güvenliğiniz için şifrelerinizi kimseyle paylaşmayınız.
      </p>
    </div>
  )
}
