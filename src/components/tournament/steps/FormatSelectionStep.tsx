"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Brackets, Users, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
    <div className="space-y-6">
      {/* Error Alert */}
      {!selectedFormat && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-500">
            Please select a tournament format
          </AlertDescription>
        </Alert>
      )}

      {/* Format Cards */}
      <div className="grid grid-cols-1 gap-4">
        {formats.map((format) => {
          const Icon = format.icon
          const isSelected = selectedFormat === format.id
          
          return (
            <Card
              key={format.id}
              className={cn(
                "relative cursor-pointer transition-all duration-300",
                "border border-border/20 backdrop-blur-md",
                "hover:bg-[#1D1D1F]/5 dark:hover:bg-[#2D2D2D]/50",
                "bg-background/50 dark:bg-background/30",
                isSelected && "ring-2 ring-[#0066CC] dark:ring-[#0A84FF]"
              )}
              onClick={() => onSelect(format.id as typeof selectedFormat)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-3 rounded-xl shrink-0",
                    "transition-colors duration-300",
                    isSelected 
                      ? "bg-[#0066CC] dark:bg-[#0A84FF]" 
                      : "bg-[#0066CC]/10 dark:bg-[#0A84FF]/10"
                  )}>
                    <Icon className={cn(
                      "h-6 w-6",
                      isSelected 
                        ? "text-white" 
                        : "text-[#0066CC] dark:text-[#0A84FF]"
                    )} />
                  </div>
                  
                  <div className="space-y-3 flex-1">
                    <div>
                      <h3 className="text-xl font-medium text-[#1D1D1F] dark:text-white mb-1.5">
                        {format.name}
                      </h3>
                      <p className="text-[#424245] dark:text-[#86868B] text-sm leading-relaxed">
                        {format.description}
                      </p>
                    </div>
                    
                    <ul className="space-y-2">
                      {format.highlights.map((highlight, index) => (
                        <li 
                          key={index}
                          className="text-sm text-[#424245] dark:text-[#86868B] flex items-center gap-2.5"
                        >
                          <div className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            isSelected 
                              ? "bg-[#0066CC] dark:bg-[#0A84FF]" 
                              : "bg-[#0066CC]/70 dark:bg-[#0A84FF]/70"
                          )} />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 