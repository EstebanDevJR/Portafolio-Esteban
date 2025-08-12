"use client"

import { useState, useEffect } from "react"

interface GenerativeTextProps {
  text: string
  className?: string
  delay?: number
  speed?: number
}

export function GenerativeText({ text, className = "", delay = 0, speed = 30 }: GenerativeTextProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      let currentIndex = 0
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex))
          currentIndex++
        } else {
          setIsComplete(true)
          clearInterval(interval)
        }
      }, speed)

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(timer)
  }, [text, delay, speed])

  return (
    <div className={className}>
      {displayedText}
      {!isComplete && <span className="animate-pulse">|</span>}
    </div>
  )
}
