"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

const navigationItems = [
  { id: "about", label: "About", href: "#about" },
  { id: "skills", label: "Skills", href: "#skills" },
  { id: "projects", label: "Projects", href: "#projects" },
  { id: "experience", label: "Experience", href: "#experience" },
  { id: "contact", label: "Contact", href: "#contact" },
]

export function NavigationMenu() {
  const [activeSection, setActiveSection] = useState("about")
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
      
      // Detect active section based on scroll position
      const sections = navigationItems.map(item => ({
        id: item.id,
        element: document.querySelector(item.href)
      })).filter(section => section.element)

      const scrollPosition = window.scrollY + 100 // Offset for fixed header

      for (const section of sections) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect()
          const elementTop = rect.top + window.scrollY
          const elementBottom = elementTop + rect.height

          if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Call once to set initial state
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleNavClick = (href: string, id: string) => {
    setActiveSection(id)
    
    // Smooth scroll to section
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ 
        behavior: "smooth",
        block: "start"
      })
    }
  }

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-background/80 backdrop-blur-md border-b border-foreground/10" 
          : "bg-transparent"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 py-2">
        <div className="flex justify-center">
          <div className="flex items-center gap-1 p-1 rounded-full bg-background/20 backdrop-blur-sm border border-foreground/10">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => handleNavClick(item.href, item.id)}
                className={`relative px-3 py-1.5 text-xs font-medium transition-all duration-300 rounded-full ${
                  activeSection === item.id
                    ? "bg-foreground/10 text-foreground"
                    : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <div className="absolute inset-0 rounded-full bg-foreground/5 animate-pulse" />
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
