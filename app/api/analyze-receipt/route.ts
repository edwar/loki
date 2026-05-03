import { NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export async function POST(request: Request) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })
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

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: imageBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
        topP: 0.8,
        topK: 40
      }
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('No se pudo procesar la imagen')
    }

    const jsonText = data.candidates[0].content.parts[0].text
    
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No se encontró JSON en la respuesta')
    }

    const parsed = JSON.parse(jsonMatch[0])
    
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