"use client"

import { useEffect } from "react"

export function DynamicFavicon() {
  useEffect(() => {
    // Ensure we're in the browser
    if (typeof window === 'undefined' || !document) return
    if (!document?.head) return

    let isMounted = true

    // Add a delay to ensure DOM is fully ready
    const timeoutId = setTimeout(() => {
      if (!isMounted) return
      updateFavicon()
    }, 150)

    const updateFavicon = async () => {
      try {
        // Double-check we're still mounted and document is available
        if (!isMounted || !document || !document.head) return

        const response = await fetch('/api/content/site-settings')
        if (!response.ok || !isMounted) return
        
        const data = await response.json()
        if (!isMounted || !document || !document.head) return
        
        // Safely remove existing favicon links using .remove() instead of removeChild
        try {
          const existingLinks = document.head.querySelectorAll("link[rel*='icon']")
          existingLinks.forEach(link => {
            try {
              // Extra safety check before removing
              if (link && typeof link.remove === 'function') {
                link.remove()
              }
            } catch (e) {
              // Ignore individual removal errors
            }
          })
        } catch (e) {
          // Ignore query/removal errors
        }
        
        if (!isMounted || !document || !document.head) return

        // Create new favicon link
        const link = document.createElement('link')
        link.rel = 'icon'
        link.type = 'image/x-icon'
        
        const timestamp = Date.now()
        
        if (data?.favicon) {
          const isValidBase64 = data.favicon.startsWith('data:image/')
          link.href = isValidBase64 ? `${data.favicon}#${timestamp}` : `/favicon.svg?t=${timestamp}`
        } else {
          link.href = `/favicon.svg?t=${timestamp}`
        }
        
        // Safely append to head
        try {
          if (document.head && isMounted && document.head.appendChild) {
            document.head.appendChild(link)
          }
        } catch (e) {
          // Ignore append errors
        }

        // Update title safely
        try {
          if (isMounted && document) {
            document.title = data?.siteName 
              ? `${data.siteName} - Profesyonel Mali Müşavirlik Hizmetleri`
              : 'SMMM - Profesyonel Mali Müşavirlik Hizmetleri'
          }
        } catch (e) {
          // Ignore title update errors
        }
      } catch (error) {
        // Silently handle all errors - don't break the app
      }
    }

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [])

  return null
}