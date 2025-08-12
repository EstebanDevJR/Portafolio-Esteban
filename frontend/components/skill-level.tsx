"use client"

import { ProgressiveReveal } from "./progressive-reveal"

interface SkillLevelProps {
  name: string
  level: string
  category: string
  experience: string
  delay?: number
}

export function SkillLevel({ name, level, category, experience, delay = 0 }: SkillLevelProps) {
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "proficient":
        return "text-green-500"
      case "intermediate":
        return "text-yellow-500"
      case "learning":
        return "text-blue-500"
      case "basic":
        return "text-purple-500"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <ProgressiveReveal delay={delay}>
      <div className="flex items-center justify-between p-3 border border-foreground/10 rounded-lg hover:border-foreground/20 transition-colors">
        <div className="space-y-1">
          <div className="font-medium text-sm">{name}</div>
          <div className="text-xs text-muted-foreground">{category} • {experience}</div>
        </div>
        <div className={`text-xs font-medium ${getLevelColor(level)}`}>
          {level}
        </div>
      </div>
    </ProgressiveReveal>
  )
}
