import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface BasicInfoStepProps {
  data: {
    name: string
    description: string
  }
  onUpdate: (data: { name: string; description: string }) => void
}

export function BasicInfoStep({ data, onUpdate }: BasicInfoStepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#1D1D1F] dark:text-white">
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
        </CardContent>
      </Card>
    </div>
  )
} 