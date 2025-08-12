"use client"

import { useEffect, useRef } from "react"

export function TokenStream() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Minimal floating tokens
    const tokens = ["AI", "ML", "GPT", "LLM", "NLP", "CV", "DL", "NN"]
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      token: string
      opacity: number
      size: number
    }> = []

    // Create fewer, more subtle particles
    for (let i = 0; i < 8; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        token: tokens[Math.floor(Math.random() * tokens.length)],
        opacity: Math.random() * 0.1 + 0.05,
        size: Math.random() * 8 + 8,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        // Draw token
        ctx.save()
        ctx.globalAlpha = particle.opacity
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--foreground").trim()
        ctx.font = `${particle.size}px monospace`
        ctx.fillText(particle.token, particle.x, particle.y)
        ctx.restore()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-30" />
}
