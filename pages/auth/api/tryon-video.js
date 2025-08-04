// pages/api/tryon-video.js

import formidable from 'formidable'
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

export const config = {
  api: {
    bodyParser: false,
  },
}

const motionMap = {
  'runway walk': 127,
  'casual pose': 56,
  'turning': 16,
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' })

  const token = req.headers.authorization?.split('Bearer ')[1]
  const user = await supabase.auth.getUser(token)
  if (!user.data.user) return res.status(401).json({ error: 'Unauthorized' })

  const form = new formidable.IncomingForm()
  form.uploadDir = '/tmp'
  form.keepExtensions = true

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Failed to parse form data' })

    const prompt = fields.prompt?.toString()
    const imageFile = files.image
    if (!prompt || !imageFile) return res.status(400).json({ error: 'Missing prompt or image file' })

    const fileData = fs.readFileSync(imageFile[0].filepath)
    const fileExt = imageFile[0].originalFilename.split('.').pop()
    const fileName = `tryon-${Date.now()}.${fileExt}`

    const { data: upload, error: uploadError } = await supabase.storage.from('videos').upload(fileName, fileData, {
      contentType: imageFile[0].mimetype,
    })

    if (uploadError) return res.status(500).json({ error: 'Image upload failed', detail: uploadError })

    const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/videos/${fileName}`

    const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN
    const motion_bucket_id = motionMap[fields.poseType?.toString()] || 127

    const startRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Token ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'runwayml/upscale-v1',
        input: {
          input_image: imageUrl,
          prompt,
          motion_bucket_id,
          video_length: 14,
          format: 'mp4',
        },
      }),
    })

    const startData = await startRes.json()
    if (!startRes.ok || !startData?.urls?.get) {
      return res.status(400).json({ error: startData?.error || 'Replicate start failed', detail: startData })
    }

    const statusUrl = startData.urls.get
    let output = null, pollCount = 0
    while (pollCount++ < 30) {
      const poll = await fetch(statusUrl, {
        headers: { Authorization: `Token ${REPLICATE_TOKEN}` },
      })
      const data = await poll.json()

      if (data.status === 'succeeded') {
        output = data.output
        break
      }
      if (data.status === 'failed') {
        return res.status(500).json({ error: 'AI generation failed', detail: data })
      }
      await new Promise((r) => setTimeout(r, 2000))
    }

    if (!output) return res.status(504).json({ error: 'Timed out waiting for AI result' })

    await supabase.from('generation_history').insert({
      user_email: user.data.user.email,
      feature: 'tryon-video',
      prompt,
      video_url: output,
      created_at: new Date().toISOString(),
    })

    return res.status(200).json({ video_url: output })
  })
}
