"use client"

import type React from "react"

import { useState } from "react"
import { GenerativeText } from "../generative-text"
import { ProgressiveReveal } from "@/components/progressive-reveal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Linkedin, Github, Instagram, ExternalLink, Send } from "lucide-react"

interface ConnectionInterfaceProps {
  isGenerating: boolean
  isVisible: boolean
}

export function ConnectionInterface({ isGenerating, isVisible }: ConnectionInterfaceProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const contacts = [
    { 
      label: "Email", 
      value: "esteban.ortiz.dev@gmail.com", 
      type: "email",
      icon: Mail,
      href: "mailto:esteban.ortiz.dev@gmail.com",
      description: "Send me an email"
    },
    { 
      label: "LinkedIn", 
      value: "LinkedIn Profile", 
      type: "link",
      icon: Linkedin,
      href: "https://www.linkedin.com/in/esteban-ortiz-restrepo",
      description: "Professional network"
    },
    { 
      label: "GitHub", 
      value: "GitHub Profile", 
      type: "link",
      icon: Github,
      href: "https://github.com/EstebanDevJR",
      description: "Code repositories"
    },
    { 
      label: "Instagram", 
      value: "Instagram Profile", 
      type: "link",
      icon: Instagram,
      href: "https://www.instagram.com/esteban_ortiz_0/",
      description: "Personal updates"
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          message,
        }),
      })

      if (!response.ok) {
        throw new Error('Error enviando mensaje')
      }

      const data = await response.json()
      
      if (data.success) {
        setSubmitStatus('success')
        setName("")
        setEmail("")
        setMessage("")
        
        // Reset success message after 5 seconds
        setTimeout(() => setSubmitStatus('idle'), 5000)
      } else {
        throw new Error(data.error || 'Error desconocido')
      }

    } catch (error) {
      console.error('Error:', error)
      setSubmitStatus('error')
      
      // Reset error message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isGenerating) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <div className="max-w-4xl w-full space-y-16">
          <div className="text-center space-y-6">
            <div className="h-12 w-64 bg-foreground/10 animate-pulse mx-auto rounded-lg" />
            <div className="h-6 w-96 bg-foreground/10 animate-pulse mx-auto rounded-lg" />
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="h-8 w-48 bg-foreground/10 animate-pulse rounded-lg" />
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 w-full bg-foreground/10 animate-pulse rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-8">
              <div className="h-8 w-48 bg-foreground/10 animate-pulse rounded-lg" />
              <div className="space-y-4">
                <div className="h-12 w-full bg-foreground/10 animate-pulse rounded-lg" />
                <div className="h-12 w-full bg-foreground/10 animate-pulse rounded-lg" />
                <div className="h-32 w-full bg-foreground/10 animate-pulse rounded-lg" />
                <div className="h-12 w-full bg-foreground/10 animate-pulse rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!isVisible) return null

  return (
    <>
      <section className="min-h-screen flex items-center justify-center">
        <div className="max-w-4xl w-full space-y-16">
          <div className="text-center space-y-6">
            <GenerativeText text="Connect" className="text-4xl md:text-5xl font-light" delay={0} />
            <GenerativeText
              text="Let's collaborate on AI projects or discuss the future of technology"
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
              delay={500}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <ProgressiveReveal delay={1000}>
                <h3 className="text-2xl font-light mb-8">Get In Touch</h3>
              </ProgressiveReveal>

              <div className="grid gap-4">
                {contacts.map((contact, index) => {
                  const IconComponent = contact.icon
                  return (
                    <ProgressiveReveal key={contact.label} delay={1200 + index * 200}>
                      <Button
                        asChild
                        variant="outline"
                        className="h-auto p-4 justify-start border-foreground/20 hover:border-foreground/40 hover:bg-foreground/5 transition-all duration-300"
                      >
                        <a
                          href={contact.href}
                          target={contact.type === "link" ? "_blank" : undefined}
                          rel={contact.type === "link" ? "noopener noreferrer" : undefined}
                          className="flex items-center gap-4 w-full"
                        >
                          <div className="p-2 rounded-lg bg-foreground/10">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium">{contact.label}</div>
                            <div className="text-sm text-muted-foreground">{contact.description}</div>
                          </div>
                          {contact.type === "link" && <ExternalLink className="w-4 h-4 text-muted-foreground" />}
                        </a>
                      </Button>
                    </ProgressiveReveal>
                  )
                })}
              </div>
            </div>

            <div className="space-y-8">
              <ProgressiveReveal delay={2000}>
                <h3 className="text-2xl font-light mb-8">Send Message</h3>
              </ProgressiveReveal>

              <ProgressiveReveal delay={2200}>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <Input
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border-foreground/20 bg-transparent rounded-lg h-12"
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-foreground/20 bg-transparent rounded-lg h-12"
                      required
                    />
                    <Textarea
                      placeholder="Your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="border-foreground/20 bg-transparent rounded-lg min-h-32 resize-none"
                      rows={4}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={!name.trim() || !email.trim() || !message.trim() || isSubmitting}
                    className={`w-full rounded-lg h-12 text-base transition-colors ${
                      submitStatus === 'success' 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : submitStatus === 'error'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-foreground text-background hover:bg-foreground/90'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                        Sending...
                      </div>
                    ) : submitStatus === 'success' ? (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Message Sent!
                      </div>
                    ) : submitStatus === 'error' ? (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Error - Try Again
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Message
                      </div>
                    )}
                  </Button>
                  
                  {/* Status Messages */}
                  {submitStatus === 'success' && (
                    <div className="text-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">
                        ✅ ¡Mensaje enviado correctamente! Te responderé pronto.
                      </p>
                    </div>
                  )}
                  
                  {submitStatus === 'error' && (
                    <div className="text-center p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-sm text-red-600 font-medium">
                        ❌ Error enviando el mensaje. Por favor intenta de nuevo.
                      </p>
                    </div>
                  )}
                </form>
              </ProgressiveReveal>
            </div>
          </div>

          <ProgressiveReveal delay={2500}>
            <div className="text-center pt-8">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-foreground animate-pulse rounded-sm" />
                <span>Always open to new opportunities and collaborations</span>
              </div>
            </div>
          </ProgressiveReveal>
        </div>
      </section>
    </>
  )
}
