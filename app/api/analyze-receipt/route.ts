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
Eres un asistente que extrae información de receipts/facturas de compras. 
Analiza la imagen de un receipt y extrae los datos en formato JSON.

Responde EXACTAMENTE con este formato JSON (sin texto adicional):
{
  "nombreProveedor": "nombre del proveedor o tienda",
  "fecha": "YYYY-MM-DD (formato ISO)",
  "total": 0.00,
  "items": [
    {
      "nombre": "nombre del producto",
      "cantidad": 1,
      "precioUnitario": 0.00,
      "subtotal": 0.00
    }
  ]
}

Reglas:
- Si no puedes leer la fecha, usa la fecha de hoy
- Los precios deben ser números
- Ignora campos vacíos o ilegibles
- Si no hay items, devuelve array vacío
- El total debe ser la suma de los subtotales
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
        model: 'meta-llama/llama-3.2-11b-vision-instruct',
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