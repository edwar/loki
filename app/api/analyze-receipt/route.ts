import { NextResponse } from 'next/server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

export async function POST(request: Request) {
  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })
    }

    const { imageBase64, mimeType } = await request.json()

    const prompt = `
Eres un experto en extraer datos de receipts y facturas.

Analiza la imagen y extrae:
- Nombre del proveedor/tienda
- Fecha (formato YYYY-MM-DD)
- Lista de items con cantidad, precio unitario y subtotal
- Subtotal (antes de descuentos e impuestos)
- Porcentaje de descuento (ej: 10 para 10%)
- Porcentaje de impuesto/IVA (ej: 21 para 21%)
- Total de la compra

Responde SOLO con JSON válido (sin markdown, sin texto extra):
{"nombreProveedor":"nombre","fecha":"2024-01-01","subtotal":100.00,"descuentoPorcentaje":0,"impuestoPorcentaje":21,"total":121.00,"items":[{"nombre":"producto","cantidad":2,"precioUnitario":50.00,"subtotal":100.00}]}

Si no es un receipt, responde:
{"error":"NO_ES_RECIBO"}
`

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://loki.vercel.app',
        'X-Title': 'Loki'
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } }
            ]
          }
        ],
        max_tokens: 2048,
        temperature: 0.1
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('API response:', JSON.stringify(data, null, 2))

    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error('No se pudo procesar la imagen')
    }

    const jsonText = data.choices[0].message.content

    let parsed
    try {
      parsed = JSON.parse(jsonText)
    } catch {
      const match = jsonText.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('No se encontró JSON')
      parsed = JSON.parse(match[0])
    }

    if (parsed.error === 'NO_ES_RECIBO') {
      return NextResponse.json({ error: 'La imagen no parece ser un receipt' }, { status: 400 })
    }

    return NextResponse.json({
      nombreProveedor: parsed.nombreProveedor || 'Proveedor desconocido',
      fecha: parsed.fecha || new Date().toISOString().split('T')[0],
      subtotal: parseFloat(parsed.subtotal) || 0,
      descuentoPorcentaje: parseFloat(parsed.descuentoPorcentaje) || 0,
      impuestoPorcentaje: parseFloat(parsed.impuestoPorcentaje) || 0,
      total: parseFloat(parsed.total) || 0,
      items: Array.isArray(parsed.items) ? parsed.items : []
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error al procesar' 
    }, { status: 500 })
  }
}