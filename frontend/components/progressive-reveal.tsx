"use client"

import { useState, useEffect } from "react"

interface ProgressiveRevealProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function ProgressiveReveal({ children, delay = 0, className = "" }: ProgressiveRevealProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
    >
      {children}
    </div>
  )
}
