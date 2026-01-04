"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ActivityCode {
  id: string
  name: string
}

interface ActivityCodeComboboxProps {
  value?: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

export function ActivityCodeCombobox({
  value,
  onValueChange,
  disabled,
}: ActivityCodeComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [codes, setCodes] = React.useState<ActivityCode[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const fetchCodes = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/activity-codes")
        if (res.ok) {
          const data = await res.json()
          setCodes(data.codes || [])
        }
      } catch (error) {
        console.error("Failed to fetch activity codes", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCodes()
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className="truncate">
            {value
              ? codes.find((code) => code.id === value)?.name || value
              : "Faaliyet kodu seçin..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Faaliyet kodu ara..." />
          <CommandList>
            <CommandEmpty>
              {loading ? "Yükleniyor..." : "Faaliyet kodu bulunamadı."}
            </CommandEmpty>
            <CommandGroup>
              {codes.map((code) => (
                <CommandItem
                  key={code.id}
                  value={code.name}
                  onSelect={() => {
                    onValueChange(code.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === code.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {code.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
