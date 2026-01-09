"use client"

import { useState } from "react"
import { Eye, EyeOff, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface PasswordListProps {
  passwords: Record<string, any> | null
}

export function PasswordList({ passwords }: PasswordListProps) {
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({})

  if (!passwords) {
    return <div className="text-muted-foreground text-sm mt-2">Kayıtlı şifre bilgisi bulunmamaktadır.</div>
  }

  const toggleVisibility = (key: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <div className="rounded-md border mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Platform</TableHead>
            <TableHead>Kullanıcı Adı</TableHead>
            <TableHead>Şifre</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(passwords).map(([key, value]: [string, any], i) => (
            <TableRow key={i}>
              <TableCell className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</TableCell>
              <TableCell>{value.username || "-"}</TableCell>
              <TableCell className="font-mono">
                {visiblePasswords[key] ? (
                  value.password || "******"
                ) : (
                  "******"
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleVisibility(key)}
                  title={visiblePasswords[key] ? "Şifreyi Gizle" : "Şifreyi Göster"}
                >
                  {visiblePasswords[key] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-xs text-muted-foreground mt-2 px-1">
        * Şifrelerinizi güvenli bir şekilde saklayınız.
      </p>
    </div>
  )
}
