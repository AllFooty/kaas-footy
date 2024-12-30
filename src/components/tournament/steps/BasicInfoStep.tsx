"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ImageIcon } from "@/components/ui/icons"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useEffect, useCallback, useState } from "react"
import Image from 'next/image'; // Import the Image component
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface BasicInfoStepProps {
  data: {
    name: string
    description: string
    coverImage?: string
    ageGroup?: string
    competitionLevel: 'RECREATIONAL' | 'COMPETITIVE' | 'PROFESSIONAL'
  }
  onUpdate: (data: BasicInfoStepProps['data']) => void
}

export function BasicInfoStep({ data, onUpdate }: BasicInfoStepProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const hasErrors = !data.name.trim()
  
  const handleUpdate = useCallback((updates: Partial<BasicInfoStepProps['data']>) => {
    onUpdate({
      ...data,
      ...updates
    })
  }, [data, onUpdate])

  useEffect(() => {
    console.log('Basic Info Configuration:', {
      name: data.name,
      description: data.description,
      ageGroup: data.ageGroup,
      competitionLevel: data.competitionLevel
    })
  }, [data])

  const handleImageUpload = useCallback((file: File) => {
    // TODO: Implement image upload logic
  }, [])

  if (!isClient) {
    return null // Or return a loading skeleton
  }

  return (
    <div className="space-y-6">
      {hasErrors && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-500">
            <ul className="list-disc pl-4">
              {!data.name.trim() && <li>Tournament name is required</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tournament Name</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => handleUpdate({ name: e.target.value })}
                  className="h-12"
                  suppressHydrationWarning
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your tournament (optional)"
                  value={data.description}
                  onChange={(e) => handleUpdate({ description: e.target.value })}
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover-image">Tournament Cover Image</Label>
                <div className="mt-2">
                  {data.coverImage ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                      <Image
                        src={data.coverImage}
                        alt="Cover"
                        layout="fill"
                        objectFit="cover"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => handleUpdate({ coverImage: undefined })}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
                      <Input
                        type="file"
                        id="cover-image"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file)
                        }}
                      />
                      <Label
                        htmlFor="cover-image"
                        className="cursor-pointer text-center"
                      >
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <span className="mt-2 block text-sm text-gray-600 dark:text-gray-400">
                          Upload a cover image&nbsp;&hellip;
                        </span>
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age-group">Age Group (Optional)</Label>
                <Select
                  value={data.ageGroup}
                  onValueChange={(value) => handleUpdate({ ageGroup: value })}
                >
                  <SelectTrigger id="age-group">
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNDER_12">Under 12</SelectItem>
                    <SelectItem value="UNDER_14">Under 14</SelectItem>
                    <SelectItem value="UNDER_16">Under 16</SelectItem>
                    <SelectItem value="UNDER_18">Under 18</SelectItem>
                    <SelectItem value="SENIOR">Senior</SelectItem>
                    <SelectItem value="VETERAN">Veteran</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Competition Level</Label>
                <RadioGroup
                  value={data.competitionLevel}
                  onValueChange={(value: typeof data.competitionLevel) =>
                    handleUpdate({ competitionLevel: value })
                  }
                  className="grid gap-4 pt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="RECREATIONAL" id="recreational" />
                    <Label htmlFor="recreational">Recreational</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="COMPETITIVE" id="competitive" />
                    <Label htmlFor="competitive">Competitive</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PROFESSIONAL" id="professional" />
                    <Label htmlFor="professional">Professional</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}