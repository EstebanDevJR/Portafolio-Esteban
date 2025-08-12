"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"

export function CursorSpotlight() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div 
      className="fixed pointer-events-none z-[5]"
      style={{
        left: mousePosition.x - 250,
        top: mousePosition.y - 250,
        width: 500,
        height: 500,
        background: theme === "dark" 
          ? `radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 30%, rgba(255, 255, 255, 0.03) 60%, transparent 100%)`
          : `radial-gradient(circle, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.04) 30%, rgba(0, 0, 0, 0.02) 60%, transparent 100%)`,
        borderRadius: '50%',
        filter: 'blur(100px)',
        transition: 'opacity 0.3s ease-out',
        opacity: isVisible ? 1 : 0,
      }}
    />
  )
}
