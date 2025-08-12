import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    // Aquí puedes integrar con tu LLM preferido
    // Por ejemplo, OpenAI, Anthropic, o cualquier otro servicio

    // Respuesta simulada por ahora
    const responses = [
      "Excelente pregunta sobre IA generativa. En mis proyectos, me enfoco en crear soluciones que combinen innovación técnica con aplicabilidad práctica.",
      "Mi experiencia con modelos como GPT-4, DALL-E y Stable Diffusion me ha permitido desarrollar aplicaciones que van desde generación de contenido hasta análisis conversacional avanzado.",
      "La clave en IA generativa está en entender no solo la tecnología, sino también cómo aplicarla de manera ética y efectiva para resolver problemas reales del mundo.",
      "¿Te interesa algún aspecto específico de mis proyectos? Puedo contarte más sobre la implementación técnica, los desafíos enfrentados o los resultados obtenidos.",
      "En el campo de la IA, la innovación constante es fundamental. Siempre estoy explorando nuevas técnicas y modelos para mantenerme a la vanguardia.",
    ]

    const randomResponse = responses[Math.floor(Math.random() * responses.length)]

    return NextResponse.json({
      message: randomResponse,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Error procesando el mensaje" }, { status: 500 })
  }
}
