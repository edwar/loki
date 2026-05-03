import { NextResponse } from 'next/server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

export async function POST(request: Request) {
  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'API key de OpenRouter no configurada' }, { status: 500 })
    }

    const { imageBase64, mimeType } = await request.json()

    const prompt = `
Eres un experto en OCR de receipts y facturas.

Analiza esta imagen buscando:
- Nombre de tienda/proveedor
- Fecha de la transacción
- Lista de productos con precios
- Total de la compra

Si la imagen NO contiene un receipt o factura (es otra cosa), responde:
{"error": "NO_ES_RECIBO", "mensaje": "La imagen no parece ser un receipt o factura"}

Si es un receipt válido, responde SOLO con JSON válido (sin markdown, sin texto extra):
{
  "nombreProveedor": "Nombre de la tienda",
  "fecha": "2024-01-15",
  "total": 150.00,
  "items": [
    {"nombre": "Producto 1", "cantidad": 2, "precioUnitario": 25.00, "subtotal": 50.00}
  ]
}

IMPORTANTE: 
- Devuelve SOLO JSON válido
- No uses backticks ni markdown
- Si no puedes leer algo, usa valores por defecto razonables
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
        model: 'google/gemini-flash-8b',
        messages: [
          {
            role: 'system',
            content: 'Respondes ÚNICAMENTE con JSON válido. Sin texto adicional.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { 
                type: 'image_url', 
                image_url: { 
                  url: `data:${mimeType};base64,${imageBase64}` 
                } 
              }
            ]
          }
        ],
        max_tokens: 2048,
        temperature: 0.1
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('OpenRouter response:', JSON.stringify(data, null, 2))
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error('No se pudo procesar la imagen')
    }

    const jsonText = data.choices[0].message.content
    console.log('Content:', jsonText)
    
    let parsed
    try {
      parsed = JSON.parse(jsonText)
    } catch {
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No se encontró JSON en la respuesta: ' + jsonText.substring(0, 200))
      }
      parsed = JSON.parse(jsonMatch[0])
    }
    
    if (parsed.error === 'NO_ES_RECIBO') {
      return NextResponse.json({ 
        error: 'La imagen no parece ser un receipt. Por favor, tomá una foto clara de un recibo o factura.' 
      }, { status: 400 })
    }
    
    return NextResponse.json({
      nombreProveedor: parsed.nombreProveedor || 'Proveedor desconocido',
      fecha: parsed.fecha || new Date().toISOString().split('T')[0],
      total: parseFloat(parsed.total) || 0,
      items: Array.isArray(parsed.items) ? parsed.items : []
    })
  } catch (error) {
    console.error('Error analyzing receipt:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error al procesar la imagen' 
    }, { status: 500 })
  }
}