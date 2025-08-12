"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { X, Send, Bot, User, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MarkdownRenderer } from "@/components/markdown-renderer"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface ChatbotModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatbotModal({ isOpen, onClose }: ChatbotModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messageIdCounter, setMessageIdCounter] = useState(1)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize messages on client side only
  useEffect(() => {
    setMessages([
      {
        id: "1",
        content:
          "¡Hola! Soy el asistente especializado de Esteban. Puedo responder preguntas específicas sobre sus proyectos de IA, experiencia técnica, y conocimientos en desarrollo. ¿En qué puedo ayudarte?",
        role: "assistant",
        timestamp: new Date(),
      },
    ])
  }, [])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: (messageIdCounter + 1).toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setMessageIdCounter(prev => prev + 1)

    try {
      // Aquí conectarás con tu API de FastAPI
      const response = await fetch("/api/chat-specialized", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          conversation_history: messages.slice(-5), // Últimos 5 mensajes para contexto
        }),
      })

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (messageIdCounter + 2).toString(),
        content: data.response || "Lo siento, no pude procesar tu pregunta en este momento.",
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setMessageIdCounter(prev => prev + 2)
    } catch (error) {
      console.error("Error:", error)

      // Respuesta de fallback mientras no esté conectada la API
      const fallbackResponses = [
        "Lo siento, no pude procesar tu pregunta en este momento.",
      ]

      const assistantMessage: Message = {
        id: (messageIdCounter + 2).toString(),
        content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setMessageIdCounter(prev => prev + 2)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearConversation = () => {
    if (messages.length > 1) {
      setShowClearConfirm(true)
    }
  }

  const confirmClear = () => {
    setMessages([
      {
        id: "1",
        content:
          "¡Hola! Soy el asistente especializado de Esteban. Puedo responder preguntas específicas sobre sus proyectos de IA, experiencia técnica, y conocimientos en desarrollo. ¿En qué puedo ayudarte?",
        role: "assistant",
        timestamp: new Date(),
      },
    ])
    setMessageIdCounter(1)
    setShowClearConfirm(false)
  }

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
    
    return () => clearTimeout(timer)
  }, [messages])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-60 flex items-center justify-center p-4">
      <div className="bg-background border border-foreground/20 rounded-xl w-full max-w-2xl h-[600px] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-foreground/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-foreground/10 rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-medium">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">Specialized in Esteban's experience</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={clearConversation}
              className="rounded-lg hover:bg-red-500/10 hover:text-red-500"
              title="Limpiar conversación"
              disabled={messages.length <= 1}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-lg">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-6 h-6 bg-foreground/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3" />
                    </div>
                  )}

                  <div
                    className={`max-w-[70%] p-3 rounded-lg text-sm break-words ${
                      message.role === "user" ? "bg-foreground text-background ml-auto" : "bg-muted"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <MarkdownRenderer content={message.content} className="leading-relaxed" />
                    ) : (
                      <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    )}
                    <span className="text-xs opacity-70 mt-2 block">{message.timestamp.toLocaleTimeString()}</span>
                  </div>

                  {message.role === "user" && (
                    <div className="w-6 h-6 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-6 h-6 bg-foreground/10 rounded-lg flex items-center justify-center">
                    <Bot className="w-3 h-3" />
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce delay-100" />
                      <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Invisible element to scroll to */}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Confirmation Modal */}
        {showClearConfirm && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
            <div className="bg-background border border-foreground/20 rounded-lg p-6 max-w-sm mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <h4 className="font-medium">Limpiar conversación</h4>
                  <p className="text-xs text-muted-foreground">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                ¿Estás seguro de que quieres eliminar todos los mensajes de esta conversación?
              </p>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowClearConfirm(false)}
                  className="rounded-lg"
                >
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={confirmClear}
                  className="rounded-lg"
                >
                  Limpiar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-foreground/20">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Pregunta sobre Esteban's experience..."
              className="flex-1 border-foreground/20 bg-transparent rounded-lg"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-foreground text-background hover:bg-foreground/90 rounded-lg"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Powered by specialized AI model • FastAPI backend
          </p>
        </div>
      </div>
    </div>
  )
}
