"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface LocationComboboxProps {
  type: 'city' | 'district'
  parentValue?: string // city name for district type
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
}

export function LocationCombobox({
  type,
  parentValue,
  value,
  onValueChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  disabled
}: LocationComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [items, setItems] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const fetchItems = async () => {
      if (type === 'district' && !parentValue) {
        setItems([])
        return
      }

      try {
        setLoading(true)
        let url = `/api/locations?type=${type === 'city' ? 'cities' : 'districts'}`
        if (type === 'district' && parentValue) {
          url += `&city=${encodeURIComponent(parentValue)}`
        }

        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) {
            setItems(data)
          }
        }
      } catch (error) {
        console.error(`Failed to fetch ${type}s`, error)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [type, parentValue])

  // Defaults
  const finalPlaceholder = placeholder || (type === 'city' ? "İl seçin..." : "İlçe seçin...")
  const finalSearchPlaceholder = searchPlaceholder || (type === 'city' ? "İl ara..." : "İlçe ara...")
  const finalEmptyMessage = emptyMessage || (type === 'city' ? "İl bulunamadı." : "İlçe bulunamadı.")

  const filter = (value: string, search: string) => {
    // Turkish character aware filtering
    const normalizedValue = value.toLocaleLowerCase('tr-TR')
    const normalizedSearch = search.toLocaleLowerCase('tr-TR')
    return normalizedValue.includes(normalizedSearch) ? 1 : 0
  }

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between gap-2"
            disabled={disabled || (type === 'district' && !parentValue)}
          >
            <span className="flex-1 text-left truncate">
              {value || finalPlaceholder}
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0 max-h-80">
          <Command filter={filter}>
            <CommandInput placeholder={finalSearchPlaceholder} />
            <CommandList className="max-h-72 overflow-auto">
              <CommandEmpty>{loading ? "Yükleniyor..." : finalEmptyMessage}</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item}
                    value={item}
                    onSelect={() => {
                      onValueChange(item)
                      setOpen(false)
                    }}
                  >

                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item}
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
