"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      suppressHydrationWarning
      data-slot="select-trigger"
      className={cn(
        "ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-8 w-full items-center justify-between rounded-xs border bg-background px-3 text-sm outline-hidden focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-muted -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function SelectPortal({ ...props }: React.ComponentProps<typeof SelectPrimitive.Portal>) {
  const [mounted, setMounted] = React.useState(false)
  const [container, setContainer] = React.useState<HTMLElement | null>(null)

  React.useEffect(() => {
    setMounted(true)
    setContainer(document.body)
    
    // Cleanup function to prevent memory leaks
    return () => {
      setMounted(false)
      setContainer(null)
    }
  }, [])

  if (!mounted || !container) return null

  return <SelectPrimitive.Portal container={container} data-slot="select-portal" {...props} />
}

function SelectContent({ className, position = "popper", ...props }: React.ComponentProps<typeof SelectPrimitive.Content> & { position?: "popper" | "item-aligned" }) {
  return (
    <SelectPortal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 relative z-50 min-w-8 overflow-hidden rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-[var(--radix-select-trigger-width)]"
          )}
        >
          {props.children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPortal>
  )
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label data-slot="select-label" className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props} />
  )
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "ring-offset-background focus:ring-ring data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-xs px-2 py-1.5 text-sm outline-hidden focus:ring-2 focus:ring-offset-2",
        className
      )}
      {...props}
    >
      <span className="absolute left-2">
        <SelectPrimitive.ItemIndicator>
          <svg viewBox="0 0 24 24" width={16} height={16}>
            <path
              d="M17.886 8.712a.476.476 0 0 0-.652-.687l-5.882 5.587-2.504-2.375a.476.476 0 1 0-.65.695l2.257 2.144c.189.18.493.177.68-.008l6.59-6.356Z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectItemIndicator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ItemIndicator>) {
  return (
    <SelectPrimitive.ItemIndicator
      data-slot="select-item-indicator"
      className={cn("absolute left-2 size-3.5", className)}
      {...props}
    />
  )
}

function SelectContentItemAligned({ className, position = "item-aligned", ...props }: React.ComponentProps<typeof SelectPrimitive.Content> & { position?: "popper" | "item-aligned" }) {
  return (
    <SelectPrimitive.Content
      data-slot="select-content"
      className={cn(
        "bg-popover text-popover-foreground data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 relative z-50 min-w-8 overflow-hidden rounded-md border shadow-md",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport className={cn("p-1")}>{props.children}</SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  )
}

function SelectSeparatorItemAligned({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator data-slot="select-separator" className={cn("bg-muted -mx-1 my-1 h-px", className)} {...props} />
  )
}

function SelectItemItemAligned({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "ring-offset-background focus:ring-ring data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-xs px-2 py-1.5 text-sm outline-hidden focus:ring-2 focus:ring-offset-2",
        className
      )}
      {...props}
    >
      <span className="absolute left-2">
        <SelectPrimitive.ItemIndicator>
          <svg viewBox="0 0 24 24" width={16} height={16}>
            <path
              d="M17.886 8.712a.476.476 0 0 0-.652-.687l-5.882 5.587-2.504-2.375a.476.476 0 1 0-.65.695l2.257 2.144c.189.18.493.177.68-.008l6.59-6.356Z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectContentPopper({ className, position = "popper", ...props }: React.ComponentProps<typeof SelectPrimitive.Content> & { position?: "popper" | "item-aligned" }) {
  return (
    <SelectPrimitive.Content
      data-slot="select-content"
      className={cn(
        "bg-popover text-popover-foreground data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 relative z-50 min-w-8 overflow-hidden rounded-md border shadow-md",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport className={cn("p-1 h-[var(--radix-select-trigger-height)] w-[var(--radix-select-trigger-width)]")}>{props.children}</SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  )
}

function SelectItemPopper({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "ring-offset-background focus:ring-ring data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-xs px-2 py-1.5 text-sm outline-hidden focus:ring-2 focus:ring-offset-2",
        className
      )}
      {...props}
    >
      <span className="absolute left-2">
        <SelectPrimitive.ItemIndicator>
          <svg viewBox="0 0 24 24" width={16} height={16}>
            <path
              d="M17.886 8.712a.476.476 0 0 0-.652-.687l-5.882 5.587-2.504-2.375a.476.476 0 1 0-.65.695l2.257 2.144c.189.18.493.177.68-.008l6.59-6.356Z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectItemText({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ItemText>) {
  return <SelectPrimitive.ItemText data-slot="select-item-text" className={cn("", className)} {...props} />
}

function SelectItemIndicatorIcon({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ItemIndicator>) {
  return (
    <SelectPrimitive.ItemIndicator data-slot="select-item-indicator" className={cn("absolute left-2 size-3.5", className)} {...props}>
      <CheckIcon className="size-4" />
    </SelectPrimitive.ItemIndicator>
  )
}

function SelectSeparatorPopper({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return <SelectPrimitive.Separator data-slot="select-separator" className={cn("bg-muted -mx-1 my-1 h-px", className)} {...props} />
}

function SelectContentViewportPopper({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Viewport>) {
  return (
    <SelectPrimitive.Viewport className={cn("p-1 h-[var(--radix-select-trigger-height)] w-[var(--radix-select-trigger-width)]", className)} {...props}>
      {children}
    </SelectPrimitive.Viewport>
  )
}

export {
  Select,
  SelectContent,
  SelectContentItemAligned,
  SelectContentPopper,
  SelectContentViewportPopper,
  SelectGroup,
  SelectItem,
  SelectItemIndicator,
  SelectItemIndicatorIcon,
  SelectItemItemAligned,
  SelectItemPopper,
  SelectItemText,
  SelectLabel,
  SelectPortal,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectSeparatorItemAligned,
  SelectSeparatorPopper,
  SelectTrigger,
  SelectValue,
}
