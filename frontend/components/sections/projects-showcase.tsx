"use client"

import { useState } from "react"
import { GenerativeText } from "../generative-text"
import { ProgressiveReveal } from "@/components/progressive-reveal"

interface ProjectsShowcaseProps {
  isGenerating: boolean
  isVisible: boolean
}

export function ProjectsShowcase({ isGenerating, isVisible }: ProjectsShowcaseProps) {
  const [selectedProject, setSelectedProject] = useState(0)

  const projects = [
    {
      title: "LegalGPT",
      status: "In Development",
      description: "Automated legal advisor for Colombian SMEs that don't understand contracts, labor laws, or tax laws.",
      tech: ["Python", "React", "OpenAI", "Fine-tuning", "RAG", "LangChain", "Pinecone", "FastAPI", "Supabase", "Typescript"],
      progress: 50,
    },
    {
      title: "ATS",
      status: "In Development",
      description: "An intelligent Applicant Tracking System with AI agents for CV processing, candidate classification, and HR assistance.",
      tech: ["Python", "Streamlit", "OpenAI", "Fine-tuning", "RAG", "LangChain", "Pinecone", "FastAPI", "Supabase", "n8n workflow", "whatsapp-bot integration", "Multiagent", "Email notification"],
      progress: 10,
    },
    {
      title: "CV Analyzer",
      status: "Completed",
      description: "Intelligent resume parser that uses advanced AI technologies, Retrieval Augmented Generation (RAG), and fine-tuning to provide detailed analysis, job recommendations, and career development roadmaps.",
      tech: ["Python", "Streamlit", "OpenAI", "Fine-tuning", "RAG", "LangChain", "ChromaDB", "pandas", "PyPDF2", "AWS Textract"],
      progress: 100,
    },
    {
      title: "DocumentAssistant-AI",
      status: "Completed",
      description: "Multimodal AI assistant that analyzes documents (PDF, CSV, Excel) and holds intelligent conversations about their content, with speech synthesis capabilities.",
      tech: ["Python", "Gradio", "LangChain", "OpenAI", "AWS Textract", "Pandas", "ElevenLabs", "PyPDF2"],
      progress: 100,
    },
    {
      title: "LLM Conversational Demo",
      status: "Completed",
      description: "An advanced demo application that allows multiple AI models (GPT-4o-mini, Claude, and DeepSeek) to have natural conversations on any topic, with high-quality speech synthesis using ElevenLabs. Optimized for the free version of ElevenLabs with smart slicing and built-in players.",
      tech: ["Python", "OpenAI", "ElevenLabs", "DeepSeek", "Gradio"],
      progress: 100,
    },
  ]

  if (isGenerating) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="h-8 w-48 bg-foreground/10 animate-pulse mx-auto" />
            <div className="h-4 w-64 bg-foreground/10 animate-pulse mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-foreground/10 p-6 space-y-4 rounded-xl">
                <div className="h-6 w-32 bg-foreground/10 animate-pulse" />
                <div className="h-4 w-20 bg-foreground/10 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-foreground/10 animate-pulse" />
                  <div className="h-3 w-3/4 bg-foreground/10 animate-pulse" />
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
      <div className="max-w-6xl w-full space-y-12">
        <div className="text-center space-y-4">
          <GenerativeText text="AI Projects" className="text-3xl md:text-4xl font-light" delay={0} />
          <GenerativeText
            text="Exploring generative AI through hands-on development"
            className="text-muted-foreground"
            delay={500}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <ProgressiveReveal key={project.title} delay={1000 + index * 300}>
              <div
                className={`border border-foreground/20 p-6 cursor-pointer transition-all duration-300 rounded-xl ${
                  selectedProject === index ? "border-foreground" : "hover:border-foreground/40"
                }`}
                onClick={() => setSelectedProject(index)}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-light">{project.title}</h3>
                    <span className="text-xs text-muted-foreground border border-foreground/20 px-2 py-1 rounded-md">
                      {project.status}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <span key={tech} className="text-xs border border-foreground/20 px-2 py-1 rounded-md">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-foreground/10">
                      <div
                        className="h-1 bg-foreground transition-all duration-1000"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ProgressiveReveal>
          ))}
        </div>

        <ProgressiveReveal delay={2500}>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 border border-foreground animate-pulse" />
              <span>More projects in development</span>
            </div>
          </div>
        </ProgressiveReveal>
      </div>
    </section>
  )
}
