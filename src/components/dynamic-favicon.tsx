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
        let existingLinks: NodeListOf<HTMLLinkElement> | null = null
        try {
          existingLinks = document.head.querySelectorAll("link[rel*='icon']") as NodeListOf<HTMLLinkElement>
        } catch (e) {
          console.warn('Error querying favicon links:', e)
        }
        
        if (!isMountedRef.current || !document || !document.head) return

        // Prepare favicon URL
        const timestamp = Date.now()
        let href = `/favicon.ico?t=${timestamp}`
        let type = 'image/x-icon'
        if (data?.favicon) {
          const isValidBase64 = typeof data.favicon === 'string' && data.favicon.startsWith('data:image/')
          if (isValidBase64) {
            href = `${data.favicon}#${timestamp}`
            // Infer MIME type from data URL
            if (data.favicon.includes('image/png')) type = 'image/png'
            else if (data.favicon.includes('image/svg+xml')) type = 'image/svg+xml'
            else if (data.favicon.includes('image/x-icon') || data.favicon.includes('image/vnd.microsoft.icon')) type = 'image/x-icon'
          } else {
            href = `/favicon.ico?t=${timestamp}`
            type = 'image/x-icon'
          }
        }

        // Update existing or append new link safely
        try {
          const updateLink = (link: HTMLLinkElement) => {
            link.href = href
            link.type = type
            link.rel = 'icon'
          }
          if (existingLinks && existingLinks.length > 0) {
            existingLinks.forEach(updateLink)
          } else {
            const link = document.createElement('link')
            link.rel = 'icon'
            link.type = type
            link.href = href
            if (document.head && isMountedRef.current) {
              document.head.appendChild(link)
            }
          }
        } catch (e) {
          console.warn('Error updating/appending favicon links:', e)
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
