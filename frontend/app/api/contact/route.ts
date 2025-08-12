import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json()

    // Validar datos
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      )
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      )
    }

    // Configurar transporter de nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // App password, no la contraseña normal
      },
    })

    // Contenido del email
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: 'esteban.ortiz.dev@gmail.com', // Email fijo donde siempre llegarán los mensajes
      subject: `Nuevo mensaje de contacto - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            Nuevo mensaje desde tu portafolio
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">Datos del contacto:</h3>
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CO')}</p>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Mensaje:</h3>
            <p style="line-height: 1.6; color: #555;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              Este mensaje fue enviado desde tu portafolio web
            </p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
              Responde directamente a este email para contactar a ${name}
            </p>
          </div>
        </div>
      `,
      replyTo: email, // Para que puedas responder directamente
    }

    // Enviar email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: "Mensaje enviado correctamente"
    })

  } catch (error) {
    console.error("Error enviando email:", error)
    
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
