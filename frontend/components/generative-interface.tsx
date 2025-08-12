"use client"

import { useState, useEffect } from "react"
import { ContentGenerator } from "./content-generator"
import { PromptInput } from "./prompt-input"
import { ThemeToggle } from "./theme-toggle"

export function GenerativeInterface() {
  const [currentPrompt, setCurrentPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<any>(null)

  const prompts = [
    { id: "about", text: "Generate: Personal profile", delay: 0 },
    { id: "skills", text: "Generate: Technical capabilities", delay: 2000 },
    { id: "projects", text: "Generate: AI projects showcase", delay: 4000 },
    { id: "experience", text: "Generate: Learning journey", delay: 6000 },
    { id: "contact", text: "Generate: Connection interface", delay: 8000 },
    { id: "complete", text: "Generation completed", delay: 10000 },
    { id: "welcome", text: "Welcome to my portfolio", delay: 12000 },
  ]

  useEffect(() => {
    // Auto-generate content on load
    prompts.forEach((prompt) => {
      setTimeout(() => {
        setCurrentPrompt(prompt.text)
        setIsGenerating(true)

        setTimeout(() => {
          setGeneratedContent({ type: prompt.id, prompt: prompt.text })
          setIsGenerating(false)
        }, 1500)
      }, prompt.delay)
    })
  }, [])

  return (
    <div className="relative z-10">
      <ThemeToggle />
      <PromptInput currentPrompt={currentPrompt} isGenerating={isGenerating} onPromptChange={setCurrentPrompt} />
      <ContentGenerator content={generatedContent} isGenerating={isGenerating} />
    </div>
  )
}
