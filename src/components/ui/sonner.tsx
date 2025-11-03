"use client"

import * as React from "react"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  X,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton
      position="top-right"
      offset="80px"
      expand={true}
      richColors
      icons={{
        success: <CircleCheckIcon className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <OctagonXIcon className="size-5" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast: 'group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-950 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg',
          title: 'group-[.toast]:text-sm group-[.toast]:font-semibold',
          description: 'group-[.toast]:text-xs group-[.toast]:text-gray-500',
          actionButton: 'group-[.toast]:bg-gray-900 group-[.toast]:text-gray-50',
          cancelButton: 'group-[.toast]:bg-gray-100 group-[.toast]:text-gray-500',
          closeButton: 'group-[.toast]:bg-white group-[.toast]:text-gray-950 group-[.toast]:border-gray-200 group-[.toast]:hover:bg-gray-100 group-[.toast]:rounded-md group-[.toast]:shadow-sm',
          success: 'group-[.toaster]:bg-green-50 group-[.toaster]:text-green-900 group-[.toaster]:border-green-200 group-[.toast]:text-green-900',
          error: 'group-[.toaster]:bg-red-50 group-[.toaster]:text-red-900 group-[.toaster]:border-red-200 group-[.toast]:text-red-900',
          warning: 'group-[.toaster]:bg-yellow-50 group-[.toaster]:text-yellow-900 group-[.toaster]:border-yellow-200 group-[.toast]:text-yellow-900',
          info: 'group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-900 group-[.toaster]:border-blue-200 group-[.toast]:text-blue-900',
          loading: 'group-[.toaster]:bg-gray-50 group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
