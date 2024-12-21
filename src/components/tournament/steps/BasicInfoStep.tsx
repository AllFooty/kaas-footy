import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ImageIcon } from "@/components/ui/icons"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useEffect } from "react"

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
  useEffect(() => {
    console.log('Basic Info Configuration:', {
      name: data.name,
      description: data.description,
      ageGroup: data.ageGroup,
      competitionLevel: data.competitionLevel
    })
  }, [data])

  const handleImageUpload = (file: File) => {
    // TODO: Implement image upload logic
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className='text-3xl font-semibold text-[#1D1D1F] dark:text-white'>
          Basic Tournament Information
        </h1>
        <p className="mt-2 text-[#424245] dark:text-[#86868B]">
          Let's start with the essential details of your tournament.
        </p>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Tournament Name</Label>
            <Input
              id="name"
              placeholder="Enter tournament name"
              value={data.name}
              onChange={(e) => onUpdate({ ...data, name: e.target.value })}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your tournament"
              value={data.description}
              onChange={(e) => onUpdate({ ...data, description: e.target.value })}
              className="min-h-[120px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover-image">Tournament Cover Image</Label>
            <div className="mt-2">
              {data.coverImage ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <img
                    src={data.coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => onUpdate({ ...data, coverImage: undefined })}
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
                      Upload a cover image
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
              onValueChange={(value) => onUpdate({ ...data, ageGroup: value })}
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
                onUpdate({ ...data, competitionLevel: value })
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
        </CardContent>
      </Card>
    </div>
  )
}