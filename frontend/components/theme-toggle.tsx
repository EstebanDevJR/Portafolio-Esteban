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
      className="fixed top-4 right-6 w-12 h-12 border border-foreground/20 bg-background/90 backdrop-blur-sm hover:border-foreground/40 hover:bg-foreground/5 transition-all duration-200 rounded-xl shadow-lg cursor-pointer flex items-center justify-center z-[999999] group"
      style={{
        position: 'fixed',
        top: '16px',
        right: '24px',
        zIndex: 999999,
        pointerEvents: 'auto',
        isolation: 'isolate'
      }}
      aria-label="Toggle theme"
      type="button"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-foreground group-hover:scale-110 transition-transform" />
      ) : (
        <Moon className="w-5 h-5 text-foreground group-hover:scale-110 transition-transform" />
      )}
    </button>
  )

  return createPortal(button, document.body)
}
