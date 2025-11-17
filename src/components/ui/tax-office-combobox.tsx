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
}

interface TaxOfficeComboboxProps {
  value: string
  onValueChange: (value: string) => void
  taxOffices: TaxOffice[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
}

export function TaxOfficeCombobox({
  value,
  onValueChange,
  taxOffices,
  placeholder = "Vergi dairesi seçin...",
  searchPlaceholder = "Vergi dairesi ara...",
  emptyMessage = "Vergi dairesi bulunamadı."
}: TaxOfficeComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const filteredOffices = taxOffices.filter(office => 
    office.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value
              ? taxOffices.find((office) => office.name === value)?.name
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput 
              placeholder={searchPlaceholder} 
              value={search}
              onValueChange={setSearch}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {filteredOffices.map((office) => (
                  <CommandItem
                    key={office.id}
                    value={office.name}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue === value ? "" : currentValue)
                      setOpen(false)
                      setSearch("")
                    }}
                  >
                    <div className="flex items-center">
                      <span>{office.name}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === office.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
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