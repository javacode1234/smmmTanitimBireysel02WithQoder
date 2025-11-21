"use client"
import React, { Component, ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class DomErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    const msg = error?.message || ""
    const name = error.name || ""
    // Target the common navigation DOM error patterns
    if (msg.includes("removeChild") || msg.includes("appendChild") || msg.includes("insertBefore") || 
        msg.includes("Cannot read properties of null") || name === "NotFoundError" || name === "TypeError") {
      if (typeof window !== "undefined") {
        console.warn("DOM Error caught by boundary, recovering...", msg)
      }
      // Return null to prevent the error from propagating
      return { hasError: true, error }
    }
    // Let other errors propagate to Next.js error handling
    throw error
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log for diagnostics, then attempt a soft recovery
    console.error("DOM Error Boundary caught:", error, errorInfo)
    // Briefly show fallback then reset to retry render
    setTimeout(() => {
      if (this.state.hasError) {
        this.setState({ hasError: false })
        if (typeof window !== "undefined") {
          console.log("DOM Error Boundary recovered")
        }
      }
    }, 100)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
            <div>Yükleniyor...</div>
          </div>
        )
      )
    }
    return this.props.children
  }
}

export default DomErrorBoundary
