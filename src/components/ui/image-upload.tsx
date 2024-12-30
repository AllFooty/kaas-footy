"use client"

import { useState } from 'react'
import { Button } from "./button"
import { ImagePlus } from "lucide-react"
import Image from 'next/image'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [preview, setPreview] = useState(value)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const url = reader.result as string
        setPreview(url)
        onChange(url)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative w-32 h-32">
          <Image 
            src={preview} 
            alt="Preview" 
            className="w-full h-full object-cover rounded-lg"
            width={128}
            height={128}
            quality={75}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute bottom-2 right-2"
            onClick={() => {
              setPreview(undefined)
              onChange('')
            }}
          >
            Remove
          </Button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
          <ImagePlus className="w-8 h-8 text-gray-400" />
          <span className="mt-2 text-sm text-gray-500">Upload Logo</span>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  )
} 