"use client"

import { useState, useMemo, Fragment } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Search } from "lucide-react"

interface TaxReturn {
  id: string
  period: string
  year: number
  type: string
  status: string
  dueDate: string | Date
  isSubmitted: boolean
}

export function ClientLastDeclarations({ declarations }: { declarations: TaxReturn[] }) {
  const [filterText, setFilterText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const filteredData = useMemo(() => {
    let data = [...declarations]

    if (filterText) {
      const lowerFilter = filterText.toLowerCase()
      data = data.filter(item => 
        item.type.toLowerCase().includes(lowerFilter) || 
        `${item.period}`.toLowerCase().includes(lowerFilter) ||
        `${item.year}`.includes(lowerFilter)
      )
    }

    return data
  }, [declarations, filterText])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  const totalPages = Math.ceil(filteredData.length / pageSize)

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Beyanname ara..."
          value={filterText}
          onChange={(e) => {
            setFilterText(e.target.value)
            setCurrentPage(1)
          }}
          className="pl-8"
        />
      </div>

      <div className="space-y-4">
        {paginatedData.length > 0 ? (
          paginatedData.map((declaration, i) => (
            <div key={declaration.id || i} className="flex items-center justify-between border-b pb-3 last:border-0">
              <div>
                <p className="font-medium">{declaration.type}</p>
                <p className="text-sm text-muted-foreground">
                  {declaration.period} {declaration.year} Dönemi
                </p>
              </div>
              <Badge 
                variant={declaration.isSubmitted ? "secondary" : "destructive"} 
                className={declaration.isSubmitted ? "bg-green-100 text-green-800" : ""}
              >
                {declaration.isSubmitted ? "Tamamlandı" : "Bekliyor"}
              </Badge>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-4">Sonuç bulunamadı.</p>
        )}
      </div>

      {filteredData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Sayfada</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="h-8 w-[60px]">
                  <SelectValue placeholder={pageSize.toString()} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span>Toplam {filteredData.length}</span>
          </div>
          
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2"
            >
              İlk
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2"
            >
              Önceki
            </Button>
            
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  if (page === 1 || page === totalPages) return true
                  if (Math.abs(page - currentPage) <= 1) return true
                  return false
                })
                .map((page, idx, arr) => (
                  <Fragment key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                      <span className="px-1 text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  </Fragment>
                ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2"
            >
              Sonraki
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2"
            >
              Son
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
