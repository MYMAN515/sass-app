// pages/tryon-video.js

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/Toast'
import { motion } from 'framer-motion'
import axios from 'axios'

const defaultOptions = {
  gender: 'female',
  skinTone: 'medium',
  hairStyle: 'long',
  bodyType: 'slim',
  clothingType: 't-shirt',
  fashionStyle: 'Zara',
  poseType: 'runway walk',
  cameraAngle: '3/4',
  duration: '10s',
}

function generateVideoPrompt(opts) {
  return `Generate a ${opts.duration} HD video of a ${opts.bodyType} ${opts.gender} model with ${opts.skinTone} skin tone and ${opts.hairStyle} hair, wearing the uploaded ${opts.clothingType} in a ${opts.fashionStyle}-inspired studio shoot. Model should be moving in a ${opts.poseType}. Camera angle is ${opts.cameraAngle} view.`
}

export default function TryonVideo() {
  const [image, setImage] = useState(null)
  const [options, setOptions] = useState(defaultOptions)
  const [videoUrl, setVideoUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setOptions((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    setImage(e.target.files[0])
  }

  const handleSubmit = async () => {
    if (!image) {
      toast({ title: 'Please upload an image.' })
      return
    }
    setLoading(true)
    setVideoUrl(null)

    try {
      const formData = new FormData()
      formData.append('image', image)
      formData.append('prompt', generateVideoPrompt(options))

      const res = await axios.post('/api/tryon-video', formData)
      if (res.data && res.data.video_url) {
        setVideoUrl(res.data.video_url)
        toast({ title: 'Video generated successfully!' })
      } else {
        throw new Error('No video returned from server.')
      }
    } catch (err) {
      toast({ title: 'Video generation failed.', description: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">AI Fashion Try-On Video Generator</h1>

      <Input type="file" accept="image/png, image/jpeg" onChange={handleFileChange} />

      <div className="grid grid-cols-2 gap-4">
        {Object.keys(defaultOptions).map((key) => (
          <div key={key}>
            <Label htmlFor={key}>{key}</Label>
            <Input
              id={key}
              name={key}
              value={options[key]}
              onChange={handleInputChange}
              type={key === 'duration' ? 'text' : 'text'}
            />
          </div>
        ))}
      </div>

      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Generating...' : 'Generate AI Video'}
      </Button>

      {videoUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 border rounded-xl overflow-hidden"
        >
          <video controls className="w-full" poster={image ? URL.createObjectURL(image) : undefined}>
            <source src={videoUrl} type="video/mp4" />
          </video>
          <a href={videoUrl} download className="block mt-2 text-blue-500 text-center">Download Video</a>
        </motion.div>
      )}
    </div>
  )
}