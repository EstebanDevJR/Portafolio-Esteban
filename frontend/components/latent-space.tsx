"use client"

import { useEffect, useRef } from "react"

export function LatentSpace() {
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

    // Minimal geometric shapes representing latent space
    const shapes: Array<{
      x: number
      y: number
      size: number
      rotation: number
      rotationSpeed: number
      opacity: number
    }> = []

    // Create subtle geometric elements
    for (let i = 0; i < 12; i++) {
      shapes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 20 + 10,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.002,
        opacity: Math.random() * 0.05 + 0.02,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      shapes.forEach((shape) => {
        shape.rotation += shape.rotationSpeed

        ctx.save()
        ctx.globalAlpha = shape.opacity
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--foreground").trim()
        ctx.lineWidth = 1

        ctx.translate(shape.x, shape.y)
        ctx.rotate(shape.rotation)

        // Draw simple square
        ctx.strokeRect(-shape.size / 2, -shape.size / 2, shape.size, shape.size)

        ctx.restore()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-20" />
}
