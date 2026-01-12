"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"

export function DashboardFilter({ years }: { years: number[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentYear = searchParams.get("year") || new Date().getFullYear().toString()

  const handleYearChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("year", value)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Yıl:</span>
      <Select value={currentYear} onValueChange={handleYearChange}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Yıl Seçiniz" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
