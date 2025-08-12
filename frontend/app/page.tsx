import { GenerativeInterface } from "@/components/generative-interface"
import { TokenStream } from "@/components/token-stream"
import { LatentSpace } from "@/components/latent-space"
import { FloatingChatbot } from "@/components/floating-chatbot"
import { AnimatedBackground } from "@/components/animated-background"
import { NavigationMenu } from "@/components/navigation-menu"
import { CursorSpotlight } from "@/components/cursor-spotlight"
import { ClickEmojiEffect } from "@/components/click-emoji-effect"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <NavigationMenu />
      <AnimatedBackground />
      <CursorSpotlight />
      <ClickEmojiEffect />
      <LatentSpace />
      <TokenStream />
      <GenerativeInterface />
      <FloatingChatbot />
    </div>
  )
}
