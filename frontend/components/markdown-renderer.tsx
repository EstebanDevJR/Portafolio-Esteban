import React from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  // Simple markdown parser para casos básicos
  const parseMarkdown = (text: string) => {
    let parsed = text
    
    // Convertir **texto** a <strong>
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    
    // Convertir *texto* a <em>
    parsed = parsed.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em class="italic">$1</em>')
    
    // Convertir `código` a <code>
    parsed = parsed.replace(/`([^`]+?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-xs font-mono border">$1</code>')
    
    // Convertir ### Título a <h4>
    parsed = parsed.replace(/^### (.*$)/gm, '<h4 class="text-sm font-semibold mt-3 mb-1 text-foreground/90">$1</h4>')
    
    // Convertir ## Título a <h3>
    parsed = parsed.replace(/^## (.*$)/gm, '<h3 class="text-base font-semibold mt-4 mb-2 text-foreground">$1</h3>')
    
    // Convertir # Título a <h2>
    parsed = parsed.replace(/^# (.*$)/gm, '<h2 class="text-lg font-bold mt-4 mb-3 text-foreground">$1</h2>')
    
    // Convertir listas numeradas 1. item
    parsed = parsed.replace(/^(\d+)\. (.*$)/gm, '<div class="ml-4 mb-1"><span class="font-medium text-foreground/70">$1.</span> $2</div>')
    
    // Convertir - item a lista
    parsed = parsed.replace(/^- (.*$)/gm, '<div class="ml-4 mb-1 flex items-start gap-2"><span class="text-foreground/70 mt-0.5">•</span><span>$1</span></div>')
    
    // Convertir bloques de código ```
    parsed = parsed.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-muted/50 p-3 rounded-lg mt-2 mb-2 overflow-x-auto"><code class="text-xs font-mono">$2</code></pre>')
    
    // Convertir enlaces [texto](url)
    parsed = parsed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-500 hover:text-blue-600 underline" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Convertir saltos de línea dobles a párrafos
    parsed = parsed.replace(/\n\n/g, '</p><p class="mb-2">')
    parsed = `<p class="mb-2">${parsed}</p>`
    
    // Convertir saltos de línea simples a <br>
    parsed = parsed.replace(/\n/g, '<br>')
    
    return parsed
  }

  return (
    <div 
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ 
        __html: parseMarkdown(content) 
      }}
      style={{
        lineHeight: '1.6'
      }}
    />
  )
}
