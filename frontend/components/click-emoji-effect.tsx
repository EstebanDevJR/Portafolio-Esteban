"use client"

import { useState, useEffect } from "react"

interface EmojiParticle {
  id: number
  x: number
  y: number
  emoji: string
  opacity: number
  scale: number
}

export function ClickEmojiEffect() {
  const [particles, setParticles] = useState<EmojiParticle[]>([])

  const emojis = [
    '💻', '⌨️', '🖥️', '📱', '🖱️', '💾', '💿', '📀',
    '🔧', '⚙️', '🛠️', '🔩', '⚡', '🔋', '🔌', '💡',
    '🚀', '🛸', '🤖', '👾', '🎮', '🕹️', '📡', '🛰️',
    '💻', '📊', '📈', '📉', '💹', '🔍', '🔎', '🧮',
    '🌐', '📶', '📡', '💾', '🗄️', '📂', '📁', '💽',
    '⚡', '🔥', '💯', '✨', '💎', '🎯', '🏆', '🥇'
  ]

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // No crear emoji si se hace click en elementos interactivos
      const target = e.target as HTMLElement
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
        return
      }

      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
      const newParticle: EmojiParticle = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
        emoji: randomEmoji,
        opacity: 1,
        scale: 1
      }

      setParticles(prev => [...prev, newParticle])

      // Remover la partícula después de la animación
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== newParticle.id))
      }, 2000)
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute text-2xl select-none animate-bounce"
          style={{
            left: particle.x - 12,
            top: particle.y - 12,
            animation: `
              emoji-float 2s ease-out forwards,
              emoji-fade 2s ease-out forwards
            `,
          }}
        >
          {particle.emoji}
        </div>
      ))}
      
      <style jsx>{`
        @keyframes emoji-float {
          0% {
            transform: translateY(0) scale(1) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translateY(-50px) scale(1.2) rotate(180deg);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100px) scale(0.8) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes emoji-fade {
          0% { opacity: 1; }
          70% { opacity: 0.8; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
