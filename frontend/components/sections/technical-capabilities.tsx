"use client"

import { useState } from "react"
import { GenerativeText } from "../generative-text"
import { ProgressiveReveal } from "@/components/progressive-reveal"
import { SkillLevel } from "@/components/skill-level"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

interface TechnicalCapabilitiesProps {
  isGenerating: boolean
  isVisible: boolean
}

export function TechnicalCapabilities({ isGenerating, isVisible }: TechnicalCapabilitiesProps) {
  const [showAllSkills, setShowAllSkills] = useState(false)
  const [showAllLearning, setShowAllLearning] = useState(false)

  const skills = [
    // IA Generativa (más importantes primero)
    { name: "Python", level: "Intermediate", category: "AI/ML", experience: "8 months" },
    { name: "OpenAI API", level: "Intermediate", category: "AI/ML", experience: "8 months" },
    { name: "LangChain", level: "Learning", category: "AI/ML", experience: "6 months" },
    { name: "RAG", level: "Learning", category: "AI/ML", experience: "5 months" },
    { name: "Vector databases", level: "Learning", category: "AI/ML", experience: "5 months" },
    { name: "Fine-tuning", level: "Learning", category: "AI/ML", experience: "5 months" },
    
    // Backend y APIs
    { name: "FastAPI", level: "Learning", category: "Backend", experience: "2 months" },
    { name: "Node.js", level: "Basic", category: "Backend", experience: "4 months" },
    { name: "AWS", level: "Learning", category: "Cloud", experience: "2 months" },
    { name: "Azure", level: "Learning", category: "Cloud", experience: "1 month" },
    
    // Frontend
    { name: "JavaScript", level: "Basic", category: "Frontend", experience: "4 months" },
    { name: "React", level: "Basic", category: "Frontend", experience: "4 months" },
    { name: "TypeScript", level: "Basic", category: "Frontend", experience: "4 months" },
  ]

  const learning = [
    "AWS, Azure",
    "LangGraph framework", 
    "LangChain framework",
    "Vector databases, RAG systems",
    "Computer vision basics",
    "FastAPI development",
  ]

  // Mostrar solo los primeros elementos por defecto
  const displayedSkills = showAllSkills ? skills : skills.slice(0, 6)
  const displayedLearning = showAllLearning ? learning : learning.slice(0, 4)

  if (isGenerating) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center">
            <div className="h-8 w-64 bg-foreground/10 animate-pulse mx-auto mb-4 rounded-lg" />
            <div className="h-4 w-96 bg-foreground/10 animate-pulse mx-auto rounded-lg" />
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex justify-between items-center p-3 border border-foreground/10 rounded-lg">
                  <div className="h-4 w-24 bg-foreground/10 animate-pulse rounded" />
                  <div className="h-3 w-16 bg-foreground/10 animate-pulse rounded" />
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-4 w-full bg-foreground/10 animate-pulse rounded-lg" />
              ))}
            </div>
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
          <GenerativeText text="Technical Capabilities" className="text-3xl md:text-4xl font-light" delay={0} />
          <GenerativeText
            text="Skills and technologies I work with in AI development"
            className="text-muted-foreground"
            delay={500}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <ProgressiveReveal delay={1000}>
              <h3 className="text-xl font-light mb-6">Current Skills</h3>
            </ProgressiveReveal>

            <div className="space-y-3">
              {displayedSkills.map((skill, index) => {
                // Para skills adicionales cuando se expande, no usar delay
                const baseDelay = 800
                const isAdditionalSkill = index >= 6
                const delay = isAdditionalSkill && showAllSkills ? 0 : (isAdditionalSkill ? baseDelay + 100 : baseDelay + index * 100)
                
                return (
                  <SkillLevel
                    key={skill.name}
                    name={skill.name}
                    level={skill.level}
                    category={skill.category}
                    experience={skill.experience}
                    delay={delay}
                  />
                )
              })}
            </div>

            {skills.length > 6 && (
              <ProgressiveReveal delay={1800}>
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllSkills(!showAllSkills)}
                    className="border-foreground/20 hover:border-foreground/40 transition-colors"
                  >
                    {showAllSkills ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Show More ({skills.length - 6} more)
                      </>
                    )}
                  </Button>
                </div>
              </ProgressiveReveal>
            )}
          </div>

          <div className="space-y-6">
            <ProgressiveReveal delay={2500}>
              <h3 className="text-xl font-light mb-6">Currently Learning</h3>
            </ProgressiveReveal>

            <div className="space-y-3">
              {displayedLearning.map((item, index) => {
                // Para items adicionales cuando se expande, no usar delay
                const baseDelay = 2700
                const isAdditionalItem = index >= 4
                const delay = isAdditionalItem && showAllLearning ? 0 : (isAdditionalItem ? baseDelay + 100 : baseDelay + index * 100)
                
                return (
                  <ProgressiveReveal key={item} delay={delay}>
                    <div className="flex items-center gap-3 p-3 border border-foreground/10 rounded-lg hover:border-foreground/20 transition-colors">
                      <div className="w-2 h-2 border border-foreground rounded-sm" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  </ProgressiveReveal>
                )
              })}
            </div>

            {learning.length > 4 && (
              <ProgressiveReveal delay={3100}>
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllLearning(!showAllLearning)}
                    className="border-foreground/20 hover:border-foreground/40 transition-colors"
                  >
                    {showAllLearning ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Show More ({learning.length - 4} more)
                      </>
                    )}
                  </Button>
                </div>
              </ProgressiveReveal>
            )}

            <ProgressiveReveal delay={4000}>
              <div className="mt-8 p-4 border border-foreground/20 rounded-xl">
                <div className="text-sm text-muted-foreground mb-3">Learning Approach</div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-foreground rounded-full" />
                    <span>Daily practice and experimentation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-foreground rounded-full" />
                    <span>Building real projects to solidify knowledge</span>
                  </div>
                </div>
              </div>
            </ProgressiveReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
