"use client"

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  AlertTriangle, 
  CheckCircle, 
  Trophy,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Settings,
  Users,
  Target,
  CalendarDays
} from "lucide-react"
import { ConflictList } from "../schedule/ConflictList"
import { ScheduleCalendar } from "../schedule/ScheduleCalendar"
import type { Tournament, Match } from '@/types/tournament'
import type { ConflictReport } from '@/lib/services/scheduleGenerator'
import type { TournamentScenario } from '@/lib/services/scenarioGenerator'
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface PlanConfirmationStepProps {
  tournament: Tournament
  matches: Record<string, Match[]>
  conflicts: ConflictReport[]
  selectedScenario?: TournamentScenario
  onModify: (section: 'basic' | 'format' | 'vision' | 'constraints') => void
}

export function PlanConfirmationStep({
  tournament,
  matches,
  conflicts,
  selectedScenario,
  onModify
}: PlanConfirmationStepProps) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const totalMatches = Object.values(matches).flat().length
  const hasConflicts = conflicts.length > 0

  const stats = {
    matchesPerDay: totalMatches / Object.keys(matches).length || 0,
    totalDays: Object.keys(matches).length,
    venueUtilization: tournament.constraints.venues.reduce((acc, venue) => {
      const venueMatches = Object.values(matches).flat()
        .filter(m => m.venueId === venue.id).length
      return acc + venueMatches
    }, 0) / totalMatches * 100 || 0
  }

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'MMM d, yyyy')
    } catch {
      return 'Not set'
    }
  }

  return (
    <div className="space-y-6">
      {/* Tournament Summary Card */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">{tournament.basicInfo.name}</h2>
              <p className="text-sm text-muted-foreground">
                {formatDate(tournament.constraints.duration.startDate)} - {formatDate(tournament.constraints.duration.endDate)}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onModify('basic')}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <div className="text-sm text-muted-foreground">Teams</div>
              <div className="text-2xl font-semibold flex items-baseline gap-2">
                {tournament.teams.length}
                <span className="text-sm text-muted-foreground font-normal">
                  registered
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-sm text-muted-foreground">Matches</div>
              <div className="text-2xl font-semibold flex items-baseline gap-2">
                {totalMatches}
                <span className="text-sm text-muted-foreground font-normal">
                  ({Math.round(stats.matchesPerDay)}/day)
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-sm text-muted-foreground">Duration</div>
              <div className="text-2xl font-semibold flex items-baseline gap-2">
                {tournament.settings.matchDuration.regularTime}
                <span className="text-sm text-muted-foreground font-normal">min</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-sm text-muted-foreground">Venues</div>
              <div className="text-2xl font-semibold flex items-baseline gap-2">
                {tournament.constraints.venues.length}
                <span className="text-sm text-muted-foreground font-normal">
                  ({Math.round(stats.venueUtilization)}% util)
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Format and Schedule Info */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Format Card */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                Tournament Format
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onModify('format')}
              >
                Edit
              </Button>
            </div>
            <div className="space-y-2">
              <Badge variant="secondary" className="font-normal">
                {tournament.format}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {tournament.format === 'LEAGUE' && tournament.settings.league?.roundRobinType && 
                  `${tournament.settings.league.roundRobinType} Round Robin`}
                {tournament.format === 'GROUP_KNOCKOUT' && tournament.settings.group &&
                  `${tournament.settings.group.numberOfGroups} groups • ${tournament.settings.group.teamsPerGroup} teams each`}
              </p>
            </div>
            {selectedScenario && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Selected Plan
                    </h4>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onModify('vision')}
                    >
                      Change
                    </Button>
                  </div>
                  <Badge variant="outline" className="font-normal">
                    {selectedScenario.label}
                  </Badge>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Schedule Stats Card */}
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Schedule Overview
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Days:</span>
                <span className="ml-2 font-medium">{stats.totalDays}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Daily Avg:</span>
                <span className="ml-2 font-medium">
                  {Math.round(stats.matchesPerDay)} matches
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Venue Usage:</span>
                <span className="ml-2 font-medium">
                  {Math.round(stats.venueUtilization)}%
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Matches:</span>
                <span className="ml-2 font-medium">{totalMatches}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Schedule Preview */}
      <Card>
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-medium flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Schedule Preview
            </h3>
            <div className="flex items-center gap-2">
              {hasConflicts && (
                <Badge variant="destructive" className="font-normal">
                  {conflicts.length} Conflicts
                </Badge>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onModify('constraints')}
              >
                Adjust Schedule
              </Button>
            </div>
          </div>
          <div className="min-h-[400px]">
            <ScheduleCalendar 
              tournament={tournament}
              matches={matches}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              view="month"
            />
          </div>
        </div>
      </Card>

      {/* Validation Status */}
      <Card className={cn(
        "p-6",
        hasConflicts 
          ? "border-destructive/50 bg-destructive/5" 
          : "border-emerald-500/50 bg-emerald-500/5"
      )}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasConflicts ? (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              ) : (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              )}
              <h3 className="font-medium">
                {hasConflicts ? 'Conflicts Detected' : 'Ready to Proceed'}
              </h3>
            </div>
            {hasConflicts && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onModify('constraints')}
              >
                Resolve Issues
              </Button>
            )}
          </div>
          {hasConflicts ? (
            <div className="max-h-[200px] overflow-auto">
              <ConflictList 
                conflicts={conflicts}
                onResolve={() => onModify('constraints')}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              All validation checks have passed. You can proceed to team registration.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
} 