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
  ArrowLeftRight,
  Users,
  Loader2,
  BarChart3,
  Wand2,
} from "lucide-react"
import type { Tournament, Match } from '@/types/tournament'
import { ScheduleCalendar } from '../schedule/ScheduleCalendar'
import { ResourceOverview } from '../schedule/ResourceOverview'
import { MatchDistribution } from '../schedule/MatchDistribution'
import { ConflictList } from '../schedule/ConflictList'
import { ScheduleGenerator, ConflictReport } from '@/lib/services/scheduleGenerator'
import { parse, format, parseISO } from 'date-fns'

interface InteractivePlanningStepProps {
  tournament: Tournament
  onUpdate: (tournament: Tournament) => void
}

export function InteractivePlanningStep({ 
  tournament, 
  onUpdate 
}: InteractivePlanningStepProps) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [matches, setMatches] = useState<Record<string, Match[]>>({})
  const [conflicts, setConflicts] = useState<ConflictReport[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('calendar')

  // Initialize matches if tournament already has them
  useEffect(() => {
    if (tournament.matches?.length) {
      // Group matches by date
      const groupedMatches = tournament.matches.reduce((acc, match) => {
        if (!acc[match.date]) {
          acc[match.date] = []
        }
        acc[match.date].push(match)
        return acc
      }, {} as Record<string, Match[]>)
      
      setMatches(groupedMatches)
      
      // Set initial selected date
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

  const generatePreviewSchedule = async () => {
    setIsGenerating(true)
    setError(null)
    
    try {
      console.log('Generating schedule with tournament:', {
        teamsCount: tournament?.teams?.length,
        teams: tournament?.teams,
        constraints: tournament?.constraints
      });
      
      if (!tournament.teams?.length) {
        throw new Error('No teams available. Please add teams first.')
      }

      // Add debug logging
      console.log('Checking tournament constraints:', tournament.constraints)

      if (!tournament.constraints?.venues?.length || !tournament.constraints?.availability?.length) {
        throw new Error('No venue or availability data found. Please set up constraints first.')
      }

      const generator = new ScheduleGenerator(tournament)
      const result = await generator.generateSchedule()
      
      console.log('Generated schedule result:', result)
      
      if (!result.matches || Object.keys(result.matches).length === 0) {
        throw new Error('No matches could be generated with the current settings.')
      }

      // Update matches state
      setMatches(result.matches)
      setConflicts(result.conflicts)

      // Set initial selected date
      const firstMatchDate = Object.keys(result.matches)[0]
      if (firstMatchDate) {
        const parsedDate = parse(firstMatchDate, 'yyyy-MM-dd', new Date())
        setSelectedDate(parsedDate)
      }

      // Update tournament with the new schedule
      onUpdate({
        ...tournament,
        matches: Object.values(result.matches).flat()
      })

    } catch (err) {
      console.error('Schedule generation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate schedule')
      setMatches({})
      setConflicts([])
    } finally {
      setIsGenerating(false)
    }
  }

  // Debug logging
  useEffect(() => {
    console.log('Current matches state:', matches)
    console.log('Match dates:', Object.keys(matches))
    console.log('Selected date:', selectedDate)
  }, [matches, selectedDate])

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Interactive Planning</h2>
        
        <Button
          size="lg"
          onClick={generatePreviewSchedule}
          disabled={isGenerating}
          className="bg-[#0066CC] hover:bg-[#0055AA] text-white shadow-lg hover:shadow-xl transition-all"
        >
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          {isGenerating ? 'Generating Schedule...' : 'Generate Schedule'}
        </Button>
      </div>

      {Object.keys(matches).length === 0 && !isGenerating && !error && (
        <Card className="p-8 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <CalendarIcon className="h-12 w-12 mx-auto text-[#0066CC]" />
            <h3 className="text-lg font-medium">No Schedule Generated Yet</h3>
            <p className="text-sm text-muted-foreground">
              Click the &quot;Generate Schedule&quot; button above to create your tournament schedule. 
              This will distribute matches across your available dates and venues.
            </p>
            <Button
              onClick={generatePreviewSchedule}
              className="mt-4"
              variant="outline"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Now
            </Button>
          </div>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>Calendar View</span>
            </div>
            {activeTab === 'calendar' && (
              <span className="ml-auto h-2 w-2 rounded-full bg-primary" />
            )}
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Resource Overview</span>
            </div>
            {activeTab === 'resources' && (
              <span className="ml-auto h-2 w-2 rounded-full bg-primary" />
            )}
          </TabsTrigger>
          <TabsTrigger value="conflicts" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Conflicts ({conflicts.length})</span>
            </div>
            {activeTab === 'conflicts' && (
              <span className="ml-auto h-2 w-2 rounded-full bg-primary" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <ScheduleCalendar
            tournament={tournament}
            matches={matches}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <ResourceOverview 
                tournament={tournament}
                matches={matches}
              />
            </Card>
            <Card className="p-6">
              <MatchDistribution 
                tournament={tournament}
                matches={matches}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conflicts" className="mt-6">
          <Card className="p-6">
            <ConflictList 
              conflicts={conflicts}
              onResolve={(conflictId) => {
                // Implement conflict resolution logic
                console.log('Resolving conflict:', conflictId)
              }}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}