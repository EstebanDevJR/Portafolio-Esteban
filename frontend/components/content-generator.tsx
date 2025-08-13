"use client"

import { useState, useEffect } from "react"
import { PersonalProfile } from "./sections/personal-profile"
import { TechnicalCapabilities } from "./sections/technical-capabilities"
import { ProjectsShowcase } from "./sections/projects-showcase"
import { LearningJourney } from "./sections/learning-journey"
import { ConnectionInterface } from "./sections/connection-interface"

interface ContentGeneratorProps {
  content: any
  isGenerating: boolean
}

export function ContentGenerator({ content, isGenerating }: ContentGeneratorProps) {
  const [visibleSections, setVisibleSections] = useState<string[]>([])
  const [generatingSection, setGeneratingSection] = useState<string | null>(null)

  useEffect(() => {
    if (content && !visibleSections.includes(content.type)) {
      setGeneratingSection(content.type)

      // Simulate generation delay
      setTimeout(() => {
        setVisibleSections((prev) => [...prev, content.type])
        setGeneratingSection(null)
      }, 2000)
    }
  }, [content, visibleSections])

  const renderSection = (type: string) => {
    const isVisible = visibleSections.includes(type)
    const isCurrentlyGenerating = generatingSection === type

    if (!isVisible && !isCurrentlyGenerating) return null

    const sectionProps = {
      isGenerating: isCurrentlyGenerating,
      isVisible: isVisible,
    }

    switch (type) {
      case "about":
        return (
          <div key={type} id="about">
            <PersonalProfile {...sectionProps} />
          </div>
        )
      case "skills":
        return (
          <div key={type} id="skills">
            <TechnicalCapabilities {...sectionProps} />
          </div>
        )
      case "projects":
        return (
          <div key={type} id="projects">
            <ProjectsShowcase {...sectionProps} />
          </div>
        )
      case "experience":
        return (
          <div key={type} id="experience">
            <LearningJourney {...sectionProps} />
          </div>
        )
      case "contact":
        return (
          <div key={type} id="contact">
            <ConnectionInterface {...sectionProps} />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 pt-32 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40 pb-8 space-y-16">
      {["about", "skills", "projects", "experience", "contact"].map(renderSection)}
    </div>
  )
}
