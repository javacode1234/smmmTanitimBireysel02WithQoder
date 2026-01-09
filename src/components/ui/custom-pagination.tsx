"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CustomPaginationProps {
  currentPage: number
  pageCount: number
  onPageChange: (page: number) => void
  disabled?: boolean
  pageSize?: number
  onPageSizeChange?: (pageSize: number) => void
  totalCount?: number
}

export function CustomPagination({ 
  currentPage, 
  pageCount, 
  onPageChange, 
  disabled = false,
  pageSize,
  onPageSizeChange,
  totalCount
}: CustomPaginationProps) {
  // If no pagination is needed (only 1 page) and no total count to show, return null
  // But user wants to see "Total records" always probably.
  // Let's keep it visible if we have totalCount or pageCount > 1
  if (pageCount <= 1 && !totalCount) return null

  // Calculate page numbers to display
  // We want to show a window of pages around current page
  // Example: 1 2 [3] 4 5
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5 // Adjust as needed
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(pageCount, startPage + maxVisiblePages - 1)
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
      {/* Left Side: Page Size & Total Count */}
      <div className="flex items-center text-sm text-muted-foreground order-2 sm:order-1">
        {pageSize && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span>Sayfada</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                onPageSizeChange(Number(value))
                // Reset to page 1 when page size changes usually, 
                // but let the parent handle that or we can do it here if we want to be safe.
                // Usually parent handles side effects.
                onPageChange(1) 
              }}
              disabled={disabled}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize.toString()} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>Kayıt var.</span>
          </div>
        )}
        {totalCount !== undefined && (
          <span className="ml-2">Toplam kayıt sayısı {totalCount}.</span>
        )}
      </div>

      {/* Right Side: Pagination Buttons */}
      {pageCount > 1 && (
        <div className="flex items-center space-x-2 order-1 sm:order-2">
          {/* İlk */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1 || disabled}
            className="px-2"
          >
            <ChevronsLeft className="h-4 w-4 mr-1" />
            İlk
          </Button>

          {/* Önceki */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || disabled}
            className="px-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Önceki
          </Button>

          {/* Page Numbers */}
          {pages.map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              disabled={disabled}
              className="w-9 px-0"
            >
              {page}
            </Button>
          ))}

          {/* Sonraki */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === pageCount || disabled}
            className="px-2"
          >
            Sonraki
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>

          {/* Son */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageCount)}
            disabled={currentPage === pageCount || disabled}
            className="px-2"
          >
            Son
            <ChevronsRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
