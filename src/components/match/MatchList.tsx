"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"
import { Clock, MapPin, Trophy, Timer } from "lucide-react"
import type { Tournament, Match } from '@/types/tournament'
import { cn } from "@/lib/utils"

interface MatchListProps {
  matches: Match[]
  tournament: Tournament
  compact?: boolean
}

export function MatchList({ 
  matches, 
  tournament,
  compact = false
}: MatchListProps) {
  if (matches.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No matches scheduled for this date
      </div>
    )
  }

  return (
    <div className={cn(
      "space-y-4",
      compact && "space-y-2"
    )}>
      {matches.map(match => (
        <Card 
          key={match.id}
          className={cn(
            "p-4",
            "hover:bg-muted/50",
            "transition-colors duration-200",
            "border-l-[3px] border-l-primary"
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-primary">
              <Clock className="h-4 w-4" />
              <span className="font-medium">
                {format(parseISO(match.startTime), 'h:mm a')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5">
                <Trophy className="h-3 w-3" />
                Round {match.round}
              </Badge>
              {tournament.settings.matchDuration && (
                <Badge variant="secondary" className="gap-1.5">
                  <Timer className="h-3 w-3" />
                  {tournament.settings.matchDuration.regularTime}min
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">{match.homeTeam.name}</span>
            </div>
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              vs
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">{match.awayTeam.name}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MapPin className="h-4 w-4" />
            <span>{match.venue}</span>
          </div>
        </Card>
      ))}
    </div>
  )
} 