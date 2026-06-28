import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
})

export async function POST(request: Request) {
  try {
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 })
    }

    const formData = await request.formData()
    const files = formData.getAll('file') as File[]

    if (files.length === 0) return NextResponse.json({ error: 'No files provided' }, { status: 400 })

    const results = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer())
        return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'loki', resource_type: 'image' },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error)
                return reject(error)
              }
              if (!result) return reject(new Error('No result from Cloudinary'))
              resolve({ url: result.secure_url, publicId: result.public_id })
            }
          )
          stream.end(buffer)
        })
      })
    )

    return NextResponse.json(results.length === 1 ? results[0] : results)
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Error uploading image' }, { status: 500 })
  }
}
