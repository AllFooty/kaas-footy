"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, 
  Users, 
  Clock, 
  Calendar,
  AlertTriangle,
  Info
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Tournament } from '@/types/tournament'
import type { TournamentScenario } from '@/lib/services/scenarioGenerator'
import { cn } from "@/lib/utils"
import type { LucideIcon } from 'lucide-react'

interface ScenarioComparisonProps {
  scenarios: TournamentScenario[]
  selectedScenario: TournamentScenario | null
  onSelectScenario: (scenario: TournamentScenario) => void
  tournament: Tournament
}

export function ScenarioComparison({ 
  scenarios, 
  selectedScenario,
  onSelectScenario,
  tournament
}: ScenarioComparisonProps) {
  const formatChange = (key: string, value: any): string => {
    switch(key) {
      case 'teamCount':
        return `${value} teams`
      case 'matchDuration':
        return `${value} minutes per match`
      case 'totalDuration':
        return `${Math.round(value / 60)} hours total`
      default:
        return String(value)
    }
  }

  const formatRestTime = (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours}h ${mins}m`
    }
    return `${minutes}m`
  }

  const getScenarioSummary = (scenario: TournamentScenario): string => {
    if (scenario.isRecommended) {
      return "Balanced format that meets most of your preferences"
    }
    
    switch (scenario.label) {
      case 'Maximum Venue Efficiency':
        return "Optimized for efficient venue usage with shorter matches"
      case 'Compact Schedule':
        return "Condensed format with fewer teams but better rest periods"
      case 'Maximum Rest Periods':
        return "Prioritizes team recovery time between matches"
      case 'Minimal Schedule':
        return "Simplified format that fits your time constraints"
      default:
        return "Alternative tournament format"
    }
  }

  return (
    <div className="space-y-6">
      {/* Recommended scenario first */}
      {scenarios
        .sort((a, b) => (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0))
        .map(scenario => (
          <Card 
            key={scenario.id} 
            className={cn(
              "p-6 transition-all cursor-pointer hover:shadow-md relative overflow-hidden",
              selectedScenario?.id === scenario.id && "ring-2 ring-primary bg-primary/5",
              scenario.isRecommended && "border-primary/30"
            )}
            onClick={() => onSelectScenario(scenario)}
          >
            {scenario.isRecommended && (
              <div className="absolute top-0 right-12 -translate-y-1/2 rotate-45 transform bg-primary px-8 py-1">
                <span className="text-xs font-semibold text-white">RECOMMENDED</span>
              </div>
            )}
            
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    {scenario.label}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="font-normal">
                      <Users className="h-3 w-3 mr-1" />
                      {scenario.changes.teamCount} teams
                    </Badge>
                    <Badge variant="outline" className="font-normal">
                      <Clock className="h-3 w-3 mr-1" />
                      {scenario.changes.matchDuration}min matches
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getScenarioSummary(scenario)}
                  </p>
                </div>

                <Button
                  variant={selectedScenario?.id === scenario.id ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "transition-all",
                    selectedScenario?.id === scenario.id && "bg-primary text-white"
                  )}
                >
                  {selectedScenario?.id === scenario.id ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Selected
                    </>
                  ) : "Select"}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <MetricCard
                  icon={Clock}
                  label="Rest Time"
                  value={formatRestTime(scenario.impact.averageRestTime)}
                  status={scenario.impact.averageRestTime < 30 ? 'warning' : 'success'}
                  tooltip="Time between matches for teams to rest and prepare"
                />
                <MetricCard
                  icon={Users}
                  label="Venue Usage"
                  value={`${scenario.impact.venueUtilization}%`}
                  status={scenario.impact.venueUtilization > 90 ? 'warning' : 'success'}
                  tooltip="How efficiently the venue time is being used"
                />
              </div>
            </div>
          </Card>
        ))}
    </div>
  )
}

// New component for metrics
function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  status,
  tooltip 
}: { 
  icon: LucideIcon
  label: string
  value: string
  status: 'success' | 'warning'
  tooltip: string
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="space-y-2 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Icon className={cn(
                "h-4 w-4",
                status === 'warning' ? "text-amber-500" : "text-green-500"
              )} />
              <span className="text-sm font-medium">{label}</span>
            </div>
            <div className={cn(
              "text-2xl font-semibold",
              status === 'warning' ? "text-amber-500" : "text-green-500"
            )}>
              {value}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 