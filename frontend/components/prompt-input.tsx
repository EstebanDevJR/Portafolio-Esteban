"use client"

import { GenerativeText } from "./generative-text"

interface PromptInputProps {
  currentPrompt: string
  isGenerating: boolean
  onPromptChange: (prompt: string) => void
}

export function PromptInput({ currentPrompt, isGenerating }: PromptInputProps) {
  if (!currentPrompt) return null

  // Determinar si mostrar "STATUS:" en lugar de "PROMPT:"
  const isStatusMessage = currentPrompt.includes("Generation completed") || 
                          currentPrompt.includes("Welcome to my portfolio")
  
  const labelText = isStatusMessage ? "Esteban.AI:" : "PROMPT:"

  return (
    <div className="absolute top-24 left-8 right-8 z-20">
      <div className="max-w-2xl mx-auto">
        <div className="bg-background/80 backdrop-blur-sm border border-foreground/20 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground">{labelText}</div>
            <GenerativeText text={currentPrompt} className="text-sm font-mono" speed={20} />
            {isGenerating && (
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-foreground animate-pulse rounded-full" />
                <div className="w-1 h-1 bg-foreground animate-pulse delay-100 rounded-full" />
                <div className="w-1 h-1 bg-foreground animate-pulse delay-200 rounded-full" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
