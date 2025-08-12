"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatbotModal } from "./chatbot-modal"

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />

          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-foreground/30 animate-ping" />

          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full bg-foreground/20 animate-pulse" />
        </Button>

        {/* Tooltip */}
        <div className="absolute bottom-16 right-0 bg-background border border-foreground/20 px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          <div className="text-xs font-medium">Chat with AI Assistant</div>
          <div className="text-xs text-muted-foreground">Specialized in Esteban's experience</div>

          {/* Arrow */}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground/20" />
        </div>
      </div>

      <ChatbotModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
