"use client"

import * as React from "react"
import { Check, ChevronsUpDown, User } from "lucide-react"
import { useRouter } from "next/navigation"

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

interface Customer {
  id: string
  companyName: string
}

export function CustomerSelector() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  const fetchCustomers = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/customers?pageSize=1000")
      if (response.ok) {
        const data = await response.json()
        // Ensure data is an array (handle { items: [...] } structure from API)
        const customerArray = Array.isArray(data) ? data : (data.items || data.customers || [])
        setCustomers(customerArray)

        // Check if selected value still exists
        setValue(prev => {
           const exists = customerArray.find((c: Customer) => c.id === prev)
           return exists ? prev : ""
        })
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    setMounted(true)
    fetchCustomers()

    const handleCustomerUpdate = () => {
      fetchCustomers()
    }

    window.addEventListener('customer:updated', handleCustomerUpdate)
    return () => {
      window.removeEventListener('customer:updated', handleCustomerUpdate)
    }
  }, [fetchCustomers])

  const handleGoToCustomer = () => {
    if (value) {
      router.push(`/admin/customers/${value}`)
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          role="combobox"
          className="w-[250px] justify-between"
          disabled
        >
          Müşteri seçiniz...
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
        <Button variant="outline" size="icon" disabled>
          <User className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[250px] justify-between"
          >
            {value
              ? customers.find((customer) => customer.id === value)?.companyName
              : "Müşteri seçiniz..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
          <Command>
            <CommandInput placeholder="Müşteri ara..." />
            <CommandList>
              <CommandEmpty>Müşteri bulunamadı.</CommandEmpty>
              <CommandGroup>
                {customers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={customer.companyName} // Search by name
                    onSelect={() => {
                      setValue(customer.id === value ? "" : customer.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === customer.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {customer.companyName}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      <Button 
        onClick={handleGoToCustomer}
        disabled={!value}
        size="sm"
      >
        Git
      </Button>
    </div>
  )
}
