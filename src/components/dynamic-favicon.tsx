"use client"

import { useEffect, useLayoutEffect, useRef } from "react"

// Use useLayoutEffect on client, useEffect on server
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export function DynamicFavicon() {
  const isMountedRef = useRef(true)

  useIsomorphicLayoutEffect(() => {
    // Ensure we're in the browser
    if (typeof window === 'undefined' || !document) return
    if (!document?.head) return

    isMountedRef.current = true

    // Add a delay to ensure DOM is fully ready
    const timeoutId = setTimeout(() => {
      if (!isMountedRef.current) return
      updateFavicon()
    }, 150)

    const updateFavicon = async () => {
      try {
        // Double-check we're still mounted and document is available
        if (!isMountedRef.current || !document || !document.head) return

        const response = await fetch('/api/content/site-settings')
        if (!response.ok || !isMountedRef.current) return
        
        const data = await response.json()
        if (!isMountedRef.current || !document || !document.head) return
        
        // Safely remove existing favicon links using .remove() instead of removeChild
        try {
          const existingLinks = document.head.querySelectorAll("link[rel*='icon']")
          existingLinks.forEach(link => {
            try {
              // Extra safety check before removing
              if (link && typeof link.remove === 'function') {
                link.remove()
              } else if (link && link.parentNode) {
                // Fallback to removeChild if remove is not available, with additional null check
                try {
                  // Check if parent node still exists and contains the child
                  if (link.parentNode && typeof link.parentNode.contains === 'function' && link.parentNode.contains(link)) {
                    link.parentNode.removeChild(link)
                  }
                } catch (removeError) {
                  // Ignore errors when removing child - element may have already been removed
                  // console.warn('Error removing favicon link:', removeError)
                }
              }
            } catch (e) {
              // Ignore individual removal errors
              console.warn('Error processing favicon link:', e)
            }
          })
        } catch (e) {
          // Ignore query/removal errors
          console.warn('Error querying favicon links:', e)
        }
        
        if (!isMountedRef.current || !document || !document.head) return

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
          if (document.head && isMountedRef.current) {
            document.head.appendChild(link)
          }
        } catch (e) {
          // Ignore append errors
          console.warn('Error appending favicon link:', e)
        }

        // Update title safely
        try {
          if (isMountedRef.current && document) {
            document.title = data?.siteName 
              ? `${data.siteName} - Profesyonel Mali Müşavirlik Hizmetleri`
              : 'SMMM - Profesyonel Mali Müşavirlik Hizmetleri'
          }
        } catch (e) {
          // Ignore title update errors
          console.warn('Error updating document title:', e)
        }
      } catch (error) {
        // Silently handle all errors - don't break the app
        console.warn('Error in favicon update:', error)
      }
    }

    return () => {
      isMountedRef.current = false
      clearTimeout(timeoutId)
    }
  }, [])

  return null
}