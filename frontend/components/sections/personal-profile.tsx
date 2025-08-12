"use client"
import { GenerativeText } from "../generative-text"
import { ProgressiveReveal } from "../progressive-reveal"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"

interface PersonalProfileProps {
  isGenerating: boolean
  isVisible: boolean
}

export function PersonalProfile({ isGenerating, isVisible }: PersonalProfileProps) {
  const profileData = {
    name: "Esteban Ortiz",
    role: "Junior AI Developer",
    location: "Pereira, Colombia",
    description:
      "Passionate about generative AI. Exploring the boundaries between creativity and technology",
    traits: ["Curious", "Autodidact", "Innovative", "Persistent"],
  }

  if (isGenerating) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-8">
          <div className="w-32 h-32 mx-auto border border-foreground/20 rounded-3xl flex items-center justify-center">
            <div className="w-16 h-16 border border-foreground/40 rounded-full animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-8 w-64 bg-foreground/10 animate-pulse mx-auto rounded-lg" />
            <div className="h-6 w-48 bg-foreground/10 animate-pulse mx-auto rounded-lg" />
            <div className="h-4 w-32 bg-foreground/10 animate-pulse mx-auto rounded-lg" />
          </div>
          <div className="w-24 h-px bg-foreground/10 animate-pulse mx-auto" />
          <div className="h-16 w-96 bg-foreground/10 animate-pulse mx-auto rounded-lg" />
          <div className="flex justify-center gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-20 bg-foreground/10 animate-pulse rounded-lg" />
            ))}
          </div>
          <div className="flex justify-center gap-4">
            <div className="h-10 w-24 bg-foreground/10 animate-pulse rounded-lg" />
            <div className="h-10 w-32 bg-foreground/10 animate-pulse rounded-lg" />
          </div>
        </div>
      </section>
    )
  }

  if (!isVisible) return null

  return (
    <section className="min-h-screen flex items-center justify-center">
      <div className="max-w-2xl text-center space-y-8">
        <ProgressiveReveal delay={0}>
          <div className="w-32 h-32 mx-auto border-2 border-foreground rounded-3xl flex items-center justify-center">
            <div className="text-4xl">🤖</div>
          </div>
        </ProgressiveReveal>

        <div className="space-y-4">
          <GenerativeText text={profileData.name} className="text-4xl md:text-6xl font-light" delay={500} />

          <GenerativeText text={profileData.role} className="text-xl md:text-2xl text-muted-foreground" delay={1000} />

          <GenerativeText text={profileData.location} className="text-sm text-muted-foreground" delay={1500} />
        </div>

        <ProgressiveReveal delay={2000}>
          <div className="w-24 h-px bg-foreground mx-auto" />
        </ProgressiveReveal>

        <GenerativeText
          text={profileData.description}
          className="text-lg leading-relaxed text-muted-foreground max-w-lg mx-auto"
          delay={2500}
          speed={50}
        />

        <ProgressiveReveal delay={4000}>
          <div className="flex justify-center gap-4 flex-wrap">
            {profileData.traits.map((trait, index) => (
              <div
                key={trait}
                className="px-4 py-2 border border-foreground/20 text-sm rounded-lg"
                style={{ animationDelay: `${4000 + index * 200}ms` }}
              >
                {trait}
              </div>
            ))}
          </div>
        </ProgressiveReveal>

        <ProgressiveReveal delay={5000}>
          <div className="flex justify-center gap-4 mt-8">
            <Button
              asChild
              variant="outline"
              className="border-foreground/20 hover:border-foreground/40 hover:bg-foreground/5 transition-all duration-300"
            >
              <a
                href="/cv/Curriculum.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                View CV
              </a>
            </Button>
            <Button
              asChild
              className="bg-foreground text-background hover:bg-foreground/90 transition-all duration-300"
            >
              <a
                href="/cv/Curriculum.pdf"
                download="Curriculum.pdf"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download CV
              </a>
            </Button>
          </div>
        </ProgressiveReveal>
      </div>
    </section>
  )
}
