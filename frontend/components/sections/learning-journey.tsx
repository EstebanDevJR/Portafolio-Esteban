"use client"

import { GenerativeText } from "../generative-text"
import { ProgressiveReveal } from "@/components/progressive-reveal"

interface LearningJourneyProps {
  isGenerating: boolean
  isVisible: boolean
}

export function LearningJourney({ isGenerating, isVisible }: LearningJourneyProps) {
  const timeline = [
    {
      period: "2023 - current",
      title: "Technology in Software Development",
      description: "Currently studying at the Universidad Tecnológica de Pereira",
      status: "current",
    },
    {
      period: "Jan 2025 - current",
      title: "LLM Course",
      description: "LLM Engineering: Master AI, Language Models, and Agents",
      status: "current",
    },
    {
      period: "Feb 2025 - current",
      title: "Bootcamp Course LLM Engineering",
      description: "Bootcamp 2025 Generative AI, LLM Apps, AI Agents, AI Cursor",
      status: "current",
    }
  ]

  if (isGenerating) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="h-8 w-48 bg-foreground/10 animate-pulse mx-auto" />
            <div className="h-4 w-64 bg-foreground/10 animate-pulse mx-auto" />
          </div>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-6">
                <div className="w-20 h-4 bg-foreground/10 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-48 bg-foreground/10 animate-pulse" />
                  <div className="h-4 w-full bg-foreground/10 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!isVisible) return null

  return (
    <section className="min-h-screen flex items-center justify-center">
      <div className="max-w-4xl w-full space-y-12">
        <div className="text-center space-y-4">
          <GenerativeText text="Learning Journey" className="text-3xl md:text-4xl font-light" delay={0} />
          <GenerativeText
            text="My path from web development to AI specialization"
            className="text-muted-foreground"
            delay={500}
          />
        </div>

        <div className="space-y-8">
          {timeline.map((item, index) => (
            <ProgressiveReveal key={`${item.period}-${item.title}`} delay={1000 + index * 400}>
              <div className="flex gap-8 items-start">
                <div className="w-20 text-sm text-muted-foreground font-mono">{item.period}</div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-light">{item.title}</h3>
                    <div
                      className={`w-2 h-2 ${
                        item.status === "completed"
                          ? "bg-foreground"
                          : item.status === "current"
                            ? "border border-foreground animate-pulse"
                            : "border border-foreground/30"
                      }`}
                    />
                  </div>

                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            </ProgressiveReveal>
          ))}
        </div>

        <ProgressiveReveal delay={3000}>
          <div className="text-center pt-8">
            <div className="inline-block p-4 border border-foreground/20">
              <div className="text-sm text-muted-foreground mb-2">Current Focus</div>
              <div className="text-lg">Build APPs powered by LLMs</div>
              <div className="text-xs text-muted-foreground mt-2">2 hours daily study</div>
            </div>
          </div>
        </ProgressiveReveal>
      </div>
    </section>
  )
}
