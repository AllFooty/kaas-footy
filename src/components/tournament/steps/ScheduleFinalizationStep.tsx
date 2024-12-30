"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, ChevronLeft, Check, RefreshCw, Calendar, Wand2 } from "lucide-react"
import { ScheduleCalendar } from "../schedule/ScheduleCalendar"
import { ResourceOverview } from "../schedule/ResourceOverview"
import { MatchDistribution } from "../schedule/MatchDistribution"
import type { Tournament, Match } from '@/types/tournament'

interface ScheduleFinalizationStepProps {
  tournament: Tournament
  matches: Record<string, Match[]>
  onRegenerateSchedule: () => void
}

export function ScheduleFinalizationStep({
  tournament,
  matches,
  onRegenerateSchedule
}: ScheduleFinalizationStepProps) {
  const totalMatches = Object.values(matches).flat().length
  const expectedMatches = tournament.teams.length * (tournament.teams.length - 1)
  const isComplete = totalMatches === expectedMatches

  return (
    <div className="space-y-8">
      {!isComplete && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Schedule is incomplete. Expected {expectedMatches} matches but found {totalMatches}.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerateSchedule}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate Schedule
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {totalMatches === 0 ? (
        <Card className="p-8 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <Calendar className="h-12 w-12 mx-auto text-[#0066CC]" />
            <h3 className="text-lg font-medium">No Schedule Available</h3>
            <p className="text-sm text-muted-foreground">
              Generate a schedule to review the match distribution and resource utilization.
            </p>
            <Button
              onClick={onRegenerateSchedule}
              className="mt-4"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Schedule
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <ResourceOverview tournament={tournament} matches={matches} />
          </Card>
          <Card className="p-6">
            <MatchDistribution tournament={tournament} matches={matches} />
          </Card>
        </div>
      )}

      <Card className="p-6">
        <ScheduleCalendar 
          tournament={tournament}
          matches={matches}
          onDateSelect={() => {}}
        />
      </Card>
    </div>
  )
} 