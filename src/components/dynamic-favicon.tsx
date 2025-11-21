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
        
        // Do NOT remove existing favicon links; update or append to avoid React DOM conflicts
        let existingLink: HTMLLinkElement | null = null
        try {
          existingLink = document.head.querySelector("link[rel*='icon']") as HTMLLinkElement | null
        } catch (e) {
          console.warn('Error querying favicon link:', e)
        }
        
        if (!isMountedRef.current || !document || !document.head) return

        // Prepare favicon URL
        const timestamp = Date.now()
        let href = `/favicon.svg?t=${timestamp}`
        if (data?.favicon) {
          const isValidBase64 = data.favicon.startsWith('data:image/')
          href = isValidBase64 ? `${data.favicon}#${timestamp}` : `/favicon.svg?t=${timestamp}`
        }

        // Update existing or append new link safely
        try {
          if (existingLink) {
            existingLink.href = href
            existingLink.type = 'image/x-icon'
            existingLink.rel = 'icon'
          } else {
            const link = document.createElement('link')
            link.rel = 'icon'
            link.type = 'image/x-icon'
            link.href = href
            if (document.head && isMountedRef.current) {
              document.head.appendChild(link)
            }
          }
        } catch (e) {
          console.warn('Error updating/appending favicon link:', e)
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
