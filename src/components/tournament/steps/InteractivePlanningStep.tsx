"use client"

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Loader2,
  BarChart3,
  Wand2,
  CheckCircle,
  CalendarDays,
  LayoutGrid,
  ListChecks,
  RefreshCw,
  Settings2,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Tournament, Match } from '@/types/tournament'
import { ScheduleCalendar } from '../schedule/ScheduleCalendar'
import { ResourceOverview } from '../schedule/ResourceOverview'
import { MatchDistribution } from '../schedule/MatchDistribution'
import { ConflictList } from '../schedule/ConflictList'
import { ScheduleGenerator, ConflictReport } from '@/lib/services/scheduleGenerator'
import { parse } from 'date-fns'
import { applyScenario } from '@/lib/services/scenarioApplier'
import type { TournamentScenario } from '@/lib/services/scenarioGenerator'
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface InteractivePlanningStepProps {
  tournament: Tournament
  onUpdate: (tournament: Tournament) => void
  selectedScenario?: TournamentScenario | null
}

export function InteractivePlanningStep({ 
  tournament, 
  onUpdate,
  selectedScenario 
}: InteractivePlanningStepProps) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [matches, setMatches] = useState<Record<string, Match[]>>({})
  const [conflicts, setConflicts] = useState<ConflictReport[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('calendar')
  const [hasAppliedScenario, setHasAppliedScenario] = useState(false)
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month')

  // Replace the existing useEffect with this one
  useEffect(() => {
    if (selectedScenario && !hasAppliedScenario) {
      const updatedTournament = applyScenario(tournament, selectedScenario)
      if (updatedTournament.teams?.length > 0) {
        setHasAppliedScenario(true)
        onUpdate(updatedTournament)
      }
    }
  }, [selectedScenario, hasAppliedScenario, tournament, onUpdate])

  // Separate effect for handling matches
  useEffect(() => {
    if (tournament.matches?.length > 0) {
      const groupedMatches = tournament.matches.reduce((acc, match) => {
        if (!acc[match.date]) {
          acc[match.date] = []
        }
        acc[match.date].push(match)
        return acc
      }, {} as Record<string, Match[]>)
      
      setMatches(groupedMatches)
      
      const firstDate = Object.keys(groupedMatches)[0]
      if (firstDate) {
        setSelectedDate(parse(firstDate, 'yyyy-MM-dd', new Date()))
      }
    }
  }, [tournament.matches])

  // Add detailed logging
  useEffect(() => {
    console.log('Tournament in InteractivePlanningStep:', {
      id: tournament.id,
      name: tournament.name,
      teamsCount: tournament?.teams?.length,
      teams: tournament?.teams,
      constraints: tournament?.constraints
    });
  }, [tournament]);

  useEffect(() => {
    console.log('Tournament data received:', {
      hasTeams: !!tournament?.teams?.length,
      teamsCount: tournament?.teams?.length,
      hasConstraints: !!tournament?.constraints,
      hasVenues: !!tournament?.constraints?.venues?.length,
      hasAvailability: !!tournament?.constraints?.availability?.length
    })
  }, [tournament])

  // Show selected scenario info
  const renderScenarioSummary = () => {
    if (!selectedScenario) {
      return (
        <Card className="p-6 mb-6 border-dashed">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium mb-1">No Scenario Selected</h3>
              <p className="text-sm text-muted-foreground">
                Please go back to the Analysis step to select a tournament scenario before generating a schedule.
              </p>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          {/* Scenario Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedScenario.label}
                </h3>
                {selectedScenario.isRecommended && (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Recommended
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Based on your tournament requirements and constraints
              </p>
            </div>
            {renderScheduleButton()}
          </div>

          {/* Scenario Details */}
          <div className="grid grid-cols-3 gap-6 pt-4 border-t">
            {/* Key Changes */}
            <div>
              <h4 className="text-sm font-medium mb-3">Key Changes</h4>
              <div className="space-y-2">
                {Object.entries(selectedScenario.changes)
                  .filter(([key]) => key !== 'teams' && selectedScenario.changes[key] !== undefined)
                  .map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      {key === 'teamCount' && <Users className="h-4 w-4 text-primary" />}
                      {key === 'matchDuration' && <Clock className="h-4 w-4 text-primary" />}
                      <span className="text-muted-foreground">
                        {formatChange(key, value)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Impact Metrics */}
            <div>
              <h4 className="text-sm font-medium mb-3">Expected Impact</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span>Venue Utilization</span>
                    <span className={cn(
                      "font-medium",
                      selectedScenario.impact.venueUtilization > 90 && "text-amber-500"
                    )}>
                      {selectedScenario.impact.venueUtilization}%
                    </span>
                  </div>
                  <Progress 
                    value={selectedScenario.impact.venueUtilization}
                    className="h-1.5"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span>Rest Time</span>
                    <span className={cn(
                      "font-medium",
                      selectedScenario.impact.averageRestTime < 30 && "text-destructive"
                    )}>
                      {formatRestTime(selectedScenario.impact.averageRestTime)}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((selectedScenario.impact.averageRestTime / 120) * 100, 100)}
                    className="h-1.5"
                  />
                </div>
              </div>
            </div>

            {/* Schedule Status */}
            <div>
              <h4 className="text-sm font-medium mb-3">Schedule Status</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    Object.keys(matches).length > 0 ? "bg-emerald-500" : "bg-muted"
                  )} />
                  <span className="text-muted-foreground">
                    {Object.keys(matches).length > 0 ? 'Schedule Generated' : 'No Schedule'}
                  </span>
                </div>
                {Object.keys(matches).length > 0 && (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        conflicts.length === 0 ? "bg-emerald-500" : "bg-amber-500"
                      )} />
                      <span className="text-muted-foreground">
                        {conflicts.length === 0 ? 'No Conflicts' : `${conflicts.length} Conflicts`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-muted-foreground">
                        {Object.values(matches).flat().length} Matches Scheduled
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Helper functions from ScenarioComparison
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

  // Simplified generatePreviewSchedule
  const generatePreviewSchedule = async () => {
    setIsGenerating(true)
    setError(null)
    
    try {
      // Basic validation
      if (!selectedScenario) {
        throw new Error('Please select a scenario before generating a schedule.')
      }

      if (!tournament.constraints?.venues?.length || !tournament.constraints?.availability?.length) {
        throw new Error('Missing venue or availability constraints.')
      }

      // Apply selected scenario
      const updatedTournament = applyScenario(tournament, selectedScenario)
      
      // Generate schedule
      const generator = new ScheduleGenerator(updatedTournament)
      const result = await generator.generateSchedule()
      
      if (!result.matches || Object.keys(result.matches).length === 0) {
        throw new Error('No matches could be generated with the current settings.')
      }

      // Update state
      setMatches(result.matches)
      setConflicts(result.conflicts)

      const firstMatchDate = Object.keys(result.matches)[0]
      if (firstMatchDate) {
        setSelectedDate(parse(firstMatchDate, 'yyyy-MM-dd', new Date()))
      }

      onUpdate({
        ...updatedTournament,
        matches: Object.values(result.matches).flat()
      })

    } catch (err) {
      console.error('Schedule generation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate schedule')
    } finally {
      setIsGenerating(false)
    }
  }

  // Helper function to group matches by date
  const groupMatchesByDate = (matches: Match[]): Record<string, Match[]> => {
    if (!Array.isArray(matches)) return {}
    return matches.reduce((acc, match) => {
      if (!acc[match.date]) {
        acc[match.date] = []
      }
      acc[match.date].push(match)
      return acc
    }, {} as Record<string, Match[]>)
  }

  // Debug logging
  useEffect(() => {
    console.log('Current matches state:', matches)
    console.log('Match dates:', Object.keys(matches))
    console.log('Selected date:', selectedDate)
  }, [matches, selectedDate])

  // Add a new helper function
  const renderScheduleButton = () => {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={generatePreviewSchedule}
        disabled={isGenerating}
        className="min-w-[140px]"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : Object.keys(matches).length > 0 ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate Schedule
          </>
        ) : (
          <>
            <Wand2 className="mr-2 h-4 w-4" />
            Generate Schedule
          </>
        )}
      </Button>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Interactive Planning</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generate and fine-tune your tournament schedule
          </p>
        </div>
      </div>

      {/* Scenario Summary Card */}
      {renderScenarioSummary()}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {Object.keys(matches).length === 0 && !isGenerating && !error && (
        <Card className="p-8 text-center border-dashed">
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CalendarIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">No Schedule Generated Yet</h3>
              <p className="text-sm text-muted-foreground mt-1.5">
                Generate a schedule using your selected scenario to start planning your tournament matches.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content Area */}
      {Object.keys(matches).length > 0 && (
        <div className="relative space-y-6">
          {/* Schedule Details Panel */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Schedule Details</h3>
              </div>

              <div className="grid grid-cols-4 gap-6">
                <Card className="p-4 bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Total Matches</div>
                  <div className="text-2xl font-semibold">
                    {Object.values(matches).flat().length}
                  </div>
                </Card>

                <Card className="p-4 bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Tournament Duration</div>
                  <div className="text-2xl font-semibold">
                    {Object.keys(matches).length} days
                  </div>
                </Card>

                <Card className="p-4 bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Venues Used</div>
                  <div className="text-2xl font-semibold">
                    {tournament.constraints.venues.length}
                  </div>
                </Card>

                {conflicts.length > 0 ? (
                  <Card className="p-4 bg-destructive/10">
                    <div className="text-sm text-destructive mb-1">Conflicts Found</div>
                    <div className="text-2xl font-semibold text-destructive">
                      {conflicts.length}
                    </div>
                  </Card>
                ) : (
                  <Card className="p-4 bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Schedule Status</div>
                    <div className="text-2xl font-semibold text-emerald-600">
                      Optimized
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </Card>

          {/* Schedule View */}
          <div className="relative">
            <Card>
              <div className="p-6">
                <ScheduleCalendar
                  tournament={tournament}
                  matches={matches}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  view={calendarView}
                />
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}