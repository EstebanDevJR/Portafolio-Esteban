import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, conversation_history, session_id } = await request.json()

    // Conectar con la API de FastAPI
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    
    const response = await fetch(`${backendUrl}/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversation_history: conversation_history || [],
        session_id: session_id,
        temperature: 0.7
      }),
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      response: data.response,
      session_id: data.session_id,
      timestamp: data.timestamp,
      tokens_used: data.tokens_used,
      response_time_ms: data.response_time_ms
    })
  } catch (error) {
    console.error("Error in specialized chat API:", error)
    
    // Fallback response si el backend no está disponible
    const fallbackResponse = {
      response: `Lo siento, estoy experimentando dificultades técnicas en este momento. Por favor, intenta de nuevo en unos momentos.`,
      session_id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      tokens_used: 0,
      response_time_ms: 0
    }

    return NextResponse.json(fallbackResponse)
  }
}
