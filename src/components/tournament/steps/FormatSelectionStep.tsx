import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Brackets, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormatSelectionStepProps {
  selectedFormat: 'LEAGUE' | 'KNOCKOUT' | 'GROUP_KNOCKOUT' | null
  onSelect: (format: 'LEAGUE' | 'KNOCKOUT' | 'GROUP_KNOCKOUT') => void
}

const formats = [
  {
    id: 'LEAGUE',
    name: 'League Format',
    description: 'Round-robin format where every team plays against each other.',
    highlights: ['Fair competition', 'Most matches', 'Clear standings'],
    icon: Trophy
  },
  {
    id: 'KNOCKOUT',
    name: 'Knockout Tournament',
    description: 'Single elimination where losing means immediate exit.',
    highlights: ['Quick progression', 'High stakes', 'Simple format'],
    icon: Brackets
  },
  {
    id: 'GROUP_KNOCKOUT',
    name: 'Groups + Knockout',
    description: 'A hybrid format with group stages followed by knockout rounds.',
    highlights: ['Guaranteed matches', 'Exciting finals', 'Group dynamics'],
    icon: Users
  }
] as const

export function FormatSelectionStep({ selectedFormat, onSelect }: FormatSelectionStepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#1D1D1F] dark:text-white">
          Choose Tournament Format
        </h1>
        <p className="mt-2 text-[#424245] dark:text-[#86868B]">
          Select the format that best suits your tournament needs.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {formats.map((format) => (
          <Card
            key={format.id}
            className={cn(
              "rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:border-[#0066CC] hover:shadow-md",
              selectedFormat === format.id
                ? "border-[#0066CC] shadow-md"
                : "border-transparent"
            )}
            onClick={() => onSelect(format.id)}
          >
            <CardContent className="p-6">
              <format.icon className="h-8 w-8 mb-4 text-[#0066CC]" />
              <h3 className="text-lg font-semibold mb-2">{format.name}</h3>
              <p className="text-sm text-[#424245] dark:text-[#86868B] mb-4">
                {format.description}
              </p>
              <ul className="space-y-2">
                {format.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="text-sm text-[#424245] dark:text-[#86868B] flex items-center"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-[#0066CC] mr-2" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 