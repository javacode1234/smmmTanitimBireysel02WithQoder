"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface TaxOffice {
  id: string
  name: string
  city?: string
  district?: string
}

interface TaxOfficeComboboxProps {
  id?: string
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  city?: string
}

export function TaxOfficeCombobox({
  id,
  value,
  onValueChange,
  placeholder = "Vergi dairesi seçin...",
  searchPlaceholder = "Vergi dairesi ara...",
  emptyMessage = "Vergi dairesi bulunamadı.",
  disabled,
  city
}: TaxOfficeComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [taxOffices, setTaxOffices] = React.useState<TaxOffice[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const fetchTaxOffices = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/tax-offices")
        if (res.ok) {
          const data = await res.json()
          setTaxOffices(data.taxOffices || [])
        }
      } catch (error) {
        console.error("Failed to fetch tax offices", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTaxOffices()
  }, [])

  const selectedOffice = taxOffices.find((office) => office.id === value)

  const filteredOffices = React.useMemo(() => {
    return taxOffices.filter(office => {
      if (city && office.city !== city) return false
      return true
    })
  }, [taxOffices, city])

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between gap-2"
            disabled={disabled}
          >
            <span className="flex-1 text-left truncate">
              {value
                ? (selectedOffice?.name || "Bilinmeyen Vergi Dairesi")
                : placeholder}
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0 max-h-80">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList className="max-h-72 overflow-auto">
              <CommandEmpty>{loading ? "Yükleniyor..." : emptyMessage}</CommandEmpty>
              <CommandGroup>
                {filteredOffices.map((office) => (
                  <CommandItem
                    key={office.id}
                    value={office.name}
                    onSelect={() => {
                      onValueChange(office.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === office.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{office.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {office.city} / {office.district}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value && !disabled && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onValueChange("");
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
