"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

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

    // Crear estrellas
    const stars: Array<{
      x: number
      y: number
      size: number
      opacity: number
      twinkleSpeed: number
      twinklePhase: number
    }> = []

    // Generar estrellas
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
      })
    }

    let animationFrame = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Determinar color basado en el tema
      const isDark = theme === "dark"
      const starColor = isDark ? "#ffffff" : "#000000" // Blanco para oscuro, Negro para claro

      stars.forEach((star) => {
        // Efecto de parpadeo
        star.twinklePhase += star.twinkleSpeed
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7
        // Aumentar la opacidad para que sean aún más visibles
        const currentOpacity = star.opacity * twinkle * 1 // Ajustado a 1 para máxima opacidad

        // Dibujar estrella
        ctx.save()
        ctx.globalAlpha = currentOpacity
        ctx.fillStyle = starColor

        // Estrella de 4 puntas
        ctx.translate(star.x, star.y)
        ctx.beginPath()

        // Crear forma de estrella
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2
          const x1 = Math.cos(angle) * star.size
          const y1 = Math.sin(angle) * star.size
          const x2 = Math.cos(angle + Math.PI / 4) * (star.size * 0.4)
          const y2 = Math.sin(angle + Math.PI / 4) * (star.size * 0.4)

          if (i === 0) {
            ctx.moveTo(x1, y1)
          } else {
            ctx.lineTo(x1, y1)
          }
          ctx.lineTo(x2, y2)
        }

        ctx.closePath()
        ctx.fill()
        ctx.restore()

        // Movimiento sutil (más lento)
        star.x += Math.sin(animationFrame * 0.001 + star.twinklePhase) * 0.02 // Reducido de 0.1 a 0.02
        star.y += Math.cos(animationFrame * 0.001 + star.twinklePhase) * 0.02 // Reducido de 0.1 a 0.02

        // Mantener estrellas en pantalla
        if (star.x < 0) star.x = canvas.width
        if (star.x > canvas.width) star.x = 0
        if (star.y < 0) star.y = canvas.height
        if (star.y > canvas.height) star.y = 0
      })

      animationFrame++
      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [theme])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-40 z-0" />
}
