"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { createPortal } from "react-dom"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleClick = () => {
    console.log("Theme toggle clicked!", theme)
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (!mounted) return null

  const button = (
    <button
      onClick={handleClick}
      className="fixed top-3 right-3 sm:top-4 sm:right-6 w-8 h-8 sm:w-9 sm:h-9 border border-foreground/20 bg-background/90 backdrop-blur-sm hover:border-foreground/40 hover:bg-foreground/5 transition-all duration-200 rounded-lg shadow-lg cursor-pointer flex items-center justify-center z-[60] group"
      style={{
        position: 'fixed',
        zIndex: 60,
        pointerEvents: 'auto',
        isolation: 'isolate'
      }}
      aria-label="Toggle theme"
      type="button"
    >
      {theme === "dark" ? (
        <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground group-hover:scale-110 transition-transform" />
      ) : (
        <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground group-hover:scale-110 transition-transform" />
      )}
    </button>
  )

  return createPortal(button, document.body)
}
