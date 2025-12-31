"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { turkishTaxOffices } from "@/lib/tax-offices"

interface TaxOffice {
  id: string
  name: string
}

const defaultTaxOffices: TaxOffice[] = turkishTaxOffices.map((office, index) => ({
  id: index.toString(),
  name: office.name
}))

interface TaxOfficeComboboxProps {
  id?: string
  value: string
  onValueChange: (value: string) => void
  taxOffices?: TaxOffice[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  allowCustom?: boolean
  minCharsToSearch?: number
  maxItemsToShow?: number
  displayMode?: 'name' | 'codeFirst'
}

export function TaxOfficeCombobox({
  id,
  value,
  onValueChange,
  taxOffices = defaultTaxOffices,
  placeholder = "Vergi dairesi seçin...",
  searchPlaceholder = "Vergi dairesi ara...",
  emptyMessage = "Vergi dairesi bulunamadı.",
  allowCustom = false,
  minCharsToSearch = 2,
  maxItemsToShow = 200,
  displayMode = 'codeFirst'
}: TaxOfficeComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const offices = taxOffices || defaultTaxOffices
  const filteredOffices = offices.filter(office => 
    office.name.toLowerCase().includes(search.toLowerCase())
  )
  const displayOffices = filteredOffices.slice(0, maxItemsToShow)

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
          >
            {(() => {
              const selected = value
                ? (offices.find((office) => office.name === value)?.name ?? value)
                : placeholder
              if (displayMode === 'name') {
                return (
                  <span className="flex-1 text-left truncate" title={typeof selected === 'string' ? selected : undefined}>
                    {selected}
                  </span>
                )
              }
              const parts = typeof selected === 'string' ? selected.split(' - ') : []
              const code = parts[0]?.trim()
              const display = value ? (code || selected) : selected
              return (
                <span className="flex-1 text-left truncate" title={typeof selected === 'string' ? selected : undefined}>
                  {display}
                </span>
              )
            })()}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 max-h-80">
          <Command>
            <CommandInput 
              placeholder={searchPlaceholder} 
              value={search}
              onValueChange={setSearch}
              className="h-9"
            />
            <CommandList className="max-h-72 overflow-auto">
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {(search.length < minCharsToSearch && offices.length > maxItemsToShow) ? null : displayOffices.map((office) => (
                  <CommandItem
                    key={office.id}
                    value={office.name}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue === value ? "" : currentValue)
                      setOpen(false)
                      setSearch("")
                    }}
                  >
                    <div className="flex flex-col">
                      {displayMode === 'name' ? (
                        <span className="text-sm font-medium">{office.name}</span>
                      ) : (
                        (() => {
                          const parts = office.name.split(' - ')
                          const code = parts[0]?.trim()
                          const desc = parts[1]?.trim()
                          return (
                            <>
                              <span className="text-sm font-medium">{code || office.name}</span>
                              {desc && <span className="text-xs text-muted-foreground">{desc}</span>}
                            </>
                          )
                        })()
                      )}
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === office.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
                {(search.length < minCharsToSearch && offices.length > maxItemsToShow) && (
                  <CommandItem key="hint" value="">
                    <div className="text-muted-foreground text-sm">Aramak için en az {minCharsToSearch} karakter girin</div>
                  </CommandItem>
                )}
                {allowCustom && search.trim() && !filteredOffices.some(o => o.name.toLowerCase() === search.trim().toLowerCase()) && (
                  <CommandItem
                    key={`custom-${search}`}
                    value={search.trim()}
                    onSelect={() => {
                      onValueChange(search.trim())
                      setOpen(false)
                      setSearch("")
                    }}
                  >
                    <div className="flex flex-col">
                      {displayMode === 'name' ? (
                        <span className="text-sm font-medium">{search.trim()}</span>
                      ) : (
                        (() => {
                          const parts = search.trim().split(' - ')
                          const code = parts[0]?.trim()
                          const desc = parts[1]?.trim()
                          return (
                            <>
                              <span className="text-sm font-medium">{code}</span>
                              {desc && <span className="text-xs text-muted-foreground">{desc}</span>}
                            </>
                          )
                        })()
                      )}
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === search.trim() ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onValueChange("");
            setSearch("");
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
