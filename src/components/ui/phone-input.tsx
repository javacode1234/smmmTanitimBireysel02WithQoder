import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string
  onChange?: (value: string) => void
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value = "", onChange, ...props }, ref) => {
    const formatPhoneNumber = (input: string): string => {
      // Remove all non-digit characters
      const digits = input.replace(/\D/g, "")
      
      // Limit to 11 digits (Turkish phone format)
      const limitedDigits = digits.slice(0, 11)
      
      // Format: 0 555 555 55 55
      let formatted = ""
      
      if (limitedDigits.length > 0) {
        formatted = limitedDigits[0] // First digit (0)
      }
      
      if (limitedDigits.length > 1) {
        formatted += " " + limitedDigits.slice(1, 4) // Next 3 digits
      }
      
      if (limitedDigits.length > 4) {
        formatted += " " + limitedDigits.slice(4, 7) // Next 3 digits
      }
      
      if (limitedDigits.length > 7) {
        formatted += " " + limitedDigits.slice(7, 9) // Next 2 digits
      }
      
      if (limitedDigits.length > 9) {
        formatted += " " + limitedDigits.slice(9, 11) // Last 2 digits
      }
      
      return formatted
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      const formatted = formatPhoneNumber(inputValue)
      
      if (onChange) {
        onChange(formatted)
      }
    }

    return (
      <Input
        ref={ref}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="0 555 555 55 55"
        className={cn(className)}
        {...props}
      />
    )
  }
)

PhoneInput.displayName = "PhoneInput"

export { PhoneInput }
